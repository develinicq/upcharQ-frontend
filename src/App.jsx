import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layouts/Layout_sidebar";
import Dashboard from "./SuperAdmin/pages/Dashboard/Dashboard";
import Doctor from "./SuperAdmin/pages/Doctors/Doctor";
import Hospitals from "./SuperAdmin/pages/Hospitals/Hospitals";
import Patients from "./SuperAdmin/pages/Patients/Patients";
import Settings from "./SuperAdmin/pages/Settings/Settings";
import Layout_registration_new from "./components/Layouts/Layout_registration_new";
import Layout_registration_test from "./components/Layouts/Layout_registration_test";
import DoctorDetailsPage from "./SuperAdmin/pages/Doctors/DoctorList/DoctorInfo/DoctorDetailsPage";
import HospitalDetailsPage from "./SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/HospitalDetailsPage";
import { RegistrationProvider } from "./SuperAdmin/context/RegistrationContext";
import SuperAdminSignIn from "./SuperAdmin/pages/SignIn";
import { ProtectedAdminRoute, PublicAdminRoute } from "./SuperAdmin/components/Guard/AdminRoutes";
import { ProtectedHospitalRoute, ProtectedDoctorRoute, PublicHospitalRoute, PublicDoctorRoute } from "./HospitalModule/Components/Guard/HospitalRoutes";
import { ProtectedFrontDeskRoute } from "./FrontDeskModule/Components/Guard/FrontDeskRoutes";
import { ProtectedHospitalFrontDeskRoute } from "./HospitalFDModule/Components/Guard/HospitalFrontDeskRoutes";
import GetStarted from "./pages/GetStarted";
import OnboardingFlow from "./DoctorModule/Pages/Login/OnboardingFlow";
import Doctor_layout from "./DoctorModule/Components/Layout/DoctorLayout";
import DocDashboard from "./DoctorModule/Pages/Dashboard/DocDashboard";
import Queue from "./DoctorModule/Pages/Queue/Queue";
import DocPatients from "./DoctorModule/Pages/Patients/Patient";
import PatientDetails from "./DoctorModule/Pages/Patients/PatientDetails";
import Doc_settings from "./DoctorModule/Pages/Settings/Doc_settings";
import DocCalendar from "./DoctorModule/Pages/Calendar/DocCalendar";
import FDLayout from "./FrontDeskModule/Components/Layout/FDLayout";
import FDDashboard from "./FrontDeskModule/Pages/Dashboard/FDDashboard";
import FDQueue from "./FrontDeskModule/Pages/Queue/FDQueue";
import FDPatients from "./FrontDeskModule/Pages/Patients/Patient";
import FDPatientDetails from "./FrontDeskModule/Pages/Patients/PatientDetails";
import FDCalendar from "./FrontDeskModule/Pages/Calendar/Calendar";
import FDClinics from "./FrontDeskModule/Pages/Settings/FDClinics";
import FDConsultation from "./FrontDeskModule/Pages/Settings/FDConsultation";
import FDStaffPermissions from "./FrontDeskModule/Pages/Settings/FDStaffPermissions";
import HospitalLayout from "./HospitalModule/Components/Layout/HospitalLayout";
import HDashboard from "./HospitalModule/Pages/Dashboard/HDashboard";
import HPatients from "./HospitalModule/Pages/Patients/Patient";
import HPatientDetails from "./HospitalModule/Pages/Patients/PatientDetails";
import HSettings from "./HospitalModule/Pages/Settings/HSettings";
import HCalendar from "./HospitalModule/Pages/Calendar/Calendar";
import HDoctors from "./HospitalModule/Pages/Doctors/Doctors";
import HDoctorDetailsPage from "./HospitalModule/Pages/Doctors/DoctorInfo/DoctorDetailsPage";
import HRxTemplate from "./HospitalModule/Pages/Settings/HRxTemplate";
import HSubscriptions from "./HospitalModule/Pages/Settings/HSubscriptions";
import HFDLayout from "./HospitalFDModule/Components/Layout/HFDLayout";
import HFDQueue from "./HospitalFDModule/Pages/Queue/Queue";
import HFDPatients from "./HospitalFDModule/Pages/Patients/Patient";
import HFDPatientDetails from "./HospitalFDModule/Pages/Patients/PatientDetails";
import HFDCalendar from "./HospitalFDModule/Pages/Calendar/Calendar";
import HFDClinics from "./HospitalFDModule/Pages/Settings/HFDClinics";
import HFDConsultation from "./HospitalFDModule/Pages/Settings/HFDConsultation";
import HFDStaffPermissions from "./HospitalFDModule/Pages/Settings/HFDStaffPermissions";
import FDOnboardingFlow from "./FrontDeskModule/Pages/Login/OnboardingFlow";
import HOnboardingFlow from "./HospitalModule/Pages/Login/OnboardingFlow";
import HospitalSignIn from "./HospitalModule/Pages/Login/SignIn";
import HFDOnboardingFlow from "./HospitalFDModule/Pages/Login/OnboardingFlow";
import UnifiedSignIn from "./pages/UnifiedSignIn";
import TabDemo from "./pages/TabDemo";
import UpgradePlan from "./DoctorModule/Pages/Settings/UpgradePlan";
import Payment from "./DoctorModule/Pages/Settings/Payment";

import Step6 from "./SuperAdmin/pages/Dashboard/Doctor_registration/Step6";
import Step6Payment from "./SuperAdmin/pages/Dashboard/Doctor_registration/Step6payment";
import Step7 from "./SuperAdmin/pages/Dashboard/Doctor_registration/Step7";
import DisplayGraph from "./components/ui/Graphs/DisplayGraph";

// DocSignIn route intentionally not wired per requirement
import DocSignIn from "./DoctorModule/Pages/Login/SignIn";


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicAdminRoute>
            <SuperAdminSignIn />
          </PublicAdminRoute>
        }
      />
      {/* Demo route for Tab component */}
      <Route path="tab-demo" element={<TabDemo />} />

      {/* Admin panel routes */}
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="doctor" element={<Doctor />} />
          <Route path="doctor/:id" element={<DoctorDetailsPage />} />
          <Route path="hospitals" element={<Hospitals />} />
          <Route path="hospital/:id" element={<HospitalDetailsPage />} />
          <Route path="patients" element={<Patients />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Registration flow with single routes - Moved outside Layout to remove main sidebar */}
      <Route
        path="register/doctor"
        element={
          <RegistrationProvider>
            <Layout_registration_new />
          </RegistrationProvider>
        }
      />
      <Route
        path="register/hospital"
        element={
          <RegistrationProvider>
            <Layout_registration_new />
          </RegistrationProvider>
        }
      />
      <Route
        path="register/patient"
        element={
          <RegistrationProvider>
            <Layout_registration_new />
          </RegistrationProvider>
        }
      />
      <Route
        path="register/test"
        element={
          <RegistrationProvider>
            <Layout_registration_test />
          </RegistrationProvider>
        }
      />

      <Route path="onboarding" element={<OnboardingFlow />} />
      {/* Unified sign-in for doctor / hospital / fd / hfd */}
      <Route path="signin" element={<UnifiedSignIn />} />
      {/* Dedicated Hospital sign-in (no API) */}
      <Route
        path="hospital/signin"
        element={
          <PublicHospitalRoute>
            <HospitalSignIn />
          </PublicHospitalRoute>
        }
      />
      {/* Back-compat redirects */}
      <Route
        path="fd/signin"
        element={<Navigate to="/signin?variant=fd" replace />}
      />
      <Route
        path="hfd/signin"
        element={<Navigate to="/signin?variant=hfd" replace />}
      />

      {/* New Doctor Sign-In Route */}
      <Route
        path="doc/signin"
        element={
          <PublicDoctorRoute>
            <DocSignIn />
          </PublicDoctorRoute>
        }
      />

      {/* Keep existing onboarding routes */}
      <Route path="fd/onboarding" element={<FDOnboardingFlow />} />
      <Route path="hospital/onboarding" element={<HOnboardingFlow />} />
      {/* Legacy: dedicated signin components removed in favor of /signin?variant=... */}
      <Route path="hfd/onboarding" element={<HFDOnboardingFlow />} />

      {/* Doctor Portal */}
      <Route element={<ProtectedDoctorRoute />}>
        <Route path="doc" element={<Doctor_layout />}>
          <Route index element={<DocDashboard />} />
          <Route path="queue" element={<Queue />} />
          <Route path="calendar" element={<DocCalendar />} />
          <Route path="patients" element={<DocPatients />} />
          <Route path="patients/:id" element={<PatientDetails />} />
          {/* Settings subroutes */}
          <Route path="settings/account" element={<Doc_settings />} />
          <Route path="settings/consultation" element={<Doc_settings />} />
          <Route path="settings/clinics" element={<Doc_settings />} />
          <Route path="settings/staff-permissions" element={<Doc_settings />} />
          <Route path="settings/security" element={<Doc_settings />} />
          <Route path="settings/billing" element={<Doc_settings />} />
          <Route path="settings/rx-template" element={<Doc_settings />} />
        </Route>
      </Route>

      {/* billing */}
      <Route path="billing/upgrade-plan" element={<UpgradePlan />} />
      <Route path="billing/payment" element={<Payment />} />

      {/* FrontDesk Portal (copy of Doctor Portal) */}
      <Route element={<ProtectedFrontDeskRoute />}>
        <Route path="fd" element={<FDLayout />}>
          <Route index element={<Navigate to="queue" replace />} />
          <Route path="queue" element={<FDQueue />} />
          <Route path="calendar" element={<FDCalendar />} />
          <Route path="patients" element={<FDPatients />} />
          <Route path="patients/:id" element={<FDPatientDetails />} />
          {/* Settings */}
          <Route path="settings/clinics" element={<FDClinics />} />
          <Route path="settings/consultation" element={<FDConsultation />} />
          <Route
            path="settings/staff-permissions"
            element={<FDStaffPermissions />}
          />
        </Route>
      </Route>

      {/* Hospital Portal (copy of Doctor Portal) */}
      <Route element={<ProtectedHospitalRoute />}>
        <Route path="hospital" element={<HospitalLayout />}>
          <Route index element={<HDashboard />} />
          <Route path="patients" element={<HPatients />} />
          <Route path="calendar" element={<HCalendar />} />
          <Route path="doctors" element={<HDoctors />} />
          <Route path="doctor/:id" element={<HDoctorDetailsPage />} />
          <Route path="patients/:id" element={<HPatientDetails />} />
          <Route path="settings/account" element={<HSettings />} />
          <Route path="settings/timing" element={<HSettings />} />
          <Route path="settings/surgeries" element={<HSettings />} />
          <Route
            path="settings/staff-permissions"
            element={<HSettings />}
          />
          <Route path="settings/security" element={<HSettings />} />
          <Route path="settings/rx-template" element={<HRxTemplate />} />
          <Route
            path="settings/subscriptions-billing"
            element={<HSubscriptions />}
          />
        </Route>
      </Route>

      {/* Hospital FrontDesk Portal (copy of FD) */}
      <Route element={<ProtectedHospitalFrontDeskRoute />}>
        <Route path="hfd" element={<HFDLayout />}>
          <Route index element={<Navigate to="queue" replace />} />
          <Route path="queue" element={<HFDQueue />} />
          <Route path="calendar" element={<HFDCalendar />} />
          <Route path="patients" element={<HFDPatients />} />
          <Route path="patients/:id" element={<HFDPatientDetails />} />
          {/* Settings */}
          {/* 
          <Route path="settings/clinics" element={<HFDClinics />} />
          <Route path="settings/consultation" element={<HFDConsultation />} />
          <Route
            path="settings/staff-permissions"
            element={<HFDStaffPermissions />}
          />
          */}
        </Route>
      </Route>


      {/* testing and building */}
      <Route

        path="step6/test"
        element={
          <RegistrationProvider>
            <Step6 />
          </RegistrationProvider>
        }
      />
      <Route
        path="step6/test/payment"
        element={
          <RegistrationProvider>
            <Step6Payment />
          </RegistrationProvider>
        }
      />
      <Route
        path="/success"
        element={
          <RegistrationProvider>
            <Step7 />
          </RegistrationProvider>
        }
      />

      {/* grpah routes for testing and displaying */}
      <Route path="/testGraph" element={<DisplayGraph />} />

    </Routes>
  );
}

export default App;
