import * as React from "react";
const SvgHashtag = (props) => (
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
      d="M10 3 5 21M19 3l-5 18m8-12H4m16 7H2"
    />
  </svg>
);
export default SvgHashtag;
