import type { SVGProps } from "react";

import * as React from "react";

const Logo: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient
        gradientTransform="matrix(15 0 0 -15 11554.6 9538.1)"
        gradientUnits="userSpaceOnUse"
        id="a"
        x1={-758.7}
        x2={-756.8}
        y1={626.8}
        y2={621}
      >
        <stop offset={0} stopColor="#ff0d0d" />
        <stop offset={1} stopColor="#ff8400" />
      </linearGradient>
    </defs>
    <path
      d="m147.3 101.2 68.6.6c9 0 13.8 10.2 8.4 17.5L122.6 254.7c-31.9-24.1-38.5-69.2-14.4-101.1l39.1-52.3Z"
      style={{
        fill: "url(#a)",
      }}
    />
    <path
      d="m108.7 153-68.6-.6c-9 0-13.8-10.2-8.4-16.8L132.2 1.4c31.9 24.1 38.5 69.2 14.4 101.1z"
      style={{
        fill: "#ff8400",
      }}
    />
  </svg>
);

export default Logo;
