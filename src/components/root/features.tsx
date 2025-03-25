import React from "react";

const stats = [
  {
    name: "Ticket Resolution",
    value: "30% faster",
  },
  {
    name: "Agent Productivity",
    value: "2-3x",
  },
  {
    name: "Incident Response Time",
    value: "50% faster",
  },
];

export default function Features() {
  return (
    <section className="mx-auto mt-44 w-full max-w-6xl px-3">
      <h2 className="mt-2 inline-block bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300">
        Designed for Instant Response & Seamless Ticket Management
      </h2>
      <p className="mt-6 max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-400">
        Our ITSM platform is engineered for speed, ensuring your team can
        resolve tickets faster than ever. We eliminate delays, streamline
        workflows and empower your team to focus on what matters, solving
        critical issues swiftly and efficiently.
      </p>
      <dl className="mt-12 grid grid-cols-1 gap-y-8 md:grid-cols-3 md:border-y md:border-background/90 md:py-14">
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            <div className="pl-6 md:text-center">
              <dd className="inline-block bg-gradient-to-t from-[#FF100D] to-[#FF7903] bg-clip-text text-5xl font-bold tracking-tight text-transparent lg:text-6xl">
                {stat.value}
              </dd>
              <dt className="mt-1 filter invert text-background/40">
                {stat.name}
              </dt>
            </div>
          </React.Fragment>
        ))}
      </dl>
    </section>
  );
}
