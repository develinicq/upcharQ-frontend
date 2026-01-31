import * as React from "react";
const SvgAllergy = (props) => (
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
      d="m8 12 2-1.5L8 9m8 3-2-1.5L16 9m0 7-1.333-1-1.334 1L12 15l-1.333 1-1.334-1L8 16m14-4c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10"
    />
  </svg>
);
export default SvgAllergy;
