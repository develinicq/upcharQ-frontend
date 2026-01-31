import * as React from "react";
const SvgSupport = (props) => (
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
      d="M19.667 9.5a7.5 7.5 0 0 0-15 0m9.166 10.833h.834a5 5 0 0 0 5-5m-5.834 5a1.667 1.667 0 1 1-3.333 0 1.667 1.667 0 0 1 3.333 0Zm-8.75-5A2.083 2.083 0 0 1 3 13.25v-1.667a2.083 2.083 0 1 1 4.167 0v1.667c0 1.15-.933 2.083-2.084 2.083Zm14.167 0a2.083 2.083 0 0 1-2.083-2.083v-1.667a2.083 2.083 0 1 1 4.166 0v1.667c0 1.15-.932 2.083-2.083 2.083Z"
    />
  </svg>
);
export default SvgSupport;
