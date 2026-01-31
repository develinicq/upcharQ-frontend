import React, { useState } from "react";
import {
    pencil,
    experience,
    publication,
    award,
    add,
    inviteUserIcon,
} from "../../../../../public/index.js";
import SectionCard from "../components/SectionCard";
import ProfileItemCard from "../components/ProfileItemCard";
import InfoField from "../components/InfoField";
import EditBasicInfoDrawer from "../drawers/EditBasicInfoDrawer.jsx";
import AddEducationDrawer from "../drawers/AddEducationDrawer.jsx";
import AddAwardDrawer from "../drawers/AddAwardDrawer.jsx";
import AddPublicationDrawer from "../drawers/AddPublicationDrawer.jsx";
import ExperienceDrawerNew from "../Drawers/ExperienceDrawer.jsx";
import EditPracticeDetailsDrawer from "../Drawers/EditPracticeDetailsDrawer.jsx";
import useEducationStore from "../../../../store/settings/useEducationStore.js";
import useExperienceStore from "../../../../store/settings/useExperienceStore.js";
import useAwardsPublicationsStore from "../../../../store/settings/useAwardsPublicationsStore.js";
import usePracticeStore from "../../../../store/settings/usePracticeStore.js";

const formatMonthYear = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date)) return "-";
    // Custom month labels to match UI (use 'Sept')
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",
    ];
    const m = months[date.getMonth()] ?? date.toLocaleString("en-US", { month: "short" });
    const y = date.getFullYear();
    return `${m}, ${y}`; // e.g., Aug, 2014
};

// Compute precise diff in years, months, and days
const diffYearsMonthsDays = (start, end = new Date()) => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e)) return null;
    // Normalize to avoid timezone drift
    const sY = s.getFullYear();
    const sM = s.getMonth();
    const sD = s.getDate();
    let y = e.getFullYear() - sY;
    let m = e.getMonth() - sM;
    let d = e.getDate() - sD;

    if (d < 0) {
        // Borrow days from previous month
        const prevMonth = new Date(e.getFullYear(), e.getMonth(), 0);
        d += prevMonth.getDate();
        m -= 1;
    }
    if (m < 0) {
        m += 12;
        y -= 1;
    }
    if (y < 0) y = 0;

    const totalMonths = y * 12 + m;
    return { years: y, months: m, days: d, totalMonths };
};

const formatExperienceRange = (startDate, endDate, isCurrent) => {
    if (!startDate) return "-";
    const start = formatMonthYear(startDate);
    const end = isCurrent || !endDate ? "Present" : formatMonthYear(endDate);
    // Duration
    const d = diffYearsMonthsDays(startDate, isCurrent || !endDate ? new Date() : new Date(endDate));
    let dur = "";
    if (d) {
        if (d.years >= 1) {
            // Show years and months when months > 0
            dur = d.months > 0 ? `${d.years} Yrs ${d.months} Mos` : `${d.years} Yrs`;
        } else if (d.totalMonths >= 1) {
            // Less than a year → show months
            dur = `${d.totalMonths} Mos`;
        } else {
            // Less than a month → show days (show 0 as 0 Days if same-day)
            dur = `${d.days} Days`;
        }
    }
    return `${start} - ${end} | ${dur}`;
};

const PersonalTab = ({ profile, fetchBasicInfo, updateBasicInfo, fetchProfessionalDetails, updatePracticeDetails }) => {
    // Drawer states
    const [basicOpen, setBasicOpen] = useState(false);
    const [eduOpen, setEduOpen] = useState(false);
    const [eduEditData, setEduEditData] = useState(null);
    const [eduEditMode, setEduEditMode] = useState("add");

    const [expOpen, setExpOpen] = useState(false);
    const [expEditData, setExpEditData] = useState(null);
    const [expEditMode, setExpEditMode] = useState("add");

    const [awardOpen, setAwardOpen] = useState(false);
    const [awardEditData, setAwardEditData] = useState(null);
    const [awardEditMode, setAwardEditMode] = useState("add");

    const [pubOpen, setPubOpen] = useState(false);
    const [pubEditData, setPubEditData] = useState(null);
    const [pubEditMode, setPubEditMode] = useState("add");

    const [practiceOpen, setPracticeOpen] = useState(false);

    const [showAddMenu, setShowAddMenu] = useState(false);

    // Store hooks
    const educationList = useEducationStore((state) => state.items);
    const educationLoading = useEducationStore((state) => state.loading);
    const fetchEducation = useEducationStore((state) => state.fetchEducation);
    const addEducation = useEducationStore((state) => state.addEducation);
    const updateEducation = useEducationStore((state) => state.updateEducation);

    const experienceList = useExperienceStore((state) => state.items);
    const experienceLoading = useExperienceStore((state) => state.loading);
    const fetchExperiences = useExperienceStore((state) => state.fetchExperiences);
    const addExperience = useExperienceStore((state) => state.addExperience);
    const updateExperience = useExperienceStore((state) => state.updateExperience);

    const awardsList = useAwardsPublicationsStore((state) => state.awards);
    const publicationsList = useAwardsPublicationsStore((state) => state.publications);
    const awardsLoading = useAwardsPublicationsStore((state) => state.loading);
    const fetchAwardsAndPublications = useAwardsPublicationsStore(
        (state) => state.fetchAwardsAndPublications
    );
    const addAward = useAwardsPublicationsStore((state) => state.addAward);
    const updateAward = useAwardsPublicationsStore((state) => state.updateAward);
    const addPublication = useAwardsPublicationsStore((state) => state.addPublication);
    const updatePublication = useAwardsPublicationsStore((state) => state.updatePublication);

    const practiceDetails = usePracticeStore((state) => state.practiceDetails);

    // Sort education: most recent first (based on startYear or completionYear)
    const sortedEducation = useMemo(() => {
        return [...educationList].sort((a, b) => {
            const yearA = a.completionYear || a.startYear || 0;
            const yearB = b.completionYear || b.startYear || 0;
            return yearB - yearA;
        });
    }, [educationList]);

    // Sort experience: most recent first (Current jobs first, then by startDate desc)
    const sortedExperience = useMemo(() => {
        return [...experienceList].sort((a, b) => {
            // 1. Current jobs first
            if (a.isCurrentlyWorking && !b.isCurrentlyWorking) return -1;
            if (!a.isCurrentlyWorking && b.isCurrentlyWorking) return 1;
            // 2. Start date desc
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return dateB - dateA;
        });
    }, [experienceList]);

    return (
        <div className="p-4 grid grid-cols-12 gap-5 no-scrollbar">
            {/* LEFT COLUMN */}
            <div className="col-span-12 xl:col-span-6 flex flex-col gap-5">

                {/* Basic Information */}
                <SectionCard
                    title="Basic Information"
                    subtitle="Visible to Patient"
                    Icon={pencil}
                    onIconClick={() => setBasicOpen(true)}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoField
                            label="Gender"
                            value={(() => {
                                const g = profile.basic?.gender;
                                return g
                                    ? g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
                                    : "-";
                            })()}
                        />
                        <InfoField label="City" value={profile.basic?.city} />
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-4">
                        <InfoField
                            label="Languages Spoken"
                            value={profile.basic?.languages?.join(", ")}
                        />
                    </div>
                    <div className="mt-4">
                        <div className="text-[14px] text-gray-500 mb-1">About Me</div>
                        <div className="text-[14px] text-gray-700 leading-relaxed bg-[#F9F9F9] p-3 rounded-lg border border-[#EEE]">
                            {profile.basic?.about || "-"}
                        </div>
                    </div>
                </SectionCard>

                {/* Educational Details */}
                <SectionCard
                    title="Educational Details"
                    subtitle="Visible to Patient"
                >
                    <div className="flex flex-col gap-0">
                        {educationLoading ? (
                            <div className="text-sm py-4 text-gray-400">Loading education...</div>
                        ) : sortedEducation.length > 0 ? (
                            sortedEducation.map((edu) => (
                                <ProfileItemCard
                                    key={edu.id}
                                    icon={edu.logo || "/uni-logo.png"} // fallback logo
                                    title={edu.instituteName}
                                    badge={edu.graduationType} // e.g. "Post Graduation"
                                    subtitle={`${edu.degree}${edu.fieldOfStudy ? " - " + edu.fieldOfStudy : ""
                                        }`}
                                    date={`${edu.startYear || ""} - ${edu.completionYear || "Present"
                                        }`}
                                    showEditEducation={true}
                                    editEducationIcon={pencil}
                                    onEditEducationClick={() => {
                                        setEduEditData({
                                            id: edu.id,
                                            school: edu.instituteName,
                                            gradType: edu.graduationType,
                                            degree: edu.degree,
                                            field: edu.fieldOfStudy,
                                            start: edu.startYear?.toString(),
                                            end: edu.completionYear?.toString(),
                                            proof: edu.proofDocumentUrl,
                                        });
                                        setEduEditMode("edit");
                                        setEduOpen(true);
                                    }}
                                    editEducationAriaLabel="Edit education entry"
                                />
                            ))
                        ) : (
                            <div className="py-6 text-center text-gray-400 text-sm italic border rounded-lg bg-gray-50 mt-2">
                                No education details added yet.
                            </div>
                        )}
                    </div>
                </SectionCard>


                {/* Awards & Publications */}
                <SectionCard
                    title="Awards & Publications"
                    subtitle="Visible to Patient"
                    headerRight={
                        <div className="relative">
                            <button
                                className="flex items-center gap-1 text-[13px] font-medium text-blue-primary250 hover:bg-blue-50 px-2 py-1 rounded transition"
                                onClick={() => setShowAddMenu((v) => !v)}
                            >
                                <img src={add} alt="add" className="w-4 h-4" />
                                Add
                            </button>
                            {showAddMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowAddMenu(false)}
                                    />
                                    <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-100 shadow-lg rounded-md z-20 overflow-hidden py-1">
                                        <button
                                            className="w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 text-gray-700 block"
                                            onClick={() => {
                                                setShowAddMenu(false);
                                                setAwardEditMode("add");
                                                setAwardEditData(null);
                                                setAwardOpen(true);
                                            }}
                                        >
                                            Add Award
                                        </button>
                                        <button
                                            className="w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 text-gray-700 block"
                                            onClick={() => {
                                                setShowAddMenu(false);
                                                setPubEditMode("add");
                                                setPubEditData(null);
                                                setPubOpen(true);
                                            }}
                                        >
                                            Add Publication
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    }
                >
                    {awardsLoading ? (
                        <div className="text-sm py-4 text-gray-400">Loading...</div>
                    ) : (
                        <div className="flex flex-col gap-0">
                            {/* Render Awards */}
                            {awardsList.length === 0 && publicationsList.length === 0 && (
                                <div className="py-6 text-center text-gray-400 text-sm italic border rounded-lg bg-gray-50 mt-2">
                                    No awards or publications added yet.
                                </div>
                            )}
                            {awardsList.map((aw) => (
                                <ProfileItemCard
                                    key={aw.id}
                                    icon={award}
                                    title={aw.awardName}
                                    badge="Award"
                                    subtitle={aw.issuerName}
                                    date={
                                        aw.issueDate
                                            ? new Date(aw.issueDate).toLocaleDateString("en-US", {
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "-"
                                    }
                                    linkUrl={aw.awardUrl}
                                    linkLabel="View Certificate"
                                    description={aw.description}
                                    showEditEducation={true}
                                    onEditEducationClick={() => {
                                        setAwardEditData({
                                            id: aw.id,
                                            title: aw.awardName,
                                            issuer: aw.issuerName,
                                            with: aw.associatedWith,
                                            date: aw.issueDate,
                                            url: aw.awardUrl,
                                            desc: aw.description,
                                        });
                                        setAwardEditMode("edit");
                                        setAwardOpen(true);
                                    }}
                                />
                            ))}

                            {/* Render Publications */}
                            {publicationsList.map((pub) => (
                                <ProfileItemCard
                                    key={pub.id}
                                    icon={publication}
                                    title={pub.title}
                                    badge="Publication"
                                    subtitle={pub.publisher}
                                    date={
                                        pub.publicationDate
                                            ? new Date(pub.publicationDate).toLocaleDateString(
                                                "en-US",
                                                { month: "short", year: "numeric" }
                                            )
                                            : "-"
                                    }
                                    linkUrl={pub.publicationUrl}
                                    linkLabel="Read Publication"
                                    description={pub.description}
                                    showEditEducation={true}
                                    onEditEducationClick={() => {
                                        setPubEditData({
                                            id: pub.id,
                                            title: pub.title,
                                            publisher: pub.publisher,
                                            date: pub.publicationDate,
                                            url: pub.publicationUrl,
                                            desc: pub.description,
                                        });
                                        setPubEditMode("edit");
                                        setPubOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-span-12 xl:col-span-6 flex flex-col gap-5">

                {/* Professional Details (Merged with Practice Details) */}
                <SectionCard
                    title="Professional Details"
                    subtitle="Visible to Patient"
                    Icon={pencil}
                    onIconClick={() => setPracticeOpen(true)}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <InfoField
                            label="Years of Experience"
                            value={
                                practiceDetails?.workExperience
                                    ? `${practiceDetails.workExperience} Years`
                                    : "-"
                            }
                        />
                        <InfoField
                            label="Medical Practice Type"
                            value={practiceDetails?.medicalPracticeType || "-"}
                        />
                        <InfoField
                            label="MRN"
                            value={profile.registration?.mrn || "-"}
                        />
                        <InfoField
                            label="Reg. Council"
                            value={profile.registration?.council || "-"}
                        />
                        <InfoField
                            label="Reg. Year"
                            value={profile.registration?.year || "-"}
                        />
                    </div>
                    {/* Practice Areas (Chips) */}
                    <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                        <div className="text-[13px] text-gray-500 mb-2 font-medium">
                            Practice Areas
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {practiceDetails?.practiceArea?.length > 0 ? (
                                practiceDetails.practiceArea.map((area, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100"
                                    >
                                        {area}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-gray-400 italic">
                                    No practice areas selected
                                </span>
                            )}
                        </div>
                    </div>
                </SectionCard>

                {/* Experience Details */}
                <SectionCard
                    title="Experience Details"
                    subtitle="Visible to Patient"
                    headerRight={
                        <button
                            className="flex items-center gap-1 text-[13px] font-medium text-blue-primary250 hover:bg-blue-50 px-2 py-1 rounded transition"
                            onClick={() => {
                                setExpEditMode("add");
                                setExpEditData(null);
                                setExpOpen(true);
                            }}
                        >
                            <img src={add} alt="add" className="w-4 h-4" />
                            Add
                        </button>
                    }
                >
                    <div className="flex flex-col gap-0">
                        {experienceLoading ? (
                            <div className="text-sm py-4 text-gray-400">Loading experience...</div>
                        ) : sortedExperience.length > 0 ? (
                            sortedExperience.map((ex) => (
                                <ProfileItemCard
                                    key={ex.id}
                                    icon={experience}
                                    title={ex.jobTitle}
                                    badge={ex.employmentType}
                                    subtitle={ex.hospitalOrClinicName}
                                    date={formatExperienceRange(
                                        ex.startDate,
                                        ex.endDate,
                                        ex.isCurrentlyWorking
                                    )}
                                    description={ex.description}
                                    showEditEducation={true}
                                    onEditEducationClick={() => {
                                        setExpEditData(ex); // pass the full object
                                        setExpEditMode("edit");
                                        setExpOpen(true);
                                    }}
                                />
                            ))
                        ) : (
                            <div className="py-6 text-center text-gray-400 text-sm italic border rounded-lg bg-gray-50 mt-2">
                                No experience details added yet.
                            </div>
                        )}
                    </div>
                </SectionCard>
            </div>

            {/* Drawer: Edit Basic Info (shared component) */}
            <EditBasicInfoDrawer
                open={basicOpen}
                onClose={() => setBasicOpen(false)}
                initialData={{
                    firstName: profile.basic?.firstName,
                    lastName: profile.basic?.lastName,
                    mobile: profile.basic?.phone,
                    email: profile.basic?.email,
                    gender: (() => {
                        const g = profile.basic?.gender;
                        return g ? g.charAt(0).toUpperCase() + g.slice(1).toLowerCase() : "";
                    })(),
                    city: profile.basic?.city,
                    languages: profile.basic?.languages || [],
                    website: profile.basic?.website,
                    headline: profile.basic?.headline,
                    about: profile.basic?.about,
                }}
                onSave={async (data) => {
                    try {
                        const payload = {};
                        if (data.firstName) payload.firstName = data.firstName;
                        if (data.lastName) payload.lastName = data.lastName;
                        if (data.gender) payload.gender = data.gender.toLowerCase();
                        if (data.city) payload.city = data.city;
                        if (
                            data.website &&
                            data.website.trim() !== "" &&
                            data.website.trim() !== "-" &&
                            (data.website.startsWith("http://") ||
                                data.website.startsWith("https://"))
                        ) {
                            payload.website = data.website;
                        }
                        if (data.headline) payload.headline = data.headline;
                        if (data.about) payload.about = data.about;
                        if (data.languages && data.languages.length > 0)
                            payload.languages = data.languages;

                        const result = await updateBasicInfo(payload);
                        if (result) {
                            await fetchBasicInfo();
                            setBasicOpen(false);
                        } else {
                            console.error("Update failed: no result returned");
                            alert("Failed to update basic info. Please check the console for details.");
                        }
                    } catch (err) {
                        console.error("Error updating basic info:", err);
                        alert(`Failed to update: ${err.message || "Unknown error"}`);
                    }
                }}
            />

            {/* Drawer: Education (shared) */}
            <AddEducationDrawer
                open={eduOpen}
                onClose={() => {
                    setEduOpen(false);
                    setEduEditData(null);
                    setEduEditMode("add");
                }}
                initial={eduEditData}
                mode={eduEditMode}
                onSave={async (ed) => {
                    try {
                        // Map drawer fields to API fields
                        const payload = {
                            instituteName: ed.school,
                            graduationType: ed.gradType,
                            degree: ed.degree,
                            fieldOfStudy: ed.field || null,
                            startYear: parseInt(ed.start) || null,
                            completionYear: parseInt(ed.end) || null,
                            proofDocumentUrl: ed.proof || null,
                        };

                        if (eduEditMode === "edit" && eduEditData?.id) {
                            console.log(
                                "Updating education with ID:",
                                eduEditData.id,
                                "Payload:",
                                payload
                            );
                            await updateEducation(eduEditData.id, payload);
                        } else {
                            console.log("Adding new education. Payload:", payload);
                            await addEducation(payload);
                        }
                        await fetchEducation(); // Refresh data
                        setEduOpen(false);
                        setEduEditData(null);
                        setEduEditMode("add");
                    } catch (err) {
                        console.error("Failed to save education:", err);
                    }
                }}
            />

            {/* Drawer: Experience (new shared component) */}
            <ExperienceDrawerNew
                open={expOpen}
                onClose={() => {
                    setExpOpen(false);
                    setExpEditData(null);
                    setExpEditMode("add");
                }}
                initial={expEditData}
                mode={expEditMode}
                onSave={async (ex) => {
                    try {
                        // Normalize payload from either old inline drawer shape or new ExperienceDrawerNew
                        const payload = {
                            jobTitle: ex.jobTitle ?? ex.role,
                            employmentType: ex.employmentType ?? ex.type,
                            hospitalOrClinicName: ex.hospitalOrClinicName ?? ex.org,
                            startDate: ex.startDate ?? ex.start,
                            endDate:
                                (ex.isCurrentlyWorking ?? ex.current)
                                    ? null
                                    : (ex.endDate ?? ex.end ?? null),
                            isCurrentlyWorking: ex.isCurrentlyWorking ?? ex.current ?? false,
                            description: ex.description ?? ex.desc ?? null,
                        };

                        if (expEditMode === "edit" && expEditData?.id) {
                            await updateExperience({ id: expEditData.id, ...payload });
                        } else {
                            await addExperience(payload);
                        }
                        await fetchExperiences(); // Refresh data
                        setExpOpen(false);
                        setExpEditData(null);
                        setExpEditMode("add");
                    } catch (err) {
                        console.error("Failed to save experience:", err);
                    }
                }}
            />

            {/* Drawer: Award (shared) */}
            <AddAwardDrawer
                open={awardOpen}
                onClose={() => {
                    setAwardOpen(false);
                    setAwardEditData(null);
                    setAwardEditMode("add");
                }}
                initial={awardEditData}
                mode={awardEditMode}
                onSave={async (aw) => {
                    try {
                        const payload = {
                            awardName: aw.title,
                            issuerName: aw.issuer,
                            associatedWith: aw.with || null,
                            issueDate: aw.date,
                            awardUrl: aw.url || null,
                            description: aw.desc || null,
                        };

                        if (awardEditMode === "edit" && awardEditData?.id) {
                            await updateAward({ id: awardEditData.id, ...payload });
                        } else {
                            await addAward(payload);
                        }
                        await fetchAwardsAndPublications(); // Refresh data
                        setAwardOpen(false);
                        setAwardEditData(null);
                        setAwardEditMode("add");
                    } catch (err) {
                        console.error("Failed to save award:", err);
                    }
                }}
            />

            {/* Drawer: Publication — uses AddPublicationDrawer above */}
            <AddPublicationDrawer
                open={pubOpen}
                onClose={() => {
                    setPubOpen(false);
                    setPubEditData(null);
                    setPubEditMode("add");
                }}
                mode={pubEditMode}
                initial={pubEditData || {}}
                onSave={async (pub) => {
                    try {
                        const payload = {
                            title: pub.title,
                            publisher: pub.publisher,
                            publicationDate: pub.date,
                            publicationUrl: pub.url || null,
                            description: pub.desc || null,
                        };

                        if (pubEditMode === "edit" && pubEditData?.id) {
                            await updatePublication({ id: pubEditData.id, ...payload });
                        } else {
                            await addPublication(payload);
                        }
                        await fetchAwardsAndPublications();
                        setPubOpen(false);
                        setPubEditData(null);
                        setPubEditMode("add");
                    } catch (err) {
                        console.error("Failed to save publication:", err);
                    }
                }}
            />

            {/* Drawer: Practice Details */}
            <EditPracticeDetailsDrawer
                open={practiceOpen}
                onClose={() => setPracticeOpen(false)}
                initial={practiceDetails}
                onSave={async (data) => {
                    try {
                        const payload = {};
                        if (data.workExperience)
                            payload.workExperience = parseInt(data.workExperience);
                        if (data.medicalPracticeType)
                            payload.medicalPracticeType = data.medicalPracticeType;
                        if (Array.isArray(data.practiceArea) && data.practiceArea.length > 0)
                            payload.practiceArea = data.practiceArea;
                        if (Array.isArray(data.specialties)) {
                            // Map to API expected shape: [{ specialtyName, expYears }]
                            payload.specialties = data.specialties
                                .filter((s) => s.specialtyName)
                                .map((s) => ({
                                    specialtyName: s.specialtyName,
                                    expYears: s.expYears ? parseInt(s.expYears) : 0,
                                }));
                        }

                        await updatePracticeDetails(payload);
                        await fetchProfessionalDetails(); // Refresh data
                        setPracticeOpen(false);
                    } catch (err) {
                        console.error("Error updating practice details:", err);
                        alert("Failed to update practice details");
                    }
                }}
            />
        </div>
    );
};

export default PersonalTab;
