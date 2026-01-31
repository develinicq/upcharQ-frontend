import * as React from "react";
const SvgParagraphSpacing = (props) => (
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
      d="M4 21h16M4 3h16m-8 2.5 3 3m-3-3-3 3m3-3v13m0 0 3-3m-3 3-3-3"
    />
  </svg>
);
export default SvgParagraphSpacing;
