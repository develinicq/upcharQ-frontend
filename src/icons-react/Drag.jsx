import * as React from "react";
const SvgDrag = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="currentColor" strokeLinecap="round" d="M20 10H4m16 5H4" />
  </svg>
);
export default SvgDrag;
