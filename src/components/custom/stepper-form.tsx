"use client";

import * as React from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { StatefullButton } from "@/components/custom/statefull-button";
import {
  Timeline,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/custom/timeline";
import { cn } from "@/lib/utils";

const STEP_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

type StepDefinition = {
  step: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

type SubmitPhase = React.ComponentProps<typeof StatefullButton>["phase"];

type StepperFormContextValue = {
  steps: StepDefinition[];
  activeStep: number;
  direction: number;
  isFirst: boolean;
  isLast: boolean;
  isBusy: boolean;
  submitPhase: SubmitPhase;
  next: () => void;
  back: () => void;
  goTo: (step: number) => void;
  submit: () => void;
};

const StepperFormContext = React.createContext<
  StepperFormContextValue | undefined
>(undefined);

const useStepperForm = () => {
  const context = React.useContext(StepperFormContext);
  if (!context) {
    throw new Error("useStepperForm must be used within a StepperForm");
  }
  return context;
};

/**
 * Walks the tree looking for <StepperFormStep> so the progress rail knows every
 * step up front, even though only the active one is mounted.
 */
function collectSteps(children: React.ReactNode): StepDefinition[] {
  const steps: StepDefinition[] = [];

  const walk = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;

      if (child.type === StepperFormStep) {
        const props = child.props as StepperFormStepProps;
        steps.push({
          step: props.step,
          title: props.title,
          description: props.description,
        });
        return;
      }

      const props = child.props as { children?: React.ReactNode };
      if (props?.children) {
        walk(props.children);
      }
    });
  };

  walk(children);

  return steps.sort((a, b) => a.step - b.step);
}

interface StepperFormProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (step: number) => void;
  /** Return false to keep the user on the current step. */
  onValidate?: (step: number) => boolean | Promise<boolean>;
  onSubmit?: () => void | Promise<void>;
  onComplete?: () => void;
  /** How long the submit button holds its success state, in ms. */
  successDuration?: number;
}

function StepperForm({
  children,
  className,
  value,
  defaultValue = 1,
  onValueChange,
  onValidate,
  onSubmit,
  onComplete,
  successDuration = 1200,
  ...props
}: StepperFormProps) {
  const steps = React.useMemo(() => collectSteps(children), [children]);

  const [uncontrolledStep, setUncontrolledStep] = React.useState(defaultValue);
  const [direction, setDirection] = React.useState(1);
  const [isValidating, setIsValidating] = React.useState(false);
  const [submitPhase, setSubmitPhase] = React.useState<SubmitPhase>("idle");

  const isControlled = value !== undefined;
  const activeStep = isControlled ? value : uncontrolledStep;

  const firstStep = steps[0]?.step ?? defaultValue;
  const lastStep = steps[steps.length - 1]?.step ?? defaultValue;
  const isFirst = activeStep <= firstStep;
  const isLast = activeStep >= lastStep;
  const isBusy = isValidating || submitPhase !== "idle";

  const commitStep = React.useCallback(
    (step: number) => {
      setDirection(step >= activeStep ? 1 : -1);
      if (!isControlled) {
        setUncontrolledStep(step);
      }
      onValueChange?.(step);
    },
    [activeStep, isControlled, onValueChange]
  );

  const validate = React.useCallback(async () => {
    if (!onValidate) return true;
    setIsValidating(true);
    try {
      return await onValidate(activeStep);
    } finally {
      setIsValidating(false);
    }
  }, [onValidate, activeStep]);

  const next = React.useCallback(async () => {
    if (isBusy || isLast) return;
    if (!(await validate())) return;

    const index = steps.findIndex((item) => item.step === activeStep);
    const nextStep = steps[index + 1]?.step;
    if (nextStep !== undefined) {
      commitStep(nextStep);
    }
  }, [isBusy, isLast, validate, steps, activeStep, commitStep]);

  const back = React.useCallback(() => {
    if (isBusy || isFirst) return;

    const index = steps.findIndex((item) => item.step === activeStep);
    const previousStep = steps[index - 1]?.step;
    if (previousStep !== undefined) {
      commitStep(previousStep);
    }
  }, [isBusy, isFirst, steps, activeStep, commitStep]);

  const goTo = React.useCallback(
    (step: number) => {
      if (isBusy || step === activeStep) return;
      // Jumping forward would skip validation, so only completed steps are reachable.
      if (step > activeStep) return;
      commitStep(step);
    },
    [isBusy, activeStep, commitStep]
  );

  const submit = React.useCallback(async () => {
    if (isBusy) return;
    if (!(await validate())) return;

    setSubmitPhase("loading");
    try {
      await onSubmit?.();
      setSubmitPhase("success");
    } catch (error) {
      setSubmitPhase("idle");
      throw error;
    }
  }, [isBusy, validate, onSubmit]);

  // Hold the success state, then hand control back to the consumer.
  React.useEffect(() => {
    if (submitPhase !== "success") return;

    const timeout = setTimeout(() => {
      setSubmitPhase("idle");
      onComplete?.();
    }, successDuration);

    return () => clearTimeout(timeout);
  }, [submitPhase, successDuration, onComplete]);

  return (
    <StepperFormContext.Provider
      value={{
        steps,
        activeStep,
        direction,
        isFirst,
        isLast,
        isBusy,
        submitPhase,
        next,
        back,
        goTo,
        submit,
      }}
    >
      <div
        data-slot="stepper-form"
        className={cn("flex w-full flex-col gap-6", className)}
        {...props}
      >
        {children}
      </div>
    </StepperFormContext.Provider>
  );
}

StepperForm.displayName = "StepperForm";

type StepperFormProgressProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue"
> & {
  orientation?: "horizontal" | "vertical";
};

function StepperFormProgress({
  className,
  orientation = "horizontal",
  ...props
}: StepperFormProgressProps) {
  const { steps, activeStep, goTo, isBusy } = useStepperForm();

  return (
    <Timeline
      value={activeStep}
      orientation={orientation}
      className={className}
      {...props}
    >
      {steps.map(({ step, title, description }, index) => {
        const isCompleted = step < activeStep;
        const isReachable = isCompleted && !isBusy;

        return (
          <TimelineItem key={step} step={step}>
            <TimelineSeparator />
            <TimelineIndicator
              className={cn(
                "flex items-center justify-center text-[10px] font-medium",
                step <= activeStep && "bg-primary text-primary-foreground"
              )}
            >
              {isCompleted ? <Check className="size-2.5" /> : index + 1}
            </TimelineIndicator>
            <TimelineTitle
              className={cn(
                "transition-colors",
                step === activeStep
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {isReachable ? (
                <button
                  type="button"
                  onClick={() => goTo(step)}
                  className="cursor-pointer hover:text-foreground"
                >
                  {title}
                </button>
              ) : (
                title
              )}
            </TimelineTitle>
            {description && (
              <p className="text-muted-foreground text-xs">{description}</p>
            )}
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

StepperFormProgress.displayName = "StepperFormProgress";

interface StepperFormStepProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    | "title"
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onAnimationStart"
    | "onAnimationEnd"
  > {
  step: number;
  /** Shown in the progress rail, not in the step body. */
  title?: React.ReactNode;
  description?: React.ReactNode;
}

function StepperFormStep({
  step,
  className,
  children,
  // Consumed by the progress rail; kept out of the DOM.
  title,
  description,
  ...props
}: StepperFormStepProps) {
  const { activeStep, direction } = useStepperForm();

  if (step !== activeStep) return null;

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={STEP_TRANSITION}
      data-slot="stepper-form-step"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

StepperFormStep.displayName = "StepperFormStep";

interface StepperFormActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  backLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  submitLabel?: React.ReactNode;
}

function StepperFormActions({
  className,
  backLabel = "Back",
  nextLabel = "Next",
  submitLabel = "Submit",
  ...props
}: StepperFormActionsProps) {
  const { isFirst, isLast, isBusy, submitPhase, next, back, submit } =
    useStepperForm();

  return (
    <div
      data-slot="stepper-form-actions"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={back}
        disabled={isFirst || isBusy}
      >
        <ChevronLeft className="size-4" />
        {backLabel}
      </Button>

      {isLast ? (
        <StatefullButton type="button" phase={submitPhase} onClick={submit}>
          {submitLabel}
        </StatefullButton>
      ) : (
        <Button type="button" onClick={next} disabled={isBusy}>
          {nextLabel}
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  );
}

StepperFormActions.displayName = "StepperFormActions";

export {
  StepperForm,
  StepperFormProgress,
  StepperFormStep,
  StepperFormActions,
  useStepperForm,
};
