"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const DEFAULT_COLORS = ["#6366f1", "#ec4899", "#22d3ee"] as const;

const VERTEX_SHADER = `#version 300 es
precision highp float;

// A fullscreen triangle straight from gl_VertexID: no buffers, nothing to clean up.
const vec2 POSITIONS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2( 3.0, -1.0),
  vec2(-1.0,  3.0)
);

void main() {
  gl_Position = vec4(POSITIONS[gl_VertexID], 0.0, 1.0);
}`;

/**
 * Uniforms available to a custom fragment shader:
 * uResolution (vec2), uTime (float, seconds), uPointer (vec2, 0..1, y up),
 * uColorA / uColorB / uColorC (vec3, linear 0..1), uGrain (float).
 */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uGrain;

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;

  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  vec2 pointer = vec2((uPointer.x - 0.5) * aspect, uPointer.y - 0.5);

  // Two centres drift on their own; the third is tethered to the pointer.
  vec2 c1 = vec2(sin(uTime * 0.60) * 0.30, cos(uTime * 0.45) * 0.22);
  vec2 c2 = vec2(cos(uTime * 0.38) * 0.34, sin(uTime * 0.52) * 0.26);
  vec2 c3 = pointer * 0.85;

  float w1 = exp(-3.2 * dot(p - c1, p - c1));
  float w2 = exp(-3.0 * dot(p - c2, p - c2));
  float w3 = exp(-2.4 * dot(p - c3, p - c3));

  float total = w1 + w2 + w3 + 1e-4;
  vec3 color = (uColorA * w1 + uColorB * w2 + uColorC * w3) / total;

  color *= 1.0 - 0.28 * dot(p, p);
  color += (hash(gl_FragCoord.xy + uTime) - 0.5) * uGrain;

  fragColor = vec4(color, 1.0);
}`;

let webgl2Probe: boolean | null = null;

/**
 * Whether this browser can actually run the surface.
 *
 * `getContext("webgl2")` allocates a real context and a page only gets so many before the
 * browser starts killing the oldest, so the probe hands it straight back and memoises the
 * answer. `failIfMajorPerformanceCaveat` keeps machines with no usable GPU on the CSS
 * fallback instead of rendering through a software rasteriser at single-digit frame rates.
 */
function detectWebGL2(): boolean {
  if (webgl2Probe !== null) return webgl2Probe;
  if (typeof document === "undefined") return false;

  const gl = document.createElement("canvas").getContext("webgl2", {
    failIfMajorPerformanceCaveat: true,
  });
  webgl2Probe = gl !== null;
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return webgl2Probe;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;

  const int = Number.parseInt(full, 16);
  if (Number.isNaN(int) || full.length !== 6) return [0, 0, 0];

  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255,
  ];
}

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("ShaderSurface:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

interface ShaderSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Three colors; the third follows the pointer. */
  colors?: string[];
  /** Multiplier on the drift. 0 holds a still frame. */
  speed?: number;
  grain?: number;
  /** Whether the pointer steers the third centre. */
  interactive?: boolean;
  /** Replace the default shader. See the uniform list above FRAGMENT_SHADER. */
  fragmentShader?: string;
  /** Classes for the CSS gradient shown when WebGL2 is unavailable. */
  fallbackClassName?: string;
}

function ShaderSurface({
  children,
  className,
  colors = [...DEFAULT_COLORS],
  speed = 1,
  grain = 0.04,
  interactive = true,
  fragmentShader = FRAGMENT_SHADER,
  fallbackClassName,
  ...props
}: ShaderSurfaceProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Pointer in 0..1, y up. Target is where it is, current is where the shader thinks it is.
  const pointerTarget = React.useRef<[number, number]>([0.5, 0.5]);
  const pointerCurrent = React.useRef<[number, number]>([0.5, 0.5]);

  // `false` through hydration: the server has no GPU to ask about, and the fallback is the
  // base layer anyway, so the honest answer arriving one render later costs nothing.
  const [supported, setSupported] = React.useState(false);
  const [generation, setGeneration] = React.useState(0);

  React.useEffect(() => {
    setSupported(detectWebGL2());
  }, []);

  const [a, b, c] = [
    hexToRgb(colors[0] ?? DEFAULT_COLORS[0]),
    hexToRgb(colors[1] ?? DEFAULT_COLORS[1]),
    hexToRgb(colors[2] ?? DEFAULT_COLORS[2]),
  ];

  React.useEffect(() => {
    if (!supported) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      failIfMajorPerformanceCaveat: true,
      powerPreference: "low-power",
    });
    if (!gl) {
      setSupported(false);
      return;
    }

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) {
      setSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setSupported(false);
      return;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("ShaderSurface:", gl.getProgramInfoLog(program));
      setSupported(false);
      return;
    }

    gl.useProgram(program);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uResolution = uniform("uResolution");
    const uTime = uniform("uTime");
    const uPointer = uniform("uPointer");

    gl.uniform3fv(uniform("uColorA"), a);
    gl.uniform3fv(uniform("uColorB"), b);
    gl.uniform3fv(uniform("uColorC"), c);
    gl.uniform1f(uniform("uGrain"), grain);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = container.getBoundingClientRect();
      const w = Math.max(1, Math.round(width * dpr));
      const h = Math.max(1, Math.round(height * dpr));

      if (canvas.width === w && canvas.height === h) return;

      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uResolution, w, h);
    };

    resize();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let frame = 0;
    let running = false;
    // Kept across pauses so scrolling away and back does not rewind the drift.
    let elapsed = 0;
    let start = performance.now();

    const draw = (time: number) => {
      gl.uniform1f(uTime, time * speed);
      gl.uniform2f(uPointer, pointerCurrent.current[0], pointerCurrent.current[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = () => {
      elapsed = (performance.now() - start) / 1000;

      // Ease toward the pointer so a fast cursor does not snap the highlight around.
      pointerCurrent.current = [
        pointerCurrent.current[0] +
          (pointerTarget.current[0] - pointerCurrent.current[0]) * 0.08,
        pointerCurrent.current[1] +
          (pointerTarget.current[1] - pointerCurrent.current[1]) * 0.08,
      ];

      draw(elapsed);
      frame = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      start = performance.now() - elapsed * 1000;
      frame = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    if (reducedMotion) {
      // One still frame: the gradient without the drift.
      draw(0);
    }

    // Only animate while the surface is actually on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (reducedMotion) return;
        if (entry.isIntersecting) startLoop();
        else stopLoop();
      },
      { threshold: 0 }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) draw(0);
    });
    resizeObserver.observe(container);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerTarget.current = [
        (event.clientX - rect.left) / rect.width,
        // Flip: gl_FragCoord counts up from the bottom, the DOM counts down from the top.
        1 - (event.clientY - rect.top) / rect.height,
      ];
    };

    const handlePointerLeave = () => {
      pointerTarget.current = [0.5, 0.5];
    };

    if (interactive && !reducedMotion) {
      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerleave", handlePointerLeave);
    }

    // Registered from the effect so the loss we cause on unmount is unobservable, and only a
    // loss that reaches a mounted canvas counts as a real one.
    const handleContextLost = (event: Event) => {
      // Without this the browser will not even try to restore the context.
      event.preventDefault();
      stopLoop();
    };

    const handleContextRestored = () => {
      setGeneration((value) => value + 1);
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    return () => {
      stopLoop();
      observer.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);

      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported, generation, fragmentShader, speed, grain, interactive, a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]]);

  const fallbackStyle: React.CSSProperties = {
    backgroundColor: colors[0] ?? DEFAULT_COLORS[0],
    backgroundImage: [
      `radial-gradient(circle at 25% 25%, ${colors[0] ?? DEFAULT_COLORS[0]}, transparent 55%)`,
      `radial-gradient(circle at 75% 35%, ${colors[1] ?? DEFAULT_COLORS[1]}, transparent 55%)`,
      `radial-gradient(circle at 50% 80%, ${colors[2] ?? DEFAULT_COLORS[2]}, transparent 55%)`,
    ].join(", "),
  };

  return (
    <div
      ref={containerRef}
      data-slot="shader-surface"
      data-webgl={supported || undefined}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {/* The fallback is the base layer, not a replacement: the canvas paints over it. */}
      <div
        aria-hidden="true"
        className={cn("absolute inset-0 -z-10", fallbackClassName)}
        style={fallbackStyle}
      />
      {supported && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 size-full"
        />
      )}
      {children}
    </div>
  );
}

ShaderSurface.displayName = "ShaderSurface";

export { ShaderSurface, detectWebGL2 };
