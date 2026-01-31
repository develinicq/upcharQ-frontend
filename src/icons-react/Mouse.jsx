import * as React from "react";
const SvgMouse = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="currentColor" d="M5 9a7 7 0 0 1 14 0v6a7 7 0 1 1-14 0z" />
    <path stroke="currentColor" strokeLinecap="round" d="M12 5v3" />
  </svg>
);
export default SvgMouse;
