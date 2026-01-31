import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Info, Minus, Plus } from "lucide-react";



const plans = [
  {
    id: "trial",
    name: "Upchar-Q Trial",
    price: "60 Days Free",
    isPrice: false,
    icon: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="47.9998" height="47.936" rx="6" fill="#0D47A1" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M37.0207 47.976L28.2873 48.0001C28.2873 48.0001 25.2854 47.0654 25.2854 46.0111C25.2854 44.9567 27.8555 43.5449 28.1433 42.3208C28.5048 40.7841 27.4888 39.6802 25.5221 38.8161C23.8202 38.0684 22.9589 37.1968 24.9222 36.0484C26.5405 35.1018 26.0979 33.4845 26.0979 33.4845L25.606 31.6513C25.606 31.6513 28.689 30.9562 29.445 32.9811C30.4973 35.7996 26.4792 36.4189 28.7491 37.6783C29.6562 38.1816 36.3115 39.1949 32.739 42.393C29.1167 45.6356 34.3464 47.3683 37.0207 47.976Z"
          fill="url(#paint0_linear_2576_11643)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.5583 48C10.5583 48 8.97472 45.153 14.8774 42.4166C20.7801 39.6801 18.2727 38.7262 18.2727 38.7262C18.2727 38.7262 17.0236 37.4957 18.7698 36.4455C20.5161 35.3954 22.062 34.1127 22.3904 33.0586C22.7188 32.0045 23.7474 30.9146 23.7474 30.9146L25.7315 33.6005L24.0744 35.5868C23.4123 36.2456 22.4911 36.7097 21.8352 37.6482C21.1794 38.5867 22.9856 39.719 23.1249 40.1702C23.2642 40.6215 23.7961 41.5063 20.3036 43.5448C16.811 45.5834 17.1678 48 17.1678 48H10.5583ZM23.7474 47.9984V48H17.1678L23.7474 47.9984Z"
          fill="url(#paint1_linear_2576_11643)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M17.1665 48.0001C17.1665 48.0001 16.8097 45.5835 20.3023 43.5449C23.7949 41.5064 23.2629 40.6216 23.1236 40.1703C22.9843 39.7191 20.9859 38.862 21.834 37.6483C22.6821 36.4347 24.6106 35.0664 24.8812 34.1378L25.606 31.6514L26.0979 33.4846C26.0979 33.4846 26.5406 35.1019 24.9223 36.0484C22.9589 37.1968 23.8203 38.0684 25.5221 38.8161C27.4888 39.6802 28.5048 40.7842 28.1434 42.3209C27.8555 43.5449 25.2855 44.9568 25.2855 46.0111C25.2855 47.0324 28.1023 47.9414 28.2787 47.9974L17.1665 48.0001Z"
          fill="#80E2DE"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M24.4655 6.53711L12.0723 30.5306H20.314L24.4655 6.53711Z"
          fill="url(#paint2_linear_2576_11643)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M28.7159 30.5306L24.4629 6.53711L37.0188 30.5306H28.7159Z"
          fill="url(#paint3_linear_2576_11643)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M24.464 35.587V6.53711L20.3125 30.5306L24.464 35.587Z"
          fill="url(#paint4_linear_2576_11643)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M24.4629 35.587V6.53711L28.7159 30.5306L24.4629 35.587Z"
          fill="url(#paint5_linear_2576_11643)"
        />
        <ellipse
          cx="6.54598"
          cy="5.9918"
          rx="1.09091"
          ry="1.08945"
          fill="white"
        />
        <ellipse
          cx="40.3643"
          cy="13.0733"
          rx="1.09091"
          ry="1.08945"
          fill="white"
        />
        <ellipse
          cx="32.1802"
          cy="6.53691"
          rx="0.545453"
          ry="0.544727"
          fill="white"
        />
        <ellipse
          cx="12.0005"
          cy="12.5286"
          rx="0.545453"
          ry="0.544727"
          fill="white"
        />
        <ellipse
          cx="3.81889"
          cy="26.1473"
          rx="0.545453"
          ry="0.544727"
          fill="white"
        />
        <ellipse
          cx="40.9107"
          cy="26.1473"
          rx="0.545453"
          ry="0.544727"
          fill="white"
        />
        <ellipse
          cx="44.7271"
          cy="5.99199"
          rx="0.545453"
          ry="0.544727"
          fill="white"
        />
        <ellipse
          cx="9.27255"
          cy="21.7892"
          rx="1.09091"
          ry="1.08945"
          fill="white"
        />
        <ellipse
          cx="40.9093"
          cy="32.6837"
          rx="1.09091"
          ry="1.08945"
          fill="white"
        />
        <defs>
          <linearGradient
            id="paint0_linear_2576_11643"
            x1="27"
            y1="31.5944"
            x2="34.074"
            y2="52.2998"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_2576_11643"
            x1="15.0016"
            y1="31.5944"
            x2="17.9938"
            y2="50.3887"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.320084" stop-color="#75D9A3" />
            <stop offset="1" stop-color="#00B1BC" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_2576_11643"
            x1="11.9348"
            y1="53.5568"
            x2="24.1512"
            y2="53.5568"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_2576_11643"
            x1="24.3236"
            y1="53.5568"
            x2="36.7005"
            y2="53.5568"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_2576_11643"
            x1="20.2664"
            y1="63.4658"
            x2="24.3587"
            y2="63.4658"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#199EA4" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_2576_11643"
            x1="24.4157"
            y1="63.4658"
            x2="28.6081"
            y2="63.4658"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
        </defs>
      </svg>
    ),
    isTrial: true,
    features: [
      "1 Doctor + 1 Staff (No Extra Add-ons)",
      "Unlimited Online Appointments",
      "Max 25 Walk-in Appointments Daily",
      "Queue Management System",
      "Front Desk Access",
      "Clinic Social Profile",
      "Doctor Profile",
    ],
  },
  {
    id: "basic",
    name: "Upchar-Q Basic",
    price: "₹1,299",
    period: "/Mo",
    taxNote: "+ taxes",
    icon: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48.0001" height="47.9574" rx="6" fill="#0D47A1" />
        <ellipse
          cx="6.54501"
          cy="5.99479"
          rx="1.09091"
          ry="1.08994"
          fill="white"
        />
        <ellipse
          cx="40.3634"
          cy="13.0793"
          rx="1.09091"
          ry="1.08994"
          fill="white"
        />
        <ellipse
          cx="32.1822"
          cy="6.53966"
          rx="0.545456"
          ry="0.544971"
          fill="white"
        />
        <ellipse
          cx="11.9996"
          cy="12.5344"
          rx="0.545456"
          ry="0.544971"
          fill="white"
        />
        <ellipse
          cx="3.81792"
          cy="26.1585"
          rx="0.545456"
          ry="0.544971"
          fill="white"
        />
        <ellipse
          cx="40.9087"
          cy="26.1585"
          rx="0.545456"
          ry="0.544971"
          fill="white"
        />
        <ellipse
          cx="44.7271"
          cy="5.99474"
          rx="0.545456"
          ry="0.544971"
          fill="white"
        />
        <ellipse
          cx="9.27255"
          cy="21.7989"
          rx="1.09091"
          ry="1.08994"
          fill="white"
        />
        <ellipse
          cx="40.9093"
          cy="32.6982"
          rx="1.09091"
          ry="1.08994"
          fill="white"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M26.8268 34.0338L21.25 34.1001C18.3974 29.006 13.1335 25.3403 12.6924 18.8177C12.6924 12.7434 18.1815 8.19391 24.0031 8.19391C29.5427 8.19391 35.3206 12.6422 35.3206 18.4902C35.3206 24.7588 29.6581 28.8525 26.8268 34.0338Z"
          fill="url(#paint0_linear_5118_49144)"
        />
        <path
          d="M21.8861 34.0969H21.502V36.3913H21.8861V34.0969Z"
          fill="url(#paint1_linear_5118_49144)"
        />
        <path
          d="M24.1986 34.0969H23.8145V36.3913H24.1986V34.0969Z"
          fill="url(#paint2_linear_5118_49144)"
        />
        <path
          d="M26.2543 34.0969H25.8701V36.3913H26.2543V34.0969Z"
          fill="url(#paint3_linear_5118_49144)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.2324 37.8197C11.2254 35.7075 12.6149 34.7402 14.4046 34.9306C16.2033 35.1853 16.9949 36.1364 16.9442 37.6704C16.8907 38.2888 17.163 38.4597 17.7925 38.1396C18.4582 37.673 19.1492 37.4403 19.9002 37.7557C20.69 38.1136 20.4554 39.2018 21.1812 39.2932L21.8856 42.427L10.8841 42.1955L10.2324 37.8197Z"
          fill="url(#paint4_linear_5118_49144)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M43.4017 47.9998C30.0637 47.9893 16.7258 47.9786 3.38777 47.968C2.85877 46.34 3.69606 45.4706 4.96143 44.8388C1.87812 42.2599 2.99468 37.6382 7.82112 36.9284C9.77162 36.5688 11.5048 37.549 13.1138 39.2934C14.7322 41.5399 16.0732 39.6923 17.5528 39.8918C18.8937 40.002 19.7651 41.0715 20.7112 40.8939L26.6235 39.8385C29.273 38.9784 28.9457 40.9438 30.1227 41.0645C31.332 41.1563 32.2852 39.4681 33.8146 39.2934C34.4354 39.182 34.1597 40.0194 34.7323 40.2224C36.1799 40.5527 36.6031 37.6422 40.2915 38.3351C44.2364 39.2934 46.2649 43.8192 43.4017 47.9998Z"
          fill="url(#paint5_linear_5118_49144)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M21.1826 36.3912H26.6245V41.0353C26.6245 41.6735 26.1019 42.1957 25.4631 42.1957H22.3441C21.7053 42.1957 21.1826 41.6735 21.1826 41.0353V36.3912Z"
          fill="url(#paint6_linear_5118_49144)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M23.2512 34.0763C21.8863 25.4063 20.5555 13.9641 23.6362 8.19391C12.1379 15.1539 18.6683 25.8661 22.4198 34.0763H23.2512Z"
          fill="url(#paint7_linear_5118_49144)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M24.8742 34.0568C26.2391 25.3868 27.5699 13.9446 24.4893 8.17444C35.6249 15.2332 29.1934 25.9184 25.7056 34.0568H24.8742Z"
          fill="url(#paint8_linear_5118_49144)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M24.8857 34.0568L23.2516 34.0761C21.3656 22.2517 21.0844 12.9801 23.6262 8.2001L24.4899 8.17444C28.1004 14.2645 25.7807 27.5429 24.8857 34.0568Z"
          fill="url(#paint9_radial_5118_49144)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.2445 28.9439L20.3927 28.9119C20.3927 28.1319 19.924 28.1088 20.0737 27.6273C20.2916 27.1679 20.1725 26.7803 19.8443 26.6677C19.3517 26.5317 18.7432 26.6197 18.0517 26.8674C17.762 26.9357 17.7228 26.8765 17.6968 26.6009C17.5772 25.8232 16.8429 25.3639 16.1363 25.535C13.5584 26.0235 12.6938 27.7482 13.2445 28.9439Z"
          fill="white"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M28.9834 30.7801H41.8113C42.5786 30.749 42.8974 30.0238 42.7824 28.628C41.9714 25.9912 40.7305 25.021 39.2077 25.1418C38.1152 25.2288 37.2915 26.0142 36.6254 27.2101C35.9284 28.3309 35.1055 28.5892 34.1807 28.1464C33.1121 27.3676 32.0109 27.5008 30.885 28.3146L28.9834 30.7801Z"
          fill="white"
        />
        <defs>
          <linearGradient
            id="paint0_linear_5118_49144"
            x1="12.4414"
            y1="58.9619"
            x2="34.7468"
            y2="58.9619"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_5118_49144"
            x1="21.4977"
            y1="38.5931"
            x2="21.8764"
            y2="38.5931"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.680208" stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_5118_49144"
            x1="23.8102"
            y1="38.5931"
            x2="24.1889"
            y2="38.5931"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.680208" stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_5118_49144"
            x1="25.8659"
            y1="38.5931"
            x2="26.2446"
            y2="38.5931"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.680208" stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_5118_49144"
            x1="10.1031"
            y1="49.6437"
            x2="21.5901"
            y2="49.6437"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#AFFFD4" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_5118_49144"
            x1="2.76597"
            y1="58.6958"
            x2="43.6926"
            y2="58.6958"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#81F3FB" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint6_linear_5118_49144"
            x1="21.1222"
            y1="47.7662"
            x2="26.4865"
            y2="47.7662"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint7_linear_5118_49144"
            x1="17.0755"
            y1="58.9152"
            x2="23.4716"
            y2="58.9152"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.232292" stop-color="#54CEAB" />
            <stop offset="1" stop-color="#05A5AF" />
          </linearGradient>
          <linearGradient
            id="paint8_linear_5118_49144"
            x1="24.4199"
            y1="58.8957"
            x2="30.5847"
            y2="58.8957"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.232292" stop-color="#10B6B9" />
            <stop offset="1" stop-color="#75D9A4" />
          </linearGradient>
          <radialGradient
            id="paint9_radial_5118_49144"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(2.30113 1.62098e-05 -3.00876e-06 1322.31 24.0277 58.9336)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </radialGradient>
        </defs>
      </svg>
    ),
    features: [
      "1 Doctor + 1 Staff",
      "Unlimited Online and Walk-ins Appts",
      "Queue Management System",
      "Front Desk Access",
      "Clinic Social Profile",
      "Doctor Social Profile",
      "Role Based Access",
    ],
  },
  {
    id: "plus",
    name: "Upchar-Q Plus",
    price: "₹2,299",
    period: "/Mo",
    taxNote: "+ taxes",
    icon: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="6" fill="#0D47A1" />
        <circle cx="6.54501" cy="6.00003" r="1.09091" fill="white" />
        <circle cx="40.3634" cy="13.0909" r="1.09091" fill="white" />
        <circle cx="32.1822" cy="6.54545" r="0.545455" fill="white" />
        <circle cx="11.9996" cy="12.5455" r="0.545455" fill="white" />
        <circle cx="3.81792" cy="26.1818" r="0.545455" fill="white" />
        <circle cx="40.9087" cy="26.1818" r="0.545455" fill="white" />
        <circle cx="44.7271" cy="5.99998" r="0.545455" fill="white" />
        <circle cx="9.27255" cy="21.8182" r="1.09091" fill="white" />
        <circle cx="40.9093" cy="32.7273" r="1.09091" fill="white" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M24.095 44.3126V10.3635C22.5718 10.594 21.2004 12.2639 20.0823 16.344V35.7482C19.8394 36.6732 23.3653 44.6793 24.095 44.3126Z"
          fill="url(#paint0_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M5.13899 29.9188C5.15786 30.1851 5.24911 30.3844 5.5416 30.3974L20.0824 28.7679V21.5651L4.98047 28.0535L5.13899 29.9188Z"
          fill="url(#paint1_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.0026 24.0262C10.3704 24.0262 10.6713 24.3271 10.6713 24.6949V26.7312H9.33398V24.6949C9.33398 24.3271 9.6349 24.0262 10.0026 24.0262Z"
          fill="url(#paint2_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M14.8659 21.8844C15.2337 21.8844 15.5345 22.1852 15.5345 22.553V24.5893H14.1973V22.553C14.1973 22.1852 14.4981 21.8844 14.8659 21.8844Z"
          fill="url(#paint3_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M21.6185 40.2823L17.8506 42.7548L18.1392 45.3913C18.1392 45.3913 18.1621 46.0752 18.656 45.9536C19.1498 45.832 23.5134 43.851 23.5134 43.851L21.6185 40.2823Z"
          fill="url(#paint4_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M16.727 32.0498L16.9399 39.8906C16.9434 40.4104 16.7139 40.626 16.1806 40.4453C14.9379 39.9477 14.2755 39.1827 14.0456 38.2192C13.8203 37.4137 14.8941 36.6694 15.0106 35.6664C15.1296 34.6559 14.3748 34.3369 15.3675 32.6349C15.9259 31.8968 15.7176 31.618 16.249 31.594C16.5034 31.5774 16.6751 31.707 16.727 32.0498Z"
          fill="url(#paint5_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M12.5412 33.7009V47.9603C10.3622 47.9999 8.99858 47.9603 6.46094 47.9603C6.46094 44.9668 9.51635 44.8602 9.86438 43.4013C9.93539 42.2793 9.2032 41.4024 9.18293 40.174C9.16266 38.9532 10.3275 38.7583 10.5809 37.8112C10.7759 37.1755 9.83131 36.4713 10.4595 35.3114C10.6849 34.7895 11.3205 34.5414 11.546 33.8145C11.8778 33.2097 12.2094 33.2117 12.5412 33.7009Z"
          fill="url(#paint6_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M24.083 44.3126V10.3635C25.6062 10.594 26.9776 12.2639 28.0957 16.344V35.7482C28.3386 36.6732 24.8127 44.6793 24.083 44.3126Z"
          fill="url(#paint7_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M43.0401 29.9188C43.0212 30.1851 42.93 30.3844 42.6375 30.3974L28.0967 28.7679V21.5651L43.1986 28.0535L43.0401 29.9188Z"
          fill="url(#paint8_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M38.1764 24.0262C37.8087 24.0262 37.5078 24.3271 37.5078 24.6949V26.7312H38.8451V24.6949C38.8451 24.3271 38.5442 24.0262 38.1764 24.0262Z"
          fill="url(#paint9_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M33.3142 21.8844C32.9464 21.8844 32.6455 22.1852 32.6455 22.553V24.5893H33.9828V22.553C33.9828 22.1852 33.6819 21.8844 33.3142 21.8844Z"
          fill="url(#paint10_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M26.5599 40.2823L30.3278 42.7548L30.0392 45.3913C30.0392 45.3913 30.0163 46.0752 29.5224 45.9536C29.0285 45.832 24.665 43.851 24.665 43.851L26.5599 40.2823Z"
          fill="url(#paint11_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M31.4523 32.0498L31.2393 39.8906C31.2358 40.4104 31.4653 40.626 31.9986 40.4453C33.2414 39.9477 33.9037 39.1827 34.1336 38.2192C34.359 37.4137 33.2851 36.6694 33.1686 35.6664C33.0496 34.6559 33.8044 34.3369 32.8117 32.6349C32.2533 31.8968 32.4616 31.618 31.9303 31.594C31.6758 31.5774 31.5041 31.707 31.4523 32.0498Z"
          fill="url(#paint12_linear_5118_49047)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M35.6366 33.7009L35.4531 47.9603C37.9077 47.9603 39.2713 47.9603 41.7169 47.9603C41.7169 44.9668 38.6615 44.8602 38.3134 43.4013C38.2425 42.2793 38.9746 41.4024 38.9949 40.174C39.0152 38.9532 37.8503 38.7583 37.597 37.8112C37.4019 37.1755 38.3465 36.4713 37.7184 35.3114C37.4929 34.7895 36.8573 34.5414 36.6318 33.8145C36.3001 33.2097 35.9684 33.2117 35.6366 33.7009Z"
          fill="url(#paint13_linear_5118_49047)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_5118_49047"
            x1="20.0257"
            y1="76.917"
            x2="23.9929"
            y2="76.917"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#75D9A3" />
            <stop offset="0.805208" stop-color="#00B1BC" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_5118_49047"
            x1="4.81294"
            y1="38.8736"
            x2="19.6995"
            y2="38.8736"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#75D9A3" />
            <stop offset="1" stop-color="#00B1BC" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_5118_49047"
            x1="9.31915"
            y1="29.327"
            x2="10.6374"
            y2="29.327"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_5118_49047"
            x1="14.1824"
            y1="27.1851"
            x2="15.5006"
            y2="27.1851"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_5118_49047"
            x1="17.7878"
            y1="51.4246"
            x2="23.3698"
            y2="51.4246"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#75D9A3" />
            <stop offset="0.83125" stop-color="#00B1BC" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_5118_49047"
            x1="13.9822"
            y1="49.0645"
            x2="16.8658"
            y2="49.0645"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#B6E8EB" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint6_linear_5118_49047"
            x1="6.39315"
            y1="68.5278"
            x2="12.4168"
            y2="68.5278"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#B6E8EB" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint7_linear_5118_49047"
            x1="24.0384"
            y1="76.917"
            x2="28.0056"
            y2="76.917"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint8_linear_5118_49047"
            x1="27.9291"
            y1="38.8736"
            x2="42.8157"
            y2="38.8736"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint9_linear_5118_49047"
            x1="37.493"
            y1="29.327"
            x2="38.8112"
            y2="29.327"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint10_linear_5118_49047"
            x1="32.6307"
            y1="27.1851"
            x2="33.9489"
            y2="27.1851"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint11_linear_5118_49047"
            x1="24.6022"
            y1="51.4246"
            x2="30.1842"
            y2="51.4246"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint12_linear_5118_49047"
            x1="31.2068"
            y1="49.0645"
            x2="34.0904"
            y2="49.0645"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#D8FFEA" />
          </linearGradient>
          <linearGradient
            id="paint13_linear_5118_49047"
            x1="35.5382"
            y1="68.5278"
            x2="41.5619"
            y2="68.5278"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#D8FFEA" />
          </linearGradient>
        </defs>
      </svg>
    ),
    features: [
      "1 Doctor + 1 Staff",
      "Unlimited Online and Walk-ins Appts",
      "Personalized Dashboard",
      "Queue Management System",
      "Front Desk Access",
      "Patient Listing",
      "Personal Calendar",
      "Clinic Social Profile",
      "Doctor Social Profile",
      "Role Based Access",
    ],
  },
  {
    id: "pro",
    name: "Upchar-Q Pro",
    price: "₹2,549",
    period: "/Mo",
    taxNote: "+ taxes",
    icon: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="6" fill="#0D47A1" />
        <circle cx="6.54501" cy="6.00003" r="1.09091" fill="white" />
        <circle cx="40.3634" cy="13.0909" r="1.09091" fill="white" />
        <circle cx="32.1822" cy="6.54545" r="0.545455" fill="white" />
        <circle cx="11.9996" cy="12.5455" r="0.545455" fill="white" />
        <circle cx="3.81792" cy="26.1818" r="0.545455" fill="white" />
        <circle cx="40.9087" cy="26.1818" r="0.545455" fill="white" />
        <circle cx="44.7271" cy="5.99998" r="0.545455" fill="white" />
        <circle cx="9.27255" cy="21.8182" r="1.09091" fill="white" />
        <circle cx="40.9093" cy="32.7273" r="1.09091" fill="white" />
        <g clip-path="url(#clip0_5118_44036)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M24.1897 9.27277C22.5413 10.381 21.3566 11.6125 20.8096 13.0135H27.4173C26.6983 11.5128 25.5628 10.3081 24.1897 9.27277Z"
            fill="url(#paint0_linear_5118_44036)"
          />
          <path
            opacity="0.5"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M27.9397 36.6399C29.0912 36.7671 29.7094 37.8633 29.7595 39.993C30.3288 39.9084 30.7301 40.1766 30.921 40.8862C31.6688 40.4696 32.4015 40.5562 33.1151 41.2617C34.335 39.2694 35.9001 38.5198 37.8774 39.2549C39.3019 36.8336 41.3484 36.3296 44.1495 38.1546C46.9672 40.6045 47.2563 44.6241 44.0857 47.6956C43.8691 47.8518 43.627 47.959 43.3501 47.9999H5.16281C4.4604 47.9246 3.88118 47.6849 3.41982 47.2871C0.2409 43.4143 1.62836 38.7741 5.09734 37.2924C7.47261 36.4466 8.99913 37.3619 10.0666 39.2092C12.3128 38.6279 13.8517 39.3722 14.79 41.2418C15.5039 40.5833 16.2271 40.4803 16.9582 40.8406C17.3134 40.2435 17.7088 39.9574 18.1326 39.8955C18.1568 38.0385 18.7963 37.0281 19.8876 36.6399L19.9134 25.3892H28.1862L27.9397 36.6399H27.9397Z"
            fill="url(#paint1_linear_5118_44036)"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.5985 30.3082L20.8096 26.1978C20.2521 24.7088 19.6948 23.22 19.1373 21.7311C16.5803 24.5898 15.75 27.4926 17.5985 30.3082Z"
            fill="url(#paint2_linear_5118_44036)"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M24.1267 30.4645L24.1135 13.0135L20.809 13.0136C18.6831 16.2306 18.4974 20.689 19.9138 25.3892C20.4188 27.065 21.1309 28.7714 22.0372 30.4627L24.1267 30.4645Z"
            fill="url(#paint3_linear_5118_44036)"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M30.6427 30.3082L27.4316 26.1978C27.9891 24.7088 28.5464 23.22 29.1039 21.7311C31.6609 24.5898 32.4912 27.4926 30.6427 30.3082Z"
            fill="url(#paint4_linear_5118_44036)"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M24.1263 30.4645L24.1133 13.0117H27.4169C30.3008 17.3756 29.6642 24.0272 26.2157 30.4627L24.1263 30.4645Z"
            fill="url(#paint5_linear_5118_44036)"
          />
          <path
            d="M24.1382 19.8086C25.2145 19.8086 26.087 18.9334 26.087 17.8537C26.087 16.7741 25.2145 15.8989 24.1382 15.8989C23.0619 15.8989 22.1895 16.7741 22.1895 17.8537C22.1895 18.9334 23.0619 19.8086 24.1382 19.8086Z"
            fill="url(#paint6_linear_5118_44036)"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M22.5795 36.0418L22.5367 38.9264C22.0805 39.189 21.7949 39.574 21.8205 40.1821C20.2047 40.3508 19.4293 41.5906 19.4654 43.8651C18.885 43.7329 18.3121 43.9411 17.7489 44.6031C17.0808 43.7353 16.0346 43.5309 14.6782 43.8716C14.2651 42.6208 13.3023 41.9896 11.7877 41.9814C9.7283 42.2264 8.73654 43.2982 8.63867 45.0622C8.63867 46.7556 10.0103 47.766 12.0329 47.8845H35.2633C37.8029 48.0251 39.7158 47.2996 39.7158 45.1788C39.4728 43.103 38.3626 42.0366 36.399 41.9632C35.1203 41.9652 34.245 42.6866 33.5856 43.7936C32.3744 43.4251 31.3554 43.7304 30.4882 44.5703C30.0878 43.9671 29.5246 43.7063 28.7459 43.8971C28.9337 41.6503 28.2873 40.314 26.5134 40.2077C26.4278 39.6419 26.1947 39.2847 25.8165 39.1332L25.8158 36.0971L22.5795 36.0418L22.5795 36.0418Z"
            fill="url(#paint7_linear_5118_44036)"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M24.204 37.8034C26.5635 36.0206 27.1601 33.6265 26.2159 30.4626H23.0812H22.037C20.9468 32.9448 21.9722 36.2148 24.204 37.8034Z"
            fill="url(#paint8_linear_5118_44036)"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M24.227 34.2802C25.3657 32.9859 25.4858 31.6777 25.2608 30.4586C24.5123 30.4584 23.8301 30.4629 23.0816 30.4627C22.7288 31.7176 23.1693 32.9865 24.227 34.2802Z"
            fill="white"
            fill-opacity="0.73"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_5118_44036"
            x1="24.5463"
            y1="12.8182"
            x2="24.5463"
            y2="9.81822"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_5118_44036"
            x1="1.14054"
            y1="69.699"
            x2="45.2299"
            y2="69.699"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_5118_44036"
            x1="16.5519"
            y1="38.5396"
            x2="20.7028"
            y2="38.5396"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_5118_44036"
            x1="17.4553"
            y1="21.8183"
            x2="25.6372"
            y2="30.5456"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_5118_44036"
            x1="27.3849"
            y1="38.5396"
            x2="31.5358"
            y2="38.5396"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_5118_44036"
            x1="24.0004"
            y1="20.4547"
            x2="28.364"
            y2="21.0001"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.254909" stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <linearGradient
            id="paint6_linear_5118_44036"
            x1="24.1382"
            y1="15.8989"
            x2="26.1821"
            y2="19.3636"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="white" />
            <stop offset="1" stop-color="#82DEAD" />
          </linearGradient>
          <linearGradient
            id="paint7_linear_5118_44036"
            x1="24.0009"
            y1="49.6364"
            x2="24.0009"
            y2="36.8182"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="0.520897" stop-color="#82DEAC" />
          </linearGradient>
          <linearGradient
            id="paint8_linear_5118_44036"
            x1="24.2732"
            y1="30.2727"
            x2="24.2732"
            y2="37.6364"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00B1BC" />
            <stop offset="1" stop-color="#75D9A3" />
          </linearGradient>
          <clipPath id="clip0_5118_44036">
            <rect
              width="44.7273"
              height="38.7273"
              fill="white"
              transform="translate(1.63672 9.27271)"
            />
          </clipPath>
        </defs>
      </svg>
    ),
    features: [
      "1 Doctor + 2 Staff",
      "Unlimited Online and Walk-ins Appts",
      "Personalized Dashboard",
      "Queue Management System",
      "Front Desk Access",
      "Patient Listing",
      "Personal Calendar",
      "Clinic Social Profile",
      "Doctor Social Profile",
      "Role Based Access",
    ],
  },
];

export default function Step6() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("trial");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [doctors, setDoctors] = useState(1);
  const [staff, setStaff] = useState(1);

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);
  const [openInfoPlanId, setOpenInfoPlanId] = useState(null);

  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpenInfoPlanId(null);
      }
    };

    if (openInfoPlanId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openInfoPlanId]);

  const handleContinue = () => {
    if (selectedPlan === "trial") {
      navigate("/success");
    } else {
      navigate("/step6/test/payment", {
        state: {
          plan: selectedPlan,
          billingCycle,
          doctors,
          staff,
        },
      });
    }
  };
  function AddOnPricingPopup() {
    return (
      <div className="absolute z-50 top-7 left-1/2 -translate-x-1/2 w-[260px]">
        {/* Card */}
        <div className="relative bg-card border border-border rounded-md shadow-lg px-4 py-3">
          <p className="text-xs font-medium text-secondary-grey300 mb-2">
            ADD-ONS PRICING
          </p>

          <div className="space-y-2">
            {/* Extra Doctor */}
            <div className="flex items-center gap-2 text-xs text-secondary-grey400">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.2123 11.9688C12.2871 11.703 12.1323 11.4269 11.8664 11.3521C11.6006 11.2773 11.3245 11.4321 11.2497 11.6979L11.731 11.8334L12.2123 11.9688ZM2.78571 1.66667C3.06186 1.66667 3.28571 1.44281 3.28571 1.16667C3.28571 0.890524 3.06186 0.666667 2.78571 0.666667V1.16667V1.66667ZM7.35714 0.666667C7.081 0.666667 6.85714 0.890524 6.85714 1.16667C6.85714 1.44281 7.081 1.66667 7.35714 1.66667V1.16667V0.666667ZM9.63508 2.9905L9.13703 3.03454V3.03454L9.63508 2.9905ZM7.81903 1.17444L7.77499 1.6725V1.6725L7.81903 1.17444ZM2.32383 1.17444L2.27979 0.676384V0.676384L2.32383 1.17444ZM0.507774 2.9905L1.00583 3.03454V3.03454L0.507774 2.9905ZM7.66667 0.5C7.66667 0.223858 7.44281 0 7.16667 0C6.89052 0 6.66667 0.223858 6.66667 0.5H7.16667H7.66667ZM6.66667 1.83333C6.66667 2.10948 6.89052 2.33333 7.16667 2.33333C7.44281 2.33333 7.66667 2.10948 7.66667 1.83333H7.16667H6.66667ZM3.66667 0.5C3.66667 0.223858 3.44281 0 3.16667 0C2.89052 0 2.66667 0.223858 2.66667 0.5H3.16667H3.66667ZM2.66667 1.83333C2.66667 2.10948 2.89052 2.33333 3.16667 2.33333C3.44281 2.33333 3.66667 2.10948 3.66667 1.83333H3.16667H2.66667ZM5.16667 8.6569H4.66667V10.5H5.16667H5.66667V8.6569H5.16667ZM8.5 13.8334V14.3334H9.08824V13.8334V13.3334H8.5V13.8334ZM5.16667 10.5H4.66667C4.66667 12.6171 6.38291 14.3334 8.5 14.3334V13.8334V13.3334C6.93519 13.3334 5.66667 12.0648 5.66667 10.5H5.16667ZM9.08824 13.8334V14.3334C10.5759 14.3334 11.8285 13.3328 12.2123 11.9688L11.731 11.8334L11.2497 11.6979C10.9841 12.642 10.1162 13.3334 9.08824 13.3334V13.8334ZM2.78571 1.16667V0.666667H2.7246V1.16667V1.66667H2.78571V1.16667ZM0.5 3.39127H0V3.99019H0.5H1V3.39127H0.5ZM9.64286 4.18067H10.1429V3.39127H9.64286H9.14286V4.18067H9.64286ZM7.41826 1.16667V0.666667H7.35714V1.16667V1.66667H7.41826V1.16667ZM9.64286 3.39127H10.1429C10.1429 3.19338 10.1433 3.06189 10.1331 2.94645L9.63508 2.9905L9.13703 3.03454C9.14237 3.09493 9.14286 3.17201 9.14286 3.39127H9.64286ZM7.41826 1.16667V1.66667C7.63751 1.66667 7.71459 1.66716 7.77499 1.6725L7.81903 1.17444L7.86307 0.676384C7.74764 0.666177 7.61615 0.666667 7.41826 0.666667V1.16667ZM9.63508 2.9905L10.1331 2.94645C10.0264 1.73969 9.06983 0.783097 7.86307 0.676384L7.81903 1.17444L7.77499 1.6725C8.49904 1.73652 9.073 2.31048 9.13703 3.03454L9.63508 2.9905ZM9.64286 4.18067H9.14286C9.14286 6.37667 7.36265 8.1569 5.16667 8.1569V8.6569V9.1569C7.91495 9.1569 10.1429 6.92894 10.1429 4.18067H9.64286ZM0.5 3.99019H0C0 6.84366 2.31319 9.1569 5.16667 9.1569V8.6569V8.1569C2.86549 8.1569 1 6.29139 1 3.99019H0.5ZM2.7246 1.16667V0.666667C2.52671 0.666667 2.39522 0.666177 2.27979 0.676384L2.32383 1.17444L2.36787 1.6725C2.42827 1.66716 2.50534 1.66667 2.7246 1.66667V1.16667ZM0.5 3.39127H1C1 3.17201 1.00049 3.09493 1.00583 3.03454L0.507774 2.9905L0.00971767 2.94645C-0.000489891 3.06189 0 3.19338 0 3.39127H0.5ZM2.32383 1.17444L2.27979 0.676384C1.07302 0.783097 0.116431 1.73969 0.00971764 2.94645L0.507774 2.9905L1.00583 3.03454C1.06986 2.31048 1.64381 1.73652 2.36787 1.6725L2.32383 1.17444ZM13.8333 9.83333H13.3333C13.3333 10.6618 12.6618 11.3333 11.8333 11.3333V11.8333V12.3333C13.214 12.3333 14.3333 11.214 14.3333 9.83333H13.8333ZM11.8333 11.8333V11.3333C11.0049 11.3333 10.3333 10.6618 10.3333 9.83333H9.83333H9.33333C9.33333 11.214 10.4526 12.3333 11.8333 12.3333V11.8333ZM9.83333 9.83333H10.3333C10.3333 9.00491 11.0049 8.33333 11.8333 8.33333V7.83333V7.33333C10.4526 7.33333 9.33333 8.45262 9.33333 9.83333H9.83333ZM11.8333 7.83333V8.33333C12.6618 8.33333 13.3333 9.00491 13.3333 9.83333H13.8333H14.3333C14.3333 8.45262 13.214 7.33333 11.8333 7.33333V7.83333ZM7.16667 0.5H6.66667V1.83333H7.16667H7.66667V0.5H7.16667ZM3.16667 0.5H2.66667V1.83333H3.16667H3.66667V0.5H3.16667Z"
                  fill="#626060"
                />
              </svg>

              <span>Extra Doctor - @ ₹1,299/Mo + Taxes</span>
            </div>

            {/* Extra Staff */}
            <div className="flex items-center gap-2 text-xs text-secondary-grey400">
              <svg
                width="15"
                height="13"
                viewBox="0 0 15 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.85854 1.16667C10.9508 1.16667 11.8492 2.08667 11.8492 3.22C11.8492 4.35333 10.9573 5.26667 9.85854 5.26667M12.922 10.9933C13.8333 10.58 13.8333 9.88667 13.8333 9.10667C13.8333 7.96 12.3791 7 10.479 6.82667M7.5 9.5H9.16667M8.25569 3.16667C8.25569 4.64 7.0988 5.83333 5.67046 5.83333C4.24212 5.83333 3.08523 4.64 3.08523 3.16667C3.08523 1.69333 4.24212 0.5 5.67046 0.5C7.0988 0.5 8.25569 1.69333 8.25569 3.16667ZM10.8409 9.5C10.8409 11.16 10.8409 12.5 5.67046 12.5C0.5 12.5 0.5 11.16 0.5 9.5C0.5 8.38735 1.5395 7.41846 3.08523 6.90049C3.84563 6.64569 4.72853 8.83333 5.67046 8.83333C6.61239 8.83333 7.4953 6.64569 8.2557 6.90049C9.80143 7.41846 10.8409 8.38735 10.8409 9.5Z"
                  stroke="#626060"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <span>Extra Staff - @ ₹399/Mo + Taxes</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col no-scrollbar ">
      

      <div className="flex flex-1 overflow-hidden">
        

        <main className="flex-1 overflow-hidden p-4">
          <div className="max-w-7xl mx-auto flex flex-col h-full">
            {/* Header */}
            <div className="text-center mb-1">
              <h1 className="text-2xl font-bold text-secondary-grey400 mb-1">
                Package & Payment
              </h1>
              <p className="text-sm text-secondary-grey300">
                Select the suitable package and make the payment to activate the
                account.
              </p>
              {/* Progress bar */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-24 h-1 bg-blue-primary250 rounded-full" />
                <div className="w-24 h-1 bg-secondary-grey100 rounded-full" />
              </div>
              <p className="text-xs text-secondary-grey200 mt-1">1 of 2</p>
            </div>

            {/* Billing Tabs */}
            <div className="flex items-center justify-center mb-3 mx-auto px-2">
              <div className="flex items-center justify-center bg-blue-primary50  rounded">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === "monthly"
                      ? "bg-blue-primary250 text-monochrom-white"
                      : "text-secondary-grey300"
                  }`}
                >
                  Billed Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("halfYearly")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === "halfYearly"
                      ? "bg-blue-primary250 text-monochrom-white"
                      : "text-secondary-grey300"
                  }`}
                >
                  Billed Half-Yearly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === "yearly"
                      ? "bg-blue-primary250 text-monochrom-white"
                      : "text-secondary-grey300"
                  }`}
                >
                  Billed Annually
                </button>
              </div>
              <span className="text-xs text-blue-primary250 font-medium flex items-center">
                <svg
                  width="31"
                  height="25"
                  viewBox="0 0 31 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M27.2261 17.5707C23.7206 18.4446 19.535 18.6106 16.4543 16.4036C14.4856 14.9931 13.4401 12.141 14.1759 9.82602C14.8708 7.63968 16.4935 5.7187 18.9251 5.77725C20.1926 5.80777 21.2854 6.3909 21.5161 7.72568C21.8686 9.7649 19.8343 11.8752 18.2169 12.7622C13.1692 15.5305 6.02848 15.3764 1.21995 12.1632"
                    stroke="#2372EC"
                    stroke-linecap="round"
                  />
                  <path
                    d="M3.33871 15.9293C2.75053 15.1074 1.46612 13.19 1.03389 12.0957"
                    stroke="#2372EC"
                    stroke-linecap="round"
                  />
                  <path
                    d="M1.03402 12.0958C2.036 11.9636 4.31355 11.5911 5.40788 11.1589"
                    stroke="#2372EC"
                    stroke-linecap="round"
                  />
                </svg>
                Get 2 Months Free😍
              </span>
            </div>

            {/* Plans Grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar ">
              <div className="grid grid-cols-2 max-w-3xl mx-auto gap-6 pb-2">
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  const isTrial = plan.id === "trial";

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative rounded-lg border cursor-pointer transition-all border-blue-primary400 p-4 ${
                        isSelected
                          ? " bg-blue-primary250 text-monochrom-white"
                          : "bg-card hover:border-blue-primary150"
                      }`}
                    >
                      {/* Plan Icon & Name & Price */}
                      <div className="flex items-center gap-2 mb-3">
                        {plan.icon && (
                          <div className="w-12 h-12">{plan.icon}</div>
                        )}

                        <div className="flex flex-col">
                          <h3
                            className={`text-sm font-semibold ${
                              isSelected
                                ? "text-monochrom-white"
                                : "text-secondary-grey300"
                            }`}
                          >
                            {plan.name}
                          </h3>
                          {isTrial ? (
                            <p
                              className={`text-xl font-bold ${
                                isSelected
                                  ? "text-monochrom-white"
                                  : "text-blue-primary250"
                              }`}
                            >
                              {plan.price}
                            </p>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span
                                className={`text-xl font-bold ${
                                  isSelected
                                    ? "text-monochrom-white"
                                    : "text-blue-primary250"
                                }`}
                              >
                                {plan.price}
                              </span>
                              <span
                                className={`text-xl font-bold ${
                                  isSelected
                                    ? "text-monochrom-white/80"
                                    : "text-blue-primary250"
                                }`}
                              >
                                {plan.period}
                              </span>
                              <span
                                className={`text-xs ${
                                  isSelected
                                    ? "text-monochrom-white/60"
                                    : "text-secondary-grey200"
                                }`}
                              >
                                {plan.taxNote}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Select Button */}
                      {isSelected ? (
                        <button className="w-full py-2 bg-monochrom-white text-blue-primary250 rounded-md text-sm font-medium flex items-center justify-center gap-2">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.02087 7.97994C5.82561 7.78468 5.50903 7.78468 5.31376 7.97994C5.1185 8.1752 5.1185 8.49179 5.31376 8.68705L5.66732 8.3335L6.02087 7.97994ZM7.00065 9.66683L6.6471 10.0204C6.84236 10.2156 7.15894 10.2156 7.3542 10.0204L7.00065 9.66683ZM10.6875 6.68705C10.8828 6.49179 10.8828 6.1752 10.6875 5.97994C10.4923 5.78468 10.1757 5.78468 9.98043 5.97994L10.334 6.3335L10.6875 6.68705ZM14.6673 8.00016H14.1673C14.1673 11.4059 11.4064 14.1668 8.00065 14.1668V14.6668V15.1668C11.9587 15.1668 15.1673 11.9582 15.1673 8.00016H14.6673ZM8.00065 14.6668V14.1668C4.59489 14.1668 1.83398 11.4059 1.83398 8.00016H1.33398H0.833984C0.833984 11.9582 4.04261 15.1668 8.00065 15.1668V14.6668ZM1.33398 8.00016H1.83398C1.83398 4.59441 4.59489 1.8335 8.00065 1.8335V1.3335V0.833496C4.04261 0.833496 0.833984 4.04212 0.833984 8.00016H1.33398ZM8.00065 1.3335V1.8335C11.4064 1.8335 14.1673 4.59441 14.1673 8.00016H14.6673H15.1673C15.1673 4.04212 11.9587 0.833496 8.00065 0.833496V1.3335ZM5.66732 8.3335L5.31376 8.68705L6.6471 10.0204L7.00065 9.66683L7.3542 9.31328L6.02087 7.97994L5.66732 8.3335ZM7.00065 9.66683L7.3542 10.0204L10.6875 6.68705L10.334 6.3335L9.98043 5.97994L6.6471 9.31328L7.00065 9.66683Z"
                              fill="#2372EC"
                            />
                          </svg>
                          Selected
                        </button>
                      ) : (
                        <button className="w-full py-2 bg-blue-primary250 hover:bg-blue-primary300 text-monochrom-white rounded-md text-sm font-medium">
                          Choose
                        </button>
                      )}

                      {/* Features */}
                      <div className="mt-4">
                        <p
                          className={`text-xs mb-2 ${
                            isSelected
                              ? "text-monochrom-white/80"
                              : "text-secondary-grey200"
                          }`}
                        >
                          Access To:
                        </p>
                        <ul className="space-y-2">
                          {plan.features.slice(0, 8).map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                                    isSelected ? " " : ""
                                  }`}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M7.99967 14.6666C11.6816 14.6666 14.6663 11.6819 14.6663 7.99998C14.6663 4.31808 11.6816 1.33331 7.99967 1.33331C4.31778 1.33331 1.33301 4.31808 1.33301 7.99998C1.33301 11.6819 4.31778 14.6666 7.99967 14.6666Z"
                                      fill="#F2F7FF"
                                    />
                                    <path
                                      d="M5.66634 8.33331L6.99967 9.66665L10.333 6.33331"
                                      fill="#F2F7FF"
                                    />
                                    <path
                                      d="M6.01989 7.97976C5.82463 7.7845 5.50805 7.7845 5.31279 7.97976C5.11753 8.17502 5.11753 8.4916 5.31279 8.68687L5.66634 8.33331L6.01989 7.97976ZM6.99967 9.66665L6.64612 10.0202C6.84138 10.2155 7.15797 10.2155 7.35323 10.0202L6.99967 9.66665ZM10.6866 6.68687C10.8818 6.4916 10.8818 6.17502 10.6866 5.97976C10.4913 5.7845 10.1747 5.7845 9.97945 5.97976L10.333 6.33331L10.6866 6.68687ZM14.6663 7.99998H14.1663C14.1663 11.4057 11.4054 14.1666 7.99967 14.1666V14.6666V15.1666C11.9577 15.1666 15.1663 11.958 15.1663 7.99998H14.6663ZM7.99967 14.6666V14.1666C4.59392 14.1666 1.83301 11.4057 1.83301 7.99998H1.33301H0.833008C0.833008 11.958 4.04163 15.1666 7.99967 15.1666V14.6666ZM1.33301 7.99998H1.83301C1.83301 4.59422 4.59392 1.83331 7.99967 1.83331V1.33331V0.833313C4.04163 0.833313 0.833008 4.04194 0.833008 7.99998H1.33301ZM7.99967 1.33331V1.83331C11.4054 1.83331 14.1663 4.59422 14.1663 7.99998H14.6663H15.1663C15.1663 4.04194 11.9577 0.833313 7.99967 0.833313V1.33331ZM5.66634 8.33331L5.31279 8.68687L6.64612 10.0202L6.99967 9.66665L7.35323 9.31309L6.01989 7.97976L5.66634 8.33331ZM6.99967 9.66665L7.35323 10.0202L10.6866 6.68687L10.333 6.33331L9.97945 5.97976L6.64612 9.31309L6.99967 9.66665Z"
                                      fill="#2372EC"
                                    />
                                  </svg>
                                </span>
                                <span
                                  className={
                                    isSelected
                                      ? "text-monochrom-white"
                                      : "text-secondary-grey300"
                                  }
                                >
                                  {feature}
                                </span>
                              </div>
                              {idx === 0 && plan.id !== "trial" && (
                                <div
                                  className="relative"
                                  ref={
                                    openInfoPlanId === plan.id ? popupRef : null
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenInfoPlanId((prev) =>
                                        prev === plan.id ? null : plan.id
                                      );
                                    }}
                                    className="p-1 rounded"
                                  >
                                    <svg
                                      width="15"
                                      height="15"
                                      viewBox="0 0 15 15"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className={
                                        isSelected
                                          ? "stroke-monochrom-white"
                                          : "stroke-secondary-grey300"
                                      }
                                    >
                                      <path
                                        d="M7.16667 10.5V6.5M7.16667 4.83333V4.5M13.8333 7.16667C13.8333 10.8486 10.8486 13.8333 7.16667 13.8333C3.48477 13.8333 0.5 10.8486 0.5 7.16667C0.5 3.48477 3.48477 0.5 7.16667 0.5C10.8486 0.5 13.8333 3.48477 13.8333 7.16667Z"
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                  </button>

                                  {openInfoPlanId === plan.id && (
                                    <AddOnPricingPopup />
                                  )}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctor/Staff Counter */}
            <div className="flex flex-wrap gap-8 border-t border-border pt-1 pr-4">
              {/* Doctors */}
              <div>
                <p className="text-sm text-secondary-grey300 mb-1 mt-1">
                  Number of Doctors
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={doctors === 1}
                    onClick={() => setDoctors(doctors - 1)}
                    className={`w-8 h-8 rounded border flex items-center justify-center
        ${
          doctors === 1
            ? "border-secondary-grey100 text-secondary-grey150 cursor-not-allowed"
            : "border-border text-secondary-grey300 hover:bg-muted"
        }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-16 h-8 flex items-center justify-center border border-border rounded text-sm font-medium text-secondary-grey400">
                    {doctors}
                  </span>

                  <button
                    disabled={doctors === 2}
                    onClick={() => setDoctors(doctors + 1)}
                    className={`w-8 h-8 rounded border flex items-center justify-center
        ${
          doctors === 2
            ? "border-secondary-grey100 text-secondary-grey150 cursor-not-allowed"
            : "border-border text-secondary-grey300 hover:bg-muted"
        }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Staff */}
              <div>
                <p className="text-sm text-secondary-grey300 mb-1 mt-1">
                  Number of Staffs
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={staff === 1}
                    onClick={() => setStaff(staff - 1)}
                    className={`w-8 h-8 rounded border flex items-center justify-center
        ${
          staff === 1
            ? "border-secondary-grey100 text-secondary-grey150 cursor-not-allowed"
            : "border-border text-secondary-grey300 hover:bg-muted"
        }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-16 h-8 flex items-center justify-center border border-border rounded text-sm font-medium text-secondary-grey400">
                    {staff}
                  </span>

                  <button
                    disabled={staff === 4}
                    onClick={() => setStaff(staff + 1)}
                    className={`w-8 h-8 rounded border flex items-center justify-center
        ${
          staff === 4
            ? "border-secondary-grey100 text-secondary-grey150 cursor-not-allowed"
            : "border-border text-secondary-grey300 hover:bg-muted"
        }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Estimate Invoice */}
              <div className="ml-auto text-right flex flex-col gap-[1px]">
                <p className="text-sm text-secondary-grey300">
                  Estimate invoice{" "}
                  <span className="text-secondary-grey200">
                    ({selectedPlanData?.name || "Upchar-Q Free"})
                  </span>
                </p>
                <p className="text-xs text-secondary-grey200">
                  (₹2,299 Package Price + ₹414 taxes)
                </p>
                <p className="text-2xl font-bold text-blue-primary250">
                  {selectedPlanData.id === "trial"
                    ? `₹00/Month`
                    : `${selectedPlanData.price}/Month`}
                </p>
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  );
}
// import React from 'react';
// import RegistrationSuccess from '../../../../components/RegistrationSuccess';
// import useDoctorStep1Store from '../../../../store/useDoctorStep1Store';

// const Step6 = () => {
//   const { firstName, lastName } = useDoctorStep1Store();
//   const doctorName = firstName && lastName ? `Dr. ${firstName} ${lastName}` : 'Doctor';

//   return (
//     <div className="h-full bg-white">
//       <RegistrationSuccess name={doctorName} />
// </div>
// )};

