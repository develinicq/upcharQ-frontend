import * as React from "react";
const SvgCommand = (props) => (
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
      d="M8 8h8M8 8v8h8M8 8H5.001a3 3 0 1 1 3-3zm8 0v8m0-8h3a3 3 0 1 0-3-3zm0 8h3a3 3 0 1 1-3 3.001zm-7.999.001h-3a3 3 0 1 0 3 3z"
    />
  </svg>
);
export default SvgCommand;
