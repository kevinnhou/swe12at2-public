"use client";

import { Button } from "~/button";

import Link from "next/link";

const methods = {
  email: {
    label: "Continue with email",
    variant: "cta" as const,
  },
};

type TSignupMenuProps = {
  goToNext: () => void;
};

export default function SignupMenu({ goToNext }: TSignupMenuProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-muted-foreground text-center mb-10 font-inter">
        Create your workspace
      </h1>
      {Object.entries(methods).map(([key, { label, variant }]) => (
        <Button
          key={key}
          variant={variant}
          className="w-full"
          onClick={() => (key === "email" ? goToNext() : null)}
        >
          {label}
        </Button>
      ))}
      <div className="text-md text-muted-foreground/60 text-center pt-4 font-inter">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
