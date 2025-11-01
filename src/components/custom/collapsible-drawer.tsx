"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { Pin, PinOff, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const collapsibleDrawerVariants = cva(
  "flex gap-1 fixed bg-background rounded-xl overflow-hidden shadow-lg z-50 m-2 box-border border border-border",
  {
    variants: {
      size: {
        sm: "w-80 h-80",
        md: "w-96 h-96",
        lg: "w-[28rem] h-[28rem]",
      },
      side: {
        right: "right-0 top-0 flex-col h-[calc(100%-16px)]",
        left: "left-0 top-0 flex-col h-[calc(100%-16px)]",
        top: "top-0 left-0 flex-col w-[calc(100%-16px)]",
        bottom: "bottom-0 left-0 flex-col w-[calc(100%-16px)]",
      },
    },
    defaultVariants: {
      size: "md",
      side: "right",
    },
    compoundVariants: [
      {
        side: ["right", "left"],
        size: "sm",
        class: "w-80",
      },
      {
        side: ["right", "left"],
        size: "md",
        class: "w-96",
      },
      {
        side: ["right", "left"],
        size: "lg",
        class: "w-[28rem]",
      },
      {
        side: ["top", "bottom"],
        size: "sm",
        class: "h-80",
      },
      {
        side: ["top", "bottom"],
        size: "md",
        class: "h-96",
      },
      {
        side: ["top", "bottom"],
        size: "lg",
        class: "h-[28rem]",
      },
    ],
  }
);

interface CollapsibleDrawerContextValue {
  isOpen: boolean;
  isCollapsed: boolean;
  isPinned: boolean;
  size?: "sm" | "md" | "lg";
  side?: "right" | "left" | "top" | "bottom";
  open: () => void;
  close: () => void;
  togglePin: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

const CollapsibleDrawerContext =
  createContext<CollapsibleDrawerContextValue | null>(null);

const useCollapsibleDrawer = () => {
  const context = useContext(CollapsibleDrawerContext);
  if (!context) {
    throw new Error(
      "CollapsibleDrawer components must be used within CollapsibleDrawer"
    );
  }
  return context;
};

export interface CollapsibleDrawerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collapsibleDrawerVariants> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CollapsibleDrawerRoot = ({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children,
  size,
  side,
}: CollapsibleDrawerProps) => {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpen = () => {
    if (!isControlled) {
      setInternalOpen(true);
    }
    setIsCollapsed(false);
    onOpenChange?.(true);
  };

  const handleClose = () => {
    if (!isControlled) {
      setInternalOpen(false);
    }
    setIsCollapsed(false);
    setIsPinned(false);
    onOpenChange?.(false);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!isPinned) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsCollapsed(true);
      }, 200);
    }
  };

  const handleTogglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsCollapsed(false);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const contextValue: CollapsibleDrawerContextValue = {
    isOpen,
    isCollapsed,
    isPinned,
    size: size ?? undefined,
    side: side ?? undefined,
    open: handleOpen,
    close: handleClose,
    togglePin: handleTogglePin,
    handleMouseEnter,
    handleMouseLeave,
  };

  return (
    <CollapsibleDrawerContext.Provider value={contextValue}>
      {children}
    </CollapsibleDrawerContext.Provider>
  );
};

CollapsibleDrawerRoot.displayName = "CollapsibleDrawer";

const CollapsibleDrawerTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild, children, onClick, ...props }, ref) => {
  const { open } = useCollapsibleDrawer();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    open();
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
      ref,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  );
});

CollapsibleDrawerTrigger.displayName = "CollapsibleDrawerTrigger";

const CollapsibleDrawerPortal = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
};

CollapsibleDrawerPortal.displayName = "CollapsibleDrawerPortal";

type CollapsibleDrawerContentProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
> &
  VariantProps<typeof collapsibleDrawerVariants>;

const CollapsibleDrawerContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleDrawerContentProps
>(({ className, children, size: sizeProp, side: sideProp, ...props }, ref) => {
  const {
    isOpen,
    isCollapsed,
    size: contextSize,
    side: contextSide,
    handleMouseEnter,
    handleMouseLeave,
  } = useCollapsibleDrawer();

  const size = (sizeProp || contextSize) ?? "md";
  const side = (sideProp || contextSide) ?? "right";

  // Calcula as animações baseadas na posição
  const getAnimationValues = () => {
    switch (side) {
      case "right":
        return {
          initial: { x: "100%" },
          animate: {
            x: isCollapsed ? "calc(100% - 48px)" : 0,
          },
          exit: { x: "100%" },
        };
      case "left":
        return {
          initial: { x: "-100%" },
          animate: {
            x: isCollapsed ? "calc(-100% + 48px)" : 0,
          },
          exit: { x: "-100%" },
        };
      case "top":
        return {
          initial: { y: "-100%" },
          animate: {
            y: isCollapsed ? "calc(-100% + 48px)" : 0,
          },
          exit: { y: "-100%" },
        };
      case "bottom":
        return {
          initial: { y: "100%" },
          animate: {
            y: isCollapsed ? "calc(100% - 48px)" : 0,
          },
          exit: { y: "100%" },
        };
    }
  };

  const animationValues = getAnimationValues();

  return (
    <CollapsibleDrawerPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={ref}
            className={cn(collapsibleDrawerVariants({ size, side }), className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={animationValues.initial}
            animate={animationValues.animate}
            exit={animationValues.exit}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            {...props}
          >
            <div className="flex h-full flex-col">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </CollapsibleDrawerPortal>
  );
});

CollapsibleDrawerContent.displayName = "CollapsibleDrawerContent";

const CollapsibleDrawerHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isPinned, togglePin, close } = useCollapsibleDrawer();

  return (
    <div className={cn("flex flex-col gap-3 p-6 pb-0", className)} {...props}>
      <div className="flex items-center justify-between">
        {children}
        <div className="flex items-center gap-2">
          <Button
            aria-label={isPinned ? "Desafixar" : "Fixar"}
            variant="link"
            size="icon"
            onClick={togglePin}
          >
            {isPinned ? (
              <PinOff className="size-4" />
            ) : (
              <Pin className="size-4" />
            )}
          </Button>
          <Button
            aria-label="Fechar"
            variant="link"
            size="icon"
            onClick={close}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <Separator />
    </div>
  );
};

CollapsibleDrawerHeader.displayName = "CollapsibleDrawerHeader";

const CollapsibleDrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "bottom-0 mt-auto flex w-full gap-2 border-t border-border bg-background p-5",
      className
    )}
    {...props}
  />
);

CollapsibleDrawerFooter.displayName = "CollapsibleDrawerFooter";

const CollapsibleDrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  }
>(({ className, children, variant = "h1", ...props }, ref) => {
  const variantClasses = {
    h1: "text-3xl font-bold",
    h2: "text-2xl font-semibold",
    h3: "text-xl font-semibold",
    h4: "text-lg font-semibold",
    h5: "text-base font-semibold",
    h6: "text-sm font-semibold",
  };

  const Component = variant;

  return (
    <Component
      ref={ref}
      className={cn(variantClasses[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
});

CollapsibleDrawerTitle.displayName = "CollapsibleDrawerTitle";

const CollapsibleDrawerBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex w-full overflow-auto px-6 py-5", className)}
    {...props}
  >
    {children}
  </div>
));

CollapsibleDrawerBody.displayName = "CollapsibleDrawerBody";

const CollapsibleDrawer =
  CollapsibleDrawerRoot as typeof CollapsibleDrawerRoot & {
    Trigger: typeof CollapsibleDrawerTrigger;
    Portal: typeof CollapsibleDrawerPortal;
    Content: typeof CollapsibleDrawerContent;
    Header: typeof CollapsibleDrawerHeader;
    Footer: typeof CollapsibleDrawerFooter;
    Title: typeof CollapsibleDrawerTitle;
    Body: typeof CollapsibleDrawerBody;
  };

CollapsibleDrawer.Trigger = CollapsibleDrawerTrigger;
CollapsibleDrawer.Portal = CollapsibleDrawerPortal;
CollapsibleDrawer.Content = CollapsibleDrawerContent;
CollapsibleDrawer.Header = CollapsibleDrawerHeader;
CollapsibleDrawer.Footer = CollapsibleDrawerFooter;
CollapsibleDrawer.Title = CollapsibleDrawerTitle;
CollapsibleDrawer.Body = CollapsibleDrawerBody;

export default CollapsibleDrawer;

export {
  CollapsibleDrawerTrigger,
  CollapsibleDrawerPortal,
  CollapsibleDrawerContent,
  CollapsibleDrawerHeader,
  CollapsibleDrawerFooter,
  CollapsibleDrawerTitle,
  CollapsibleDrawerBody,
};
