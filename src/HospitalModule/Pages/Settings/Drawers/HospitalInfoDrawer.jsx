import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "../../../../components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "../../../../components/GeneralDrawer/InputWithMeta";
import RichTextBox from "../../../../components/GeneralDrawer/RichTextBox";
import Dropdown from "../../../../components/GeneralDrawer/Dropdown";
import RadioButton from "../../../../components/GeneralDrawer/RadioButton";
import { ChevronDown, CheckCircle2, X } from "lucide-react";
import MapLocation from "../../../../components/FormItems/MapLocation";
import useImageUploadStore from "../../../../store/useImageUploadStore";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { updateHospitalInfoAndAddressForAdmin, updateHospitalAdminDetailsForAdmin } from "../../../../services/hospitalService";
import useToastStore from "../../../../store/useToastStore";
import UniversalLoader from "../../../../components/UniversalLoader";
import { getPublicUrl } from "../../../../services/uploadsService";
import useHospitalAuthStore from "../../../../store/useHospitalAuthStore";

const upload = '/Doctor_module/settings/upload.png'

export default function HospitalInfoDrawer({ open, onClose, onSave, initial = {}, initialSection = null }) {
    const { hospitalId: storeHospitalId } = useHospitalAuthStore();
    // Prefer passed ID (e.g. from HAccount wrapper or initial prop) or fallback to store
    const hospitalId = storeHospitalId;

    const hospitalInfoRef = React.useRef(null);
    const adminDetailsRef = React.useRef(null);
    const addressDetailsRef = React.useRef(null);

    // Helper for address initialization
    const initAddr = initial?.address || {};
    const initAdmin = initial?.admin || {};

    // Initialize state directly from props to prevent "Dirty" flash on first render
    const [name, setName] = useState(initial?.hospitalName || "");
    const [type, setType] = useState(initial?.type || "Multi-Speciality");
    const [headline, setHeadline] = useState(initial?.headline || "");
    const [url, setUrl] = useState(initial?.url || initial?.website || "");
    const [establishmentDate, setEstablishmentDate] = useState(initial?.estDate ? String(initial.estDate).split("T")[0] : "");
    const [phone, setPhone] = useState(initial?.phone || "");
    const [email, setEmail] = useState(initial?.email || "");
    const [website, setWebsite] = useState(initial?.website || "");
    const [emergencyPhone, setEmergencyPhone] = useState(initial?.emergencyPhone || "");
    const [beds, setBeds] = useState(initial?.beds ? String(initial.beds) : "");
    const [icuBeds, setIcuBeds] = useState(initial?.icuBeds ? String(initial.icuBeds) : "");
    const [ambulances, setAmbulances] = useState(initial?.ambulances ? String(initial.ambulances) : "");
    const [ambulancePhone, setAmbulancePhone] = useState(initial?.ambulancePhone || "");
    const [bloodBank, setBloodBank] = useState(initial?.bloodBank ? "Yes" : "No");
    const [bloodBankPhone, setBloodBankPhone] = useState(initial?.bloodBankPhone || "");
    const [about, setAbout] = useState(initial?.about || "");

    const [blockNo, setBlockNo] = useState(initAddr.block || initAddr.blockNo || "");
    const [areaStreet, setAreaStreet] = useState(initAddr.road || initAddr.street || "");
    const [landmark, setLandmark] = useState(initAddr.landmark || "");
    const [pincode, setPincode] = useState(initAddr.pincode || "");
    const [city, setCity] = useState(initial?.city || "");
    const [state, setState] = useState(initial?.state || "Maharashtra");
    const [latLng, setLatLng] = useState({
        lat: initial?.latitude ? parseFloat(initial.latitude) : null,
        lng: initial?.longitude ? parseFloat(initial.longitude) : null
    });

    // Admin Details
    const [adminFirstName, setAdminFirstName] = useState(initAdmin.firstName || initial.firstName || "");
    const [adminLastName, setAdminLastName] = useState(initAdmin.lastName || initial.lastName || "");
    const [adminMobile, setAdminMobile] = useState(initAdmin.mobileNumber || initAdmin.phone || initial.adminMobile || "");
    const [adminEmail, setAdminEmail] = useState(initAdmin.email || initAdmin.emailId || initial.adminEmail || "");
    const [adminGender, setAdminGender] = useState(initAdmin.gender ? initAdmin.gender.toUpperCase() : "");
    const [adminCity, setAdminCity] = useState(initAdmin.city || "");

    const [managedPhotos, setManagedPhotos] = useState(() => {
        const initKeys = Array.isArray(initial?.photos) ? initial.photos : [];
        return initKeys.map(key => ({
            id: Math.random().toString(36).substr(2, 9),
            key,
            url: null,
            uploading: false
        }));
    });

    // Fetch photo URLs on mount/update
    useEffect(() => {
        if (!managedPhotos.length) return;
        const fetchUrls = async () => {
            // Only fetch if url is missing
            const needsFetch = managedPhotos.some(p => !p.url && p.key);
            if (!needsFetch) return;

            const updated = await Promise.all(managedPhotos.map(async (item) => {
                if (item.url || !item.key) return item;
                const url = await getPublicUrl(item.key);
                return { ...item, url };
            }));
            // Prevent infinite loop if nothing changed really, but use JSON stringify check or just set
            // Simple approach: set if different
            if (JSON.stringify(updated) !== JSON.stringify(managedPhotos)) {
                setManagedPhotos(updated);
            }
        };
        fetchUrls();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managedPhotos.map(p => p.key).join(',')]);


    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

    const [loading, setLoading] = useState(false);
    const [showEstDateCalendar, setShowEstDateCalendar] = useState(false);
    const [typeOpen, setTypeOpen] = useState(false);
    const [cityOpen, setCityOpen] = useState(false);
    const [adminCityOpen, setAdminCityOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);

    const { getUploadUrl } = useImageUploadStore();
    const addToast = useToastStore(state => state.addToast);

    const hospitalTypes = useMemo(() => [
        { label: "Multi-Speciality", value: "Multi-Speciality" },
        { label: "Super-Speciality", value: "Super-Speciality" },
        { label: "General Hospital", value: "General Hospital" },
        { label: "Clinic", value: "Clinic" },
    ], []);

    const cityOptions = useMemo(() => [
        "Akola, Maharashtra",
        "Mumbai, Maharashtra",
        "Pune, Maharashtra",
        "Nagpur, Maharashtra",
        "Nashik, Maharashtra",
    ], []);

    const stateOptions = useMemo(() => ["Maharashtra", "Karnataka", "Gujarat", "Madhya Pradesh", "Goa"], []);

    // Effect to Sync State with Initial Data if props change (re-initialization)
    useEffect(() => {
        if (!open) return; // Only sync when drawer is open or opens

        const iAdmin = initial?.admin || {};
        const iAddr = initial?.address || {};

        setName(initial?.hospitalName || "");
        setType(initial?.type || "Multi-Speciality");
        setHeadline(initial?.headline || "");
        setUrl(initial?.url || initial?.website || "");
        setEstablishmentDate(initial?.estDate ? String(initial.estDate).split("T")[0] : "");
        setPhone(initial?.phone || "");
        setEmail(initial?.email || "");
        setWebsite(initial?.website || "");
        setEmergencyPhone(initial?.emergencyPhone || "");
        setBeds(initial?.beds ? String(initial.beds) : "");
        setIcuBeds(initial?.icuBeds ? String(initial.icuBeds) : "");
        setAmbulances(initial?.ambulances ? String(initial.ambulances) : "");
        setAmbulancePhone(initial?.ambulancePhone || "");
        setBloodBank(initial?.bloodBank ? "Yes" : "No");
        setBloodBankPhone(initial?.bloodBankPhone || "");
        setAbout(initial?.about || "");

        // Initialize managedPhotos from existing keys
        const initKeys = Array.isArray(initial?.photos) ? initial.photos : [];
        const initialItems = initKeys.map(key => ({
            id: Math.random().toString(36).substr(2, 9),
            key,
            url: null,
            uploading: false
        }));
        setManagedPhotos(initialItems);

        setBlockNo(iAddr.block || iAddr.blockNo || "");
        setAreaStreet(iAddr.road || iAddr.street || "");
        setLandmark(iAddr.landmark || "");
        setPincode(iAddr.pincode || "");
        setCity(initial?.city || "");
        setState(initial?.state || "Maharashtra");
        setLatLng({
            lat: initial?.latitude ? parseFloat(initial.latitude) : null,
            lng: initial?.longitude ? parseFloat(initial.longitude) : null,
        });

        // Admin
        setAdminFirstName(iAdmin.firstName || initial.firstName || "");
        setAdminLastName(iAdmin.lastName || initial.lastName || "");
        setAdminMobile(iAdmin.mobileNumber || iAdmin.phone || initial.adminMobile || "");
        setAdminEmail(iAdmin.email || iAdmin.emailId || initial.adminEmail || "");
        setAdminGender(iAdmin.gender ? iAdmin.gender.toUpperCase() : "");
        setAdminCity(iAdmin.city || "");

    }, [open, initial]);

    // Effect for Scrolling / Focus when opened
    useEffect(() => {
        if (open && initialSection) {
            setTimeout(() => {
                let target = null;
                if (initialSection === 'info') target = hospitalInfoRef.current;
                else if (initialSection === 'admin') target = adminDetailsRef.current;
                else if (initialSection === 'address') target = addressDetailsRef.current;

                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [open, initialSection]);

    const isDirty = useMemo(() => {
        const norm = (v) => {
            if (v === null || v === undefined) return "";
            return String(v).trim();
        };

        const initAddr = initial.address || {};
        const initAdmin = initial.admin || {};
        const normDate = (d) => d ? String(d).split("T")[0] : "";

        const comparisons = {
            name: norm(name) !== norm(initial.hospitalName),
            type: norm(type) !== norm(initial.type || "Multi-Speciality"),
            headline: norm(headline) !== norm(initial.headline),
            url: norm(url) !== norm(initial.url || initial.website),
            estDate: norm(establishmentDate) !== norm(normDate(initial.estDate)),
            phone: norm(phone) !== norm(initial.phone),
            email: norm(email) !== norm(initial.email),
            emergencyPhone: norm(emergencyPhone) !== norm(initial.emergencyPhone),
            beds: norm(beds) !== norm(initial.beds),
            icuBeds: norm(icuBeds) !== norm(initial.icuBeds),
            ambulances: norm(ambulances) !== norm(initial.ambulances),
            ambulancePhone: norm(ambulancePhone) !== norm(initial.ambulancePhone),
            bloodBank: (bloodBank === "Yes") !== !!initial.bloodBank,
            bloodBankPhone: norm(bloodBankPhone) !== norm(initial.bloodBankPhone),
            about: norm(about) !== norm(initial.about),
            photos: JSON.stringify(managedPhotos.map(p => p.key).filter(Boolean)) !== JSON.stringify(Array.isArray(initial.photos) ? initial.photos : []),
            blockNo: norm(blockNo) !== norm(initAddr.block || initAddr.blockNo),
            areaStreet: norm(areaStreet) !== norm(initAddr.road || initAddr.street),
            landmark: norm(landmark) !== norm(initAddr.landmark),
            pincode: norm(pincode) !== norm(initAddr.pincode),
            city: norm(city) !== norm(initial.city),
            state: norm(state) !== norm(initial.state || "Maharashtra"),
            adminFirstName: norm(adminFirstName) !== norm(initAdmin.firstName || initial.firstName),
            adminLastName: norm(adminLastName) !== norm(initAdmin.lastName || initial.lastName),
            adminMobile: norm(adminMobile) !== norm(initAdmin.mobileNumber || initAdmin.phone || initial.adminMobile),
            adminEmail: norm(adminEmail) !== norm(initAdmin.email || initAdmin.emailId || initial.adminEmail),
            adminGender: norm(adminGender) !== norm(initAdmin.gender ? initAdmin.gender.toUpperCase() : ""),
            adminCity: norm(adminCity) !== norm(initAdmin.city)
        };

        // Debug logs removed for production hygiene as requested
        return Object.values(comparisons).some(Boolean);
    }, [name, type, headline, url, establishmentDate, phone, email, emergencyPhone, beds, icuBeds, ambulances, ambulancePhone, bloodBank, bloodBankPhone, about, managedPhotos, blockNo, areaStreet, landmark, pincode, city, state, latLng, adminFirstName, adminLastName, adminMobile, adminEmail, adminGender, adminCity, initial]);

    const onUploadPhotos = async (fileList) => {
        if (!fileList || fileList.length === 0) return;
        const files = Array.isArray(fileList) ? fileList : Array.from(fileList);
        setIsUploadingPhotos(true);

        const newItems = files.map(f => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(f),
            file: f,
            uploading: true,
            key: null
        }));

        setManagedPhotos(prev => [...prev, ...newItems]);

        for (const item of newItems) {
            try {
                const info = await getUploadUrl(item.file.type, item.file);
                if (!info?.uploadUrl || !info?.key) throw new Error("No upload URL");

                await fetch(info.uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": item.file.type },
                    body: item.file,
                });

                setManagedPhotos(prev => prev.map(p =>
                    p.id === item.id ? { ...p, key: info.key, uploading: false } : p
                ));
            } catch (e) {
                console.error("Photo upload failed", e);
                addToast({ title: "Error", message: `Failed to upload ${item.file.name}`, type: "error" });
                setManagedPhotos(prev => prev.filter(p => p.id !== item.id));
            }
        }
        setIsUploadingPhotos(false);
    };

    const handleRemovePhoto = (id) => {
        setManagedPhotos(prev => prev.filter(p => p.id !== id));
    };

    const handleSave = async () => {
        if (!hospitalId) {
            console.error("No hospitalId found");
            return;
        }
        if (!isDirty) return;
        setLoading(true);

        const norm = (v) => {
            if (v === null || v === undefined) return "";
            return String(v).trim();
        };
        const normDate = (d) => d ? String(d).split("T")[0] : "";

        const hospitalData = {};
        const adminData = {};
        const initAddr = initial.address || {};
        const initAdmin = initial.admin || {};

        const addIfChanged = (obj, key, current, initialVal, transform = (v) => v) => {
            if (norm(current) !== norm(initialVal)) {
                obj[key] = transform(current);
            }
        };

        // Hospital Info & Address Payloads
        addIfChanged(hospitalData, "name", name, initial.hospitalName);
        addIfChanged(hospitalData, "type", type, initial.type || "Multi-Speciality");
        addIfChanged(hospitalData, "headline", headline, initial.headline);
        addIfChanged(hospitalData, "url", url, initial.url || initial.website);

        // Date handling
        // Comparison uses normalized YYYY-MM-DD strings. Payload transformation extracts Year if needed.
        addIfChanged(
            hospitalData,
            "establishmentYear",
            establishmentDate,
            normDate(initial.estDate),
            (v) => v.split("-")[0]
        );

        addIfChanged(hospitalData, "phone", phone, initial.phone);
        addIfChanged(hospitalData, "email", email, initial.email);
        addIfChanged(hospitalData, "emergencyContactNo", emergencyPhone, initial.emergencyPhone);

        // Number fields
        const parseIntPayload = (v) => v ? parseInt(v) : 0;
        addIfChanged(hospitalData, "noOfBeds", beds, initial.beds, parseIntPayload);
        addIfChanged(hospitalData, "noOfIcuBeds", icuBeds, initial.icuBeds, parseIntPayload);
        addIfChanged(hospitalData, "noOfAmbulances", ambulances, initial.ambulances, parseIntPayload);

        addIfChanged(hospitalData, "ambulanceContactNo", ambulancePhone, initial.ambulancePhone);

        if ((bloodBank === "Yes") !== !!initial.bloodBank) {
            hospitalData.hasBloodBank = bloodBank === "Yes";
        }

        addIfChanged(hospitalData, "bloodBankContactNo", bloodBankPhone, initial.bloodBankPhone);
        addIfChanged(hospitalData, "about", about, initial.about);

        const currentKeys = managedPhotos.map(p => p.key).filter(Boolean);
        if (JSON.stringify(currentKeys) !== JSON.stringify(Array.isArray(initial.photos) ? initial.photos : [])) {
            hospitalData.tempImageKeys = currentKeys;
        }

        addIfChanged(hospitalData, "blockNo", blockNo, initAddr.block || initAddr.blockNo);
        addIfChanged(hospitalData, "street", areaStreet, initAddr.road || initAddr.street);
        addIfChanged(hospitalData, "landmark", landmark, initAddr.landmark);
        addIfChanged(hospitalData, "pincode", pincode, initAddr.pincode);
        addIfChanged(hospitalData, "city", city, initial.city);
        addIfChanged(hospitalData, "state", state, initial.state || "Maharashtra");

        if (latLng.lat !== (initial.latitude ? parseFloat(initial.latitude) : null)) hospitalData.latitude = latLng.lat;
        if (latLng.lng !== (initial.longitude ? parseFloat(initial.longitude) : null)) hospitalData.longitude = latLng.lng;

        // Admin Details Payload
        addIfChanged(adminData, "firstName", adminFirstName, initAdmin.firstName || initial.firstName);
        addIfChanged(adminData, "lastName", adminLastName, initAdmin.lastName || initial.lastName);
        addIfChanged(adminData, "mobileNumber", adminMobile, initAdmin.mobileNumber || initAdmin.phone || initial.adminMobile);
        addIfChanged(adminData, "email", adminEmail, initAdmin.email || initAdmin.emailId || initial.adminEmail);
        addIfChanged(adminData, "gender", adminGender, initAdmin.gender ? initAdmin.gender.toUpperCase() : "");
        addIfChanged(adminData, "city", adminCity, initAdmin.city);

        try {
            const promises = [];
            if (Object.keys(hospitalData).length > 0) {
                promises.push(updateHospitalInfoAndAddressForAdmin(hospitalId, hospitalData));
            } else {
                promises.push(Promise.resolve({ success: true }));
            }

            if (Object.keys(adminData).length > 0) {
                promises.push(updateHospitalAdminDetailsForAdmin(hospitalId, adminData));
            } else {
                promises.push(Promise.resolve({ success: true }));
            }

            const [resInfo, resAdmin] = await Promise.all(promises);

            if (resInfo.success && resAdmin.success) {
                addToast({
                    title: "Success",
                    message: "Hospital information updated successfully",
                    type: "success"
                });
                onSave?.(); // Refresh data
                onClose?.();
            } else {
                throw new Error("One or more updates failed");
            }
        } catch (error) {
            console.error("Failed to update hospital info:", error);
            addToast({
                title: "Error",
                message: error?.response?.data?.message || "Failed to update hospital info",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <GeneralDrawer
            isOpen={open}
            onClose={onClose}
            title="Edit Hospital Info"
            primaryActionLabel={loading ? (
                <div className="flex items-center gap-2">
                    <UniversalLoader size={16} />
                    <span>Updating...</span>
                </div>
            ) : "Update"}
            onPrimaryAction={handleSave}
            primaryActionDisabled={!isDirty || loading}
            width={600}
        >
            <div className="flex flex-col gap-3">
                <div ref={hospitalInfoRef}>
                    <InputWithMeta label="Hospital Name" requiredDot value={name} onChange={setName} placeholder="Manipal Hospital" />
                </div>
                <InputWithMeta label="Hospital Headline" value={headline} onChange={setHeadline} placeholder="Your Health, Our Priority" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                    <div className="relative">
                        <InputWithMeta label="Hospital Type" requiredDot value={type} onChange={() => { }} RightIcon={ChevronDown} onFieldOpen={() => setTypeOpen(!typeOpen)} dropdownOpen={typeOpen} onRequestClose={() => setTypeOpen(false)} readonlyWhenIcon placeholder="Multi-Speciality" />
                        <Dropdown open={typeOpen} onClose={() => setTypeOpen(false)} items={hospitalTypes} selectedValue={type} onSelect={(it) => { setType(it.value); setTypeOpen(false); }} anchorClassName="w-full h-0" className="input-meta-dropdown w-full" />
                    </div>
                    <div className="relative">
                        <InputWithMeta label="Establishment Date" requiredDot value={establishmentDate} onChange={setEstablishmentDate} RightIcon='/Doctor_module/settings/calendar.png' onIconClick={() => setShowEstDateCalendar((v) => !v)} dropdownOpen={showEstDateCalendar} onRequestClose={() => setShowEstDateCalendar(false)} placeholder="09/09/2005" />
                        {showEstDateCalendar && (
                            <div className="shadcn-calendar-dropdown absolute z-[10000] right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
                                <ShadcnCalendar mode="single" selected={establishmentDate ? new Date(establishmentDate) : undefined} onSelect={(date) => { if (date) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0"); setEstablishmentDate(`${year}-${month}-${day}`); } setShowEstDateCalendar(false); }} captionLayout="dropdown" fromYear={1900} toYear={new Date().getFullYear()} className="rounded-lg p-1" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputWithMeta label="Mobile Number" requiredDot value={phone} onChange={setPhone} immutable ImmutableRightIcon={CheckCircle2} placeholder="91753 67487" />
                    <InputWithMeta label="Email" requiredDot value={email} onChange={setEmail} immutable ImmutableRightIcon={CheckCircle2} placeholder="milindchachun.gmail.com" />
                </div>
                <div className="text-[12px] text-secondary-grey200">To Change your Mobile & Email please <span className="text-blue-primary250 cursor-pointer">Call Us</span></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputWithMeta label="Website" value={url} onChange={setUrl} placeholder="https://citygeneral.com" />
                    <InputWithMeta label="Emergency Contact Number" value={emergencyPhone} onChange={setEmergencyPhone} placeholder="91753 67487" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputWithMeta label="Number of Beds" value={beds} onChange={setBeds} placeholder="600" />
                    <InputWithMeta label="Number of ICU Beds" value={icuBeds} onChange={setIcuBeds} placeholder="200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputWithMeta label="Number of Ambulances" value={ambulances} onChange={setAmbulances} placeholder="5" />
                    <InputWithMeta label="Ambulance Contact Number" value={ambulancePhone} onChange={setAmbulancePhone} placeholder="91753 67487" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputWithMeta label="Do you have Blood Bank?" requiredDot showInput={false}>
                        <div className="flex gap-4 mt-1">
                            <RadioButton name="bloodBank" className="" value="Yes" label="Yes" checked={bloodBank === "Yes"} onChange={() => setBloodBank("Yes")} />
                            <RadioButton name="bloodBank" value="No" label="No" checked={bloodBank === "No"} onChange={() => setBloodBank("No")} />
                        </div>
                    </InputWithMeta>
                    <InputWithMeta label="Blood Bank Contact Number" value={bloodBankPhone} onChange={setBloodBankPhone} placeholder="91753 67487" />
                </div>
                <div className="gap-1 flex flex-col">
                    <InputWithMeta label="About Us" showInput={false}>
                        <RichTextBox value={about} onChange={setAbout} />
                    </InputWithMeta>
                </div>
                <div>
                    <InputWithMeta label="Hospital Photos" showInput={false} />
                    <div className="flex flex-nowrap gap-3 mt-1 items-center overflow-x-auto mb-1 scrollbar-hide py-1">
                        {managedPhotos.map((photo) => (
                            <div key={photo.id} className="relative w-[120px] h-[120px] bg-gray-100 rounded-md border border-gray-200 overflow-hidden shrink-0 group">
                                <img src={photo.url} alt="Hospital" className={`w-full h-full object-cover ${photo.uploading ? 'opacity-50 blur-[1px]' : ''}`} />
                                {photo.uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <UniversalLoader size={20} />
                                    </div>
                                )}
                                {!photo.uploading && (
                                    <button
                                        onClick={() => handleRemovePhoto(photo.id)}
                                        className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-white rounded-full text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        title="Remove Photo"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <label className={`w-[120px] h-[120px] border-dashed bg-blue-primary50 border-blue-primary150 border-[0.5px] rounded-md grid place-items-center text-blue-primary250 text-sm cursor-pointer shrink-0 transition-all hover:bg-blue-primary100 active:scale-95`}>
                            <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => onUploadPhotos(e.target.files)} />
                            <div className="flex flex-col items-center gap-1">
                                <img src={upload} alt="Upload" className="w-4 h-4" />
                                <span className="text-xs">Upload Photo</span>
                            </div>
                        </label>
                    </div>
                    <div className="text-[12px] text-secondary-grey200 mt-1">Support Size upto 2MB in .png, .jpg, .svg, .webp</div>
                </div>


                <div className="border-b-[0.5px] border-secondary-grey100 my-2"></div>
                <div ref={addressDetailsRef} className="text-sm font-semibold text-secondary-grey400">Hospital Address</div>
                <div className="flex flex-col gap-2">
                    <div>
                        <InputWithMeta label="Map Location" infoIcon placeholder="Search Location" />
                        <div className="h-[100px] rounded-md overflow-hidden border mt-2">
                            <MapLocation heightClass="h-full" initialPosition={latLng.lat && latLng.lng ? [latLng.lat, latLng.lng] : null} onChange={({ lat, lng }) => setLatLng({ lat, lng })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <InputWithMeta label="Block no./Shop no./House no." requiredDot value={blockNo} onChange={setBlockNo} placeholder="Survey No 111/11/1" />
                        <InputWithMeta label="Road/Area/Street" infoIcon requiredDot value={areaStreet} onChange={setAreaStreet} placeholder="Veerbhadra Nagar Road" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputWithMeta label="Landmark" infoIcon requiredDot value={landmark} onChange={setLandmark} placeholder="Near Chowk" />
                        <InputWithMeta label="Pincode" infoIcon requiredDot value={pincode} onChange={(v) => setPincode(v.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="444001" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative">
                            <InputWithMeta label="City" requiredDot value={city} onChange={setCity} infoIcon RightIcon={ChevronDown} onFieldOpen={() => setCityOpen(!cityOpen)} dropdownOpen={cityOpen} onRequestClose={() => setCityOpen(false)} placeholder="Akola" />
                            <Dropdown open={cityOpen} onClose={() => setCityOpen(false)} items={cityOptions.map(c => ({ label: c, value: c }))} selectedValue={city} onSelect={(it) => { setCity(it.value); setCityOpen(false); }} className="w-full input-meta-dropdown" anchorClassName="w-full" direction="up" />
                        </div>
                        <div className="relative">
                            <InputWithMeta label="State" requiredDot value={state} onChange={() => { }} infoIcon RightIcon={ChevronDown} onFieldOpen={() => setStateOpen(!stateOpen)} dropdownOpen={stateOpen} onRequestClose={() => setStateOpen(false)} readonlyWhenIcon placeholder="Maharashtra" />
                            <Dropdown open={stateOpen} onClose={() => setStateOpen(false)} items={stateOptions.map(s => ({ label: s, value: s }))} selectedValue={state} onSelect={(it) => { setState(it.value); setStateOpen(false); }} className="w-full input-meta-dropdown" anchorClassName="w-full" direction="up" />
                        </div>
                    </div>
                </div>
            </div>
        </GeneralDrawer>
    );
}
