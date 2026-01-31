import React, { useState, useEffect } from "react";
import AvatarCircle from "../../../components/AvatarCircle";
import Badge from "../../../components/Badge";
import { Eye, MoreVertical, Filter } from "lucide-react";
import { useParams } from "react-router-dom";
import { getPatientAppointmentsForDoctor } from "../../../services/doctorService";
import useDoctorAuthStore from "../../../store/useDoctorAuthStore";
import useFrontDeskAuthStore from "../../../store/useFrontDeskAuthStore";
import useClinicStore from "../../../store/settings/useClinicStore";
import ScheduleAppointmentDrawer2 from "../../../components/PatientList/ScheduleAppointmentDrawer2";

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  let color = "gray";
  let label = status || "-";

  if (s === "CONFIRMED") {
    color = "green";
    label = "Confirmed";
  } else if (s === "CANCELLED" || s === "DECLINED") {
    color = "red";
    label = s.charAt(0) + s.slice(1).toLowerCase();
  } else if (s === "COMPLETED") {
    color = "gray";
    label = "Completed";
  }

  return (
    <Badge size="s" type="ghost" color={color}>
      {label}
    </Badge>
  );
}

function AppointmentsTable({ rows, loading }) {
  const { user: doctorDetails } = useDoctorAuthStore();

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">
        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading appointments...
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <div className="py-8 text-center text-gray-500 italic border rounded-md">No appointments found.</div>;
  }

  return (
    <table className="min-w-full h-8 min-h-8 max-h-8 border-t-[0.5px] border-b-[0.5px] border-[#D6D6D6]">
      <thead className="font-medium text-gray-500 border-b">
        <tr className="h-[32px]">
          <th className="px-[8px] font-inter font-medium text-sm leading-[120%] tracking-normal text-left text-[#424242]">Date</th>
          <th className="px-[8px] font-inter font-medium text-sm leading-[120%] tracking-normal text-left text-[#424242]">Doctor</th>
          <th className="px-[8px] font-inter font-medium text-sm leading-[120%] tracking-normal text-left text-[#424242]">Type</th>
          <th className="px-[8px] font-inter font-medium text-sm leading-[120%] tracking-normal text-left text-[#424242]">Reason For Visit</th>
          <th className="px-[8px] font-inter font-medium text-sm leading-[120%] tracking-normal text-left text-[#424242]">Status</th>
          <th className="px-[8px] text-right"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const docName =
            r.doctorName ||
            r.doctor?.name ||
            doctorDetails?.name ||
            (doctorDetails?.firstName ? `${doctorDetails.firstName} ${doctorDetails.lastName || ""}`.trim() : null) ||
            doctorDetails?.fullName ||
            "-";

          const docSpecialization =
            r.doctorSpecialization ||
            r.doctor?.specialization ||
            doctorDetails?.designation ||
            (Array.isArray(doctorDetails?.specializations) ? doctorDetails?.specializations[0] : null) ||
            "-";

          return (
            <tr key={r.id || i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="pl-1 py-3 font-inter font-normal text-sm leading-[120%] tracking-normal text-gray-800">
                {r.displayDate}
              </td>
              <td className="px-[8px] py-3">
                <div className="flex items-center gap-2">
                  <AvatarCircle
                    name={docName !== "-" ? docName : "Doctor"}
                    size='s'
                    fontSize={14}
                  />
                  <div className="flex flex-col">
                    <span className="font-inter font-medium text-sm leading-[120%] tracking-normal text-gray-800">
                      {docName}
                    </span>
                    <span className="font-inter font-normal text-xs leading-[120%] tracking-normal text-gray-500">
                      {docSpecialization}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-3 font-inter font-normal text-sm leading-[120%] tracking-normal text-[#424242]">
                {r.bookingType ? (r.bookingType.charAt(0) + r.bookingType.slice(1).toLowerCase()) : "-"}
              </td>
              <td className="py-3 font-inter font-normal text-sm leading-[120%] tracking-normal text-[#424242]">
                {r.reason || "-"}
              </td>
              <td className="py-3 px-2">
                <StatusBadge status={r.status} />
              </td>
              <td className="py-3 pr-2">
                <div className="flex items-center justify-end gap-2 text-gray-600">
                  <button aria-label="View">
                    <img src="/Eye.svg" width={24} height={24} className="h-6 w-6" alt="view" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-gray-100" aria-label="More">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function PatientAppointments({ patientId: propPatientId, appointmentData: propsAppointmentData }) {
  const { id: urlPatientId } = useParams();
  const patientId = propPatientId || urlPatientId;

  const { user: doctorDetails } = useDoctorAuthStore();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!propsAppointmentData) return;

    const processAppointments = () => {
      const now = new Date();
      const upcomingArr = [];
      const pastArr = [];

      propsAppointmentData.forEach((appt) => {
        const apptDate = appt.date ? new Date(appt.date) : null;
        const apptTime = appt.time ? new Date(appt.time) : null;

        // Format for display
        const displayDate = apptDate
          ? `${apptDate.toLocaleDateString("en-GB")} | ${apptTime ? apptTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : ""}`
          : "-";

        const processed = { ...appt, displayDate };

        // Categorization
        // If date is today or future, it's upcoming
        if (apptDate && apptDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
          upcomingArr.push(processed);
        } else {
          pastArr.push(processed);
        }
      });

      // Sort upcoming: closest first
      upcomingArr.sort((a, b) => new Date(a.date) - new Date(b.date));
      // Sort past: most recent first
      pastArr.sort((a, b) => new Date(b.date) - new Date(a.date));

      setUpcoming(upcomingArr);
      setPast(pastArr);
    };

    processAppointments();
  }, [propsAppointmentData]);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const { user: authDoc } = useDoctorAuthStore();
  const { user: fdUser } = useFrontDeskAuthStore();
  const { clinic: clinicData } = useClinicStore();

  const handleOpenSchedule = () => setIsScheduleOpen(true);

  return (
    <div className="flex flex-col gap-[24px]">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="text-sm font-semibold text-gray-800">
            Upcoming Appointment ({upcoming.length})
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenSchedule}
              className="text-blue-600 hover:underline font-medium"
            >
              + Schedule
            </button>
            <button className="p-1.5 rounded hover:bg-gray-100" aria-label="Filter">
              <Filter className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
        <AppointmentsTable rows={upcoming} loading={loading} />
      </div>

      <div>
        <div className="text-sm font-semibold text-gray-800 mb-2">
          Past Appointments ({past.length})
        </div>
        <AppointmentsTable rows={past} loading={loading} />
      </div>

      <ScheduleAppointmentDrawer2
        open={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        patient={{ id: patientId, name: upcoming[0]?.patientName || "" }} // Basic info fallback
        doctorId={authDoc?.id || authDoc?.doctorId || fdUser?.doctorId}
        clinicId={authDoc?.clinicId || authDoc?.clinic?.id || fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId}
        onSchedule={() => {
          // Re-fetch appointments after scheduling
          window.location.reload(); // Simple refresh for now or trigger re-fetch logic if exposed
        }}
        zIndex={6000}
      />
    </div>
  );
}
