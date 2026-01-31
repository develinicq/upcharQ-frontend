import { PatientsServedChart } from "./PatientsServedChart";
import { AppointmentBookingChart } from "./AppointmentBookingChart";
import { AppointmentBookingStatusChart } from "./AppointmentBookingStatusChart";
import { SpecialityAppointmentChart } from "./SpecialityAppointmentChart";
import { AppointmentTypeChart } from "./AppointmentTypeChart";
import { PatientDemographicsChart } from "./PatientDemographicsChart";

const DisplayGraph = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4">
      <div className="max-w-9xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#424242] mb-8">Display Graph</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PatientsServedChart />
          <AppointmentBookingChart />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AppointmentBookingStatusChart />
          <SpecialityAppointmentChart />
        </div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AppointmentTypeChart/>
          <PatientDemographicsChart/>
        </div>
      </div>
    </div>
  );
};

export default DisplayGraph;
