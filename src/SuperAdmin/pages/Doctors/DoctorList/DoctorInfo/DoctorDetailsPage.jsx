import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import DoctorBanner from "../../../../../components/DoctorList/DoctorInfo/DoctorBanner";
import PageNav from "../../../../../components/DoctorList/DoctorInfo/PageNav";
import { getDoctorDetailsByIdBySuperAdmin } from "../../../../../services/doctorService";
import useAuthStore from "../../../../../store/useAuthStore";
import useUIStore from "../../../../../store/useUIStore";

import UniversalLoader from "@/components/UniversalLoader";

const DoctorDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isAuthed = useAuthStore((s) => Boolean(s.token));
  const setBreadcrumbName = useUIStore((s) => s.setBreadcrumbEntityName);
  const clearBreadcrumbName = useUIStore((s) => s.clearBreadcrumbEntityName);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctor, setDoctor] = useState(() => location.state?.doctor || null);
  const [selectedClinicId, setSelectedClinicId] = useState(undefined);

  useEffect(() => {
    if (doctor?.name) {
      setBreadcrumbName(doctor.name);
    }
  }, [doctor, setBreadcrumbName]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // prefer userId from route param; fallback to state.doctor.userId
        const userId = decodeURIComponent(String(id || "")).trim() || location.state?.doctor?.userId;
        console.log("DoctorDetailsPage: userId extracted:", userId);

        if (!userId) throw new Error("Doctor userId is missing");

        console.log("DoctorDetailsPage: Fetching data for:", userId);
        const resp = await getDoctorDetailsByIdBySuperAdmin(userId);
        console.log("DoctorDetailsPage: API Success:", resp);

        if (ignore) return;
        const d = resp?.data || {};
        // Map API details to UI contract
        const mapped = {
          id: d?.doctorCode || userId,
          userId,
          name: d?.doctorName || "", // Use API name strictly
          workplace: d?.workplace || { clinics: [], hospitals: [] }, // Added workplace mapping
          clinicId: (d?.workplace?.clinics?.[0]?.id) || undefined, // expose clinicId for Consultation tab
          designation: d?.qualification || "",
          specialization: d?.specialization || "",
          // If experienceOverall is 0, we still show it? Or only if > 0? User example has 0.
          exp: d?.experienceOverall != null ? `${d.experienceOverall} yrs exp` : "",
          status: d?.status || 'Active',
          avatar: d?.profilePhoto || "",
          activePackage: d?.activePackage,
          clinicHospitalName: d?.clinicHospitalName,
          mrnNumber: d?.mrnNumber,
          registrationCouncil: d?.registrationCouncil,
          registrationYear: d?.registrationYear,
          specializationWithExperience: d?.specializationWithExperience || [],
          primaryPhone: d?.primaryPhone,
          emailAddress: d?.emailAddress,
          graduationDegree: d?.graduationDegree,
          postGraduationDegree: d?.postGraduationDegree,
          address: d?.address,
          location: d?.location,
          hospitalDetails: d?.hospitalDetails || [],
          dateOfBirth: d?.dateOfBirth,
          age: d?.age,
          dateJoinedPlatform: d?.dateJoinedPlatform,
          profileCreated: d?.profileCreated,
          rating: d?.rating || 'N/A', // Added rating mapping
          // ... map other fields ensuring they match UI expectations
        };
        console.log("DoctorDetailsPage: Mapped doctor object:", mapped);
        setDoctor(mapped);
        setBreadcrumbName(mapped.name);
        // Initialize selected clinic from API data if available
        setSelectedClinicId(mapped.clinicId);
      } catch (e) {
        if (ignore) return;
        console.error("DoctorDetailsPage: API/Logic Error:", e);

        // Fallback: prefer route state if present
        const stateDoc = location.state?.doctor;
        if (stateDoc) {
          console.log("DoctorDetailsPage: Falling back to navigation state data.");
          const mapped = {
            id: stateDoc.id || stateDoc.docId,
            userId: stateDoc.userId,
            name: stateDoc.name,
            clinicId: stateDoc?.workplace?.clinics?.[0]?.id,
            designation: stateDoc.designation,
            specialization: stateDoc.specialization,
            exp: stateDoc.exp,
            status: stateDoc.status || 'Active',
            avatar: '',
          };
          setDoctor(mapped);
          setSelectedClinicId(mapped.clinicId);
        } else {
          setError('Failed to fetch doctor details');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (isAuthed) load();
    else {
      // Not authed: allow viewing from route state if present
      const stateDoc = location.state?.doctor;
      if (stateDoc) {
        const mapped = {
          id: stateDoc.id || stateDoc.docId,
          userId: stateDoc.userId,
          name: stateDoc.name,
          designation: stateDoc.designation,
          specialization: stateDoc.specialization,
          exp: stateDoc.exp,
          status: stateDoc.status || 'Active',
          avatar: '',
        };
        setDoctor(mapped);
        setBreadcrumbName(mapped.name);
        setSelectedClinicId(stateDoc?.workplace?.clinics?.[0]?.id);
        setError(null);
      } else {
        setError("Not authenticated");
      }
      setLoading(false);
    }
    return () => {
      ignore = true;
      clearBreadcrumbName();
    };
  }, [id, isAuthed, location.state, setBreadcrumbName, clearBreadcrumbName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-white h-screen">
        <UniversalLoader size={32}  />
      </div>
    );
  }
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>;
  if (!doctor) return <div className="p-6 text-gray-600">Doctor not found.</div>;

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div>
        <DoctorBanner doctor={doctor} onClinicChange={setSelectedClinicId} />
        <PageNav doctor={doctor} selectedClinicId={selectedClinicId} />
      </div>
    </div>
  );
};

export default DoctorDetailsPage;
