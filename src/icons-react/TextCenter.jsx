import * as React from "react";
const SvgTextCenter = (props) => (
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
      d="M22 7H2m15 5H7m11.5 5h-13"
    />
  </svg>
);
export default SvgTextCenter;
