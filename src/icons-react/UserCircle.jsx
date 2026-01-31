import * as React from "react";
const SvgUserCircle = (props) => (
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
      d="M17.97 20c-.16-2.892-1.045-5-5.97-5s-5.81 2.108-5.97 5M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7 3c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z"
    />
  </svg>
);
export default SvgUserCircle;
