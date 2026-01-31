import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Info, Bell } from "lucide-react";
const BasicSVG = (
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="48.0001" height="47.9574" rx="6" fill="#0D47A1"/>
<ellipse cx="6.54501" cy="5.99479" rx="1.09091" ry="1.08994" fill="white"/>
<ellipse cx="40.3634" cy="13.0793" rx="1.09091" ry="1.08994" fill="white"/>
<ellipse cx="32.1822" cy="6.53966" rx="0.545456" ry="0.544971" fill="white"/>
<ellipse cx="11.9996" cy="12.5344" rx="0.545456" ry="0.544971" fill="white"/>
<ellipse cx="3.81792" cy="26.1585" rx="0.545456" ry="0.544971" fill="white"/>
<ellipse cx="40.9087" cy="26.1585" rx="0.545456" ry="0.544971" fill="white"/>
<ellipse cx="44.7271" cy="5.99474" rx="0.545456" ry="0.544971" fill="white"/>
<ellipse cx="9.27255" cy="21.7989" rx="1.09091" ry="1.08994" fill="white"/>
<ellipse cx="40.9093" cy="32.6982" rx="1.09091" ry="1.08994" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M26.8268 34.0338L21.25 34.1001C18.3974 29.006 13.1335 25.3403 12.6924 18.8177C12.6924 12.7434 18.1815 8.19391 24.0031 8.19391C29.5427 8.19391 35.3206 12.6422 35.3206 18.4902C35.3206 24.7588 29.6581 28.8525 26.8268 34.0338Z" fill="url(#paint0_linear_5118_49144)"/>
<path d="M21.8861 34.0969H21.502V36.3913H21.8861V34.0969Z" fill="url(#paint1_linear_5118_49144)"/>
<path d="M24.1986 34.0969H23.8145V36.3913H24.1986V34.0969Z" fill="url(#paint2_linear_5118_49144)"/>
<path d="M26.2543 34.0969H25.8701V36.3913H26.2543V34.0969Z" fill="url(#paint3_linear_5118_49144)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.2324 37.8197C11.2254 35.7075 12.6149 34.7402 14.4046 34.9306C16.2033 35.1853 16.9949 36.1364 16.9442 37.6704C16.8907 38.2888 17.163 38.4597 17.7925 38.1396C18.4582 37.673 19.1492 37.4403 19.9002 37.7557C20.69 38.1136 20.4554 39.2018 21.1812 39.2932L21.8856 42.427L10.8841 42.1955L10.2324 37.8197Z" fill="url(#paint4_linear_5118_49144)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M43.4017 47.9998C30.0637 47.9893 16.7258 47.9786 3.38777 47.968C2.85877 46.34 3.69606 45.4706 4.96143 44.8388C1.87812 42.2599 2.99468 37.6382 7.82112 36.9284C9.77162 36.5688 11.5048 37.549 13.1138 39.2934C14.7322 41.5399 16.0732 39.6923 17.5528 39.8918C18.8937 40.002 19.7651 41.0715 20.7112 40.8939L26.6235 39.8385C29.273 38.9784 28.9457 40.9438 30.1227 41.0645C31.332 41.1563 32.2852 39.4681 33.8146 39.2934C34.4354 39.182 34.1597 40.0194 34.7323 40.2224C36.1799 40.5527 36.6031 37.6422 40.2915 38.3351C44.2364 39.2934 46.2649 43.8192 43.4017 47.9998Z" fill="url(#paint5_linear_5118_49144)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M21.1826 36.3912H26.6245V41.0353C26.6245 41.6735 26.1019 42.1957 25.4631 42.1957H22.3441C21.7053 42.1957 21.1826 41.6735 21.1826 41.0353V36.3912Z" fill="url(#paint6_linear_5118_49144)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M23.2512 34.0763C21.8863 25.4063 20.5555 13.9641 23.6362 8.19391C12.1379 15.1539 18.6683 25.8661 22.4198 34.0763H23.2512Z" fill="url(#paint7_linear_5118_49144)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.8742 34.0568C26.2391 25.3868 27.5699 13.9446 24.4893 8.17444C35.6249 15.2332 29.1934 25.9184 25.7056 34.0568H24.8742Z" fill="url(#paint8_linear_5118_49144)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.8857 34.0568L23.2516 34.0761C21.3656 22.2517 21.0844 12.9801 23.6262 8.2001L24.4899 8.17444C28.1004 14.2645 25.7807 27.5429 24.8857 34.0568Z" fill="url(#paint9_radial_5118_49144)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.2445 28.9439L20.3927 28.9119C20.3927 28.1319 19.924 28.1088 20.0737 27.6273C20.2916 27.1679 20.1725 26.7803 19.8443 26.6677C19.3517 26.5317 18.7432 26.6197 18.0517 26.8674C17.762 26.9357 17.7228 26.8765 17.6968 26.6009C17.5772 25.8232 16.8429 25.3639 16.1363 25.535C13.5584 26.0235 12.6938 27.7482 13.2445 28.9439Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M28.9834 30.7801H41.8113C42.5786 30.749 42.8974 30.0238 42.7824 28.628C41.9714 25.9912 40.7305 25.021 39.2077 25.1418C38.1152 25.2288 37.2915 26.0142 36.6254 27.2101C35.9284 28.3309 35.1055 28.5892 34.1807 28.1464C33.1121 27.3676 32.0109 27.5008 30.885 28.3146L28.9834 30.7801Z" fill="white"/>
<defs>
<linearGradient id="paint0_linear_5118_49144" x1="12.4414" y1="58.9619" x2="34.7468" y2="58.9619" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint1_linear_5118_49144" x1="21.4977" y1="38.5931" x2="21.8764" y2="38.5931" gradientUnits="userSpaceOnUse">
<stop offset="0.680208" stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint2_linear_5118_49144" x1="23.8102" y1="38.5931" x2="24.1889" y2="38.5931" gradientUnits="userSpaceOnUse">
<stop offset="0.680208" stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint3_linear_5118_49144" x1="25.8659" y1="38.5931" x2="26.2446" y2="38.5931" gradientUnits="userSpaceOnUse">
<stop offset="0.680208" stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint4_linear_5118_49144" x1="10.1031" y1="49.6437" x2="21.5901" y2="49.6437" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#AFFFD4"/>
</linearGradient>
<linearGradient id="paint5_linear_5118_49144" x1="2.76597" y1="58.6958" x2="43.6926" y2="58.6958" gradientUnits="userSpaceOnUse">
<stop stop-color="#81F3FB"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint6_linear_5118_49144" x1="21.1222" y1="47.7662" x2="26.4865" y2="47.7662" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint7_linear_5118_49144" x1="17.0755" y1="58.9152" x2="23.4716" y2="58.9152" gradientUnits="userSpaceOnUse">
<stop offset="0.232292" stop-color="#54CEAB"/>
<stop offset="1" stop-color="#05A5AF"/>
</linearGradient>
<linearGradient id="paint8_linear_5118_49144" x1="24.4199" y1="58.8957" x2="30.5847" y2="58.8957" gradientUnits="userSpaceOnUse">
<stop offset="0.232292" stop-color="#10B6B9"/>
<stop offset="1" stop-color="#75D9A4"/>
</linearGradient>
<radialGradient id="paint9_radial_5118_49144" cx="0" cy="0" r="1" gradientTransform="matrix(2.30113 1.62098e-05 -3.00876e-06 1322.31 24.0277 58.9336)" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</radialGradient>
</defs>
</svg>


);

const PlusSVG = (
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="48" height="48" rx="6" fill="#0D47A1"/>
<circle cx="6.54501" cy="6.00003" r="1.09091" fill="white"/>
<circle cx="40.3634" cy="13.0909" r="1.09091" fill="white"/>
<circle cx="32.1822" cy="6.54545" r="0.545455" fill="white"/>
<circle cx="11.9996" cy="12.5455" r="0.545455" fill="white"/>
<circle cx="3.81792" cy="26.1818" r="0.545455" fill="white"/>
<circle cx="40.9087" cy="26.1818" r="0.545455" fill="white"/>
<circle cx="44.7271" cy="5.99998" r="0.545455" fill="white"/>
<circle cx="9.27255" cy="21.8182" r="1.09091" fill="white"/>
<circle cx="40.9093" cy="32.7273" r="1.09091" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.095 44.3126V10.3635C22.5718 10.594 21.2004 12.2639 20.0823 16.344V35.7482C19.8394 36.6732 23.3653 44.6793 24.095 44.3126Z" fill="url(#paint0_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.13899 29.9188C5.15786 30.1851 5.24911 30.3844 5.5416 30.3974L20.0824 28.7679V21.5651L4.98047 28.0535L5.13899 29.9188Z" fill="url(#paint1_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.0026 24.0262C10.3704 24.0262 10.6713 24.3271 10.6713 24.6949V26.7312H9.33398V24.6949C9.33398 24.3271 9.6349 24.0262 10.0026 24.0262Z" fill="url(#paint2_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.8659 21.8844C15.2337 21.8844 15.5345 22.1852 15.5345 22.553V24.5893H14.1973V22.553C14.1973 22.1852 14.4981 21.8844 14.8659 21.8844Z" fill="url(#paint3_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M21.6185 40.2823L17.8506 42.7548L18.1392 45.3913C18.1392 45.3913 18.1621 46.0752 18.656 45.9536C19.1498 45.832 23.5134 43.851 23.5134 43.851L21.6185 40.2823Z" fill="url(#paint4_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M16.727 32.0498L16.9399 39.8906C16.9434 40.4104 16.7139 40.626 16.1806 40.4453C14.9379 39.9477 14.2755 39.1827 14.0456 38.2192C13.8203 37.4137 14.8941 36.6694 15.0106 35.6664C15.1296 34.6559 14.3748 34.3369 15.3675 32.6349C15.9259 31.8968 15.7176 31.618 16.249 31.594C16.5034 31.5774 16.6751 31.707 16.727 32.0498Z" fill="url(#paint5_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.5412 33.7009V47.9603C10.3622 47.9999 8.99858 47.9603 6.46094 47.9603C6.46094 44.9668 9.51635 44.8602 9.86438 43.4013C9.93539 42.2793 9.2032 41.4024 9.18293 40.174C9.16266 38.9532 10.3275 38.7583 10.5809 37.8112C10.7759 37.1755 9.83131 36.4713 10.4595 35.3114C10.6849 34.7895 11.3205 34.5414 11.546 33.8145C11.8778 33.2097 12.2094 33.2117 12.5412 33.7009Z" fill="url(#paint6_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.083 44.3126V10.3635C25.6062 10.594 26.9776 12.2639 28.0957 16.344V35.7482C28.3386 36.6732 24.8127 44.6793 24.083 44.3126Z" fill="url(#paint7_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M43.0401 29.9188C43.0212 30.1851 42.93 30.3844 42.6375 30.3974L28.0967 28.7679V21.5651L43.1986 28.0535L43.0401 29.9188Z" fill="url(#paint8_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M38.1764 24.0262C37.8087 24.0262 37.5078 24.3271 37.5078 24.6949V26.7312H38.8451V24.6949C38.8451 24.3271 38.5442 24.0262 38.1764 24.0262Z" fill="url(#paint9_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M33.3142 21.8844C32.9464 21.8844 32.6455 22.1852 32.6455 22.553V24.5893H33.9828V22.553C33.9828 22.1852 33.6819 21.8844 33.3142 21.8844Z" fill="url(#paint10_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M26.5599 40.2823L30.3278 42.7548L30.0392 45.3913C30.0392 45.3913 30.0163 46.0752 29.5224 45.9536C29.0285 45.832 24.665 43.851 24.665 43.851L26.5599 40.2823Z" fill="url(#paint11_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M31.4523 32.0498L31.2393 39.8906C31.2358 40.4104 31.4653 40.626 31.9986 40.4453C33.2414 39.9477 33.9037 39.1827 34.1336 38.2192C34.359 37.4137 33.2851 36.6694 33.1686 35.6664C33.0496 34.6559 33.8044 34.3369 32.8117 32.6349C32.2533 31.8968 32.4616 31.618 31.9303 31.594C31.6758 31.5774 31.5041 31.707 31.4523 32.0498Z" fill="url(#paint12_linear_5118_49047)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M35.6366 33.7009L35.4531 47.9603C37.9077 47.9603 39.2713 47.9603 41.7169 47.9603C41.7169 44.9668 38.6615 44.8602 38.3134 43.4013C38.2425 42.2793 38.9746 41.4024 38.9949 40.174C39.0152 38.9532 37.8503 38.7583 37.597 37.8112C37.4019 37.1755 38.3465 36.4713 37.7184 35.3114C37.4929 34.7895 36.8573 34.5414 36.6318 33.8145C36.3001 33.2097 35.9684 33.2117 35.6366 33.7009Z" fill="url(#paint13_linear_5118_49047)"/>
<defs>
<linearGradient id="paint0_linear_5118_49047" x1="20.0257" y1="76.917" x2="23.9929" y2="76.917" gradientUnits="userSpaceOnUse">
<stop stop-color="#75D9A3"/>
<stop offset="0.805208" stop-color="#00B1BC"/>
</linearGradient>
<linearGradient id="paint1_linear_5118_49047" x1="4.81294" y1="38.8736" x2="19.6995" y2="38.8736" gradientUnits="userSpaceOnUse">
<stop stop-color="#75D9A3"/>
<stop offset="1" stop-color="#00B1BC"/>
</linearGradient>
<linearGradient id="paint2_linear_5118_49047" x1="9.31915" y1="29.327" x2="10.6374" y2="29.327" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint3_linear_5118_49047" x1="14.1824" y1="27.1851" x2="15.5006" y2="27.1851" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint4_linear_5118_49047" x1="17.7878" y1="51.4246" x2="23.3698" y2="51.4246" gradientUnits="userSpaceOnUse">
<stop stop-color="#75D9A3"/>
<stop offset="0.83125" stop-color="#00B1BC"/>
</linearGradient>
<linearGradient id="paint5_linear_5118_49047" x1="13.9822" y1="49.0645" x2="16.8658" y2="49.0645" gradientUnits="userSpaceOnUse">
<stop stop-color="#B6E8EB"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint6_linear_5118_49047" x1="6.39315" y1="68.5278" x2="12.4168" y2="68.5278" gradientUnits="userSpaceOnUse">
<stop stop-color="#B6E8EB"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint7_linear_5118_49047" x1="24.0384" y1="76.917" x2="28.0056" y2="76.917" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint8_linear_5118_49047" x1="27.9291" y1="38.8736" x2="42.8157" y2="38.8736" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint9_linear_5118_49047" x1="37.493" y1="29.327" x2="38.8112" y2="29.327" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint10_linear_5118_49047" x1="32.6307" y1="27.1851" x2="33.9489" y2="27.1851" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint11_linear_5118_49047" x1="24.6022" y1="51.4246" x2="30.1842" y2="51.4246" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint12_linear_5118_49047" x1="31.2068" y1="49.0645" x2="34.0904" y2="49.0645" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#D8FFEA"/>
</linearGradient>
<linearGradient id="paint13_linear_5118_49047" x1="35.5382" y1="68.5278" x2="41.5619" y2="68.5278" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#D8FFEA"/>
</linearGradient>
</defs>
</svg>

);

const ProSVG = (
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="48" height="48" rx="6" fill="#0D47A1"/>
<circle cx="6.54501" cy="6.00003" r="1.09091" fill="white"/>
<circle cx="40.3634" cy="13.0909" r="1.09091" fill="white"/>
<circle cx="32.1822" cy="6.54545" r="0.545455" fill="white"/>
<circle cx="11.9996" cy="12.5455" r="0.545455" fill="white"/>
<circle cx="3.81792" cy="26.1818" r="0.545455" fill="white"/>
<circle cx="40.9087" cy="26.1818" r="0.545455" fill="white"/>
<circle cx="44.7271" cy="5.99998" r="0.545455" fill="white"/>
<circle cx="9.27255" cy="21.8182" r="1.09091" fill="white"/>
<circle cx="40.9093" cy="32.7273" r="1.09091" fill="white"/>
<g clip-path="url(#clip0_5118_44036)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.1897 9.27277C22.5413 10.381 21.3566 11.6125 20.8096 13.0135H27.4173C26.6983 11.5128 25.5628 10.3081 24.1897 9.27277Z" fill="url(#paint0_linear_5118_44036)"/>
<path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M27.9397 36.6399C29.0912 36.7671 29.7094 37.8633 29.7595 39.993C30.3288 39.9084 30.7301 40.1766 30.921 40.8862C31.6688 40.4696 32.4015 40.5562 33.1151 41.2617C34.335 39.2694 35.9001 38.5198 37.8774 39.2549C39.3019 36.8336 41.3484 36.3296 44.1495 38.1546C46.9672 40.6045 47.2563 44.6241 44.0857 47.6956C43.8691 47.8518 43.627 47.959 43.3501 47.9999H5.16281C4.4604 47.9246 3.88118 47.6849 3.41982 47.2871C0.2409 43.4143 1.62836 38.7741 5.09734 37.2924C7.47261 36.4466 8.99913 37.3619 10.0666 39.2092C12.3128 38.6279 13.8517 39.3722 14.79 41.2418C15.5039 40.5833 16.2271 40.4803 16.9582 40.8406C17.3134 40.2435 17.7088 39.9574 18.1326 39.8955C18.1568 38.0385 18.7963 37.0281 19.8876 36.6399L19.9134 25.3892H28.1862L27.9397 36.6399H27.9397Z" fill="url(#paint1_linear_5118_44036)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M17.5985 30.3082L20.8096 26.1978C20.2521 24.7088 19.6948 23.22 19.1373 21.7311C16.5803 24.5898 15.75 27.4926 17.5985 30.3082Z" fill="url(#paint2_linear_5118_44036)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.1267 30.4645L24.1135 13.0135L20.809 13.0136C18.6831 16.2306 18.4974 20.689 19.9138 25.3892C20.4188 27.065 21.1309 28.7714 22.0372 30.4627L24.1267 30.4645Z" fill="url(#paint3_linear_5118_44036)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M30.6427 30.3082L27.4316 26.1978C27.9891 24.7088 28.5464 23.22 29.1039 21.7311C31.6609 24.5898 32.4912 27.4926 30.6427 30.3082Z" fill="url(#paint4_linear_5118_44036)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.1263 30.4645L24.1133 13.0117H27.4169C30.3008 17.3756 29.6642 24.0272 26.2157 30.4627L24.1263 30.4645Z" fill="url(#paint5_linear_5118_44036)"/>
<path d="M24.1382 19.8086C25.2145 19.8086 26.087 18.9334 26.087 17.8537C26.087 16.7741 25.2145 15.8989 24.1382 15.8989C23.0619 15.8989 22.1895 16.7741 22.1895 17.8537C22.1895 18.9334 23.0619 19.8086 24.1382 19.8086Z" fill="url(#paint6_linear_5118_44036)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M22.5795 36.0418L22.5367 38.9264C22.0805 39.189 21.7949 39.574 21.8205 40.1821C20.2047 40.3508 19.4293 41.5906 19.4654 43.8651C18.885 43.7329 18.3121 43.9411 17.7489 44.6031C17.0808 43.7353 16.0346 43.5309 14.6782 43.8716C14.2651 42.6208 13.3023 41.9896 11.7877 41.9814C9.7283 42.2264 8.73654 43.2982 8.63867 45.0622C8.63867 46.7556 10.0103 47.766 12.0329 47.8845H35.2633C37.8029 48.0251 39.7158 47.2996 39.7158 45.1788C39.4728 43.103 38.3626 42.0366 36.399 41.9632C35.1203 41.9652 34.245 42.6866 33.5856 43.7936C32.3744 43.4251 31.3554 43.7304 30.4882 44.5703C30.0878 43.9671 29.5246 43.7063 28.7459 43.8971C28.9337 41.6503 28.2873 40.314 26.5134 40.2077C26.4278 39.6419 26.1947 39.2847 25.8165 39.1332L25.8158 36.0971L22.5795 36.0418L22.5795 36.0418Z" fill="url(#paint7_linear_5118_44036)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.204 37.8034C26.5635 36.0206 27.1601 33.6265 26.2159 30.4626H23.0812H22.037C20.9468 32.9448 21.9722 36.2148 24.204 37.8034Z" fill="url(#paint8_linear_5118_44036)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.227 34.2802C25.3657 32.9859 25.4858 31.6777 25.2608 30.4586C24.5123 30.4584 23.8301 30.4629 23.0816 30.4627C22.7288 31.7176 23.1693 32.9865 24.227 34.2802Z" fill="white" fill-opacity="0.73"/>
</g>
<defs>
<linearGradient id="paint0_linear_5118_44036" x1="24.5463" y1="12.8182" x2="24.5463" y2="9.81822" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint1_linear_5118_44036" x1="1.14054" y1="69.699" x2="45.2299" y2="69.699" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint2_linear_5118_44036" x1="16.5519" y1="38.5396" x2="20.7028" y2="38.5396" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint3_linear_5118_44036" x1="17.4553" y1="21.8183" x2="25.6372" y2="30.5456" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint4_linear_5118_44036" x1="27.3849" y1="38.5396" x2="31.5358" y2="38.5396" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint5_linear_5118_44036" x1="24.0004" y1="20.4547" x2="28.364" y2="21.0001" gradientUnits="userSpaceOnUse">
<stop offset="0.254909" stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<linearGradient id="paint6_linear_5118_44036" x1="24.1382" y1="15.8989" x2="26.1821" y2="19.3636" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="#82DEAD"/>
</linearGradient>
<linearGradient id="paint7_linear_5118_44036" x1="24.0009" y1="49.6364" x2="24.0009" y2="36.8182" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="0.520897" stop-color="#82DEAC"/>
</linearGradient>
<linearGradient id="paint8_linear_5118_44036" x1="24.2732" y1="30.2727" x2="24.2732" y2="37.6364" gradientUnits="userSpaceOnUse">
<stop stop-color="#00B1BC"/>
<stop offset="1" stop-color="#75D9A3"/>
</linearGradient>
<clipPath id="clip0_5118_44036">
<rect width="44.7273" height="38.7273" fill="white" transform="translate(1.63672 9.27271)"/>
</clipPath>
</defs>
</svg>

);

const plans = [
  {
    id: "basic",
    name: "Upchar-Q Basic",
    price: "₹1,299",
    period: "/Mo",
    taxNote: "+ taxes",
    icon: BasicSVG,
    current: false,
    features: [
      "1 Doctor + 1 Staff",
      "Unlimited Online and Walk-ins Appts",
      "Queue Management System",
      "Front Desk Access",
      "Clinic Social Profile",
      "Doctor Social Profile",
      "Role Based Access",
    ],
    hasInfo: [0],
  },
  {
    id: "plus",
    name: "Upchar-Q Plus",
    price: "₹2,299",
    period: "/Mo",
    taxNote: "+ taxes",
     icon: PlusSVG,
    current: true,
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
    hasInfo: [0],
  },
  {
    id: "pro",
    name: "Upchar-Q Pro",
    price: "₹2,549",
    period: "/Mo",
    taxNote: "+ taxes",
    current: false,
     icon: ProSVG,
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
    hasInfo: [0],
  },
];
const subscriptionData = {
  plan: "Upchar-Q Plus",
  status: "Active",
  billingCycle: "Half-Yearly",
  monthlyAmount: "₹13,564/- (Inc. Tax)",
  nextBilling: "05/02/2026 (31 Days Remaining)",
  doctorAddons: "-",
  staffAddons: "x1 - @412 (inc. tax)"
};

export default function UpgradePlan() {
  const navigate = useNavigate();
   const planIcons = {
  Basic: BasicSVG,
  Plus: PlusSVG,
  Pro: ProSVG,
};
  const [selectedPlan, setSelectedPlan] = useState("pro"); 
const currentPlanId = subscriptionData.plan.split(" ")[1].toLowerCase();
const isCurrentPlan = selectedPlan === currentPlanId;


  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-12 md:h-12 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 overflow-hidden">
         <div className="px-4 py-3">
                  <svg width="127" height="30" viewBox="0 0 127 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_4903_68514)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M117.017 21.8129C120.195 20.1756 122.369 16.8615 122.369 13.0399C122.369 7.59294 117.953 3.17731 112.506 3.17731C107.058 3.17731 102.642 7.59294 102.642 13.0399C102.642 18.4868 107.058 22.9024 112.506 22.9024C112.905 22.9024 113.053 22.9048 113.444 22.8579C114.706 26.227 117.845 27.2447 120.75 25.327C120.524 25.094 120.345 24.8157 120.227 24.5072C115.646 27.3782 114.284 21.611 113.997 21.6367C113.507 21.6806 113.014 21.7638 112.506 21.7638C107.687 21.7638 103.78 17.8579 103.78 13.0398C103.78 8.22173 107.687 4.31586 112.506 4.31586C117.324 4.31586 121.231 8.22173 121.231 13.0398C121.231 16.5173 119.196 19.5196 116.252 20.921C115.885 21.0956 115.665 21.4659 115.876 21.8296C116.038 22.1105 116.312 22.1759 117.017 21.8128L117.017 21.8129Z" fill="#0744BD" stroke="#0744BD" stroke-width="0.5" stroke-miterlimit="22.9256"/>
<path d="M92.9971 14.8155H99.9897V16.47H92.9971V14.8155Z" fill="#0744BD"/>
<path d="M85.1049 11.5865C85.5497 10.6436 86.2125 9.93202 87.0933 9.45167C87.9741 8.97132 89.0639 8.73114 90.3628 8.73114V10.5724L89.909 10.5458C88.4322 10.5458 87.2757 10.9995 86.4394 11.9068C85.6031 12.8141 85.185 14.0861 85.185 15.7228V22.8746H83.29V8.8379H85.1049V11.5865Z" fill="#0744BD"/>
<path d="M75.0443 8.73113C76.877 8.73113 78.2826 9.18924 79.2612 10.1055C80.2398 11.0217 80.7291 12.3781 80.7291 14.175V22.8746H78.9142V20.6863C78.4872 21.4158 77.86 21.985 77.0326 22.3942C76.2052 22.8034 75.2222 23.008 74.0834 23.008C72.5176 23.008 71.2721 22.6343 70.3469 21.8871C69.4217 21.14 68.959 20.1526 68.959 18.925C68.959 17.7331 69.3904 16.7724 70.2534 16.043C71.1164 15.3136 72.4909 14.9489 74.377 14.9489H78.8341V14.0949C78.8341 12.8852 78.496 11.9645 77.8199 11.3329C77.1438 10.7014 76.1562 10.3856 74.8574 10.3856C73.9677 10.3856 73.1137 10.5323 72.2952 10.8259C71.4767 11.1195 70.7739 11.5242 70.1867 12.0401L69.3326 10.6257C70.0443 10.0209 70.8984 9.55385 71.8948 9.22475C72.8912 8.89566 73.941 8.73108 75.0442 8.73108L75.0443 8.73113ZM74.377 21.5136C75.4446 21.5136 76.3609 21.269 77.126 20.7797C77.8911 20.2905 78.4605 19.5833 78.8341 18.6582V16.3632H74.4304C72.0283 16.3632 70.8273 17.1994 70.8273 18.8717C70.8273 19.6901 71.1387 20.335 71.7614 20.8064C72.3841 21.2778 73.256 21.5136 74.377 21.5136V21.5136Z" fill="#0744BD"/>
<path d="M60.643 8.73112C62.4045 8.73112 63.8057 9.24263 64.8466 10.2656C65.8875 11.2885 66.4079 12.7785 66.4079 14.7354V22.8745H64.513V14.9222C64.513 13.4634 64.1482 12.3515 63.4187 11.5865C62.6892 10.8214 61.6483 10.439 60.296 10.439C58.7836 10.439 57.5871 10.8882 56.7063 11.7866C55.8256 12.685 55.3852 13.9259 55.3852 15.5093V22.8745H53.4902V3.07373H55.3852V11.2929C55.9012 10.4746 56.6129 9.84302 57.5204 9.39824C58.4278 8.95346 59.4687 8.73107 60.643 8.73107V8.73112Z" fill="#0744BD"/>
<path d="M45.3764 23.0081C43.9885 23.0081 42.7475 22.7056 41.6532 22.1007C40.5589 21.4958 39.7004 20.6464 39.0776 19.5522C38.4549 18.4581 38.1436 17.2261 38.1436 15.8563C38.1436 14.4864 38.4549 13.2589 39.0776 12.1737C39.7004 11.0885 40.5589 10.2434 41.6532 9.63855C42.7475 9.03365 43.9885 8.7312 45.3764 8.7312C46.5863 8.7312 47.6672 8.96692 48.6192 9.43835C49.5711 9.90983 50.3228 10.5992 50.8744 11.5065L49.4599 12.4672C48.9973 11.7733 48.4101 11.253 47.6983 10.9061C46.9866 10.5592 46.2126 10.3857 45.3764 10.3857C44.3622 10.3857 43.4502 10.6126 42.6407 11.0662C41.8311 11.5199 41.1995 12.1647 40.7457 13.0009C40.2919 13.837 40.0651 14.7888 40.0651 15.8563C40.0651 16.9415 40.292 17.8977 40.7457 18.725C41.1995 19.5522 41.8311 20.1927 42.6407 20.6464C43.4502 21.1001 44.3622 21.3268 45.3764 21.3268C46.2126 21.3268 46.9866 21.1578 47.6983 20.8198C48.41 20.4818 48.9973 19.9658 49.4599 19.272L50.8744 20.2326C50.3228 21.14 49.5666 21.8293 48.6058 22.3008C47.645 22.7723 46.5685 23.008 45.3764 23.008V23.0081Z" fill="#0744BD"/>
<path d="M28.6947 8.73114C30.0114 8.73114 31.2035 9.02913 32.2712 9.62511C33.3387 10.2211 34.175 11.0616 34.78 12.1469C35.385 13.2321 35.6874 14.4686 35.6874 15.8563C35.6874 17.2617 35.385 18.507 34.78 19.5923C34.175 20.6775 33.3432 21.5181 32.2845 22.1141C31.2258 22.7101 30.0293 23.0081 28.6948 23.0081C27.556 23.0081 26.5285 22.7724 25.6122 22.3009C24.6958 21.8294 23.944 21.1401 23.3569 20.2327V28.0517H21.4619V8.8379H23.2768V11.6132C23.8462 10.6881 24.5979 9.97645 25.532 9.47832C26.4662 8.98023 27.5204 8.73114 28.6947 8.73114ZM28.5613 21.3268C29.5399 21.3268 30.4295 21.1 31.2302 20.6464C32.0309 20.1927 32.6581 19.5478 33.1118 18.7116C33.5656 17.8755 33.7924 16.9237 33.7924 15.8563C33.7924 14.7888 33.5655 13.8415 33.1118 13.0143C32.6581 12.187 32.0309 11.5421 31.2302 11.0795C30.4296 10.617 29.5399 10.3857 28.5613 10.3857C27.5649 10.3857 26.6707 10.617 25.879 11.0795C25.0872 11.5421 24.4645 12.187 24.0108 13.0143C23.557 13.8416 23.3302 14.7888 23.3302 15.8563C23.3302 16.9237 23.5571 17.8755 24.0108 18.7116C24.4645 19.5478 25.0872 20.1927 25.879 20.6464C26.6708 21.1001 27.5649 21.3268 28.5613 21.3268Z" fill="#0744BD"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.46029 3.1972H5.02507C4.91186 3.40133 4.84735 3.63615 4.84735 3.88598C4.84735 4.15939 4.92455 4.41475 5.05825 4.63157H4.02775C3.73009 4.63157 3.485 4.87668 3.485 5.17424V14.3316C3.485 18.9079 6.96336 21.0338 10.4428 20.9832C13.8209 20.9341 17.0987 18.8411 17.0965 14.3316L17.0919 5.17753C17.0918 4.87912 16.8465 4.63491 16.5491 4.63491H15.609C15.718 4.43365 15.7799 4.22018 15.7799 3.95845C15.7799 3.69672 15.6997 3.41991 15.5612 3.20055H18.1036C18.5979 3.20055 19.0022 3.60546 19.0024 4.09908L19.007 14.4947C19.012 25.8897 1.56152 25.6917 1.56152 14.4947V4.09584C1.56152 3.60158 1.96601 3.19726 2.46024 3.19726L2.46029 3.1972Z" fill="#0744BD"/>
<path d="M6.25329 5.70454C7.29064 5.70454 8.13158 4.86372 8.13158 3.82651C8.13158 2.78931 7.29064 1.94849 6.25329 1.94849C5.21594 1.94849 4.375 2.78931 4.375 3.82651C4.375 4.86372 5.21594 5.70454 6.25329 5.70454Z" fill="#87AFFF" stroke="white" stroke-width="0.5" stroke-miterlimit="22.9256"/>
<path d="M14.3529 5.70454C15.3903 5.70454 16.2312 4.86372 16.2312 3.82651C16.2312 2.78931 15.3903 1.94849 14.3529 1.94849C13.3155 1.94849 12.4746 2.78931 12.4746 3.82651C12.4746 4.86372 13.3155 5.70454 14.3529 5.70454Z" fill="#87AFFF" stroke="white" stroke-width="0.5" stroke-miterlimit="22.9256"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M112.498 10.1104H112.498C112.923 10.1104 113.27 10.4581 113.27 10.8831V12.4675H114.855C115.28 12.4675 115.628 12.8152 115.628 13.2402V13.2403C115.628 13.6653 115.28 14.013 114.855 14.013H113.27V15.5974C113.27 16.0224 112.923 16.3701 112.498 16.3701H112.498C112.072 16.3701 111.725 16.0224 111.725 15.5974V14.013H110.14C109.715 14.013 109.367 13.6653 109.367 13.2403V13.2402C109.367 12.8152 109.715 12.4675 110.14 12.4675H111.725V10.8831C111.725 10.4581 112.072 10.1104 112.498 10.1104Z" fill="#87AFFF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M122.952 20.6934C124.406 20.6934 125.585 21.8723 125.585 23.3265C125.585 24.7807 124.406 25.9597 122.952 25.9597C121.497 25.9597 120.318 24.7807 120.318 23.3265C120.318 21.8723 121.497 20.6934 122.952 20.6934ZM122.952 21.5013C123.96 21.5013 124.777 22.3184 124.777 23.3265C124.777 24.3346 123.96 25.1517 122.952 25.1517C121.944 25.1517 121.126 24.3346 121.126 23.3265C121.126 22.3184 121.944 21.5013 122.952 21.5013Z" fill="#87AFFF"/>
<path d="M122.952 24.5388C123.621 24.5388 124.164 23.9961 124.164 23.3265C124.164 22.657 123.621 22.1143 122.952 22.1143C122.282 22.1143 121.739 22.657 121.739 23.3265C121.739 23.9961 122.282 24.5388 122.952 24.5388Z" fill="#0744BD"/>
</g>
<defs>
<clipPath id="clip0_4903_68514">
<rect width="127" height="30" fill="white"/>
</clipPath>
</defs>
</svg>

                </div>
          <span className="text-secondary-grey150   hidden sm:inline">
            |
          </span>
          <a href="/doc/settings/billing" className="text-xs md:text-sm text-secondary-grey200 hidden sm:inline hover:text-foreground">
            Billing & Subscription
          </a>
          <span className="text-secondary-grey200 mx-1 hidden md:inline">›</span>
          <span className="text-xs md:text-sm font-medium text-secondary-grey400 hidden md:inline">
            Step 1
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="relative p-2 rounded-lg hover:bg-accent">
     <div className="relative inline-block">
  
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.6243 8.09133V7.50416C15.6243 4.28021 13.1062 1.66669 10 1.66669C6.8938 1.66669 4.37573 4.28021 4.37573 7.50416V8.09133C4.37573 8.79598 4.17476 9.48488 3.79817 10.0712L2.8753 11.508C2.03235 12.8203 2.67587 14.6041 4.14197 15.0191C7.97728 16.1048 12.0227 16.1048 15.858 15.0191C17.3241 14.6041 17.9676 12.8203 17.1247 11.508L16.2018 10.0712C15.8252 9.48488 15.6243 8.79598 15.6243 8.09133Z" fill="#96BFFF"/>
<path d="M16.2018 10.0712L15.7811 10.3414V10.3414L16.2018 10.0712ZM17.1247 11.508L17.5454 11.2377V11.2377L17.1247 11.508ZM2.8753 11.508L2.45461 11.2377H2.45461L2.8753 11.508ZM3.79817 10.0712L4.21886 10.3414V10.3414L3.79817 10.0712ZM15.858 15.0191L15.7219 14.538V14.538L15.858 15.0191ZM4.14197 15.0191L4.27815 14.538H4.27815L4.14197 15.0191ZM6.7182 15.6579C6.62129 15.3993 6.33311 15.2682 6.07453 15.3652C5.81595 15.4621 5.68489 15.7502 5.7818 16.0088L6.25 15.8334L6.7182 15.6579ZM14.2182 16.0088C14.3151 15.7502 14.184 15.4621 13.9255 15.3652C13.6669 15.2682 13.3787 15.3993 13.2818 15.6579L13.75 15.8334L14.2182 16.0088ZM15.6243 7.50416H15.1243V8.09133H15.6243H16.1243V7.50416H15.6243ZM16.2018 10.0712L15.7811 10.3414L16.704 11.7782L17.1247 11.508L17.5454 11.2377L16.6225 9.80097L16.2018 10.0712ZM2.8753 11.508L3.29599 11.7782L4.21886 10.3414L3.79817 10.0712L3.37747 9.80097L2.45461 11.2377L2.8753 11.508ZM4.37573 8.09133H4.87573V7.50416H4.37573H3.87573V8.09133H4.37573ZM15.858 15.0191L15.7219 14.538C11.9756 15.5985 8.02443 15.5985 4.27815 14.538L4.14197 15.0191L4.00579 15.5002C7.93014 16.6111 12.0699 16.6111 15.9942 15.5002L15.858 15.0191ZM3.79817 10.0712L4.21886 10.3414C4.64785 9.67353 4.87573 8.89065 4.87573 8.09133H4.37573H3.87573C3.87573 8.70131 3.70168 9.29623 3.37747 9.80097L3.79817 10.0712ZM15.6243 8.09133H15.1243C15.1243 8.89065 15.3522 9.67353 15.7811 10.3414L16.2018 10.0712L16.6225 9.80097C16.2983 9.29623 16.1243 8.70131 16.1243 8.09133H15.6243ZM2.8753 11.508L2.45461 11.2377C1.43984 12.8176 2.1998 14.989 4.00579 15.5002L4.14197 15.0191L4.27815 14.538C3.15195 14.2192 2.62487 12.823 3.29599 11.7782L2.8753 11.508ZM17.1247 11.508L16.704 11.7782C17.3751 12.823 16.8481 14.2192 15.7219 14.538L15.858 15.0191L15.9942 15.5002C17.8002 14.989 18.5602 12.8176 17.5454 11.2377L17.1247 11.508ZM10 1.66669V2.16669C12.8127 2.16669 15.1243 4.53866 15.1243 7.50416H15.6243H16.1243C16.1243 4.02177 13.3997 1.16669 10 1.16669V1.66669ZM10 1.66669V1.16669C6.60029 1.16669 3.87573 4.02177 3.87573 7.50416H4.37573H4.87573C4.87573 4.53866 7.18731 2.16669 10 2.16669V1.66669ZM10 5.00002H9.5V8.33335H10H10.5V5.00002H10ZM6.25 15.8334L5.7818 16.0088C6.40364 17.668 8.06841 18.8334 10 18.8334V18.3334V17.8334C8.46901 17.8334 7.18808 16.9116 6.7182 15.6579L6.25 15.8334ZM10 18.3334V18.8334C11.9316 18.8334 13.5964 17.668 14.2182 16.0088L13.75 15.8334L13.2818 15.6579C12.8119 16.9116 11.531 17.8334 10 17.8334V18.3334Z" fill="#424242"/>
</svg>


  
  <span className="absolute -top-1 -right-1 bg-error-400 text-monochrom-white text-[9px] min-w-[12px] h-[12px] rounded-full flex items-center justify-center font-medium">
    3
  </span>
</div>


          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-medium text-secondary-grey400 hidden sm:inline">
              Super Admin
            </span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-secondary-grey400">
              S
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="text-center mb-6 md:mb-6 mx-auto border-b border-border w-full py-2">
            <h1 className="text-xl md:text-2xl font-bold text-secondary-grey400 mb-2">
              Upgrade Your Plan
            </h1>
            <p className="text-sm md:text-base text-secondary-grey300">
              Choose a plan that fits your clinics needs
            </p>
          </div>
      <main className="flex-1 p-4 md:p-4 overflow-y-auto">
         
        <div className="max-w-5xl mx-auto">
         

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const isPro = plan.id === "pro";

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      
                        ? "border-blue-primary400 bg-blue-primary250 text-primary-foreground"
                        : "border-blue-primary400 bg-card"
                      
                  }`}
                >
                  {plan.current && (
                    <div className="absolute top-1.5 left-4 px-1 py-.5 rounded  text-xs text-secondary-grey400 bg-monochrom-white">
                      Current Active Plan
                    </div>
                  )}

                  <div className="p-4 md:p-4 mt-3">
                    {/* Plan Header */}
                    <div className="flex items-center gap-3 mb-2">
                     <div
  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
    isSelected
      ? "bg-primary-foreground/20"
      : "bg-primary/10"
  }`}
>
  {plan.icon}
</div>

                      <h3
                        className={`font-semibold ${
                          isSelected
                            ? "text-monochrom-white"
                            : "text-secondary-grey400"
                        }`}
                      >
                        {plan.name}
                      </h3>
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                      <span
                        className={`text-xl md:text-2xl font-bold ${
                          isSelected
                            ? "text-monochrom-white"
                            : "text-blue-primary250"
                        }`}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={`text-md ${
                           isSelected
                             ? "text-monochrom-white"
                            : "text-blue-primary250"
                        }`}
                      >
                        {plan.period}
                      </span>
                      <span
                        className={`text-xs ml-1 ${
                           isSelected
                            ? "text-monochrom-white"
                            : "text-secondary-grey200"
                        }`}
                      >
                        {plan.taxNote}
                      </span>
                    </div>

                    
                    {isSelected ? (
                      <div
                        className={`w-full rounded-lg text-center text-sm font-medium border flex justify-center items-center gap-2 py-2 bg-monochrom-white text-blue-primary250`}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.01989 7.97976C5.82463 7.7845 5.50805 7.7845 5.31279 7.97976C5.11753 8.17502 5.11753 8.4916 5.31279 8.68687L5.66634 8.33331L6.01989 7.97976ZM6.99967 9.66665L6.64612 10.0202C6.84138 10.2155 7.15797 10.2155 7.35323 10.0202L6.99967 9.66665ZM10.6866 6.68687C10.8818 6.4916 10.8818 6.17502 10.6866 5.97976C10.4913 5.7845 10.1747 5.7845 9.97945 5.97976L10.333 6.33331L10.6866 6.68687ZM14.6663 7.99998H14.1663C14.1663 11.4057 11.4054 14.1666 7.99967 14.1666V14.6666V15.1666C11.9577 15.1666 15.1663 11.958 15.1663 7.99998H14.6663ZM7.99967 14.6666V14.1666C4.59392 14.1666 1.83301 11.4057 1.83301 7.99998H1.33301H0.833008C0.833008 11.958 4.04163 15.1666 7.99967 15.1666V14.6666ZM1.33301 7.99998H1.83301C1.83301 4.59422 4.59392 1.83331 7.99967 1.83331V1.33331V0.833313C4.04163 0.833313 0.833008 4.04194 0.833008 7.99998H1.33301ZM7.99967 1.33331V1.83331C11.4054 1.83331 14.1663 4.59422 14.1663 7.99998H14.6663H15.1663C15.1663 4.04194 11.9577 0.833313 7.99967 0.833313V1.33331ZM5.66634 8.33331L5.31279 8.68687L6.64612 10.0202L6.99967 9.66665L7.35323 9.31309L6.01989 7.97976L5.66634 8.33331ZM6.99967 9.66665L7.35323 10.0202L10.6866 6.68687L10.333 6.33331L9.97945 5.97976L6.64612 9.31309L6.99967 9.66665Z" fill="#2372EC"/>
</svg>
 Selected
                      </div>
                    ) : (
                      <button className="w-full py-2 rounded-lg bg-blue-primary250 text-monochrom-white hover:opacity-90">
                        Choose
                      </button>
                    )}

                    {/* Features */}
                    <div className="mt-4 md:mt-6">
                      <p
                        className={`text-sm mb-2 ${
                           isSelected
                            ? "text-monochrom-white"
                            : "text-secondary-grey200"
                        }`}
                      >
                        Access To:
                      </p>
                      <ul className="space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 justify-between text-sm">
                          <div className="flex items-center gap-2">
                              <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                                isSelected
                                  ? " "
                                  : ""
                              }`}
                            >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.99967 14.6666C11.6816 14.6666 14.6663 11.6819 14.6663 7.99998C14.6663 4.31808 11.6816 1.33331 7.99967 1.33331C4.31778 1.33331 1.33301 4.31808 1.33301 7.99998C1.33301 11.6819 4.31778 14.6666 7.99967 14.6666Z" fill="#F2F7FF"/>
<path d="M5.66634 8.33331L6.99967 9.66665L10.333 6.33331" fill="#F2F7FF"/>
<path d="M6.01989 7.97976C5.82463 7.7845 5.50805 7.7845 5.31279 7.97976C5.11753 8.17502 5.11753 8.4916 5.31279 8.68687L5.66634 8.33331L6.01989 7.97976ZM6.99967 9.66665L6.64612 10.0202C6.84138 10.2155 7.15797 10.2155 7.35323 10.0202L6.99967 9.66665ZM10.6866 6.68687C10.8818 6.4916 10.8818 6.17502 10.6866 5.97976C10.4913 5.7845 10.1747 5.7845 9.97945 5.97976L10.333 6.33331L10.6866 6.68687ZM14.6663 7.99998H14.1663C14.1663 11.4057 11.4054 14.1666 7.99967 14.1666V14.6666V15.1666C11.9577 15.1666 15.1663 11.958 15.1663 7.99998H14.6663ZM7.99967 14.6666V14.1666C4.59392 14.1666 1.83301 11.4057 1.83301 7.99998H1.33301H0.833008C0.833008 11.958 4.04163 15.1666 7.99967 15.1666V14.6666ZM1.33301 7.99998H1.83301C1.83301 4.59422 4.59392 1.83331 7.99967 1.83331V1.33331V0.833313C4.04163 0.833313 0.833008 4.04194 0.833008 7.99998H1.33301ZM7.99967 1.33331V1.83331C11.4054 1.83331 14.1663 4.59422 14.1663 7.99998H14.6663H15.1663C15.1663 4.04194 11.9577 0.833313 7.99967 0.833313V1.33331ZM5.66634 8.33331L5.31279 8.68687L6.64612 10.0202L6.99967 9.66665L7.35323 9.31309L6.01989 7.97976L5.66634 8.33331ZM6.99967 9.66665L7.35323 10.0202L10.6866 6.68687L10.333 6.33331L9.97945 5.97976L6.64612 9.31309L6.99967 9.66665Z" fill="#2372EC"/>
</svg>

                            </span>
                            <span
                              className={
                                isSelected
                                  ? "text-primary-foreground/90"
                                  : "text-secondary-grey300"
                              }
                            >
                              {feature}
                            </span>
                          </div>
                          {idx === 0 && (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={isSelected ? "stroke-monochrom-white" : "stroke-secondary-grey300"}
  >
    <path
      d="M7.16667 10.5V6.5M7.16667 4.83333V4.5M13.8333 7.16667C13.8333 10.8486 10.8486 13.8333 7.16667 13.8333C3.48477 13.8333 0.5 10.8486 0.5 7.16667C0.5 3.48477 3.48477 0.5 7.16667 0.5C10.8486 0.5 13.8333 3.48477 13.8333 7.16667Z"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
)}

                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 md:h-14 bg-card border-t border-border flex items-center  justify-between px-4 md:px-6">
        <button
          onClick={() => navigate("/doc/settings/billing")}
          className="!px-6 py-2 border border-secondary-grey200 rounded-md text-secondary-grey400"
        >
          Cancel
        </button>
       <button
  disabled={isCurrentPlan}
  onClick={() => {
    if (isCurrentPlan) return;

    navigate("/billing/payment", {
      state: {
        selectedPlan,
      },
    });
  }}
  className={`px-3 py-2 rounded-lg transition-all flex items-center justfy-center gap-2 ${
    isCurrentPlan
      ? "bg-secondary-grey50 text-secondary-grey100 cursor-not-allowed"
      : "bg-blue-primary250 text-monochrom-white hover:opacity-90"
  }`}
>
  Preview Purchase <svg
  width="16"
  height="16"
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M2.66602 8H13.3327M13.3327 8L9.33268 4M13.3327 8L9.33268 12"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>


</button>

      </footer>
    </div>
  );
}
