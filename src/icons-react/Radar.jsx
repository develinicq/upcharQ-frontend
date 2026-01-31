import * as React from "react";
const SvgRadar = (props) => (
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
      d="M12 12 8.501 9.168 7.5 8.358M7.087 3.29a9.97 9.97 0 0 1 7.501-.95c5.335 1.43 8.5 6.913 7.071 12.248s-6.912 8.5-12.247 7.07-8.5-6.912-7.071-12.247a10 10 0 0 1 1.295-2.897c.303-.462.937-.526 1.366-.179L7.5 8.357m0 0S5.5 10 6 13c.304 1.826 1.769 3.759 4 4.5 3.067 1.02 6.34-.483 7.5-3.5.769-2 .39-4.589-2-6.5S10.5 6 9 7"
    />
  </svg>
);
export default SvgRadar;
