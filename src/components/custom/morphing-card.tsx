"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

const MORPH_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

const morphingCardPanelVariants = cva(
  "relative flex w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-lg",
  {
    variants: {
      size: {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

type MorphingCardSize = NonNullable<
  VariantProps<typeof morphingCardPanelVariants>["size"]
>;

type MorphingCardContextValue = {
  layoutId: string;
  isOpen: boolean;
  size: MorphingCardSize;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
};

const MorphingCardContext = React.createContext<
  MorphingCardContextValue | undefined
>(undefined);

const useMorphingCard = () => {
  const context = React.useContext(MorphingCardContext);
  if (!context) {
    throw new Error("useMorphingCard must be used within a MorphingCard");
  }
  return context;
};

interface MorphingCardProps {
  children: React.ReactNode;
  /** Unique id shared by the collapsed and expanded surfaces. Generated when omitted. */
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: MorphingCardSize;
}

function MorphingCard({
  children,
  id,
  open,
  defaultOpen = false,
  onOpenChange,
  size = "md",
}: MorphingCardProps) {
  const generatedId = React.useId();
  const layoutId = id ?? generatedId;
  const triggerRef = React.useRef<HTMLDivElement | null>(null);

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  // Close on Escape and lock body scroll while expanded.
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setOpen]);

  return (
    <MorphingCardContext.Provider
      value={{ layoutId, isOpen, size, setOpen, triggerRef }}
    >
      {children}
    </MorphingCardContext.Provider>
  );
}

MorphingCard.displayName = "MorphingCard";

type MorphingCardTriggerProps = Omit<
  React.ComponentProps<typeof motion.div>,
  "children"
> & {
  children?: React.ReactNode;
};

function MorphingCardTrigger({
  className,
  children,
  ...props
}: MorphingCardTriggerProps) {
  const { layoutId, isOpen, setOpen, triggerRef } = useMorphingCard();

  return (
    <motion.div
      ref={triggerRef}
      layoutId={`${layoutId}-surface`}
      transition={MORPH_TRANSITION}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      onClick={() => setOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(true);
        }
      }}
      className={cn(
        "cursor-pointer overflow-hidden rounded-xl border border-border bg-background shadow-sm outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      {...props}
    >
      {/* Fades out so the collapsed slot reads as empty once the surface travels. */}
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

MorphingCardTrigger.displayName = "MorphingCardTrigger";

type MorphingCardContentProps = Omit<
  React.ComponentProps<typeof motion.div>,
  "children"
> &
  VariantProps<typeof morphingCardPanelVariants> & {
    children?: React.ReactNode;
    showCloseButton?: boolean;
  };

function MorphingCardContent({
  className,
  children,
  size: sizeProp,
  showCloseButton = true,
  ...props
}: MorphingCardContentProps) {
  const { layoutId, isOpen, size, setOpen, triggerRef } = useMorphingCard();
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
      return;
    }
    // Only restore focus when the trigger was the last thing focused.
    if (mounted) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    // The backdrop and the panel are siblings on purpose: the backdrop defers
    // its unmount to fade out, while the panel unmounts at once so the shared
    // layoutId hands the morph back to the trigger immediately.
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="morphing-card-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setOpen(false)}
        />
      )}
      {isOpen && (
        <div
          key="morphing-card-panel"
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            ref={panelRef}
            layoutId={`${layoutId}-surface`}
            transition={MORPH_TRANSITION}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className={cn(
              morphingCardPanelVariants({ size: sizeProp ?? size }),
              "pointer-events-auto outline-none",
              className
            )}
            {...props}
          >
            {children}
            {showCloseButton && <MorphingCardClose />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

MorphingCardContent.displayName = "MorphingCardContent";

type MorphingCardCloseProps = Omit<
  React.ComponentProps<typeof motion.button>,
  "children"
> & {
  children?: React.ReactNode;
};

function MorphingCardClose({
  className,
  children,
  ...props
}: MorphingCardCloseProps) {
  const { setOpen } = useMorphingCard();

  return (
    <motion.button
      type="button"
      aria-label="Close"
      onClick={() => setOpen(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.15 }}
      className={cn(
        "absolute right-3 top-3 rounded-full bg-background/80 p-1.5 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors",
        "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children ?? <X className="size-4" />}
    </motion.button>
  );
}

MorphingCardClose.displayName = "MorphingCardClose";

type MorphingCardImageProps = React.ComponentProps<typeof motion.img>;

function MorphingCardImage({ className, ...props }: MorphingCardImageProps) {
  const { layoutId } = useMorphingCard();

  return (
    <motion.img
      layoutId={`${layoutId}-image`}
      transition={MORPH_TRANSITION}
      className={cn("w-full object-cover", className)}
      {...props}
    />
  );
}

MorphingCardImage.displayName = "MorphingCardImage";

type MorphingCardTitleProps = React.ComponentProps<typeof motion.h3>;

function MorphingCardTitle({ className, ...props }: MorphingCardTitleProps) {
  const { layoutId } = useMorphingCard();

  return (
    <motion.h3
      layoutId={`${layoutId}-title`}
      transition={MORPH_TRANSITION}
      className={cn("font-semibold leading-tight", className)}
      {...props}
    />
  );
}

MorphingCardTitle.displayName = "MorphingCardTitle";

type MorphingCardDescriptionProps = React.ComponentProps<typeof motion.p>;

function MorphingCardDescription({
  className,
  ...props
}: MorphingCardDescriptionProps) {
  const { layoutId } = useMorphingCard();

  return (
    <motion.p
      layoutId={`${layoutId}-description`}
      transition={MORPH_TRANSITION}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

MorphingCardDescription.displayName = "MorphingCardDescription";

type MorphingCardBodyProps = React.ComponentProps<typeof motion.div>;

/** Content that only exists in the expanded state: fades in after the morph. */
function MorphingCardBody({ className, ...props }: MorphingCardBodyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: 0.12 }}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

MorphingCardBody.displayName = "MorphingCardBody";

export {
  MorphingCard,
  MorphingCardTrigger,
  MorphingCardContent,
  MorphingCardClose,
  MorphingCardImage,
  MorphingCardTitle,
  MorphingCardDescription,
  MorphingCardBody,
};
