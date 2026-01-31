import React from "react";
import AvatarCircle from "../../../components/AvatarCircle";

function Row({ label, value }) {
  return (
    <div className="flex items-center py-2 gap-[0.5rem] text-sm">
      <div className="text-gray-500 w-[184px]">{label}</div>
      <div className="text-gray-800">{value}</div>
    </div>
  );
}

function SectionCard({ title, children, editButtonGroup }) {
  return (
    <div className="mt-2">
      <div className="text-sm font-semibold text-gray-800 flex items-center justify-between">
        <div>{title}</div>
        {editButtonGroup ? <div>{editButtonGroup}</div> : null}
      </div>
      {/* horizontal line */}
      <div className="border-b border-gray-300 my-1" />
      <div>{children}</div>
    </div>
  );
}

export default function PatientDemographics({ overview, patientId }) {
  if (!overview) return <div className="p-4 text-center text-gray-500 italic">No demographics data available.</div>;

  const basicInfo = {
    name: overview.name || "-",
    dob: overview.dob ? new Date(overview.dob).toLocaleDateString("en-GB") : "-",
    age: overview.age !== undefined ? `${overview.age} Years` : "-",
    gender: overview.gender ? (overview.gender.charAt(0).toUpperCase() + overview.gender.slice(1).toLowerCase()) : "-",
    bloodGroup: overview.bloodGroup ? overview.bloodGroup.replace('_', ' ') : "-",
    maritalStatus: overview.maritalStatus || "-"
  };

  const contactInfo = overview.contactInfo || {};
  const phone = contactInfo.phone || {};
  const contactDetails = {
    primaryPhone: phone.primary || "-",
    secondaryPhone: phone.secondary || "-",
    email: contactInfo.emailId || "-",
    emergencyContact: "-", // Emergency contact field not explicitly in overview, keeping as -
    primaryLanguage: overview.demographics?.contactDetails?.primaryLanguage || "-",
    secondaryLanguage: overview.demographics?.contactDetails?.secondaryLanguages?.length > 0
      ? overview.demographics.contactDetails.secondaryLanguages.join("/")
      : "-"
  };

  const addressDetails = overview.demographics?.addressDetails?.permanentAddress || {};
  const address = addressDetails.address || {};
  const formattedAddress = [address.blockNo, address.areaStreet, address.landmark].filter(Boolean).join(", ") || "-";

  const dependents = overview.dependents || [];

  return (
    <div className="w-[100%] gap-4 pt-4 px-3 pb-3 opacity-100">
      <div className="">
        <SectionCard
          title="Basic Info"
          editButtonGroup={
            <button
              className="font-inter text-xs font-normal leading-[1.2] tracking-normal align-middle
            text-[#2372EC] flex items-center gap-1"
            >
              <img
                src="/icons/Pen.svg"
                alt="edit icon"
                width={14}
                height={14}
              />
              <div>Edit</div>
            </button>
          }
        >
          <Row label="Name:" value={basicInfo.name} />
          <Row label="Date Of Birth:" value={basicInfo.dob} />
          <Row label="Age:" value={basicInfo.age} />
          <Row label="Gender:" value={basicInfo.gender} />
          <Row label="Blood Group:" value={basicInfo.bloodGroup} />
          <Row label="Marital Status:" value={basicInfo.maritalStatus} />
        </SectionCard>

        <SectionCard title="Contact Details">
          <Row label="Primary Phone:" value={contactDetails.primaryPhone} />
          <Row label="Secondary Phone:" value={contactDetails.secondaryPhone} />
          <Row label="Email Address:" value={contactDetails.email} />
          <Row label="Emergency Contact:" value={contactDetails.emergencyContact} />
          <Row label="Primary Language:" value={contactDetails.primaryLanguage} />
          <Row label="Secondary Language:" value={contactDetails.secondaryLanguage} />
        </SectionCard>

        <SectionCard title="Address Details">
          <div
            className=" text-[#0D47A1] font-inter text-sm font-normal leading-[22px] tracking-[0px]"
          >
            Permanent Address
          </div>
          <Row label="Address:" value={formattedAddress} />
          <Row label="City:" value={addressDetails.city || "-"} />
          <Row label="State:" value={addressDetails.state || "-"} />
          <Row label="Zip Code:" value={addressDetails.pincode || "-"} />
        </SectionCard>

        <SectionCard
          title={`Dependant (${dependents.length})`}
          editButtonGroup={
            <div className="flex items-center justify-end">
              <button
                className=" text-[#2372EC] font-inter text-xs font-normal leading-[1.2] tracking-normal align-middle
"
              >
                + Add New
              </button>
            </div>
          }
        >
          {dependents.length > 0 ? dependents.map((d, idx) => (
            <div key={d.id || idx} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <AvatarCircle name={d.name} size="s" />
              <div>
                <div className="text-gray-800">
                  {d.name}{" "}
                  <span className="text-xs text-gray-500">
                    {d.relation ? (d.relation.charAt(0).toUpperCase() + d.relation.slice(1).toLowerCase()) : "Dependant"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {d.phone || "-"}
                </div>
              </div>
              <div className="ml-auto">
                <button className="p-1.5 rounded hover:bg-gray-100">
                  <img
                    src="/icons/Menu Dots.svg"
                    alt="options"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-2 text-xs text-gray-400 italic">No dependents found.</div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
