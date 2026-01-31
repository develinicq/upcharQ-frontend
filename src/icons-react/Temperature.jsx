import * as React from "react";
const SvgTemperature = (props) => (
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
      d="M12 14a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm0 0V5m5.5 11.5a5.5 5.5 0 1 1-8.939-4.293c.264-.211.439-.521.439-.86V5a3 3 0 1 1 6 0v6.348c0 .338.175.648.439.86A5.49 5.49 0 0 1 17.5 16.5Z"
    />
  </svg>
);
export default SvgTemperature;
