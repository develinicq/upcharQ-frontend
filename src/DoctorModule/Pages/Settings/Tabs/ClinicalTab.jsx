import React, { useState } from "react";
import SectionCard from "../components/SectionCard";
import InfoField from "../components/InfoField";
import MapLocation from "../../../../components/FormItems/MapLocation";
import EditClinicDetailsDrawer from "../drawers/EditClinicDetailsDrawer.jsx";
import { pencil, hospital } from "../../../../../public/index.js";

const ClinicalTab = ({
    clinic,
    updateClinicInfo,
    fetchClinicInfo,
}) => {
    const [clinicDrawerOpen, setClinicDrawerOpen] = useState(false);

    return (
        <div className="p-4 grid grid-cols-12 gap-5 no-scrollbar">
            {/* LEFT: Clinic Info */}
            <div className="col-span-12 xl:col-span-6">
                <SectionCard
                    title="Clinic Information"
                    subtitle="Visible to Patient"
                    Icon={pencil}
                    onIconClick={() => setClinicDrawerOpen(true)}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-blue-50 grid place-items-center text-blue-primary250 border border-blue-100 shadow-sm relative overflow-hidden">
                            {/* If clinic has a logo, show it, else default icon */}
                            {clinic?.logo || clinic?.clinicPhotos?.[0] ? (
                                <img
                                    src={
                                        clinic.logo ||
                                        `${import.meta.env.VITE_API_BASE_URL}/${clinic.clinicPhotos[0]
                                        }`
                                    }
                                    alt="Clinic"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img src={hospital} alt="" className="w-8 h-8 opacity-60" />
                            )}
                        </div>
                        <div>
                            <div className="text-[17px] font-semibold text-gray-800">
                                {clinic?.name || "Clinic Name"}
                            </div>
                            <div className="text-[13px] text-gray-500">
                                Created on:{" "}
                                {clinic?.establishmentDate
                                    ? new Date(clinic.establishmentDate).toLocaleDateString()
                                    : "-"}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <InfoField label="Phone" value={clinic?.phone} />
                        <InfoField label="Email" value={clinic?.email} />
                        <InfoField label="No. of Beds" value={clinic?.noOfBeds} />
                        <InfoField label="City" value={clinic?.city} />
                    </div>

                    <div className="mt-4">
                        <div className="text-[13px] text-gray-500 mb-1">Clinic About</div>
                        <div className="text-[13px] text-gray-700 leading-relaxed max-h-[100px] overflow-y-auto pr-1">
                            {clinic?.about || "-"}
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="text-[13px] text-gray-500 mb-2">Clinic Photos</div>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scroll">
                            {clinic?.clinicPhotos?.length > 0 ? (
                                clinic.clinicPhotos.map((photo, i) => (
                                    <div
                                        key={i}
                                        className="w-[120px] h-[120px] rounded-md overflow-hidden border bg-gray-50 shrink-0"
                                    >
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL}/${photo}`}
                                            alt={`Clinic ${i}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-[120px] h-[120px] rounded-md overflow-hidden border bg-gray-100" />
                                ))
                            )}
                        </div>

                        <div className="mt-2 text-[11px] text-gray-400">
                            Support Size upto 2MB in .png, .jpg, .svg, .webp
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* RIGHT: Address */}
            <div className="col-span-12 xl:col-span-6">
                <SectionCard
                    title="Clinic Address"
                    subtitle="Visible to Patient"
                    Icon={pencil}
                    onIconClick={() => setClinicDrawerOpen(true)}
                >
                    <div className="mb-3">
                        <div className="text-[13px] text-gray-500 mb-1">
                            Map Location
                        </div>
                        <div className="h-[220px] rounded overflow-hidden border">
                            <MapLocation
                                heightClass="h-full"
                                initialPosition={[
                                    parseFloat(clinic?.latitude) || 19.07,
                                    parseFloat(clinic?.longitude) || 72.87,
                                ]}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <InfoField
                            label="Block no./Shop no./House no."
                            value={clinic?.blockNo}
                        />
                        <InfoField
                            label="Road/Area/Street"
                            value={clinic?.areaStreet}
                        />
                        <InfoField label="Landmark" value={clinic?.landmark} />
                        <InfoField label="Pincode" value={clinic?.pincode} />
                        <InfoField label="City" value={clinic?.city} />
                        <InfoField label="State" value={clinic?.state} />
                    </div>
                </SectionCard>
            </div>

            {/* Drawer: Clinic Details (unified) */}
            <EditClinicDetailsDrawer
                open={clinicDrawerOpen}
                onClose={() => setClinicDrawerOpen(false)}
                initial={{
                    name: clinic?.name || "",
                    phone: clinic?.phone || "",
                    email: clinic?.email || "",
                    establishmentDate: clinic?.establishmentDate || "",
                    proof: clinic?.proof || clinic?.establishmentProof || "",
                    noOfBeds: clinic?.noOfBeds || "",
                    about: clinic?.about || "",
                    clinicPhotos: clinic?.clinicPhotos || [],
                    latitude: clinic?.latitude || null,
                    longitude: clinic?.longitude || null,
                    blockNo: clinic?.blockNo || "",
                    areaStreet: clinic?.areaStreet || "",
                    landmark: clinic?.landmark || "",
                    pincode: clinic?.pincode || "",
                    city: clinic?.city || "",
                    state: clinic?.state || "Maharashtra",
                }}
                onSave={async (data) => {
                    try {
                        // API expects the fields as provided by clinicalService.updateClinicInfo
                        await updateClinicInfo(data);
                        await fetchClinicInfo();
                        setClinicDrawerOpen(false);
                    } catch (e) {
                        console.error("Failed to update clinic info", e);
                        alert(e?.response?.data?.message || e?.message || "Failed to update clinic info");
                    }
                }}
            />
        </div>
    );
};

export default ClinicalTab;
