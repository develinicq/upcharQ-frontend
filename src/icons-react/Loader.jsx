import * as React from "react";
const SvgLoader = (props) => (
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
      d="M12 3a9 9 0 1 0 9 9m-1.206-4.5q.144.25.273.51"
    />
  </svg>
);
export default SvgLoader;
