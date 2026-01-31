import * as React from "react";
const SvgMonitor = (props) => (
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
      d="M16 22H8m4-5v5m10-9H2m6 4h8c2.828 0 4.243 0 5.121-.879C22 15.243 22 13.828 22 11v-1c0-3.771 0-5.657-1.172-6.828S17.771 2 14 2h-4C6.229 2 4.343 2 3.172 3.172S2 6.229 2 10v1c0 2.828 0 4.243.879 5.121C3.757 17 5.172 17 8 17Z"
    />
  </svg>
);
export default SvgMonitor;
