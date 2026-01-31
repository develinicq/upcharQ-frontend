import * as React from "react";
const SvgTextUnderline = (props) => (
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
      d="M4 21h16M4 3v6a8 8 0 1 0 16 0V3"
    />
  </svg>
);
export default SvgTextUnderline;
