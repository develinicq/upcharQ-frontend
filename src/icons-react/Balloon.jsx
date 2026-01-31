import * as React from "react";
const SvgBalloon = (props) => (
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
      d="M12.5 6a3.035 3.035 0 0 1 3 3M12 20.35c.321 0 .482 0 .593-.022.654-.128 1.051-.772.858-1.39-.033-.105-.11-.242-.261-.515M12 20.35c-.321 0-.482 0-.593-.022-.654-.128-1.051-.772-.858-1.39.033-.105.109-.242.261-.515M12 20.35v2.15m7.56-12.696c.034 4.276-3.418 8.23-7.56 8.196s-7.406-4.045-7.44-8.32C4.528 5.403 7.859 1.965 12 2s7.527 3.529 7.56 7.804Z"
    />
  </svg>
);
export default SvgBalloon;
