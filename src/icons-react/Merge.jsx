import * as React from "react";
const SvgMerge = (props) => (
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
      d="m12 4.5 5 5m-5-5-5 5m5-5v10c0 1.667-1 5-5 5m6-1.875c.75 1.042 2 1.875 4 1.875"
    />
  </svg>
);
export default SvgMerge;
