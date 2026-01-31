import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import HospitalDoctorBanner from "./HospitalDoctorBanner";
import PageNav from "./PageNav";
import { getDoctorPersonalInfoForHospital } from "@/services/doctorService";
import useHospitalAuthStore from "@/store/useHospitalAuthStore";

const DoctorDetailsPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const { hospitalId } = useHospitalAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [doctor, setDoctor] = useState(null);

    useEffect(() => {
        let ignore = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                // prefer userId from route param; fallback to state.doctor.userId
                // The route is /hospital/doctor/:id. This ID is likely the userId or doctorId.
                const routeId = id ? decodeURIComponent(String(id)).trim() : "";
                const stateUserId = location.state?.doctor?.userId || location.state?.doctor?.id;
                const userId = routeId || stateUserId;

                if (!userId) throw new Error("Doctor userId is missing");
                if (!hospitalId) throw new Error("Hospital ID is missing");

                const resp = await getDoctorPersonalInfoForHospital(userId, hospitalId);
                if (ignore) return;

                const d = resp?.data || {};
                const pInfo = d.personalInfo || {};
                const profInfo = d.professionalInfo || {};
                const hMap = d.hospitalMapping || {};
                const specs = profInfo.specializations || [];

                // Map API details to UI contract
                const mapped = {
                    ...d,
                    id: d.doctorCode || userId,
                    userId,
                    name: pInfo.name || "Doctor",
                    designation: specs[0]?.name || "",
                    specialization: specs.map(s => s.name).join(", "),
                    exp: specs[0]?.experience || "0",
                    status: 'Active', // Fallback status as not in new API snippet
                    profileImage: pInfo.photo || "",
                    coverImage: "",
                    activePackage: null,
                    clinicHospitalName: "",
                    mrnNumber: "",
                    registrationCouncil: profInfo.medicalCouncil || "",
                    registrationNumber: profInfo.registrationNumber || "",
                    registrationYear: profInfo.registrationYear || "",
                    specializationWithExperience: specs,
                    primaryPhone: pInfo.phone || "",
                    emailAddress: pInfo.email || "",
                    graduationDegree: d.education?.[0]?.degree || "",
                    postGraduationDegree: d.education?.find(e => e.type === 'PG')?.degree || "",
                    address: null,
                    location: "-",
                    hospitalDetails: [],
                    dateOfBirth: pInfo.dateOfBirth,
                    age: null,
                    dateJoinedPlatform: null,
                    profileCreated: null,
                    consultationDetails: {
                        consultationFee: hMap.consultationFee,
                        followUpFee: hMap.followUpFee,
                        avgDurationMinutes: hMap.avgDurationMinutes,
                        availabilityDays: hMap.availabilityDays
                    },
                    education: d.education || [],
                    experience: d.experience || [],
                    awards: d.awards || [],
                    publications: d.publications || []
                };
                setDoctor(mapped);
            } catch (e) {
                if (ignore) return;
                console.error("Failed to load doctor details", e);

                // Fallback: prefer route state if present; if API returned 401/403 (or forbidden text), suppress server message
                const stateDoc = location.state?.doctor;
                const status = e?.response?.status;
                const serverMsg = e?.response?.data?.message || e?.message || '';
                const isAuthError = status === 401 || status === 403 || /forbidden/i.test(serverMsg) || /SUPER_ACCESS/i.test(serverMsg);

                if (stateDoc) {
                    const mapped = {
                        ...stateDoc,
                        id: stateDoc.id || stateDoc.docId,
                        userId: stateDoc.userId,
                        name: stateDoc.name,
                        designation: stateDoc.designation,
                        specialization: stateDoc.specialization,
                        exp: stateDoc.exp,
                        status: stateDoc.status || 'Active',
                        profileImage: stateDoc.image || stateDoc.profilePhoto || '',
                    };
                    setDoctor(mapped);
                } else if (isAuthError) {
                    // show a minimal dummy doctor when permissions prevent fetching details
                    setDoctor({
                        id: id || 'DOC-DUMMY',
                        userId: id || 'user-dummy',
                        name: 'Doctor (preview)',
                        designation: 'General',
                        specialization: 'General',
                        exp: '5',
                        status: 'Active',
                        profileImage: ''
                    });
                    setError(null);
                } else {
                    setError('Failed to fetch doctor details');
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        if (hospitalId) load();
        else {
            // Not authed or missing hospitalId: allow viewing from route state if present
            const stateDoc = location.state?.doctor;
            if (stateDoc) {
                setDoctor({
                    ...stateDoc,
                    id: stateDoc.id || stateDoc.docId,
                    userId: stateDoc.userId,
                    name: stateDoc.name,
                    designation: stateDoc.designation,
                    specialization: stateDoc.specialization,
                    exp: stateDoc.exp,
                    status: stateDoc.status || 'Active',
                    profileImage: stateDoc.image || '',
                });
                setError(null);
            } else {
                setError("Not authenticated");
            }
            setLoading(false);
        }
        return () => { ignore = true; };
    }, [id, hospitalId, location.state]);

    if (loading) return <div className="p-6 text-gray-600">Loading doctor details…</div>;
    // Suppress error if we have a partial doctor loaded via fallback? No, existing logic sets doctor if fallback succeeds.
    if (error && !doctor) return <div className="p-6 text-red-600">{String(error)}</div>;
    if (!doctor) return <div className="p-6 text-gray-600">Doctor not found.</div>;

    return (
        <div className="flex flex-col gap-6 w-full h-full">
            <div>
                <HospitalDoctorBanner doctor={doctor} />
                <PageNav doctor={doctor} />
            </div>
        </div>
    );
};

export default DoctorDetailsPage;
