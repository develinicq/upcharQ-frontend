import * as React from "react";
const SvgScissors = (props) => (
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
      d="M14.314 2 10.64 19.066M9.686 2l3.675 17.066M5 19.143C5 20.72 6.259 22 7.811 22s2.343-.952 2.812-2.857c.374-1.605-1.259-2.857-2.812-2.857S5 17.565 5 19.143m14 0C19 20.72 17.741 22 16.189 22s-2.343-.952-2.812-2.857c-.374-1.605 1.259-2.857 2.812-2.857S19 17.565 19 19.143"
    />
  </svg>
);
export default SvgScissors;
