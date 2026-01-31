import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";


const data = [
  { specialty: "General Physician", value: 2000 },
  { specialty: "Pediatrician", value: 1300 },
  { specialty: "Gynaecologist", value: 500 },
  { specialty: "Dentist", value: 600 },
  { specialty: "Dermatologist", value: 300 },
  { specialty: "ENT", value: 800 },
  { specialty: "Cardiologist", value: 400 },
  { specialty: "Orthopedic", value: 700 },
  { specialty: "Pulmonologist", value: 400 },
  { specialty: "Nephrologist", value: 434 },
  { specialty: "Gastroenterologist", value: 242 },
  { specialty: "Sexologist", value: 211 },
];

export function SpecialityAppointmentChart({
  title = "Speciality Appointment Booked",
  subtitle = "Appointment metrics by speciality"
}) {
  return (
    <div className="w-full bg-white rounded-lg p-6 border border-secondary-grey100">
      <div className="flex justify-between items-start mb-2">
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

      <div className="w-full h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#D3D5DD"
              horizontal={true}
              vertical={true}
            />

            <XAxis
              type="number"
              domain={[0, 2000]}
              ticks={[0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000]}
              axisLine={{ stroke: "#7E7E8B" }}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#8E8E8E" }}
              orientation="top"
            />

            <YAxis
              type="category"
              dataKey="specialty"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#424242" }}
              width={110}
            />

            <Bar
              dataKey="value"
              fill="#2372ec"
              radius={[0, 3, 3, 0]}
              barSize={18}
            >
              <LabelList
                dataKey="value"
                position="right"
                fill="#424242"
                fontSize={10}
                fontWeight={500}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
