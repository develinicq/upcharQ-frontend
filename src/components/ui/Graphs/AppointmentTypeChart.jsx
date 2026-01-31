
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { date: "Sep 1", new: 70, followUp: 30, reviewVisit: 40, emergencyOPD: 45, secondOpinion: 15, inPatientVisit: 20 },
  { date: "Sep 8", new: 65, followUp: 50, reviewVisit: 60, emergencyOPD: 55, secondOpinion: 25, inPatientVisit: 45 },
  { date: "Sep 15", new: 80, followUp: 55, reviewVisit: 70, emergencyOPD: 60, secondOpinion: 30, inPatientVisit: 45 },
  { date: "Sep 22", new: 50, followUp: 35, reviewVisit: 45, emergencyOPD: 40, secondOpinion: 20, inPatientVisit: 30 },
  { date: "Sep 29", new: 60, followUp: 45, reviewVisit: 55, emergencyOPD: 50, secondOpinion: 25, inPatientVisit: 80 },
  { date: "Oct 4", new: 55, followUp: 40, reviewVisit: 50, emergencyOPD: 45, secondOpinion: 35, inPatientVisit: 70 },
];

const legendItems = [
  { key: "new", label: "New", color: "#A78BFA" },
  { key: "followUp", label: "Follow-up", color: "#F5A0A0" },
  { key: "reviewVisit", label: "Review Visit", color: "#4FC3F7" },
  { key: "emergencyOPD", label: "Emergency OPD", color: "#FFAE4C" },
  { key: "secondOpinion", label: "Second Opinion", color: "#3B82F6" },
  { key: "inPatientVisit", label: "In-Patient Visit", color: "#4ADE80" },
];

const CustomLegend = () => {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {legendItems.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-secondary-grey300">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export function AppointmentTypeChart({
  title = "Appointment Type vs. Patient",
  subtitle = "Breakdown by visit type over time"
}) {
  return (
    <div className="bg-white rounded-lg p-6 border border-secondary-grey100 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="text-base font-semibold text-secondary-grey400">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-secondary-grey200 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 2.5C10.5 2.22386 10.2761 2 10 2C9.72386 2 9.5 2.22386 9.5 2.5H10H10.5ZM10 13.3333L9.63099 13.6707C9.72571 13.7743 9.85962 13.8333 10 13.8333C10.1404 13.8333 10.2743 13.7743 10.369 13.6707L10 13.3333ZM13.7023 10.0249C13.8887 9.82108 13.8745 9.50482 13.6707 9.31849C13.4669 9.13215 13.1507 9.14631 12.9643 9.35012L13.3333 9.6875L13.7023 10.0249ZM7.03568 9.35012C6.84935 9.14631 6.53308 9.13215 6.32928 9.31849C6.12548 9.50482 6.11132 9.82108 6.29765 10.0249L6.66667 9.6875L7.03568 9.35012ZM12.5 17.5V17H7.5V17.5V18H12.5V17.5ZM7.5 17.5V17C6.30735 17 5.46317 16.9989 4.82344 16.9129C4.1981 16.8289 3.84352 16.6719 3.58579 16.4142L3.23223 16.7678L2.87868 17.1213C3.35318 17.5958 3.95397 17.805 4.6902 17.904C5.41204 18.0011 6.33562 18 7.5 18V17.5ZM2.5 12.5H2C2 13.6644 1.99894 14.588 2.09599 15.3098C2.19497 16.046 2.40418 16.6468 2.87868 17.1213L3.23223 16.7678L3.58579 16.4142C3.32805 16.1565 3.17115 15.8019 3.08707 15.1766C3.00106 14.5368 3 13.6926 3 12.5H2.5ZM17.5 12.5H17C17 13.6926 16.9989 14.5368 16.9129 15.1766C16.8289 15.8019 16.6719 16.1565 16.4142 16.4142L16.7678 16.7678L17.1213 17.1213C17.5958 16.6468 17.805 16.046 17.904 15.3098C18.0011 14.588 18 13.6644 18 12.5H17.5ZM12.5 17.5V18C13.6644 18 14.588 18.0011 15.3098 17.904C16.046 17.805 16.6468 17.5958 17.1213 17.1213L16.7678 16.7678L16.4142 16.4142C16.1565 16.6719 15.8019 16.8289 15.1766 16.9129C14.5368 16.9989 13.6926 17 12.5 17V17.5ZM10 2.5H9.5V13.3333H10H10.5V2.5H10ZM10 13.3333L10.369 13.6707L13.7023 10.0249L13.3333 9.6875L12.9643 9.35012L9.63099 12.9959L10 13.3333ZM10 13.3333L10.369 12.9959L7.03568 9.35012L6.66667 9.6875L6.29765 10.0249L9.63099 13.6707L10 13.3333Z" fill="#424242" />
        </svg>
      </div>
      <div className="h-[280px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={true}
              horizontal={true}
              stroke="#E5E5E5"
            />
            <XAxis
              dataKey="date"
              axisLine={{ stroke: "#7E7E8B" }}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8E8E8E" }}
              dy={10}
            />
            <YAxis
              domain={[0, 400]}
              ticks={[0, 80, 160, 240, 320, 400]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8E8E8E" }}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E5E5",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="new"
              stackId="a"
              fill="#A78BFA"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="followUp"
              stackId="a"
              fill="#F5A0A0"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="reviewVisit"
              stackId="a"
              fill="#4FC3F7"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="emergencyOPD"
              stackId="a"
              fill="#FFAE4C"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="secondOpinion"
              stackId="a"
              fill="#3B82F6"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="inPatientVisit"
              stackId="a"
              fill="#4ADE80"
              radius={[0, 0, 0, 0]}
            />
            <Legend content={<CustomLegend />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}