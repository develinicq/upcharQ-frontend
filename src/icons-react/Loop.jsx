import * as React from "react";
const SvgLoop = (props) => (
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
      d="m20 8-4-4m4 4-4 4m4-4H9c-1.333 0-4 .8-4 4m0 4 4 4m-4-4 4-4m-4 4h11c1.333 0 4-.8 4-4"
    />
  </svg>
);
export default SvgLoop;
