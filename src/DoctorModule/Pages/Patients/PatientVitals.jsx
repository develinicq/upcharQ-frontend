import React, { useState } from "react";
import { ChevronDown, List, BarChart2, ArrowUp, ArrowDown, Eye } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomDot = ({ cx, cy, stroke }) => {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={stroke} opacity={0.25} />
      <circle cx={cx} cy={cy} r={5} fill={stroke} stroke="#fff" strokeWidth={2} />
    </g>
  );
};

function VitalsChart({ vital }) {
  if (!vital || !vital.chartData || vital.chartData.length === 0) {
    return (
      <div className="w-full h-[280px] flex items-center justify-center text-gray-400 italic">
        No chart data available for {vital?.name || "this vital"}
      </div>
    );
  }

  const isDouble = vital.chartType === "double";

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={vital.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFAE4C" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#FFAE4C" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="diastolicGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#537FF1" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#537FF1" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="singleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#537FF1" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#537FF1" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2" vertical={true} stroke="#D3D5DD" />
          <XAxis
            dataKey="date"
            axisLine={{ stroke: "#AEAFBB" }}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#000" }}
            dy={10}
            label={{ value: "Dates", position: "bottom", offset: 10, style: { fontSize: 12, fill: "#8E8E8E" } }}
          />
          <YAxis
            domain={isDouble ? [0, 200] : ["dataMin - 5", "dataMax + 5"]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#000" }}
            dx={-5}
            label={{ value: vital.unit, angle: -90, position: "insideLeft", offset: 15, style: { fontSize: 12, fill: "#8E8E8E", textAnchor: "middle" } }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "white", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "12px" }}
            formatter={(value, name) => {
              if (isDouble) {
                return [`${value} ${vital.unit}`, name === "systolic" ? "Systolic" : "Diastolic"];
              }
              return [`${value} ${vital.unit}`, vital.name];
            }}
          />
          {isDouble ? (
            <>
              <Area type="monotone" dataKey="systolic" stroke="#FFAE4C" strokeWidth={2} fill="url(#systolicGradient)" dot={<CustomDot stroke="#FFAE4C" />} activeDot={{ r: 7 }} />
              <Area type="monotone" dataKey="diastolic" stroke="#537FF1" strokeWidth={2} fill="url(#diastolicGradient)" dot={<CustomDot stroke="#537FF1" />} activeDot={{ r: 7 }} />
            </>
          ) : (
            <Area type="monotone" dataKey="value" stroke="#537FF1" strokeWidth={2} fill="url(#singleGradient)" dot={<CustomDot stroke="#537FF1" />} activeDot={<CustomDot stroke="#537FF1" />} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB");
};

const mapVitalHistory = (history, config) => {
  // Sort history: oldest first for chart
  const sorted = [...history].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

  const chartData = sorted.map((entry) => {
    const val = entry.data?.[config.key];
    if (config.key === "bloodPressure") {
      return {
        date: formatDate(entry.recordedAt),
        systolic: val?.systolic || 0,
        diastolic: val?.diastolic || 0,
        rawDate: entry.recordedAt
      };
    }
    return {
      date: formatDate(entry.recordedAt),
      value: val || 0,
      rawDate: entry.recordedAt
    };
  });

  // Latest values for summary table (last 3 recorded)
  const descSorted = [...history].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  const latestScores = descSorted.slice(0, 3).map((entry, idx, arr) => {
    const val = entry.data?.[config.key];
    let reading = "-";
    let trend = null;

    if (config.key === "bloodPressure") {
      reading = val ? `${val.systolic}/${val.diastolic}` : "-";
      // Basic trend comparison (current vs previous)
      if (idx < arr.length - 1) {
        const prev = arr[idx + 1].data?.[config.key];
        if (val && prev) {
          if (val.systolic > prev.systolic) trend = "up";
          else if (val.systolic < prev.systolic) trend = "down";
        }
      }
    } else {
      reading = val ? `${val}` : "-";
      if (idx < arr.length - 1) {
        const prevValue = arr[idx + 1].data?.[config.key];
        if (val && prevValue) {
          if (val > prevValue) trend = "up";
          else if (val < prevValue) trend = "down";
        }
      }
    }

    return { reading, date: formatFullDate(entry.recordedAt), trend };
  });

  return {
    ...config,
    latest: latestScores[0]?.reading || "-",
    chartData,
    tableValues: latestScores
  };
};

const VITAL_CONFIGS = [
  { name: "Blood Pressure", unit: "mmHg", key: "bloodPressure", chartType: "double", normalRange: "120/80" },
  { name: "Heart Rate", unit: "bpm", key: "heartRate", chartType: "single", normalRange: "60-100" },
  { name: "Temperature", unit: "°F", key: "temperature", chartType: "single", normalRange: "97.7-99.1" },
  { name: "Respiratory Rate", unit: "breaths/min", key: "respiratoryRate", chartType: "single", normalRange: "12-18" },
  { name: "Oxygen Saturation", unit: "%", key: "oxygenSaturation", chartType: "single", normalRange: "95-100" },
  { name: "Blood Glucose", unit: "mg/dL", key: "bloodGlucose", chartType: "single", normalRange: "70-100" },
];

function SectionHeader({ title, actionLabel, onAdd, hideActions = false }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-semibold text-secondary-grey900">{title}</div>
      {!hideActions && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={onAdd}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            + {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

const VitalsTable = ({ configs }) => {
  const getStatusColor = (status) => {
    if (status === "up") return "text-error-400";
    if (status === "down") return "text-success-400";
    return "text-secondary-grey300";
  };

  const getStatusIcon = (status) => {
    if (status === "up") return <img src="/Course Up.svg" className="w-4 h-4 inline ml-1" />;
    if (status === "down") return <img src="/Course Down.svg" className="w-4 h-4 inline ml-1" />;
    return <img src="/Pending.svg" className="w-4 h-4 inline ml-1" />;
  };

  return (
    <div className="w-full overflow-x-auto border-t-[0.5px] border-border">
      <table className="w-full border-collapse">
        <thead>
          <tr className="h-8 border-b-[0.5px] border-border text-secondary-grey400">
            <th className="text-left text-sm w-[180px] px-1 font-medium ">Name</th>
            <th className="text-left text-sm px-1 font-medium ">Last 3 Recorded Values</th>
            <th className="text-left text-sm w-[150px] px-1 font-medium ">Status</th>
            <th className="text-left text-sm w-[180px] px-1 font-medium ">Normal Range</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((vital, idx) => (
            <tr key={idx} className="h-[54px] border-t-[0.5px] border-border hover:bg-gray-50">
              <td className="py-2 px-1">
                <div className="font-medium text-sm text-secondary-grey400">{vital.name}</div>
                <div className="text-xs text-secondary-grey200">{vital.unit}</div>
              </td>
              <td className="py-2 px-1">
                <div className="flex gap-14">
                  {vital.tableValues?.map((val, vidx) => (
                    <div key={vidx} className="flex flex-col w-[70px]">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm  ${val.trend === "up" ? "text-success-300" : val.trend === "down" ? "text-error-400" : "text-secondary-grey400"}`}>{val.reading}</span>
                        {val.trend === "up" && <ArrowUp className="w-3 h-3 text-success-300" />}
                        {val.trend === "down" && <ArrowDown className="w-3 h-3 text-error-400" />}
                      </div>
                      <div className="text-[12px] text-secondary-grey200">{val.date}</div>
                    </div>
                  ))}
                  {(!vital.tableValues || vital.tableValues.length === 0) && <span className="text-xs text-secondary-grey400 italic">No records</span>}
                </div>
              </td>
              <td className="py-2 px-1">
                <div className={`w-fit px-2 py-0.5 rounded text-xs flex items-center ${vital.tableValues?.[0]?.trend ? (vital.tableValues[0].trend === "up" ? "bg-success-100 text-success-300" : "bg-error-50 text-error-400") : "bg-gray-50 text-secondary-grey400"}`}>
                  {vital.tableValues?.[0]?.trend === "up" ? "Improved" : vital.tableValues?.[0]?.trend === "down" ? "Worse" : "Stabled"}
                  {getStatusIcon(vital.tableValues?.[0]?.trend)}
                </div>
              </td>
              <td className="py-2 px-1 text-right sm:text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary-grey400 bg-secondary-grey50 px-1.5 py-0.5 rounded">{vital.normalRange}</span>
                  <button className="text-gray-400 hover:text-blue-500"><img src="/Eye.svg" className="w-5 h-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function BiometricsTable({ history }) {
  if (!history || history.length === 0) {
    return <div className="py-12 text-center text-gray-500 italic border border-dashed rounded-lg">No biometrics data available.</div>;
  }

  // Sort by date desc for table
  const descSorted = [...history].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)).slice(0, 5);

  const categories = [
    { name: "Weight", unit: "kg", key: "weight" },
    { name: "Height", unit: "cm", key: "height" },
    { name: "BMI", unit: "kg/m²", key: "bmi" },
    { name: "Waist", unit: "cm", key: "waistCircumference" },
  ];

  return (
    <div className="mt-2 border-t-[1px] border-border">
      <table className="min-w-full table-fixed text-sm text-left text-gray-700">
        <colgroup><col className="w-[180px]" /><col /><col className="w-[64px]" /></colgroup>
        <thead className="text-[14px] font-medium text-secondary-grey400 border-b">
          <tr className="h-8"><th className="font-medium">Name</th><th className="font-medium">Last 5 Recorded Values</th><th className="text-right"></th></tr>
        </thead>
        <tbody>
          {categories.map((cat, i) => (
            <tr key={i} className="border-b border-border hover:bg-gray-50">
              <td className="py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-secondary-grey400">{cat.name}</span>
                  <span className="text-xs text-secondary-grey200">{cat.unit}</span>
                </div>
              </td>
              <td>
                <div className="grid grid-cols-5 gap-4">
                  {descSorted.map((entry, idx) => {
                    const val = entry.data?.[cat.key];
                    let trend = null;
                    if (idx < descSorted.length - 1) {
                      const prevVal = descSorted[idx + 1].data?.[cat.key];
                      if (val && prevVal) {
                        if (val > prevVal) trend = "up";
                        else if (val < prevVal) trend = "down";
                      }
                    }

                    return (
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className={`text-sm ${trend === "up" ? "text-success-300" : trend === "down" ? "text-error-400" : "text-secondary-grey400"}`}>
                            {val || "-"}
                          </span>
                          {trend === "up" && <ArrowUp className="w-3 h-3 text-success-300" />}
                          {trend === "down" && <ArrowDown className="w-3 h-3 text-error-400" />}
                        </div>
                        <div className="text-[12px] text-secondary-grey200">{formatFullDate(entry.recordedAt)}</div>
                      </div>
                    );
                  })}
                </div>
              </td>
              <td className="text-right pr-2">
                <button className="text-gray-400 p-1 hover:text-blue-500"><img src="/Eye.svg" width={20} className="h-[20px] w-[20px]" alt="view" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PatientVitals({
  embedded = false,
  onAdd,
  vitalsHistory = [],
  biometricsHistory = []
}) {
  const [viewMode, setViewMode] = useState("chart");
  const [selectedVitalName, setSelectedVitalName] = useState("Blood Pressure");

  const mappedConfigs = VITAL_CONFIGS.map(cfg => mapVitalHistory(vitalsHistory, cfg));
  const selectedConfig = mappedConfigs.find(c => c.name === selectedVitalName) || mappedConfigs[0];

  if (embedded) {
    return (
      <>
        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-secondary-grey900">Vitals</div>
            <div className="flex items-center gap-2">
              <div className="flex gap-[2px]">
                <button onClick={() => setViewMode("table")} className={`p-1 rounded ${viewMode === "table" ? "text-blue-primary250 bg-blue-50 border-[1.5px] border-[#96BFFF]" : "text-secondary-grey300"}`} aria-label="list view">
                  <List className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode("chart")} className={`p-1 rounded ${viewMode === "chart" ? "text-blue-primary250 bg-blue-50 border-[1.5px] border-[#96BFFF]" : "text-secondary-grey300"}`} aria-label="chart view">
                  <BarChart2 className="h-4 w-4" />
                </button>
              </div>
              <div className="w-[1.5px] h-[16px] bg-gray-300" />
              <button onClick={onAdd} className="px-2 text-blue-primary250 text-sm font-medium hover:underline focus:outline-none">+ Add Vitals</button>
            </div>
          </div>

          <div className="mt-3">
            {viewMode === "chart" ? (
              <div className="flex flex-col lg:flex-row gap-0">
                <div className="w-full lg:w-[250px] border-r border-gray-100">
                  {mappedConfigs.map((v, i) => (
                    <button key={i} onClick={() => setSelectedVitalName(v.name)} className={`w-full text-left px-3 py-3 flex items-center justify-between border-l-[3px] transition-all ${selectedVitalName === v.name ? "bg-blue-50 text-blue-600 border-[#96bfff]" : "border-transparent hover:bg-gray-50"}`}>
                      <div>
                        <div className="font-medium text-sm">{v.name}</div>
                        <div className="text-[11px] text-gray-400">{v.unit}</div>
                      </div>
                      <div className="text-xs font-semibold text-gray-500">{v.latest}</div>
                    </button>
                  ))}
                </div>
                <div className="flex-1 bg-blue-primary50 rounded p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-gray-500 font-medium">{selectedConfig.name}</div>
                      <div className="px-2 py-0.5 rounded-lg border bg-secondary-grey50 text-secondary-grey200">Range: {selectedConfig.normalRange}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-white border rounded px-1.5 py-0.5 text-[11px] text-gray-600 flex items-center gap-1">1 Month <ChevronDown className="h-3 w-3" /></div>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <VitalsChart vital={selectedConfig} />
                </div>
              </div>
            ) : (
              <VitalsTable configs={mappedConfigs} />
            )}
          </div>
        </div>

        <div className="py-3">
          <SectionHeader title="Biometrics" actionLabel="Add Biometrics" onAdd={onAdd} />
          <BiometricsTable history={biometricsHistory} />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-4 rounded-md border border-border">
        <SectionHeader title="Vitals Summary" actionLabel="Add Vitals" onAdd={onAdd} />
        <VitalsTable configs={mappedConfigs} />
        <div className="mt-6">
          <SectionHeader title="Biometrics History" actionLabel="Add Biometrics" onAdd={onAdd} />
          <BiometricsTable history={biometricsHistory} />
        </div>
      </div>
    </div>
  );
}
