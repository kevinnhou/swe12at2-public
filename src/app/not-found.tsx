import Link from "next/link";

import { site } from "@/lib/config";
import { cx } from "@/lib/utils";

import { Button } from "~/button";
import Logo from "@/components/logo";

function ArrowAnimated({
  className,
  ...props
}: React.HTMLAttributes<SVGElement>) {
  return (
    <svg
      className={cx("-mr-1 ml-1.5 stroke-[1.5px]", className)}
      fill="none"
      stroke="currentColor"
      width="11"
      height="11"
      viewBox="0 0 10 10"
      aria-hidden="true"
      {...props}
    >
      <path
        className="opacity-0 transition group-hover:opacity-100"
        d="M0 5h7"
      />
      <path
        className="transition group-hover:translate-x-[3px]"
        d="M1 1l4 4-4 4"
      />
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center ">
      <Link href="/" className="gap-x-2 flex flex-row items-center">
        <Logo className="h-10" />{" "}
        <span className="mt-0.5 text-lg font-semibold text-foreground">
          {site.name.short}
        </span>
      </Link>
      <p className="mt-6 text-4xl font-semibold bg-gradient-to-r from-[#FF100D] to-[#FF7903] bg-clip-text text-transparent sm:text-5xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-foreground/80">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-foreground/60">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Button asChild className="group mt-8" variant="outline">
        <Link href="/">
          Go back home
          <ArrowAnimated className="stroke-foreground/60" />
        </Link>
      </Button>
    </div>
  );
}
