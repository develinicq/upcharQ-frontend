import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import { ChevronDown } from "lucide-react";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import RichTextBox from "@/components/GeneralDrawer/RichTextBox";
import { addHospitalPublicationForSuperAdmin } from "@/services/hospitalService";
import useToastStore from "@/store/useToastStore";
import UniversalLoader from "@/components/UniversalLoader";

export default function AddPublicationDrawer({ open, onClose, onSuccess, hospitalId, mode = "add", initial = {} }) {
    const [title, setTitle] = useState("");
    const [publisher, setPublisher] = useState("");
    const [type, setType] = useState("");
    const [date, setDate] = useState("");
    const [url, setUrl] = useState("");
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);

    const [typeOpen, setTypeOpen] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const addToast = useToastStore(state => state.addToast);

    useEffect(() => {
        if (!open) return;
        setTitle(initial?.title || initial?.publicationName || "");
        setPublisher(initial?.publisher || "");
        setType(initial?.type || initial?.associatedWith || "");
        setDate(initial?.date || (initial?.publicationDate ? initial.publicationDate.split("T")[0] : ""));
        setUrl(initial?.url || initial?.publicationUrl || "");
        setDesc(initial?.desc || initial?.description || "");
        setTypeOpen(false);
        setLoading(false);
    }, [open, initial]);

    const canSave = Boolean(title.trim() && publisher.trim() && date && !loading);

    const typeOptions = useMemo(
        () => ["Journal", "Conference", "Book", "Whitepaper", "Blog"],
        []
    );

    const save = async () => {
        if (!canSave || !hospitalId) return;
        setLoading(true);
        try {
            const payload = {
                publicationName: title.trim(),
                publisher: publisher.trim(),
                associatedWith: type.trim(),
                publicationDate: date,
                publicationUrl: url.trim(),
                description: desc.trim()
            };
            const res = await addHospitalPublicationForSuperAdmin(hospitalId, payload);
            if (res.success) {
                addToast({
                    title: "Success",
                    message: "Publication added successfully",
                    type: "success"
                });
                onSuccess?.();
                onClose?.();
            }
        } catch (error) {
            console.error("Failed to add publication:", error);
            addToast({
                title: "Error",
                message: error?.response?.data?.message || "Failed to add publication",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <GeneralDrawer
            isOpen={open}
            onClose={onClose}
            title={mode === "edit" ? "Edit Publication" : "Add Publication"}
            primaryActionLabel={loading ? (
                <div className="flex items-center gap-2">
                    <UniversalLoader size={16} />
                    <span>Saving...</span>
                </div>
            ) : "Save"}
            onPrimaryAction={save}
            primaryActionDisabled={!canSave}
            width={600}
        >
            <div className="flex flex-col gap-4">
                <InputWithMeta label="Title" requiredDot value={title} onChange={setTitle} placeholder="Enter Title" />
                <InputWithMeta label="Publisher" requiredDot value={publisher} onChange={setPublisher} placeholder="Enter Publisher" />
                <div className="relative">
                    <InputWithMeta label="Type" value={type} onChange={setType} placeholder="Select Type" RightIcon={ChevronDown} onFieldOpen={() => setTypeOpen((o) => !o)} dropdownOpen={typeOpen} onRequestClose={() => setTypeOpen(false)} readonlyWhenIcon={false} />
                    <Dropdown open={typeOpen} onClose={() => setTypeOpen(false)} items={typeOptions.map((a) => ({ label: a, value: a }))} selectedValue={type} onSelect={(it) => { setType(it.value); setTypeOpen(false); }} anchorClassName="absolute bottom-0 left-0 w-full h-0" className="input-meta-dropdown w-full" direction="down" />
                </div>
                <div className="relative">
                    <InputWithMeta label="Date" requiredDot value={date} onChange={setDate} placeholder="Select Date" RightIcon='/Doctor_module/settings/calendar.png' onIconClick={() => setShowCalendar((v) => !v)} dropdownOpen={showCalendar} onRequestClose={() => setShowCalendar(false)} readonlyWhenIcon={true} />
                    {showCalendar && (
                        <div className="shadcn-calendar-dropdown absolute right-1 top-full z-[10000] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
                            <ShadcnCalendar mode="single" selected={date ? new Date(date) : undefined} onSelect={(d) => { if (!d) return; const yyyy = d.getFullYear(); const mm = String(d.getMonth() + 1).padStart(2, "0"); const dd = String(d.getDate()).padStart(2, "0"); setDate(`${yyyy}-${mm}-${dd}`); setShowCalendar(false); }} />
                        </div>
                    )}
                </div>
                <InputWithMeta label="URL" value={url} onChange={setUrl} placeholder="Paste URL" />
                <RichTextBox label="Description" value={desc} onChange={(v) => setDesc(v.slice(0, 1600))} placeholder="Description" showCounter={true} maxLength={1600} />
            </div>
        </GeneralDrawer>
    );
}