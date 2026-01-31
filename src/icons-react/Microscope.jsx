import * as React from "react";
const SvgMicroscope = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18h8M3 22h18m-7 0a7 7 0 1 0 0-14h-1m-4 6h2m1-8V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3m1 6a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2z"
    />
  </svg>
);
export default SvgMicroscope;
