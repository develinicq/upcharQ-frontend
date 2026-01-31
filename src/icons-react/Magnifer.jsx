import * as React from "react";
const SvgMagnifer = (props) => (
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
      d="M17.85 17.85 21 21m-.9-9.45a8.55 8.55 0 1 1-17.1 0 8.55 8.55 0 0 1 17.1 0Z"
    />
  </svg>
);
export default SvgMagnifer;
