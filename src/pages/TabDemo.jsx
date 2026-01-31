import React, { useState } from "react";
import Tab from "../components/Tab";
import Button from "../components/Button";
import GeneralDrawer from "../components/GeneralDrawer/GeneralDrawer";
import RadioButton from "../components/GeneralDrawer/RadioButton";
import InputWithMeta from "../components/GeneralDrawer/InputWithMeta";
import SampleTable from "./SampleTable";
import useToastStore from "../store/useToastStore";
import { Icon } from "@/components/Icon";

const TabDemo = () => {
  const [open, setOpen] = useState(false);
  const [isExisting, setIsExisting] = useState(true);
  const [slotOpen, setSlotOpen] = useState(false);
  const [slotLabel, setSlotLabel] = useState("Morning (10:00 am - 12 : 30 pm)");

  return (
    <>
      <div className="p-6 ">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Tab Component Demo</h1>
          <div className="flex items-center gap-3">
            <Button onClick={() => setOpen(true)}>Open Drawer</Button>
            <Button
              className="bg-success-300 hover:bg-success-400"
              onClick={() => useToastStore.getState().addToast({ title: "Success", message: "This is a success toast", type: "success" })}
            >
              Success Toast
            </Button>
            <Button
              className="bg-error-400 hover:bg-error-500"
              onClick={() => useToastStore.getState().addToast({ title: "Error", message: "This is an error toast", type: "error" })}
            >
              Error Toast
            </Button>
            <Button
              className="bg-warning-400 hover:bg-warning-500"
              onClick={() => useToastStore.getState().addToast({ title: "Warning", message: "This is a warning toast", type: "warning" })}
            >
              Warning Toast
            </Button>
          </div>
        </div>

        {/* Drawer Instance */}
        <GeneralDrawer
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Book Walk-In Appointment"
          primaryActionLabel={isExisting ? "Book Appointment" : "Save"}
          onPrimaryAction={() => setOpen(false)}
          primaryActionDisabled={false}
        >
          {/* Header radios */}
          <div className="flex items-center gap-6">
            <RadioButton
              name="pt"
              value="existing"
              checked={isExisting}
              onChange={(v) => setIsExisting(v === "existing")}
              label="Existing Patients"
            />
            <RadioButton
              name="pt"
              value="new"
              checked={!isExisting}
              onChange={(v) => setIsExisting(v === "existing" ? true : false)}
              label="New Patient"
            />
          </div>

      

<Icon name="" />
<Icon name="" className="text-red-500" />


          {/* Body inputs demo */}
          {isExisting ? (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Search Patient by name, Abha id, Patient ID or Contact Number"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Enter First Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Enter Last Name" />
              </div>
            </div>
          )}

          {/* Available Slot row demo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <InputWithMeta
              label="Available Slot"
              requiredDot
              rightMeta={<span>5 Tokens available</span>}
              value={slotLabel}
              onChange={setSlotLabel}
              onIconClick={() => setSlotOpen((s) => !s)}
              dropdown={
                slotOpen && (
                  <div className="border rounded-md shadow-sm bg-white">
                    {[
                      "Morning (10:00 am - 12 : 30 pm)",
                      "Afternoon (12:30 pm - 3:30 pm)",
                      "Evening (4:00 pm - 7:00 pm)",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => {
                          setSlotLabel(opt);
                          setSlotOpen(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )
              }
            />
          </div>
        </GeneralDrawer>

        {/* Tabs variant: show all 3 states, both sizes */}
        <section>
          <h2 className="mb-3 text-lg font-medium">Tabs variant (28px)</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-20 text-sm text-gray-500">size: md</span>
              <Tab variant="tabs" size="md" status="default">Default</Tab>
              <Tab variant="tabs" size="md" status="hover">Hover</Tab>
              <Tab variant="tabs" size="md" status="active">Active</Tab>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-sm text-gray-500">size: sm</span>
              <Tab variant="tabs" size="sm" status="default">Default</Tab>
              <Tab variant="tabs" size="sm" status="hover">Hover</Tab>
              <Tab variant="tabs" size="sm" status="active">Active</Tab>
            </div>
          </div>
        </section>

        {/* Underline variant: show all 3 states, both sizes */}
        <section>
          <h2 className="mb-3 text-lg font-medium">Underline variant (40px)</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-20 text-sm text-gray-500">size: md</span>
              <Tab variant="underline" size="md" status="default">Default</Tab>
              <Tab variant="underline" size="md" status="hover">Hover</Tab>
              <Tab variant="underline" size="md" status="active">Active</Tab>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-sm text-gray-500">size: sm</span>
              <Tab variant="underline" size="sm" status="default">Default</Tab>
              <Tab variant="underline" size="sm" status="hover">Hover</Tab>
              <Tab variant="underline" size="sm" status="active">Active</Tab>
            </div>
          </div>
        </section>
      </div>
      <Icon name="AlarmAdd" className="text-red-500" />
<Icon name="AlarmPlay" size={32} strokeWidth={2} />
<Icon name="Unknown" size={32} strokeWidth={2} />


      <SampleTable />
    </>
  );
};

export default TabDemo;
