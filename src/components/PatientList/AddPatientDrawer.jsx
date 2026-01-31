import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { calendarMinimalistic } from "../../../public/index.js";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import GeneralDrawer from "../GeneralDrawer/GeneralDrawer";
import InputWithMeta from "../GeneralDrawer/InputWithMeta";
import Dropdown from "../GeneralDrawer/Dropdown";
import { createPatientProfile } from "../../services/doctorService";
import { createPatientProfileForHospital } from "../../services/hospitalService";
import useClinicStore from "../../store/settings/useClinicStore";
import useToastStore from "../../store/useToastStore";

import UniversalLoader from "../UniversalLoader";

import useFrontDeskAuthStore from "../../store/useFrontDeskAuthStore";
import useHospitalFrontDeskAuthStore from "../../store/useHospitalFrontDeskAuthStore";
import useHospitalAuthStore from "../../store/useHospitalAuthStore";
import useAuthStore from "../../store/useAuthStore";

export default function AddPatientDrawer({ open, onClose, onSave, clinicId: propClinicId, hospitalId: propHospitalId }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    mobile: "",
    email: "",
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGenderDD, setShowGenderDD] = useState(false);
  const [showBloodDD, setShowBloodDD] = useState(false);
  const [loading, setLoading] = useState(false);

  const { clinic, selectedClinicId } = useClinicStore();
  const { doctorDetails } = useAuthStore();
  const { user: fdUser } = useFrontDeskAuthStore();
  const { hospitalId: hfdHospitalId } = useHospitalFrontDeskAuthStore();
  const { hospitalId: hAdminHospitalId } = useHospitalAuthStore();
  const { addToast } = useToastStore();
  const location = useLocation();

  const CalendarIcon = () => (
    <img src={calendarMinimalistic} alt="Calendar" className="w-4 h-4" />
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const BLOOD_MAP = {
    "A+": "A_POSITIVE",
    "A-": "A_NEGATIVE",
    "B+": "B_POSITIVE",
    "B-": "B_NEGATIVE",
    "O+": "O_POSITIVE",
    "O-": "O_NEGATIVE",
    "AB+": "AB_POSITIVE",
    "AB-": "AB_NEGATIVE",
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePhone = (phone) => {
    return /^\d{10}$/.test(phone);
  };

  const canSave =
    form.firstName &&
    form.lastName &&
    form.dob &&
    form.gender &&
    form.bloodGroup &&
    validatePhone(form.mobile) &&
    validateEmail(form.email) &&
    !loading;

  const handleDateSelect = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      set("dob", `${year}-${month}-${day}`);
      setShowCalendar(false);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    if (!validatePhone(form.mobile)) {
      addToast({
        title: "Validation Error",
        message: "Please enter a valid 10-digit mobile number",
        type: "error",
      });
      return;
    }

    if (form.email && !validateEmail(form.email)) {
      addToast({
        title: "Validation Error",
        message: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    const hospitalId =
      propHospitalId ||
      hfdHospitalId ||
      hAdminHospitalId;

    const clinicId =
      propClinicId ||
      selectedClinicId ||
      doctorDetails?.clinicId ||
      doctorDetails?.clinic?.id ||
      fdUser?.clinicId ||
      fdUser?.clinic?.id ||
      clinic?.id ||
      clinic?.clinicId;

    // Use selectedWorkplaceType from store to decide the logical flow if multiple IDs resolved
    const { selectedWorkplaceType } = useClinicStore.getState();
    const isHospital = selectedWorkplaceType === "Hospital" || location.pathname.startsWith("/hospital");

    if (!hospitalId && !clinicId) {
      addToast({
        title: "Error",
        message: "Clinic or Hospital ID not found. Please try again.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        emailId: form.email || null,
        phone: form.mobile,
        dob: form.dob,
        gender: form.gender.toLowerCase(),
        bloodGroup: BLOOD_MAP[form.bloodGroup] || form.bloodGroup,
      };

      let res;
      if (isHospital) {
        if (!hospitalId) {
          addToast({
            title: "Error",
            message: "Hospital ID not found. Please try again.",
            type: "error",
          });
          setLoading(false);
          return;
        }
        res = await createPatientProfileForHospital(hospitalId, payload);
      } else {
        if (!clinicId) {
          addToast({
            title: "Error",
            message: "Clinic ID not found. Please try again.",
            type: "error",
          });
          setLoading(false);
          return;
        }
        res = await createPatientProfile(clinicId, payload);
      }

      if (res?.success) {
        addToast({
          title: "Registration Success",
          message: "Patient profile created successfully.",
          type: "success",
        });
        onSave?.(form);
        // Reset form
        setForm({
          firstName: "",
          lastName: "",
          dob: "",
          gender: "",
          bloodGroup: "",
          mobile: "",
          email: "",
        });
        onClose();
      } else {
        addToast({
          title: "Registration Failed",
          message: res?.message || "Failed to create patient profile",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error creating patient:", err);
      addToast({
        title: "Registration Failed",
        message: err?.response?.data?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GeneralDrawer
      isOpen={open}
      onClose={onClose}
      title="Add New Patient"
      primaryActionLabel={
        loading ? (
          <div className="flex items-center gap-2">
            <UniversalLoader size={16} color="white" />
            <span>Saving...</span>
          </div>
        ) : (
          "Save"
        )
      }
      onPrimaryAction={handleSave}
      primaryActionDisabled={!canSave}
      width={600}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <InputWithMeta
            label="First Name"
            requiredDot
            value={form.firstName}
            onChange={(v) => set("firstName", v)}
            placeholder="Enter First Name"
          />
          <InputWithMeta
            label="Last Name"
            requiredDot
            value={form.lastName}
            onChange={(v) => set("lastName", v)}
            placeholder="Enter Last Name"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <InputWithMeta
              label="Date of Birth"
              requiredDot
              value={form.dob}
              placeholder="Select Date of Birth"
              RightIcon={CalendarIcon}
              onIconClick={() => setShowCalendar(!showCalendar)}
              dropdownOpen={showCalendar}
              onRequestClose={() => setShowCalendar(false)}
            />
            {showCalendar && (
              <div className="shadcn-calendar-dropdown absolute z-[10000] bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
                <ShadcnCalendar
                  mode="single"
                  selected={form.dob ? new Date(form.dob) : undefined}
                  onSelect={handleDateSelect}
                  className="rounded-lg p-1"
                  captionLayout="dropdown"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  classNames={{
                    day_selected:
                      "bg-blue-primary250 text-white hover:bg-blue-primary250",
                  }}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <InputWithMeta
              label="Gender"
              requiredDot
              value={form.gender}
              onChange={(v) => set("gender", v)}
              placeholder="Select Gender"
              RightIcon={ChevronDown}
              onFieldOpen={() => setShowGenderDD(!showGenderDD)}
              dropdownOpen={showGenderDD}
            />
            <Dropdown
              open={showGenderDD}
              onClose={() => setShowGenderDD(false)}
              items={["Male", "Female", "Other"].map((g) => ({
                label: g,
                value: g,
              }))}
              onSelect={(it) => set("gender", it.value)}
              className="w-full"
              selectedValue={form.gender}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <InputWithMeta
              label="Blood Group"
              requiredDot
              value={form.bloodGroup}
              onChange={(v) => set("bloodGroup", v)}
              placeholder="Select Blood Group"
              RightIcon={ChevronDown}
              onFieldOpen={() => setShowBloodDD(!showBloodDD)}
              dropdownOpen={showBloodDD}
            />
            <Dropdown
              open={showBloodDD}
              onClose={() => setShowBloodDD(false)}
              items={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                (bg) => ({ label: bg, value: bg })
              )}
              onSelect={(it) => set("bloodGroup", it.value)}
              className="w-full"
              selectedValue={form.bloodGroup}
            />
          </div>

          <div>
            <InputWithMeta
              label="Mobile Number"
              requiredDot
              value={form.mobile}
              onChange={(v) => {
                const numeric = v.replace(/\D/g, "");
                if (numeric.length <= 10) set("mobile", numeric);
              }}
              placeholder="Enter Mobile Number"
            />
            {form.mobile.length > 0 && form.mobile.length < 10 && (
              <div className="text-[10px] text-red-500 mt-0.5 ml-1">
                Mobile number must be exactly 10 digits long.
              </div>
            )}
          </div>
        </div>

        <div>
          <InputWithMeta
            label="Email ID"
            value={form.email}
            requiredDot
            onChange={(v) => set("email", v)}
            placeholder="Enter Email"
          />
          {form.email.length > 0 && !validateEmail(form.email) && (
            <div className="text-[10px] text-red-500 mt-0.5 ml-1">
              Please enter a valid email address.
            </div>
          )}
        </div>
      </div>
    </GeneralDrawer>
  );
}
