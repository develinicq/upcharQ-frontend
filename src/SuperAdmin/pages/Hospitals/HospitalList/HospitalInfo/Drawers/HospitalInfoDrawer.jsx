import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import RichTextBox from "@/components/GeneralDrawer/RichTextBox";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import RadioButton from "@/components/GeneralDrawer/RadioButton";
import { ChevronDown, CheckCircle2, X } from "lucide-react";
import MapLocation from "@/components/FormItems/MapLocation";
import useImageUploadStore from "@/store/useImageUploadStore";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { updateHospitalInfoAndAddressForSuperAdmin, updateHospitalAdminDetailsForSuperAdmin } from "@/services/hospitalService";
import useToastStore from "@/store/useToastStore";
import UniversalLoader from "@/components/UniversalLoader";
import { getPublicUrl } from "@/services/uploadsService";
const upload = '/Doctor_module/settings/upload.png'

export default function HospitalInfoDrawer({ open, onClose, onSave, initial = {}, initialSection = null }) {
	const hospitalId = initial?.hospitalId || initial?.id || initial?.temp;

	const hospitalInfoRef = React.useRef(null);
	const adminDetailsRef = React.useRef(null);
	const addressDetailsRef = React.useRef(null);
	const [name, setName] = useState("");
	const [type, setType] = useState("");
	const [headline, setHeadline] = useState("");
	const [url, setUrl] = useState("");
	const [establishmentDate, setEstablishmentDate] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [website, setWebsite] = useState("");
	const [emergencyPhone, setEmergencyPhone] = useState("");
	const [beds, setBeds] = useState("");
	const [icuBeds, setIcuBeds] = useState("");
	const [ambulances, setAmbulances] = useState("");
	const [ambulancePhone, setAmbulancePhone] = useState("");
	const [bloodBank, setBloodBank] = useState("No");
	const [bloodBankPhone, setBloodBankPhone] = useState("");
	const [about, setAbout] = useState("");

	const [blockNo, setBlockNo] = useState("");
	const [areaStreet, setAreaStreet] = useState("");
	const [landmark, setLandmark] = useState("");
	const [pincode, setPincode] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [latLng, setLatLng] = useState({ lat: null, lng: null });

	// Admin Details
	const [adminFirstName, setAdminFirstName] = useState("");
	const [adminLastName, setAdminLastName] = useState("");
	const [adminMobile, setAdminMobile] = useState("");
	const [adminEmail, setAdminEmail] = useState("");
	const [adminGender, setAdminGender] = useState("");
	const [adminCity, setAdminCity] = useState("");
	const [managedPhotos, setManagedPhotos] = useState([]); // { id, key, url, uploading }
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

	useEffect(() => {
		if (!open) return;
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
		// Initialize managedPhotos from existing keys
		const initKeys = Array.isArray(initial?.photos) ? initial.photos : [];
		const initialItems = initKeys.map(key => ({
			id: Math.random().toString(36).substr(2, 9),
			key,
			url: null,
			uploading: false
		}));
		setManagedPhotos(initialItems);

		initialItems.forEach(async (item) => {
			const url = await getPublicUrl(item.key);
			setManagedPhotos(prev => prev.map(p => p.id === item.id ? { ...p, url } : p));
		});

		setBlockNo(initial?.address?.block || "");
		setAreaStreet(initial?.address?.road || "");
		setLandmark(initial?.address?.landmark || "");
		setPincode(initial?.address?.pincode || "");
		setCity(initial?.city || "");
		setState(initial?.state || "Maharashtra");
		setLatLng({
			lat: initial?.latitude ? parseFloat(initial.latitude) : null,
			lng: initial?.longitude ? parseFloat(initial.longitude) : null,
		});

		// Admin
		const admin = initial?.admin || {};
		setAdminFirstName(admin.firstName || "");
		setAdminLastName(admin.lastName || "");
		setAdminMobile(admin.mobileNumber || admin.phone || "");
		setAdminEmail(admin.email || admin.emailId || "");
		setAdminGender(admin.gender ? admin.gender.toUpperCase() : "");
		setAdminCity(admin.city || "");

		// Handle Scrolling
		if (initialSection) {
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
	}, [open, initial, initialSection]);

	// Removed redundant photoresolving effect as it's now handled in managedPhotos

	const isDirty = useMemo(() => {
		const norm = (v) => v || "";
		return (
			norm(name) !== norm(initial.hospitalName) ||
			norm(type) !== norm(initial.type || "Multi-Speciality") ||
			norm(headline) !== norm(initial.headline) ||
			norm(url) !== norm(initial.url || initial.website) ||
			norm(establishmentDate) !== norm(initial.estDate ? String(initial.estDate).split("T")[0] : "") ||
			norm(phone) !== norm(initial.phone) ||
			norm(email) !== norm(initial.email) ||
			norm(emergencyPhone) !== norm(initial.emergencyPhone) ||
			norm(beds) !== norm(initial.beds ? String(initial.beds) : "") ||
			norm(icuBeds) !== norm(initial.icuBeds ? String(initial.icuBeds) : "") ||
			norm(ambulances) !== norm(initial.ambulances ? String(initial.ambulances) : "") ||
			norm(ambulancePhone) !== norm(initial.ambulancePhone) ||
			(bloodBank === "Yes") !== !!initial.bloodBank ||
			norm(bloodBankPhone) !== norm(initial.bloodBankPhone) ||
			norm(about) !== norm(initial.about) ||
			JSON.stringify(managedPhotos.map(p => p.key).filter(Boolean)) !== JSON.stringify(Array.isArray(initial.photos) ? initial.photos : []) ||
			norm(blockNo) !== norm(initial.address?.blockNo || initial.address?.block) ||
			norm(areaStreet) !== norm(initial.address?.street || initial.address?.road) ||
			norm(landmark) !== norm(initial.address?.landmark) ||
			norm(pincode) !== norm(initial.address?.pincode) ||
			norm(city) !== norm(initial.city) ||
			norm(state) !== norm(initial.state || "Maharashtra") ||
			latLng.lat !== (initial.latitude ? parseFloat(initial.latitude) : null) ||
			latLng.lng !== (initial.longitude ? parseFloat(initial.longitude) : null) ||
			// Admin
			norm(adminFirstName) !== norm(initial.admin?.firstName) ||
			norm(adminLastName) !== norm(initial.admin?.lastName) ||
			norm(adminMobile) !== norm(initial.admin?.mobileNumber || initial.admin?.phone) ||
			norm(adminEmail) !== norm(initial.admin?.email || initial.admin?.emailId) ||
			norm(adminGender) !== norm(initial.admin?.gender ? initial.admin.gender.toUpperCase() : "") ||
			norm(adminCity) !== norm(initial.admin?.city)
		);
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
		console.log("HospitalInfoDrawer: handleSave called. hospitalId:", hospitalId, "isDirty:", isDirty);
		if (!hospitalId || !isDirty) return;
		setLoading(true);

		const norm = (v) => v || "";
		const hospitalData = {};
		const adminData = {};

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
		addIfChanged(hospitalData, "establishmentYear", establishmentDate, initial.estDate ? String(initial.estDate).split("T")[0] : "", (v) => v.split("-")[0]);
		addIfChanged(hospitalData, "phone", phone, initial.phone);
		addIfChanged(hospitalData, "email", email, initial.email);
		addIfChanged(hospitalData, "emergencyContactNo", emergencyPhone, initial.emergencyPhone);
		addIfChanged(hospitalData, "noOfBeds", beds, initial.beds ? String(initial.beds) : "", (v) => v ? parseInt(v) : 0);
		addIfChanged(hospitalData, "noOfIcuBeds", icuBeds, initial.icuBeds ? String(initial.icuBeds) : "", (v) => v ? parseInt(v) : 0);
		addIfChanged(hospitalData, "noOfAmbulances", ambulances, initial.ambulances ? String(initial.ambulances) : "", (v) => v ? parseInt(v) : 0);
		addIfChanged(hospitalData, "ambulanceContactNo", ambulancePhone, initial.ambulancePhone);
		if ((bloodBank === "Yes") !== !!initial.bloodBank) hospitalData.hasBloodBank = bloodBank === "Yes";
		addIfChanged(hospitalData, "bloodBankContactNo", bloodBankPhone, initial.bloodBankPhone);
		addIfChanged(hospitalData, "about", about, initial.about);
		const currentKeys = managedPhotos.map(p => p.key).filter(Boolean);
		if (JSON.stringify(currentKeys) !== JSON.stringify(Array.isArray(initial.photos) ? initial.photos : [])) {
			hospitalData.tempImageKeys = currentKeys;
		}
		addIfChanged(hospitalData, "blockNo", blockNo, initial.address?.blockNo || initial.address?.block);
		addIfChanged(hospitalData, "street", areaStreet, initial.address?.street || initial.address?.road);
		addIfChanged(hospitalData, "landmark", landmark, initial.address?.landmark);
		addIfChanged(hospitalData, "pincode", pincode, initial.address?.pincode);
		addIfChanged(hospitalData, "city", city, initial.city);
		addIfChanged(hospitalData, "state", state, initial.state || "Maharashtra");
		if (latLng.lat !== (initial.latitude ? parseFloat(initial.latitude) : null)) hospitalData.latitude = latLng.lat;
		if (latLng.lng !== (initial.longitude ? parseFloat(initial.longitude) : null)) hospitalData.longitude = latLng.lng;

		// Admin Details Payload
		addIfChanged(adminData, "firstName", adminFirstName, initial.admin?.firstName);
		addIfChanged(adminData, "lastName", adminLastName, initial.admin?.lastName);
		addIfChanged(adminData, "mobileNumber", adminMobile, initial.admin?.mobileNumber || initial.admin?.phone);
		addIfChanged(adminData, "email", adminEmail, initial.admin?.email || initial.admin?.emailId);
		addIfChanged(adminData, "gender", adminGender, initial.admin?.gender ? initial.admin.gender.toUpperCase() : "");
		addIfChanged(adminData, "city", adminCity, initial.admin?.city);

		try {
			console.log("Calling update APIs with partial payloads. Hospital:", Object.keys(hospitalData), "Admin:", Object.keys(adminData));

			const promises = [];
			if (Object.keys(hospitalData).length > 0) {
				promises.push(updateHospitalInfoAndAddressForSuperAdmin(hospitalId, hospitalData));
			} else {
				promises.push(Promise.resolve({ success: true }));
			}

			if (Object.keys(adminData).length > 0) {
				promises.push(updateHospitalAdminDetailsForSuperAdmin(hospitalId, adminData));
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
				onSave?.({ silent: true, sections: ['info', 'admin'] });
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
				<div ref={adminDetailsRef} className="text-sm font-semibold text-secondary-grey400">Admin Details</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<InputWithMeta label="First Name" requiredDot value={adminFirstName} onChange={setAdminFirstName} placeholder="Enter First Name" />
					<InputWithMeta label="Last Name" requiredDot value={adminLastName} onChange={setAdminLastName} placeholder="Enter Last Name" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<InputWithMeta label="Mobile Number" requiredDot value={adminMobile} onChange={setAdminMobile} immutable ImmutableRightIcon={CheckCircle2} placeholder="91753 67487" />
					<InputWithMeta label="Email" requiredDot value={adminEmail} onChange={setAdminEmail} immutable ImmutableRightIcon={CheckCircle2} placeholder="admin@example.com" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<InputWithMeta label="Gender" requiredDot showInput={false}>
						<div className="flex gap-4 mt-1">
							<RadioButton name="adminGender" value="MALE" label="Male" checked={adminGender === "MALE"} onChange={() => setAdminGender("MALE")} />
							<RadioButton name="adminGender" value="FEMALE" label="Female" checked={adminGender === "FEMALE"} onChange={() => setAdminGender("FEMALE")} />
							<RadioButton name="adminGender" value="OTHER" label="Other" checked={adminGender === "OTHER"} onChange={() => setAdminGender("OTHER")} />
						</div>
					</InputWithMeta>
					<div className="relative">
						<InputWithMeta label="City" requiredDot value={adminCity} onChange={setAdminCity} infoIcon RightIcon={ChevronDown} onFieldOpen={() => setAdminCityOpen(!adminCityOpen)} dropdownOpen={adminCityOpen} onRequestClose={() => setAdminCityOpen(false)} placeholder="Mumbai" />
						<Dropdown open={adminCityOpen} onClose={() => setAdminCityOpen(false)} items={cityOptions.map(c => ({ label: c, value: c }))} selectedValue={adminCity} onSelect={(it) => { setAdminCity(it.value); setAdminCityOpen(false); }} className="w-full" anchorClassName="w-full" direction="up" />
					</div>
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
							<Dropdown open={cityOpen} onClose={() => setCityOpen(false)} items={cityOptions.map(c => ({ label: c, value: c }))} selectedValue={city} onSelect={(it) => { setCity(it.value); setCityOpen(false); }} className="w-full" anchorClassName="w-full" direction="up" />
						</div>
						<div className="relative">
							<InputWithMeta label="State" requiredDot value={state} onChange={() => { }} infoIcon RightIcon={ChevronDown} onFieldOpen={() => setStateOpen(!stateOpen)} dropdownOpen={stateOpen} onRequestClose={() => setStateOpen(false)} readonlyWhenIcon placeholder="Maharashtra" />
							<Dropdown open={stateOpen} onClose={() => setStateOpen(false)} items={stateOptions.map(s => ({ label: s, value: s }))} selectedValue={state} onSelect={(it) => { setState(it.value); setStateOpen(false); }} className="w-full" anchorClassName="w-full" direction="up" />
						</div>
					</div>
				</div>
			</div>
		</GeneralDrawer>
	);
}
