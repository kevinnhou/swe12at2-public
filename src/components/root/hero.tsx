"use client";

import ThemedImage from "@/components/themed-image";
import { site } from "@/lib/config";

export default function Hero() {
  return (
    <section className="mt-16 flex flex-col items-center justify-center text-center sm:mt-34 font-inter overflow-hidden">
      <h1 className="text-foreground p-2 text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
        The
        <span className="font-bold sm:px-4 px-2 bg-gradient-to-r from-[#FF100D] to-[#FF7903] text-transparent bg-clip-text">
          ITSM solution
        </span>
        for <br /> modern workplaces
      </h1>
      <p className="mt-6 max-w-lg text-lg text-gray-700 dark:text-gray-400">
        {site.name.short} delivers secure, scalable ticket management with
        modern workspaces.
      </p>
      <div className="relative sm:mx-auto ml-3 mt-20 h-fit w-[40rem] max-w-6xl sm:ml-auto sm:w-full sm:px-2">
        <section className="flow-root">
          <div className="rounded-2xl bg-slate-50/40 p-2 ring-1 ring-inset ring-slate-200/50 dark:bg-gray-900/70 dark:ring-white/10 overflow-hidden">
            <div className="rounded-xl bg-background ring-1 ring-slate-900/5 dark:ring-white/15 overflo">
              <ThemedImage
                alt="App Preview"
                className="rounded-xl shadow-2xl"
                dark="/images/hero-dark.webp"
                height={1600}
                light="/images/hero-light.webp"
                width={2400}
              />
            </div>
          </div>
        </section>
        <div className="absolute inset-x-0 -bottom-20 -mx-10 h-2/4 bg-gradient-to-t from-white via-white to-transparent lg:h-1/4 dark:from-gray-950 dark:via-gray-950 overflow-hidden" />
      </div>
    </section>
  );
}
