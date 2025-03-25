"use client";

import type React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { site } from "@/lib/config";
import { cx } from "@/lib/utils";
import useScroll from "@/hooks/use-scroll";

import { Button } from "~/button";
import ProtectedRoute from "@/components/auth/protected-route";
import Logo from "@/components/logo";

type TStep = {
  name: string;
  href: string;
};

const steps: TStep[] = [
  { name: "Welcome", href: "/onboarding/welcome" },
  { name: "Workspace", href: "/onboarding/workspace" },
  { name: "Completion", href: "/onboarding/completion" },
];

type TStepProgressProps = {
  steps: TStep[];
  currentStepIndex: number;
  onStepClick: (href: string) => void;
};

function StepProgress({
  steps,
  currentStepIndex,
  onStepClick,
}: TStepProgressProps) {
  return (
    <div aria-label="Onboarding progress">
      <ol className="mx-auto flex w-24 flex-nowrap gap-1 md:w-fit">
        {steps.map((step, index) => (
          <li
            key={step.name}
            className={cx(
              "h-1 w-12 rounded-full cursor-pointer",
              index <= currentStepIndex ? "bg-primary" : "bg-muted"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onStepClick(step.href);
            }}
          >
            <span className="sr-only">
              {step.name}{" "}
              {index < currentStepIndex
                ? "completed"
                : index === currentStepIndex
                ? "current"
                : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const scrolled = useScroll(15);
  const pathname = usePathname();
  const router = useRouter();

  function getCurrentStepIndex() {
    return steps.findIndex((step) => pathname.startsWith(step.href));
  }

  function handleStepClick(href: string) {
    router.push(href);
  }

  function handleNextStep() {
    if (currentStepIndex < steps.length - 1 && pathname === steps[0].href) {
      router.push(steps[currentStepIndex + 1].href);
    } else if (currentStepIndex === steps.length - 1) {
      router.push("/dashboard");
    }
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen" onClick={handleNextStep}>
      <header
        className={cx(
          "fixed inset-x-0 top-0 isolate z-50 flex items-center justify-between border-b border-border bg-background px-4 transition-all md:grid md:grid-cols-[200px_auto_200px] md:px-6",
          scrolled ? "h-12" : "h-16"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          className="hidden flex-nowrap items-center gap-0.5 md:flex"
          href="/"
        >
          <Logo className="w-7 p-px text-primary" />
          <span className="mt-0.5 text-lg font-semibold text-foreground">
            {site.name.short}
          </span>
        </Link>
        <StepProgress
          steps={steps}
          currentStepIndex={currentStepIndex}
          onStepClick={handleStepClick}
        />
        <Button
          variant="ghost"
          className="ml-auto w-fit"
          asChild
          onClick={(e) => e.stopPropagation()}
        >
          <a href="/dashboard">Skip to dashboard</a>
        </Button>
      </header>
      <main className="mx-auto pt-28 max-w-lg px-4">
        <ProtectedRoute>{children}</ProtectedRoute>
      </main>
    </div>
  );
}
