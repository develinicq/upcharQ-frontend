import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

const data = [
  { month: "Jan", online: 14.21, walkIn: 90.34 },
  { month: "Feb", online: 29.43, walkIn: 49.7 },
  { month: "Mar", online: 71.17, walkIn: 40.95 },
  { month: "Apr", online: 85.71, walkIn: 14.85 },
  { month: "May", online: 58.1, walkIn: 69.01 },
  { month: "Jun", online: 84, walkIn: 50.54 },
  { month: "Jul", online: 50.29, walkIn: 93.07 },
  { month: "Aug", online: 51.78, walkIn: 68.95 },
  { month: "Sep", online: 65.36, walkIn: 29.45 },
  { month: "Oct", online: 17.51, walkIn: 42.34 },
  { month: "Nov", online: 49.98, walkIn: 80.95 },
  { month: "Dec", online: 38.19, walkIn: 39.55 },
];

const CustomDot = (props) => {
  const { cx, cy, stroke } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#fff"
        stroke={stroke}
        strokeWidth={2}
      />
    </g>
  );
};

const renderOnlineLabel = (props) => {
  const { x, y, value } = props;
  if (x == null || y == null) return null;

  return (
    <text
      x={x}
      y={y + 18}
      fill="#5BC0DE"
      fontSize={10}
      textAnchor="middle"
      fontWeight={400}
    >
      {value}
    </text>
  );
};

const renderWalkInLabel = (props) => {
  const { x, y, value } = props;
  if (x == null || y == null) return null;

  return (
    <text
      x={x}
      y={y - 12}
      fill="#F5A623"
      fontSize={10}
      textAnchor="middle"
      fontWeight={400}
    >
      {value}
    </text>
  );
};

const CustomLegend = () => {
  return (
    <div className="flex justify-center items-center gap-6 mt-2">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="7" width="16" height="2" fill="#3CC3DF" />
          <circle cx="8" cy="8" r="3.5" fill="white" stroke="#3CC3DF" />
        </svg>

        <span className="text-xs text-secondary-grey400">Online</span>
      </div>
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="7" width="16" height="2" fill="#FFAE4C" />
          <circle cx="8" cy="8" r="3.5" fill="white" stroke="#FFAE4C" />
        </svg>

        <span className="text-xs text-secondary-grey400">Walk-In</span>
      </div>
    </div>
  );
};

export function AppointmentBookingChart({
  title = "Appointment Booking Through",
  subtitle
}) {
  return (
    <div className="w-full bg-white rounded-lg p-6 border border-secondary-grey100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-secondary-grey400">{title}</h3>
          {subtitle && (
            <p className="text-xs text-secondary-grey200">{subtitle}</p>
          )}
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 2.5C10.5 2.22386 10.2761 2 10 2C9.72386 2 9.5 2.22386 9.5 2.5H10H10.5ZM10 13.3333L9.63099 13.6707C9.72571 13.7743 9.85962 13.8333 10 13.8333C10.1404 13.8333 10.2743 13.7743 10.369 13.6707L10 13.3333ZM13.7023 10.0249C13.8887 9.82108 13.8745 9.50482 13.6707 9.31849C13.4669 9.13215 13.1507 9.14631 12.9643 9.35012L13.3333 9.6875L13.7023 10.0249ZM7.03568 9.35012C6.84935 9.14631 6.53308 9.13215 6.32928 9.31849C6.12548 9.50482 6.11132 9.82108 6.29765 10.0249L6.66667 9.6875L7.03568 9.35012ZM12.5 17.5V17H7.5V17.5V18H12.5V17.5ZM7.5 17.5V17C6.30735 17 5.46317 16.9989 4.82344 16.9129C4.1981 16.8289 3.84352 16.6719 3.58579 16.4142L3.23223 16.7678L2.87868 17.1213C3.35318 17.5958 3.95397 17.805 4.6902 17.904C5.41204 18.0011 6.33562 18 7.5 18V17.5ZM2.5 12.5H2C2 13.6644 1.99894 14.588 2.09599 15.3098C2.19497 16.046 2.40418 16.6468 2.87868 17.1213L3.23223 16.7678L3.58579 16.4142C3.32805 16.1565 3.17115 15.8019 3.08707 15.1766C3.00106 14.5368 3 13.6926 3 12.5H2.5ZM17.5 12.5H17C17 13.6926 16.9989 14.5368 16.9129 15.1766C16.8289 15.8019 16.6719 16.1565 16.4142 16.4142L16.7678 16.7678L17.1213 17.1213C17.5958 16.6468 17.805 16.046 17.904 15.3098C18.0011 14.588 18 13.6644 18 12.5H17.5ZM12.5 17.5V18C13.6644 18 14.588 18.0011 15.3098 17.904C16.046 17.805 16.6468 17.5958 17.1213 17.1213L16.7678 16.7678L16.4142 16.4142C16.1565 16.6719 15.8019 16.8289 15.1766 16.9129C14.5368 16.9989 13.6926 17 12.5 17V17.5ZM10 2.5H9.5V13.3333H10H10.5V2.5H10ZM10 13.3333L10.369 13.6707L13.7023 10.0249L13.3333 9.6875L12.9643 9.35012L9.63099 12.9959L10 13.3333ZM10 13.3333L10.369 12.9959L7.03568 9.35012L6.66667 9.6875L6.29765 10.0249L9.63099 13.6707L10 13.3333Z" fill="#424242" />
        </svg>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 25, right: 20, left: -1, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#D3D5DD"
              vertical={true}
              horizontal={true}
            />

            <XAxis
              dataKey="month"
              axisLine={{ stroke: "#7E7E8B" }}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#424242" }}
              dy={8}
            />

            <YAxis
              domain={[0, 200]}
              ticks={[0, 40, 80, 120, 160, 200]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#424242" }}
              dx={-5}
              width={40}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E5E5",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />

            <Legend
              content={<CustomLegend />}
              verticalAlign="bottom"
              
            />
            <Line
              type="monotone"
              dataKey="online"
              stroke="#3cc3df"
              strokeWidth={7}
              opacity={0.12}
              dot={false}
              activeDot={false}
            />

            <Line
              type="monotone"
              dataKey="walkIn"
              stroke="#ffae4c"
              strokeWidth={7}
              opacity={0.12}
              dot={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="online"
              name="Online"
              stroke="#3cc3df"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: "#3cc3df" }}
            >
              <LabelList
                dataKey="online"
                content={renderOnlineLabel}
              />
            </Line>

            <Line
              type="monotone"
              dataKey="walkIn"
              name="Walk-In"
              stroke="#ffae4c"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: "#ffae4c" }}
            >
              <LabelList
                dataKey="walkIn"
                content={renderWalkInLabel}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}