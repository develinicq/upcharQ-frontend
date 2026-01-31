import * as React from "react";
const SvgMapArrow = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <g clipPath="url(#Map_Arrow_svg__a)">
      <path
        stroke="currentColor"
        d="m14.94 20.489 5.82-15.192c.467-1.218-.655-2.341-1.873-1.875L3.694 9.244c-1.376.527-1.42 2.457-.066 2.869l5.763 1.75c.448.137.792.481.928.93l1.751 5.762c.412 1.355 2.342 1.31 2.87-.066Z"
      />
    </g>
    <defs>
      <clipPath id="Map_Arrow_svg__a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgMapArrow;
