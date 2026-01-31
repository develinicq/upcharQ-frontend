import * as React from "react";
const SvgOr = (props) => (
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
      d="M6 3v12m0 0a3 3 0 1 0 3 3m-3-3a3 3 0 0 1 3 3m9-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0a9 9 0 0 1-9 9"
    />
  </svg>
);
export default SvgOr;
