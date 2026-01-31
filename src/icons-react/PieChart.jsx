import * as React from "react";
const SvgPieChart = (props) => (
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
      d="M20 15.552A9.215 9.215 0 0 1 11.21 22 9.21 9.21 0 0 1 2 12.79 9.215 9.215 0 0 1 8.448 4m5.605-1.913a11.35 11.35 0 0 1 7.86 7.86C22.372 11.591 20.946 13 19.24 13h-6.694A1.545 1.545 0 0 1 11 11.455V4.761c0-1.707 1.41-3.133 3.053-2.674Z"
    />
  </svg>
);
export default SvgPieChart;
