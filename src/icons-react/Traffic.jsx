import * as React from "react";
const SvgTraffic = (props) => (
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
      d="M22 12A10 10 0 1 1 12 2m2.5.315c3.514.904 6.28 3.67 7.185 7.185"
    />
  </svg>
);
export default SvgTraffic;
