import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="6" fill="url(#bs-logo-grad)" />
      <text
        x="12"
        y="16.5"
        fill="white"
        fontSize="13"
        fontWeight="900"
        fontFamily="var(--font-inter), sans-serif"
        textAnchor="middle"
        style={{ letterSpacing: "-0.5px" }}
      >
        BS
      </text>
      <defs>
        <linearGradient id="bs-logo-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand, #0a66c2)" />
          <stop offset="1" stopColor="var(--brand-hover, #084d92)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
