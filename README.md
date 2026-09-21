# UI

A shadcn registry of fully-styled, animated components.

## Quick start

Every component is served from this repo's shadcn registry, so the shadcn CLI
installs it along with whatever it depends on:

```bash
npx shadcn@latest add https://ui-iota-nine.vercel.app/r/multi-select-animated.json
```

The registry is generated from the components themselves by `bun run
registry:build`, which also runs as part of `bun run build`.

You can use it as:

```tsx
import MultiSelectAnimated from "@/components/multi-select-animated";

export default function Example() {
  return (
    <MultiSelectAnimated
      options={[
        { id: 1, content: "JavaScript" },
        { id: 2, content: "Go" },
      ]}
      placeholder="Select technologies"
    />
  );
}
```

## Contributing

Clone this repo and open a Pull Request:

```bash
git clone https://github.com/qedrohenrique/ui.git
cd ui
bun install
bun run dev
```

Adding a component: drop the `.tsx` in `src/components/custom/`, add a demo
page under `src/app/`, and describe it as an item in `registry.json`. The
registry JSON under `public/r/` is generated — don't edit it by hand.

Pedro Henrique de Almeida © 2026 - All rights reserved
