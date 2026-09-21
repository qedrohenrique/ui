"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon, GithubIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  StepperForm,
  StepperFormActions,
  StepperFormProgress,
  StepperFormStep,
} from "@/components/custom/stepper-form";

export default function StepperFormPage() {
  const INSTALL_CMD =
    "npx shadcn@latest add https://ui-iota-nine.vercel.app/r/stepper-form.json";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    toast.success("Copied to clipboard");
  };

  const handleValidate = (step: number) => {
    if (step === 1 && !email.includes("@")) {
      toast.error("Enter a valid email to continue");
      return false;
    }
    if (step === 2 && name.trim().length === 0) {
      toast.error("Tell us your name to continue");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
  };

  return (
    <div className="flex flex-col mt-32 font-[family-name:var(--font-geist-sans)] items-center h-100vh">
      <div className="flex flex-col gap-4 p-4 rounded-md border border-foreground/10 w-full max-w-xl">
        <div>
          <h1 className="text-2xl font-bold">Stepper Form</h1>
          <p className="text-sm text-muted-foreground">built with shadcn/ui</p>
        </div>

        <StepperForm
          onValidate={handleValidate}
          onSubmit={handleSubmit}
          onComplete={() => toast.success("Account created")}
        >
          <StepperFormProgress className="mb-2" />

          <StepperFormStep step={1} title="Account" description="How we reach you">
            <label className="flex flex-col gap-1.5 text-sm">
              Email
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          </StepperFormStep>

          <StepperFormStep step={2} title="Profile" description="How we greet you">
            <label className="flex flex-col gap-1.5 text-sm">
              Name
              <Input
                placeholder="Ada Lovelace"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Role
              <Input
                placeholder="Engineer"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              />
            </label>
          </StepperFormStep>

          <StepperFormStep step={3} title="Review" description="One last look">
            <dl className="rounded-md border border-foreground/10 p-3 text-sm">
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{email || "—"}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Name</dt>
                <dd>{name || "—"}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Role</dt>
                <dd>{role || "—"}</dd>
              </div>
            </dl>
          </StepperFormStep>

          <StepperFormActions submitLabel="Create account" />
        </StepperForm>
      </div>

      <span className="text-sm text-muted-foreground my-4 border border-foreground/10 rounded-md p-2 flex items-center gap-2">
        {INSTALL_CMD}
        <Separator orientation="vertical" />
        <CopyIcon className="w-4 h-4 cursor-pointer" onClick={handleCopy} />
      </span>
      <Button
        variant="outline"
        onClick={() =>
          window.open(
            "https://github.com/qedrohenrique/ui/blob/master/src/components/custom/stepper-form.tsx",
            "_blank",
          )
        }
      >
        <GithubIcon />
        GitHub
      </Button>
    </div>
  );
}
