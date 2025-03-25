"use client";

import Link from "next/link";

import { Button } from "~/button";

export default function Cta() {
  return (
    <section className="mx-auto max-w-6xl p-1 px-2 my-20">
      <div className="flex items-center justify-center">
        <div className="max-w-4xl">
          <div className="items-center justify-center text-center">
            <div>
              <h3 className="inline-block bg-gradient-to-t from-gray-900 to-gray-800 bg-clip-text p-2 text-4xl font-bold tracking-tighter text-transparent md:text-6xl dark:from-gray-50 dark:to-gray-300">
                Ready to get started?
              </h3>
              <p className="mx-auto mt-4 max-w-2xl text-foreground/60 sm:text-lg">
                Launch a new workspace and start managing your tickets with
                ease.
              </p>
              <Link href="/signup">
                <Button className="mt-8" variant="cta">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
