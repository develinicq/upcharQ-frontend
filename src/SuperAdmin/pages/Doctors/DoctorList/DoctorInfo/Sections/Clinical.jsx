import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  verifiedTick
} from "../../../../../../../public/index.js";
import MapLocation from "@/components/FormItems/MapLocation";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import RichTextBox from "@/components/GeneralDrawer/RichTextBox";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import FileUploadBox from "@/components/GeneralDrawer/FileUploadBox";
import { ChevronDown } from "lucide-react";
import EditClinicDetailsDrawer from "../Drawers/EditClinicDetailsDrawer.jsx";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import calendarWhite from "/Doctor_module/sidebar/calendar_white.png";
import { getDoctorClinicalDetailsForSuperAdmin } from "@/services/doctorService";
import UniversalLoader from "@/components/UniversalLoader";

const upload = '/Doctor_module/settings/upload.png'

const SectionCard = ({
  title,
  subtitle,
  subo,
  Icon,
  onIconClick,
  headerRight,
  children,
}) => (
  <div className="px-4 py-3 flex flex-col gap-3 bg-white rounded-lg ">
    <div className="flex items-center justify-between">
      {/* LEFT */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-sm">
          <div className="font-medium text-[14px] text-gray-900">{title}</div>

          {subtitle && (
            <div className="px-1 py-[2px] bg-secondary-grey50 rounded-md text-[12px] text-gray-500">
              {subtitle}
            </div>
          )}
        </div>

        {subo && (
          <div className="flex gap-1 text-[12px] text-secondary-grey200">
            <span>{subo}</span>
            <span className="text-blue-primary250">Call Us</span>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 shrink-0">
        {headerRight}

        {Icon && (
          <button
            onClick={onIconClick}
            className="p-1 text-gray-500 hover:bg-gray-50"
          >
            {typeof Icon === "string" ? (
              <img src={Icon} alt="icon" className="w-7 h-7" />
            ) : (
              <Icon className="w-7 h-7" />
            )}
          </button>
        )}
      </div>
    </div>

    <div>{children}</div>
  </div>
);

const Clinical = ({ doctor, onLoadingChange, cache = {}, updateCache }) => {
  // doctorId to fetch clinical details
  const doctorId = doctor?.userId || doctor?.id || doctor?.doctorId;
  // Prefer fetched clinical details over prop
  const [fetchedClinic, setFetchedClinic] = useState(null);
  const [hasClinicFlag, setHasClinicFlag] = useState(undefined);
  const [clinicalLoading, setClinicalLoading] = useState(false);
  // Important: avoid {} fallback to prevent truthy object causing repeated effects
  const clinic = useMemo(() => (
    fetchedClinic ?? doctor?.hospitalDetails?.[0] ?? null
  ), [fetchedClinic, doctor?.hospitalDetails]);

  // Local state to populate inputs (Read-onlyish view but using Input components)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [establishmentDate, setEstablishmentDate] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("");
  const [about, setAbout] = useState("");
  const [proofKey, setProofKey] = useState("");
  const [proofName, setProofName] = useState("");
  const [photos, setPhotos] = useState([]);

  // Address
  const [blockNo, setBlockNo] = useState("");
  const [areaStreet, setAreaStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [latLng, setLatLng] = useState({ lat: null, lng: null });
  const [showEstDateCalendar, setShowEstDateCalendar] = useState(false);

  // Dropdown states
  const [cityOpen, setCityOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  const cityOptions = useMemo(
    () => [
      "Akola, Maharashtra",
      "Mumbai, Maharashtra",
      "Pune, Maharashtra",
      "Nagpur, Maharashtra",
      "Nashik, Maharashtra",
    ],
    []
  );

  const stateOptions = useMemo(
    () => ["Maharashtra", "Karnataka", "Gujarat", "Madhya Pradesh", "Goa"],
    []
  );

  // Calendar icon used in InputWithMeta right slot
  const CalendarWhiteIcon = () => (
    <img src={calendarWhite} alt="Calendar" className="w-4 h-4" />
  );

  // Bubble loading to parent (for overlay loader like Personal/Consultation)
  useEffect(() => {
    if (typeof onLoadingChange === 'function') onLoadingChange(!!clinicalLoading);
  }, [clinicalLoading, onLoadingChange]);

  useEffect(() => {
    // If cache provided, hydrate and skip fetch
    if (cache?.clinic || typeof cache?.hasClinic !== 'undefined') {
      if (cache?.clinic) setFetchedClinic(cache.clinic);
      if (typeof cache?.hasClinic !== 'undefined') setHasClinicFlag(!!cache.hasClinic);
      setClinicalLoading(false);
      return;
    }
    // Fetch clinical details from API when doctorId is available
    let cancelled = false;
    const run = async () => {
      if (!doctorId) return;
      try {
        setClinicalLoading(true);
        const res = await getDoctorClinicalDetailsForSuperAdmin(doctorId);
        const data = res?.data;
        if (!cancelled) {
          setHasClinicFlag(!!data?.hasClinic);
          if (data?.hasClinic && data?.clinic) {
            setFetchedClinic(data.clinic);
          }
          if (typeof updateCache === 'function') updateCache({ clinic: data?.clinic, hasClinic: !!data?.hasClinic });
        }
      } catch (e) {
        // non-blocking; keep UI based on doctor prop
        console.warn("Failed to fetch clinical details:", e?.message || e);
      } finally {
        if (!cancelled) setClinicalLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [doctorId]);

  // Hydrate from fetchedClinic when it changes
  useEffect(() => {
    if (!fetchedClinic) return;
    const c = fetchedClinic;
    setName(c.name || c.hospitalName || "");
    setPhone(c.phone || c.hospitalContactNumber || "");
    setEmail(c.email || c.hospitalEmail || "");
    setEstablishmentDate(c.establishmentDate ? String(c.establishmentDate).split("T")[0] : "");
    setNoOfBeds(c.noOfBeds ? String(c.noOfBeds) : "");
    setAbout(c.about || "");
    setProofKey(c.proof || c.proofDocumentUrl || "");
    setProofName((c.proof || c.proofDocumentUrl) ? (c.proof || c.proofDocumentUrl).split("/").pop() : "Establishment.pdf");
    setPhotos(Array.isArray(c.clinicPhotos) ? c.clinicPhotos : (c.images || c.image ? [c.image] : []));
    setBlockNo(c.blockNo || "");
    setAreaStreet(c.areaStreet || "");
    setLandmark(c.landmark || "");
    setPincode(c.pincode || "");
    setCity(c.city || "");
    setState(c.state || "Maharashtra");
    setLatLng({
      lat: c.latitude ? parseFloat(c.latitude) : null,
      lng: c.longitude ? parseFloat(c.longitude) : null,
    });
  }, [fetchedClinic]);

  // Hydrate from doctor prop clinic only once per doctorId, and only if we don't have fetched clinic
  const hydratedFromPropRef = useRef({});
  useEffect(() => {
    if (fetchedClinic) return; // fetched data takes precedence
    if (!doctorId) return;
    if (hydratedFromPropRef.current[doctorId]) return;
    const dc = doctor?.hospitalDetails?.[0];
    if (!dc) return;
    hydratedFromPropRef.current[doctorId] = true;
    setName(dc.name || dc.hospitalName || "");
    setPhone(dc.phone || dc.hospitalContactNumber || "");
    setEmail(dc.email || dc.hospitalEmail || "");
    setEstablishmentDate(dc.establishmentDate ? String(dc.establishmentDate).split("T")[0] : "");
    setNoOfBeds(dc.noOfBeds ? String(dc.noOfBeds) : "");
    setAbout(dc.about || "");
    setProofKey(dc.proof || dc.proofDocumentUrl || "");
    setProofName((dc.proof || dc.proofDocumentUrl) ? (dc.proof || dc.proofDocumentUrl).split("/").pop() : "Establishment.pdf");
    setPhotos(Array.isArray(dc.clinicPhotos) ? dc.clinicPhotos : (dc.images || dc.image ? [dc.image] : []));
    setBlockNo(dc.blockNo || "");
    setAreaStreet(dc.areaStreet || "");
    setLandmark(dc.landmark || "");
    setPincode(dc.pincode || "");
    setCity(dc.city || "");
    setState(dc.state || "Maharashtra");
    setLatLng({
      lat: dc.latitude ? parseFloat(dc.latitude) : null,
      lng: dc.longitude ? parseFloat(dc.longitude) : null,
    });
  }, [doctorId, fetchedClinic]);

  // Close calendar on outside click
  useEffect(() => {
    if (!showEstDateCalendar) return;
    const handleClickOutside = (event) => {
      const target = event.target;
      const isCalendarClick = target.closest(".shadcn-calendar-dropdown");
      if (!isCalendarClick) setShowEstDateCalendar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEstDateCalendar]);

  const onFileView = (url) => {
    if (url) window.open(url, "_blank");
  };

  const VerifiedBadge = () => (
    <span className="inline-flex items-center text-green-600 border border-green-400 py-0.5 px-1 rounded-md text-[12px]">
      <img
        src={verifiedTick}
        alt="Verified"
        className="w-3.5 h-3.5 mr-1"
      />
      Verified
    </span>
  );

  const clinicHasAnyData = useMemo(() => {
    if (!clinic || typeof clinic !== 'object') return false;
    return Boolean(
      clinic.id || clinic.name || clinic.clinicCode || clinic.email || clinic.phone ||
      clinic.city || clinic.state || clinic.pincode || clinic.image ||
      clinic.latitude || clinic.longitude || clinic.blockNo || clinic.areaStreet || clinic.landmark
    );
  }, [clinic]);

  const showNoClinic = !clinicalLoading && (hasClinicFlag === false || !clinicHasAnyData);

  // Full white loader like Basic Info
  if (clinicalLoading) {
    return (
      <div className="relative min-h-[320px]">
        <div className="absolute inset-0 flex items-center justify-center ">
          <UniversalLoader size={28} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-12 gap-7 bg-secondary-grey50">
      {showNoClinic ? (
        <div className="col-span-12">
          <div className="bg-white border border-secondary-grey100 rounded-lg p-8 text-center text-secondary-grey300">
            No clinic found.
          </div>
        </div>
      ) : (
        <>
      {/* LEFT: Clinic Info */}
      <div className="col-span-12 xl:col-span-6">
        <SectionCard
          title="Clinic Info"
          subtitle="Visible to Patient"
        >
          <div className="flex flex-col gap-4">
            {/* Clinic Name */}
            <div>
              <InputWithMeta
                label="Clinic Name"
                requiredDot
                value={name}
                onChange={setName}
                placeholder="Clinic Name"
              />
            </div>

            {/* Mobile + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputWithMeta
                label="Mobile Number"
                value={phone}
                onChange={setPhone}
                placeholder="Phone"
                requiredDot
                rightMeta={<VerifiedBadge />}
              />
              <InputWithMeta
                label="Email"
                requiredDot
                value={email}
                onChange={setEmail}
                placeholder="Email"
                rightMeta={<VerifiedBadge />}
              />
            </div>

            {/* Establishment Date + Establishment Proof */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="relative">
                <InputWithMeta
                  label="Establishment Date"
                  value={establishmentDate}
                  onChange={setEstablishmentDate}
                  requiredDot
                  placeholder="YYYY-MM-DD"
                  RightIcon={CalendarWhiteIcon}
                  onIconClick={() => setShowEstDateCalendar((v) => !v)}
                  dropdownOpen={showEstDateCalendar}
                  onRequestClose={() => setShowEstDateCalendar(false)}
                />
                {showEstDateCalendar && (
                  <div className="shadcn-calendar-dropdown absolute z-[10000] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
                    <ShadcnCalendar
                      mode="single"
                      selected={establishmentDate ? new Date(establishmentDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const day = String(date.getDate()).padStart(2, "0");
                          setEstablishmentDate(`${year}-${month}-${day}`);
                        }
                        setShowEstDateCalendar(false);
                      }}
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      className="rounded-lg p-1"
                      classNames={{
                        day_selected: "bg-blue-600 text-white hover:bg-blue-600",
                      }}
                    />
                  </div>
                )}
              </div>

              <InputWithMeta
                label="Establishment Proof"
                requiredDot
                showDivider
                showReupload
                showInput={false}
                imageUpload
                fileName={proofName || "Establishment.pdf"}
                fileAccept="application/pdf, image/*"
                onFileView={() => onFileView(proofKey)}
              />
            </div>

            {/* Number of Beds */}
            <div>
              <InputWithMeta
                label="Number of Beds"
                value={noOfBeds}
                onChange={(v) => setNoOfBeds(String(v).replace(/[^0-9]/g, "").slice(0, 4))}
                placeholder="Enter Number of Beds"
                inputRightMeta="Beds"
              />
            </div>

            {/* About */}
            <div>
              <InputWithMeta label="About Clinic" showInput={false}>
                <RichTextBox
                  value={about}
                  onChange={setAbout}
                  placeholder="Write about the clinic..."
                />
              </InputWithMeta>
            </div>

            {/* Clinic Photos */}
            <div>
              <InputWithMeta label="Clinic Photos" showInput={false}>
                <div className="flex flex-wrap gap-4 mt-1 items-center">
                  {photos.map((key, idx) => (
                    <div key={idx} className="relative w-[120px] h-[120px] bg-gray-100 rounded-md border border-gray-200 overflow-hidden">
                      <img src={key} alt="Clinic" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {/* Mock Upload Button to match UI */}
                  <label className="w-[120px] h-[120px] border-dashed bg-blue-primary50 border-blue-primary150 border-[0.5px] rounded-md grid place-items-center text-blue-primary250 text-sm cursor-pointer">
                    <div className="flex gap-1 items-center">
                      <img src={upload} alt="Upload" className="w-4 h-4" />
                      <span>Upload File</span>
                    </div>
                  </label>
                </div>
                <div className="text-[12px] text-secondary-grey200 mt-1">
                  Support Size upto 2MB in .png, .jpg, .svg, .webp
                </div>
              </InputWithMeta>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* RIGHT: Clinic Address */}
      <div className="col-span-12 xl:col-span-6">
        <SectionCard
          title="Clinic Address"
          subtitle="Visible to Patient"
        >
          <div className="flex flex-col gap-4">
            {/* Map */}
            <div className="flex flex-col gap-2">
              <InputWithMeta label="Map Location" infoIcon placeholder="Search Location"></InputWithMeta>
              <div className="h-[110px] rounded overflow-hidden border">
                <MapLocation
                  heightClass="h-full"
                  initialPosition={latLng.lat && latLng.lng ? [latLng.lat, latLng.lng] : null}
                  onChange={({ lat, lng }) => setLatLng({ lat, lng })}
                  readOnly={false}
                />
              </div>
            </div>

            {/* Address Grid */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWithMeta
                  label="Block no./Shop no./House no."
                  requiredDot
                  value={blockNo}
                  onChange={setBlockNo}
                  placeholder="Shop No"
                />
                <InputWithMeta
                  label="Road/Area/Street"
                  infoIcon
                  requiredDot
                  value={areaStreet}
                  onChange={setAreaStreet}
                  placeholder="Area/Street"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWithMeta
                  label="Landmark"
                  infoIcon
                  requiredDot
                  value={landmark}
                  onChange={setLandmark}
                  placeholder="Landmark"
                />
                <InputWithMeta
                  label="Pincode"
                  infoIcon
                  requiredDot
                  value={pincode}
                  onChange={(v) => setPincode(v.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="Pincode"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <InputWithMeta
                    label="City"
                    requiredDot
                    value={city}
                    onChange={setCity}
                    placeholder="City"
                    infoIcon
                    RightIcon={ChevronDown}
                    onFieldOpen={() => setCityOpen((o) => !o)}
                    dropdownOpen={cityOpen}
                    onRequestClose={() => setCityOpen(false)}
                  />
                  <Dropdown
                    open={cityOpen}
                    onClose={() => setCityOpen(false)}
                    items={cityOptions.map((c) => ({ label: c, value: c }))}
                    selectedValue={city}
                    onSelect={(it) => {
                      setCity(it.value);
                      setCityOpen(false);
                    }}
                    anchorClassName="w-full h-0"
                    className="input-meta-dropdown w-full"
                  />
                </div>

                <div className="relative">
                  <InputWithMeta
                    label="State"
                    requiredDot
                    value={state}
                    infoIcon
                    placeholder="State"
                    RightIcon={ChevronDown}
                    onFieldOpen={() => setStateOpen((o) => !o)}
                    dropdownOpen={stateOpen}
                    onRequestClose={() => setStateOpen(false)}
                    readonlyWhenIcon
                  />
                  <Dropdown
                    open={stateOpen}
                    onClose={() => setStateOpen(false)}
                    items={stateOptions.map((s) => ({ label: s, value: s }))}
                    selectedValue={state}
                    onSelect={(it) => {
                      setState(it.value);
                      setStateOpen(false);
                    }}
                    anchorClassName="w-full h-0"
                    className="input-meta-dropdown w-full"
                  />
                </div>
              </div>
            </div>

          </div>
        </SectionCard>
      </div>
        </>
      )}
    </div>
  );
};

export default Clinical;
