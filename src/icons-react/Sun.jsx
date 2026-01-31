import * as React from "react";
const SvgSun = (props) => (
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
      d="M12 2v1m0 18v1m10-10h-1M3 12H2m17.07-7.07-.392.392M5.322 18.678l-.393.393m14.142 0-.393-.393M5.322 5.322l-.393-.393M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
    />
  </svg>
);
export default SvgSun;
