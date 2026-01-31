import * as React from "react";
const SvgInfinity = (props) => (
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
      d="M10 8a5 5 0 1 0-3 9c2.761 0 3.5-2 5-5s2.239-5 5-5a5 5 0 1 1-3 9"
    />
  </svg>
);
export default SvgInfinity;
