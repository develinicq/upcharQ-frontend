import React, { useState, useEffect } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import { ChevronDown, Calendar as CalendarIcon, Check, Minus, Plus, Search as SearchIcon } from "lucide-react";
import MapLocation from "@/components/FormItems/MapLocation";
import useImageUploadStore from "@/store/useImageUploadStore";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import calendarWhite from "/Doctor_module/sidebar/calendar_white.png";
import upload from '/Doctor_module/settings/upload.png';
import { State, City } from 'country-state-city';

const PLANS = [
    {
        id: "free",
        name: "Upchar-Q Free",
        basePrice: 0,
        features: ["1 Doctor", "Online Appts"]
    },
    {
        id: "basic",
        name: "Upchar-Q Basic",
        basePrice: 1299,
        features: ["1 Doctor + 1 Staff", "Unlimited Online & Walk-in Appts", "Queue Management", "Front Desk Access"]
    },
    {
        id: "plus",
        name: "Upchar-Q Plus",
        basePrice: 2299,
        features: ["1 Doctor + 2 Staff", "Unlimited Appts", "Personalized Dashboard", "Queue Management", "Front Desk Access", "Patient Listing", "Clinic Social Profile"]
    },
    {
        id: "pro",
        name: "Upchar-Q Pro",
        basePrice: 2549,
        features: ["1 Doctor + 3 Staff", "All Plus Features", "Priority Support", "Advanced Analytics"]
    }
];

export default function AddBranchDrawer({ open, onClose, onSave }) {
    const [step, setStep] = useState(1);

    // --- Step 1 States (Clinic Details) ---
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [establishmentDate, setEstablishmentDate] = useState("");
    const [proofKey, setProofKey] = useState("");
    const [proofName, setProofName] = useState("");

    // Address
    const [blockNo, setBlockNo] = useState("");
    const [areaStreet, setAreaStreet] = useState("");
    const [landmark, setLandmark] = useState("");
    const [pincode, setPincode] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [latLng, setLatLng] = useState({ lat: null, lng: null });

    const [showEstDateCalendar, setShowEstDateCalendar] = useState(false);

    // --- Dynamic Address Logic ---
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // States/Cities Data
    const allStates = State.getStatesOfCountry('IN');
    const getFilteredStates = (query) => {
        if (!query) return allStates;
        return allStates.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
    };

    const getCities = (stateName) => {
        const s = allStates.find(st => st.name === stateName);
        return s ? City.getCitiesOfState('IN', s.isoCode) : [];
    };

    const [cityOptions, setCityOptions] = useState([]);

    useEffect(() => {
        if (state) {
            setCityOptions(getCities(state));
        } else {
            setCityOptions([]);
        }
    }, [state]);

    const handleLocationSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setLatLng({ lat: parseFloat(lat), lng: parseFloat(lon) });
                // Optional: Update state/city if possible, but map move is priority
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handlePincodeChange = async (val) => {
        // Allow only numbers
        const numericVal = val.replace(/[^0-9]/g, '');
        setPincode(numericVal);

        if (numericVal.length === 6) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${numericVal}`);
                const data = await res.json();
                if (data && data[0].Status === "Success") {
                    const details = data[0].PostOffice[0];
                    const stateName = details.State;
                    const cityName = details.District || details.Block || details.Name;

                    // Try to match state
                    const matchedState = allStates.find(s => s.name.toLowerCase() === stateName.toLowerCase())
                        || allStates.find(s => stateName.toLowerCase().includes(s.name.toLowerCase()));

                    const finalState = matchedState ? matchedState.name : stateName;
                    setState(finalState);
                    setCity(cityName);

                    // Auto-search map
                    const query = `${cityName}, ${finalState}`;
                    setSearchQuery(query);

                    // Trigger map search
                    setIsSearching(true);
                    const mapRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                    const mapData = await mapRes.json();
                    if (mapData && mapData.length > 0) {
                        setLatLng({ lat: parseFloat(mapData[0].lat), lng: parseFloat(mapData[0].lon) });
                    }
                    setIsSearching(false);
                }
            } catch (e) {
                console.error("Pincode fetch error", e);
                setIsSearching(false);
            }
        }
    };

    // --- Step 2 States (Plan) ---
    const [selectedPlanId, setSelectedPlanId] = useState("plus");
    const [billingCycle, setBillingCycle] = useState("monthly"); // monthly, half-yearly, yearly
    const [numDoctors, setNumDoctors] = useState(1);
    const [numStaffs, setNumStaffs] = useState(1);
    const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
    const [agreed, setAgreed] = useState(false);

    // Utils
    const { getUploadUrl, isLoading: uploading, error: uploadError, reset } = useImageUploadStore();

    useEffect(() => {
        if (open) {
            setStep(1);
            // Reset fields if needed, or keep for persistence if re-opening
        }
    }, [open]);

    // --- Step 1 Logic ---
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

    const step1Valid = name && phone && email && establishmentDate && proofKey && blockNo && areaStreet && pincode && city && state;

    // --- Step 2 Logic ---
    const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[2];

    const calculateTotal = () => {
        let monthlyRate = selectedPlan.basePrice;
        let months = 1;
        let discount = 0;

        if (billingCycle === 'half-yearly') {
            months = 6;
            // Bonus: 1 month free equivalent discount? Or literally free month added?
            // Screenshot says "6-Month Bonus (1 Month Free) -₹2,299"
            // So you pay for 5 months, get 6? Or pay for 6 get 1 free (7)?
            // Screenshot implies Pay for 6 months, but minus 1 month cost.
            discount = monthlyRate * 1;
        } else if (billingCycle === 'yearly') {
            months = 12;
            discount = monthlyRate * 2; // 2 months free
        }

        const baseTotal = monthlyRate * months;
        const subTotal = baseTotal - discount;
        const taxes = subTotal * 0.18; // Assuming 18% GST
        const total = subTotal + taxes;

        return { baseTotal, subTotal, taxes, total, discount, monthlyRate };
    };

    const totals = calculateTotal();

    const handleNext = () => {
        if (step === 1) setStep(2);
        else {
            // Submit
            const payload = {
                clinic: { name, phone, email, establishmentDate, proofKey, blockNo, areaStreet, landmark, pincode, city, state, latLng },
                plan: { id: selectedPlanId, cycle: billingCycle, doctors: numDoctors, staffs: numStaffs, total: totals.total }
            };
            onSave && onSave(payload);
            onClose();
        }
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
        else onClose();
    };

    const cycleOptions = [
        { id: 'monthly', label: 'Monthly' },
        { id: 'half-yearly', label: 'Half-Yearly ( Get 1 month free)' },
        { id: 'yearly', label: 'Yearly ( Get 2 month free)' },
    ];

    return (
        <GeneralDrawer
            isOpen={open}
            onClose={onClose}
            title="Add Branch"
            primaryActionLabel={step === 1 ? "Next" : "Preview Purchase"}
            onPrimaryAction={handleNext}
            primaryActionDisabled={step === 1 ? !step1Valid : !agreed}
            secondaryActionLabel="Back"
            onSecondaryAction={step === 2 ? handleBack : undefined} // Only show back on step 2, or maybe cancel on step 1?
            width={600}
        >
            {step === 1 && (
                <div className="flex flex-col gap-5 pb-4">
                    <div className="text-sm font-semibold text-gray-700">Clinic Details</div>

                    <InputWithMeta label="Clinic Name" requiredDot value={name} onChange={setName} placeholder="Enter Clinic Name" />

                    <div className="grid grid-cols-2 gap-4">
                        <InputWithMeta label="Clinic Contact Email" requiredDot value={email} onChange={setEmail} placeholder="Enter Work Email" />
                        <InputWithMeta label="Clinic Contact Number" requiredDot value={phone} onChange={setPhone} placeholder="Enter Work Number" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <InputWithMeta label="Establishment Date" requiredDot value={establishmentDate} onChange={setEstablishmentDate} placeholder="Select Establishment Date" RightIcon={CalendarIcon} onIconClick={() => setShowEstDateCalendar(!showEstDateCalendar)} readonlyWhenIcon />
                            {showEstDateCalendar && (
                                <div className="absolute z-50 top-full mt-1 bg-white border rounded shadow p-2">
                                    <ShadcnCalendar mode="single" selected={establishmentDate ? new Date(establishmentDate) : undefined} onSelect={(d) => {
                                        if (d) setEstablishmentDate(d.toISOString().split('T')[0]);
                                        setShowEstDateCalendar(false);
                                    }} className="rounded-md border" />
                                </div>
                            )}
                        </div>
                        <div>
                            <InputWithMeta label="Upload Establishment Proof" requiredDot showInput={false}>
                                <div className="border border-dashed border-blue-300 bg-blue-50 rounded-md p-2 flex items-center justify-between cursor-pointer relative">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onUploadProof(e.target.files[0])} accept=".pdf,.png,.jpg" />
                                    <span className="text-sm text-blue-600 font-medium truncate">{proofName || "Upload File"}</span>
                                    <img src={upload} alt="" className="w-4 h-4" />
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1">Support Size upto 1MB in .png, .jpg, .svg, .webp</div>
                            </InputWithMeta>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 my-1"></div>

                    <div className="text-sm font-semibold text-gray-700">Clinic Address</div>

                    <div className="flex flex-col gap-2">
                        <InputWithMeta
                            label="Map Location"
                            infoIcon
                            placeholder="Search Location (e.g. Bangalore)"
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                            RightIcon={SearchIcon}
                            onIconClick={handleLocationSearch}
                            disabled={isSearching}
                        />
                        <div className="h-[200px] rounded-md border overflow-hidden relative">
                            <MapLocation
                                key={`${latLng.lat}-${latLng.lng}`}
                                heightClass="h-full"
                                initialPosition={latLng.lat ? [latLng.lat, latLng.lng] : null}
                                onChange={setLatLng}
                            />
                        </div>
                    </div>

                    <InputWithMeta label="Block no./Shop no./House no." requiredDot value={blockNo} onChange={setBlockNo} placeholder="Enter Block Number" />

                    <InputWithMeta label="Road/Area/Street" requiredDot value={areaStreet} onChange={setAreaStreet} placeholder="Enter Road/Area/Street" />

                    <div className="grid grid-cols-2 gap-4">
                        <InputWithMeta label="Landmark" requiredDot value={landmark} onChange={setLandmark} placeholder="Enter Landmark" />
                        <InputWithMeta
                            label="Pincode"
                            requiredDot
                            value={pincode}
                            onChange={handlePincodeChange}
                            placeholder="Enter Pincode (e.g. 560001)"
                            maxLength={6}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <InputWithMeta
                                label="City"
                                requiredDot
                                value={city}
                                onChange={setCity}
                                placeholder="City"
                                readOnly
                            />
                        </div>
                        <div className="relative">
                            <InputWithMeta
                                label="State"
                                requiredDot
                                value={state}
                                onChange={setState}
                                placeholder="State"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <div className="text-sm text-gray-700 flex items-center gap-0.5">
                            Upload Clinic Image <span className="text-red-500">*</span>
                        </div>
                        <div className="border border-dashed border-blue-300 bg-blue-50 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer relative hover:bg-blue-50/80 transition-colors">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) onUploadProof(file);
                                }}
                                accept=".png,.jpg,.jpeg,.svg,.webp"
                            />
                            {/* Placeholder for the specific colorful icon in screenshot */}
                            <div className="w-10 h-10 mb-2 bg-indigo-500 rounded-md flex items-center justify-center shadow-sm">
                                <div className="border-2 border-white w-5 h-5 border-dashed rounded-sm"></div>
                            </div>

                            <div className="text-blue-500 font-medium text-sm flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                Drag and Drop Clinic Images
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-400">Support Size upto 2MB in .png, .jpg, .svg, .webp</div>
                    </div>

                </div>
            )}

            {step === 2 && (
                <div className="flex flex-col gap-6 pb-4">

                    {/* Package Dropdown */}
                    <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Package Details</div>
                        <div className="text-[10px] text-gray-500 mb-2">Package Selected</div>
                        <div className="relative">
                            <div className="border border-gray-300 rounded-md p-2 flex justify-between items-center cursor-pointer bg-white" onClick={() => setPlanDropdownOpen(!planDropdownOpen)}>
                                <span className="text-sm text-gray-800">{selectedPlan.name}</span>
                                <ChevronDown size={16} className="text-gray-500" />
                            </div>
                            {planDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                    {PLANS.map(p => (
                                        <div key={p.id} className="p-2 hover:bg-gray-50 cursor-pointer text-sm" onClick={() => { setSelectedPlanId(p.id); setPlanDropdownOpen(false); }}>
                                            {p.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Billing Cycle */}
                    <div>
                        <div className="text-xs font-medium text-gray-700 mb-2">Billing Cycle</div>
                        <div className="flex flex-wrap gap-4">
                            {cycleOptions.map(c => (
                                <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="billingCycle" checked={billingCycle === c.id} onChange={() => setBillingCycle(c.id)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-700">{c.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Counters */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-xs font-medium text-gray-700 mb-2">Number of Doctors</div>
                            <div className="flex items-center border border-gray-300 rounded-md w-fit">
                                <button className="p-2 text-gray-500 hover:bg-gray-50" onClick={() => setNumDoctors(Math.max(1, numDoctors - 1))}><Minus size={16} /></button>
                                <span className="px-4 text-sm font-medium border-x border-gray-300 min-w-[40px] text-center">{numDoctors}</span>
                                <button className="p-2 text-gray-500 hover:bg-gray-50" onClick={() => setNumDoctors(numDoctors + 1)}><Plus size={16} /></button>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-700 mb-2">Number of Staffs</div>
                            <div className="flex items-center border border-gray-300 rounded-md w-fit">
                                <button className="p-2 text-gray-500 hover:bg-gray-50" onClick={() => setNumStaffs(Math.max(1, numStaffs - 1))}><Minus size={16} /></button>
                                <span className="px-4 text-sm font-medium border-x border-gray-300 min-w-[40px] text-center">{numStaffs}</span>
                                <button className="p-2 text-gray-500 hover:bg-gray-50" onClick={() => setNumStaffs(numStaffs + 1)}><Plus size={16} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div>
                        <div className="text-xs font-medium text-gray-700 mb-2">Payment Summary</div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="text-xs text-gray-500 mb-3">for May 24, 2025 - May 24, 2026</div>

                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Plus [Base]</span>
                                <span className="font-medium">₹{totals.monthlyRate}/mo</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Base x {billingCycle === 'yearly' ? 12 : billingCycle === 'half-yearly' ? 6 : 1}months</span>
                                <span className="font-medium">₹{totals.baseTotal.toLocaleString()}</span>
                            </div>
                            {totals.discount > 0 && (
                                <div className="flex justify-between text-sm mb-2 text-green-600">
                                    <span>{billingCycle === 'yearly' ? 'Yearly Bonus (2 Months Free)' : '6-Month Bonus (1 Month Free)'}</span>
                                    <span className="font-medium">-₹{totals.discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{totals.subTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-4">
                                <span className="text-gray-600">Taxes (18%)</span>
                                <span className="font-medium">₹{totals.taxes.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md mb-3">
                                <span className="text-base font-semibold text-gray-800">Total Amount</span>
                                <span className="text-xl font-bold text-blue-600">₹{totals.total.toLocaleString()}</span>
                            </div>

                            {totals.discount > 0 && (
                                <div className="bg-green-50 text-green-700 text-xs text-center py-2 rounded border border-green-100 mb-3">
                                    🎉 Get {billingCycle === 'yearly' ? '2 Months' : '1 Month'} Free! You save ₹{totals.discount.toLocaleString()}
                                </div>
                            )}

                            <div className="flex gap-2 items-start mt-4">
                                <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} />
                                <label htmlFor="terms" className="text-xs text-gray-600 leading-tight cursor-pointer">
                                    I agree to the <span className="underline">Terms and Conditions</span> and <span className="underline">Privacy Policy</span>. I understand that this subscription will automatically renew unless cancelled.
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Features Access */}
                    <div>
                        <div className="text-xs font-medium text-gray-500 mb-2">Access To:</div>
                        <div className="space-y-2">
                            {selectedPlan.features.map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                    <div className="w-4 h-4 rounded-full border border-blue-400 flex items-center justify-center">
                                        <Check size={10} className="text-blue-500" />
                                    </div>
                                    {feat}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </GeneralDrawer>
    );
}
