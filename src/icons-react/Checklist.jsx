import * as React from "react";
const SvgChecklist = (props) => (
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
      d="M2 5.5 3.214 7 7.5 3M2 12.5 3.214 14 7.5 10M2 19.5 3.214 21 7.5 17M22 19H12m10-7H12m10-7H12"
    />
  </svg>
);
export default SvgChecklist;
