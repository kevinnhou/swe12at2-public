"use client";

import { useRouter } from "next/navigation";

import { Button } from "~/button";

const methods = {
  email: {
    label: "Continue with email",
    variant: "cta" as const,
  },
};

interface TLoginMenuProps {
  goToNext: () => void;
}

export default function LoginMenu({ goToNext }: TLoginMenuProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-muted-foreground text-center mb-10 font-inter">
        Log in to Jyra
      </h1>
      {Object.entries(methods).map(([key, { label, variant }]) => (
        <Button
          className="w-full"
          key={key}
          onClick={() => (key === "email" ? goToNext() : null)}
          variant={variant}
        >
          {label}
        </Button>
      ))}
      <div className="text-md text-muted-foreground/60 text-center pt-4 font-inter">
        Don't have an account?{" "}
        <button
          className="text-foreground hover:underline"
          onClick={() => router.push("/signup")}
        >
          Sign up{" "}
        </button>{" "}
        or{" "}
        <button
          className="text-foreground hover:underline"
          onClick={() => router.push("/")}
        >
          Learn more
        </button>
      </div>
    </div>
  );
}
