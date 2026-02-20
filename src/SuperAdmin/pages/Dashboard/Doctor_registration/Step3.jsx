import React, { useState, forwardRef, useImperativeHandle } from 'react'
import {
  MFA,
  FormFieldRow,
  MapLocation,
  RegistrationHeader
} from '../../../../components/FormItems';
import InputWithMeta from '../../../../components/GeneralDrawer/InputWithMeta';
import useDoctorRegistrationStore from '../../../../store/useDoctorRegistrationStore';
import CustomUpload from '../../../../components/CustomUpload';
import { ChevronDown, Search } from 'lucide-react';
import RadioButton from '../../../../components/GeneralDrawer/RadioButton';
import { setupClinic } from '../../../../services/doctorService';

import useToastStore from '../../../../store/useToastStore';
import { State, City } from 'country-state-city';
const upload = '/upload_blue.png'


const Step3 = forwardRef((props, ref) => {
  const {
    userId,
    clinicData,
    setClinicField,
    setField,
    hasClinic,
    profilePhotoKey
  } = useDoctorRegistrationStore();
  const addToast = useToastStore((state) => state.addToast);

  const [formErrors, setFormErrors] = React.useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Function to search location using OSM Nominatim
  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setClinicField('latitude', parseFloat(lat));
        setClinicField('longitude', parseFloat(lon));
        setFormErrors(prev => ({ ...prev, mapLocation: "" }));
        addToast({ title: 'Location Found', message: `Moved map to ${data[0].display_name}`, type: 'success' });
      } else {
        addToast({ title: 'Not Found', message: 'Location not found', type: 'error' });
      }
    } catch (error) {
      console.error("Search error:", error);
      addToast({ title: 'Error', message: 'Failed to search location', type: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const closeDropdown = (key) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: false }));
  };

  // Common form field props
  const commonFieldProps = {
    compulsory: true,
    required: true
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value) return "Required";
        return "";
      case "email":
        if (!value) return "Required";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format";
        return "";
      case "phone":
        if (!value) return "Required";
        if (!/^\d{10}$/.test(value)) return "Phone must be 10 digits";
        return "";
      case "blockNo":
      case "areaStreet":
      case "landmark":
      case "city":
      case "state":
        if (!value) return "Required";
        return "";
      case "pincode":
        if (!value) return "Required";
        if (!/^\d{6}$/.test(value)) return "Pincode must be 6 digits";
        return "";
      case "proof":
        if (!value) return "Required";
        return "";
      default:
        return "";
    }
  };

  const validateAll = () => {
    if (!hasClinic) return true; // Step is valid (skipped) if no clinic

    const fieldsToValidate = {
      name: clinicData.name,
      email: clinicData.email,
      phone: clinicData.phone,
      blockNo: clinicData.blockNo,
      areaStreet: clinicData.areaStreet,
      landmark: clinicData.landmark,
      city: clinicData.city,
      state: clinicData.state,
      pincode: clinicData.pincode,
      proof: clinicData.proof
    };
    const newErrors = {};
    Object.entries(fieldsToValidate).forEach(([key, val]) => {
      const err = validateField(key, val);
      if (err) newErrors[key] = err;
    });

    if (!Number(clinicData.latitude) || !Number(clinicData.longitude)) {
      newErrors.mapLocation = "Location required";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // If "No" clinic, we skip or treat as success immediately?
    // Assuming for now user might just skip. 
    // Button state logic for Next handles "No" case as pass-through or different API.
    // Based on prompt "setup-clinic" is the endpoint. 
    // If hasClinic is false, maybe we don't call anything or call with empty data?
    // User requirement implies valid clinic setup. Let's assume hasClinic=true flow.

    if (!hasClinic) {
      // If specific behavior for "No Clinic" is needed (e.g. skip content), return true.
      return true;
    }

    if (!validateAll()) return false;

    if (!userId) {
      addToast({ title: 'Error', message: 'User ID missing', type: 'error' });
      return false;
    }

    try {
      const payload = {
        doctorId: userId,
        clinicData: {
          name: clinicData.name,
          emailId: clinicData.email,
          phone: clinicData.phone,
          latitude: Number(clinicData.latitude) || 0,
          longitude: Number(clinicData.longitude) || 0,
          blockNo: clinicData.blockNo,
          areaStreet: clinicData.areaStreet,
          landmark: clinicData.landmark,
          city: clinicData.city,
          state: clinicData.state,
          pincode: clinicData.pincode,
          tempImageKey: profilePhotoKey || "", // Using profile photo as tempImageKey as per payload sample example
          tempProofKey: clinicData.proof || ""
        }
      };

      const res = await setupClinic(payload);
      // const res = { success: true, message: "Mock Success" };
      if (res.success) {
        addToast({ title: 'Success', message: 'Clinic setup successful', type: 'success' });
        return true;
      } else {
        addToast({ title: 'Error', message: res.message || 'Setup failed', type: 'error' });
        return false;
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Setup failed";
      addToast({ title: 'Error', message: msg, type: 'error' });
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClinicField(name, value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  // State options derived from country-state-city
  const allStates = State.getStatesOfCountry('IN');
  const stateOptions = allStates.map(s => ({ value: s.isoCode, label: s.name }));

  // Helper to filter states
  const getFilteredStates = (query) => {
    if (!query) return stateOptions;
    const lower = query.toLowerCase();
    return stateOptions.filter(s => s.label.toLowerCase().includes(lower));
  };


  // City options derived from selected state
  // We need to find the isoCode of the currently selected state name to fetch cities
  const selectedStateObj = allStates.find(s => s.name === clinicData.state);
  const selectedStateCode = selectedStateObj ? selectedStateObj.isoCode : null;

  const allCities = selectedStateCode ? City.getCitiesOfState('IN', selectedStateCode) : [];
  const cityOptions = allCities.map(c => ({ value: c.name, label: c.name }));

  // Helper to filter cities
  const getFilteredCities = (query) => {
    if (!query) return cityOptions;
    const lower = query.toLowerCase();
    return cityOptions.filter(c => c.label.toLowerCase().includes(lower));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-sm overflow-hidden">
      <RegistrationHeader
        title="Clinical Details & Document Upload"
        subtitle="Enter your clinic information & document"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[700px] mx-auto space-y-6">

          <div className="space-y-4">
            <div className="flex gap-6 ">
              <label className="text-sm text-secondary-grey400 ">Do you have your own clinic?</label>
              <div className="flex gap-4">
                <RadioButton
                  name="hasClinic"
                  value="yes"
                  label="Yes"
                  checked={hasClinic === true}
                  onChange={() => setField('hasClinic', true)}
                />
                <RadioButton
                  name="hasClinic"
                  value="no"
                  label="No"
                  checked={hasClinic === false}
                  onChange={() => setField('hasClinic', false)}
                />
              </div>
            </div>
          </div>


          {hasClinic && (
            <>
              {/* Clinic Info Section */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-secondary-grey400">Clinic Info</h2>
                {/* Clinic Name and Contact Email Row */}
                <FormFieldRow>
                  <div className="w-full">
                    <InputWithMeta
                      label="Clinic Name"
                      requiredDot
                      value={clinicData.name}
                      onChange={(val) => handleInputChange({ target: { name: 'name', value: val } })}
                      placeholder="Enter Clinic Name"
                      {...commonFieldProps}
                      meta="Visible to Patient"
                    />
                    {formErrors.name && <span className="text-red-500 text-xs">{formErrors.name}</span>}
                  </div>
                  <div className="w-full">
                    <InputWithMeta
                      label="Clinic Contact Email"
                      requiredDot
                      type="email"
                      value={clinicData.email}
                      onChange={(val) => handleInputChange({ target: { name: 'email', value: val } })}
                      placeholder="Enter Work Email"
                      {...commonFieldProps}
                      meta="Visible to Patient"
                    />
                    {formErrors.email && <span className="text-red-500 text-xs">{formErrors.email}</span>}
                  </div>
                </FormFieldRow>

                {/* Contact Number and Upload Establishment Proof Row */}
                <FormFieldRow>
                  <div className="w-full">
                    <InputWithMeta
                      label="Clinic Contact Number"
                      requiredDot
                      type="tel"
                      value={clinicData.phone}
                      onChange={(val) => handleInputChange({ target: { name: 'phone', value: val } })}
                      placeholder="Enter Work Number"
                      {...commonFieldProps}
                      meta="Visible to Patient"
                    />
                    {formErrors.phone && <span className="text-red-500 text-xs">{formErrors.phone}</span>}
                  </div>
                  <div className="w-full">
                    <CustomUpload
                      label="Upload Establishment Proof"
                      compulsory={true}
                      onUpload={(key, name) => {
                        setClinicField('proof', key);
                        setFormErrors(prev => ({ ...prev, proof: "" }));
                      }}
                      meta="Support Size upto 1MB in .png, .jpg, .svg, .webp"
                      uploadedKey={clinicData.proof}
                    />
                    {formErrors.proof && <span className="text-red-500 text-xs">{formErrors.proof}</span>}
                  </div>
                </FormFieldRow>
              </div>

              <div className="border border-b-[0.5px] mt-1"></div>

              {/* Clinic Address Section */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-secondary-grey400">Clinic Address</h2>
                {/* Map Location */}
                <div className='flex flex-col gap-2'>

                  <InputWithMeta
                    label="Map Location"
                    requiredDot
                    infoIcon
                    value={searchQuery}
                    onChange={(val) => setSearchQuery(val)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLocationSearch();
                      }
                    }}
                    placeholder="Search Location (e.g. Mumbai, Hospital Name)"
                    RightIcon={Search}
                    onIconClick={handleLocationSearch}
                    readonlyWhenIcon={false}
                    disabled={isSearching}
                  />
                  <MapLocation
                    key={`${clinicData.latitude}-${clinicData.longitude}`}
                    heightClass="h-[300px]"
                    initialPosition={clinicData.latitude && clinicData.longitude ? [parseFloat(clinicData.latitude), parseFloat(clinicData.longitude)] : null}
                    onChange={({ lat, lng }) => {
                      setClinicField('latitude', lat);
                      setClinicField('longitude', lng);
                      setFormErrors(prev => ({ ...prev, mapLocation: "" }));
                    }}
                  />
                  {formErrors.mapLocation && <span className="text-red-500 text-xs">{formErrors.mapLocation}</span>}
                </div>

                {/* Block No and Road/Area/Street Row */}
                <FormFieldRow>
                  <div className="w-full">
                    <InputWithMeta
                      label="Block no./Shop no./House no."
                      requiredDot
                      value={clinicData.blockNo}
                      onChange={(val) => handleInputChange({ target: { name: 'blockNo', value: val } })}
                      placeholder="Enter Block Number/ Shop Number/ House Number"
                      {...commonFieldProps}
                    />
                    {formErrors.blockNo && <span className="text-red-500 text-xs">{formErrors.blockNo}</span>}
                  </div>
                  <div className="w-full">
                    <InputWithMeta
                      label="Road/Area/Street"
                      requiredDot
                      infoIcon
                      value={clinicData.areaStreet}
                      onChange={(val) => handleInputChange({ target: { name: 'areaStreet', value: val } })}
                      placeholder="Enter Road/Area/Street"
                      {...commonFieldProps}
                    />
                    {formErrors.areaStreet && <span className="text-red-500 text-xs">{formErrors.areaStreet}</span>}
                  </div>
                </FormFieldRow>

                {/* Landmark and Pincode Row */}
                <FormFieldRow>
                  <div className="w-full">
                    <InputWithMeta
                      label="Landmark"
                      requiredDot
                      infoIcon
                      value={clinicData.landmark}
                      onChange={(val) => handleInputChange({ target: { name: 'landmark', value: val } })}
                      placeholder="Enter landmark"
                      {...commonFieldProps}
                    />
                    {formErrors.landmark && <span className="text-red-500 text-xs">{formErrors.landmark}</span>}
                  </div>
                  <div className="w-full">
                    <InputWithMeta
                      label="Pincode"
                      requiredDot
                      infoIcon
                      value={clinicData.pincode}
                      onChange={(val) => {
                        handleInputChange({ target: { name: 'pincode', value: val } });
                        if (val.length === 6) {
                          // Fetch Logic
                          fetch(`https://api.postalpincode.in/pincode/${val}`)
                            .then(res => res.json())
                            .then(data => {
                              if (data && data[0].Status === "Success") {
                                const postOffice = data[0].PostOffice[0];
                                const stateName = postOffice.State;
                                const district = postOffice.District || postOffice.Region || postOffice.Block;

                                // Try to match state
                                const matchedState = allStates.find(s => s.name.toLowerCase() === stateName.toLowerCase()) ||
                                  allStates.find(s => stateName.toLowerCase().includes(s.name.toLowerCase()));

                                if (matchedState) {
                                  handleInputChange({ target: { name: 'state', value: matchedState.name } });
                                  // Try to match city/district
                                  // We need to wait for state update or use logic directly? 
                                  // Since we just set state, we can try to set city directly if we don't rely on derived 'cityOptions' for the value itself, just for dropdown validation
                                  handleInputChange({ target: { name: 'city', value: district } });

                                  // Construct search query for map
                                  const locQuery = `${district}, ${matchedState.name}`;
                                  setSearchQuery(locQuery);
                                  // Trigger map search automatically
                                  setIsSearching(true);
                                  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locQuery)}`)
                                    .then(r => r.json())
                                    .then(d => {
                                      if (d && d.length > 0) {
                                        setClinicField('latitude', parseFloat(d[0].lat));
                                        setClinicField('longitude', parseFloat(d[0].lon));
                                        addToast({ title: 'Location Updated', message: `Map moved to ${district}`, type: 'success' });
                                      }
                                    }).finally(() => setIsSearching(false));
                                }
                              } else {
                                addToast({ title: 'Invalid Pincode', message: 'Could not fetch details', type: 'error' });
                              }
                            })
                            .catch(err => console.error(err));
                        }
                      }}
                      placeholder="Enter Pincode"
                      {...commonFieldProps}
                    />
                    {formErrors.pincode && <span className="text-red-500 text-xs">{formErrors.pincode}</span>}
                  </div>
                </FormFieldRow>

                {/* City and State Row */}
                <FormFieldRow>
                  <div className="w-full">
                    <InputWithMeta
                      label="State"
                      requiredDot
                      infoIcon
                      value={clinicData.state}
                      onChange={(val) => handleInputChange({ target: { name: 'state', value: val } })}
                      placeholder="Select or Type State"
                      RightIcon={ChevronDown}
                      readonlyWhenIcon={false}
                      closeOnReclick={false}
                      onIconClick={() => toggleDropdown('state')}
                      dropdownOpen={openDropdowns['state']}
                      onRequestClose={() => closeDropdown('state')}
                      dropdownItems={getFilteredStates(clinicData.state)}
                      onSelectItem={(item) => {
                        handleInputChange({ target: { name: 'state', value: item.label } });
                        // Clear city when state changes
                        handleInputChange({ target: { name: 'city', value: '' } });
                        closeDropdown('state');
                      }}
                      {...commonFieldProps}
                    />
                    {formErrors.state && <span className="text-red-500 text-xs">{formErrors.state}</span>}
                  </div>

                  <div className="w-full">
                    <InputWithMeta
                      label="City"
                      requiredDot
                      infoIcon
                      value={clinicData.city}
                      onChange={(val) => handleInputChange({ target: { name: 'city', value: val } })}
                      placeholder={selectedStateCode ? "Select or Type City" : "Select State First"}
                      RightIcon={ChevronDown}
                      readonlyWhenIcon={false}
                      closeOnReclick={false}
                      disabled={!selectedStateCode}
                      onIconClick={() => toggleDropdown('city')}
                      dropdownOpen={openDropdowns['city']}
                      onRequestClose={() => closeDropdown('city')}
                      dropdownItems={getFilteredCities(clinicData.city)}
                      onSelectItem={(item) => {
                        handleInputChange({ target: { name: 'city', value: item.value } });
                        closeDropdown('city');
                      }}
                      {...commonFieldProps}
                    />
                    {formErrors.city && <span className="text-red-500 text-xs">{formErrors.city}</span>}
                  </div>
                </FormFieldRow>
              </div>

              <CustomUpload
                label="Upload Clinic Image"
                variant="box"
                compulsory={true}
                uploadContent="Upload"
                onUpload={(key) => setField('profilePhotoKey', key)}
                uploadedKey={profilePhotoKey}
                meta="Support Size upto 1MB in .png, .jpg, .svg, .webp"
              />

            </>
          )}

        </div>
      </div>
    </div >
  );
})


export default Step3