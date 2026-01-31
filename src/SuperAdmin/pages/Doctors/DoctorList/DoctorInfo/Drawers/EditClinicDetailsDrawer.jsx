import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import RichTextBox from "@/components/GeneralDrawer/RichTextBox";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import FileUploadBox from "@/components/GeneralDrawer/FileUploadBox";
import { ChevronDown, FileText, Eye, RefreshCw } from "lucide-react";
import MapLocation from "@/components/FormItems/MapLocation";
import useImageUploadStore from "@/store/useImageUploadStore";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import calendarWhite from "/Doctor_module/sidebar/calendar_white.png";
const upload = '/Doctor_module/settings/upload.png'
/**
 * EditClinicDetailsDrawer — unified drawer for Clinic Info + Address.
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSave: (data) => Promise<void> | void
 * - initial: {
 *     name, phone, email, establishmentDate, proof,
 *     noOfBeds, about, clinicPhotos: string[],
 *     latitude, longitude,
 *     blockNo, areaStreet, landmark, pincode, city, state
 *   }
 */
export default function EditClinicDetailsDrawer({ open, onClose, onSave, initial = {} }) {
  // Clinic Info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [establishmentDate, setEstablishmentDate] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("");
  const [about, setAbout] = useState("");
  const [proofKey, setProofKey] = useState("");
  const [proofName, setProofName] = useState("");
  const [showEstDateCalendar, setShowEstDateCalendar] = useState(false);

  // Address + Map
  const [blockNo, setBlockNo] = useState("");
  const [areaStreet, setAreaStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [latLng, setLatLng] = useState({ lat: null, lng: null });

  // Photos
  const [photos, setPhotos] = useState([]); // array of storage keys

  // Dropdown open flags
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

  const { getUploadUrl, isLoading: uploading, error: uploadError, reset } = useImageUploadStore();

  // Calendar icon used in InputWithMeta right slot
  const CalendarWhiteIcon = () => (
    <img src={calendarWhite} alt="Calendar" className="w-4 h-4" />
  );

  // Hydrate on open
  useEffect(() => {
    if (!open) return;
    setName(initial?.name || "");
    setPhone(initial?.phone || "");
    setEmail(initial?.email || "");
    setEstablishmentDate(
      initial?.establishmentDate
        ? String(initial.establishmentDate).split("T")[0]
        : ""
    );
    setNoOfBeds(initial?.noOfBeds ? String(initial.noOfBeds) : "");
    setAbout(initial?.about || "");
    setProofKey(initial?.proof || "");
    setProofName(
      initial?.proof
        ? typeof initial.proof === "string"
          ? initial.proof.split("/").pop()
          : "Uploaded File"
        : ""
    );
    setPhotos(Array.isArray(initial?.clinicPhotos) ? initial.clinicPhotos : []);
    setBlockNo(initial?.blockNo || "");
    setAreaStreet(initial?.areaStreet || "");
    setLandmark(initial?.landmark || "");
    setPincode(initial?.pincode || "");
    setCity(initial?.city || "");
    setState(initial?.state || "Maharashtra");
    setLatLng({
      lat: initial?.latitude ? parseFloat(initial.latitude) : null,
      lng: initial?.longitude ? parseFloat(initial.longitude) : null,
    });
    setCityOpen(false);
    setStateOpen(false);
  }, [open, initial]);

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

  const canSave = Boolean(
    name && email && blockNo && areaStreet && pincode && city && state
  );

  const onUploadProof = async (file) => {
    if (!file) return;
    try {
      reset();
      const info = await getUploadUrl(file.type, file);
      if (!info?.uploadUrl || !info?.key) return;
      await fetch(info.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setProofKey(info.key);
      setProofName(file.name);
    } catch (e) {
      console.error("Proof upload failed", e);
    }
  };

  const onUploadPhotos = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.isArray(fileList) ? fileList : Array.from(fileList);
    const newKeys = [];
    for (const f of files) {
      try {
        const info = await getUploadUrl(f.type, f);
        if (!info?.uploadUrl || !info?.key) continue;
        await fetch(info.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": f.type },
          body: f,
        });
        newKeys.push(info.key);
      } catch (e) {
        console.error("Photo upload failed", e);
      }
    }
    setPhotos((prev) => [...prev, ...newKeys]);
  };

  const removePhoto = (key) => setPhotos((prev) => prev.filter((k) => k !== key));

  const save = () => {
    if (!canSave) return;
    const payload = {
      name,
      phone,
      email,
      establishmentDate,
      noOfBeds: noOfBeds ? Number(noOfBeds) : undefined,
      about,
      proof: proofKey || undefined,
      clinicPhotos: photos,
      blockNo,
      areaStreet,
      landmark,
      pincode,
      city,
      state,
      latitude: latLng?.lat ?? undefined,
      longitude: latLng?.lng ?? undefined,
    };
    onSave?.(payload);
    onClose?.();
  };

  return (
    <GeneralDrawer
      isOpen={open}
      onClose={onClose}
      title="Edit Clinical Details"
      primaryActionLabel="Update"
      onPrimaryAction={save}
      primaryActionDisabled={!canSave}
      width={600}
    >
      <div className="flex flex-col gap-4">
        {/* Section: Clinic Details */}
        <div className="text-sm text-secondary-grey400 font-semibold">Clinic Details</div>

        {/* Row 1: Clinic Name (full width) */}
        <div>
          <InputWithMeta label="Clinic Name" requiredDot value={name} onChange={setName} placeholder="Chauhan Clinic" />
        </div>

        {/* Row 2: Mobile + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputWithMeta label="Mobile Number" value={phone} onChange={setPhone} placeholder="91753 67487" requiredDot />
          <InputWithMeta label="Email" requiredDot value={email} onChange={setEmail} placeholder="milindchachun.gmail.com" />
        </div>

        {/* Row 3: Establishment Date + Establishment Proof */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <div className="relative">
            <InputWithMeta
              label="Establishment Date"
              value={establishmentDate}
              onChange={setEstablishmentDate}
              requiredDot
              placeholder="YYYY-MM-DD"
              RightIcon='/Doctor_module/settings/calendar.png'
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
          <div>
            <InputWithMeta
              label="Establishment Proof"
              requiredDot
              showDivider
              showReupload
              showInput={false}
              imageUpload
              fileName={uploading ? "Uploading..." : (proofName || "Establishment.pdf")}
              fileAccept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp, application/pdf"
              onFileSelect={(f) => {
                if (f) onUploadProof(f);
              }}
              onFileView={() => {
                if (proofKey) window.open(proofKey, "_blank");
              }}
            />
            {uploadError ? (
              <div className="text-[11px] text-red-500 mt-1">{String(uploadError)}</div>
            ) : null}
          </div>
        </div>

  {/* Row 4: Number of Beds (full width) */}
  <div>
            <InputWithMeta
              label="Number of Beds"
              value={noOfBeds}
              onChange={(v) => setNoOfBeds(String(v).replace(/[^0-9]/g, "").slice(0, 4))}
              placeholder="Enter Number of Beds"
              inputRightMeta="Beds"
            />
  </div>

  <div>
          <InputWithMeta label="About Clinic" showInput={false}>
            <RichTextBox
              value={about}
              onChange={(v) => setAbout(String(v).slice(0, 1600))}
              placeholder="Write about the clinic..."
             
            />
          </InputWithMeta>
        </div>

        <div>
          <InputWithMeta label="Clinic Photos" showInput={false}>
          <div className="flex flex-wrap gap-4 mt-1 items-center">
            {photos.map((key) => (
              <div key={key} className="relative w-[120px] h-[120px] bg-gray-100 rounded-md border border-gray-200 overflow-hidden">
                <img src={key} alt="Clinic" className="w-full h-full object-cover" />
                
              </div>
            ))}
            <label className="w-[120px] h-[120px] border-dashed bg-blue-primary50 border-blue-primary150 border-[0.5px] rounded-md grid place-items-center text-blue-primary250 text-sm cursor-pointer">
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                onChange={(e) => onUploadPhotos(e.target.files)}
              />
              
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

            <div className="border-b-[0.5px] h-4 border-secondary-grey100"></div>
        {/* Section: Clinic Address */}
        <div className="text-sm text-secondary-grey400  font-semibold">Clinic Address</div>
        {/* Address + Map */}
        <div className="flex flex-col gap-4">
          
          <div className="gap-2 flex flex-col">
            <InputWithMeta label="Map Location" infoIcon placeholder="Search Location"></InputWithMeta>
            <div className="h-[100px] rounded-md overflow-hidden border">
                <MapLocation
                  heightClass="h-full"
                  initialPosition={latLng.lat && latLng.lng ? [latLng.lat, latLng.lng] : null}
                  onChange={({ lat, lng }) => setLatLng({ lat, lng })}
                />
              </div>
          </div>
            
          {/* Row: Block no. & Road/Area/Street */}
          <div className="gap-4 flex flex-col">
            <InputWithMeta
              label="Block no./Shop no./House no."
              requiredDot
              value={blockNo}
              onChange={setBlockNo}
              placeholder="Shop No 2"
            />
            <InputWithMeta
              label="Road/Area/Street"
              infoIcon
              requiredDot
              value={areaStreet}
              onChange={setAreaStreet}
              placeholder="Jawahar Nagar, Gokul Colony"
            />
          </div>

          {/* Row: Landmark & Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
            <InputWithMeta
              label="Landmark"
              infoIcon
              requiredDot
              value={landmark}
              onChange={setLandmark}
              placeholder="Near Chowk"
            />
            <InputWithMeta
              label="Pincode"
              infoIcon
              requiredDot
              value={pincode}
              onChange={(v) => setPincode(v.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="444001"
            />
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
            <div className="grid  relative">
            <InputWithMeta
              label="City"
              requiredDot
              value={city}
              onChange={setCity}
              placeholder="Akola"
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
              onChange={() => {}}
              placeholder="Maharashtra"
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

        {/* Bottom upload: Upload Clinic Image using reusable FileUploadBox */}
        <div className="flex flex-col gap-4">
          <InputWithMeta label="Upload Clinic Image" requiredDot showInput={false}>
            <FileUploadBox
              label=""
              value={null}
              accept=".png,.jpg,.jpeg,.svg,.webp"
              maxSizeMB={2}
              onChange={(file) => {
                // Reuse photo upload logic; wrap single file into FileList-like array
                if (file) {
                  const dt = {
                    length: 1,
                    0: file,
                  };
                  // onUploadPhotos expects FileList; simulate minimal interface or adapt
                  onUploadPhotos(dt);
                }
              }}
              helperText="Support size upto 2MB in .png, .jpg, .svg, .webp"
            />
          </InputWithMeta>
        </div>
      </div>
    </GeneralDrawer>
  );
}
