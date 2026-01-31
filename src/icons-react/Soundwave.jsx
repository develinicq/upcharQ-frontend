import * as React from "react";
const SvgSoundwave = (props) => (
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
      d="M12 4v16m4-13v10M8 7v10m12-6v2M4 11v2"
    />
  </svg>
);
export default SvgSoundwave;
