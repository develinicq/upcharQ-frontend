import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import { ChevronDown } from "lucide-react";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import RichTextBox from "@/components/GeneralDrawer/RichTextBox";
import { addHospitalAwardForSuperAdmin, updateHospitalAwardForSuperAdmin } from "@/services/hospitalService";
import useToastStore from "@/store/useToastStore";
import UniversalLoader from "@/components/UniversalLoader";

export default function AddAwardDrawer({ open, onClose, onSuccess, hospitalId, mode = "add", initial = {} }) {
	const [title, setTitle] = useState("");
	const [issuer, setIssuer] = useState("");
	const [assoc, setAssoc] = useState("");
	const [date, setDate] = useState("");
	const [url, setUrl] = useState("");
	const [desc, setDesc] = useState("");
	const [loading, setLoading] = useState(false);

	const [assocOpen, setAssocOpen] = useState(false);
	const [showIssueCalendar, setShowIssueCalendar] = useState(false);
	const addToast = useToastStore(state => state.addToast);

	useEffect(() => {
		if (!open) return;
		setTitle(initial?.title || initial?.awardName || "");
		setIssuer(initial?.issuer || initial?.issuerName || "");
		setAssoc(initial?.with || initial?.associatedWith || "");
		setDate(initial?.date || (initial?.issueDate ? initial.issueDate.split("T")[0] : ""));
		setUrl(initial?.url || initial?.awardUrl || "");
		setDesc(initial?.desc || initial?.description || "");
		setAssocOpen(false);
		setLoading(false);
	}, [open]); // Only reset when opening

	const hasChanges = useMemo(() => {
		if (mode !== "edit") return true;
		const initialTitle = initial?.title || initial?.awardName || "";
		const initialIssuer = initial?.issuer || initial?.issuerName || "";
		const initialAssoc = initial?.with || initial?.associatedWith || "";
		const initialDate = initial?.date || (initial?.issueDate ? initial.issueDate.split("T")[0] : "");
		const initialUrl = initial?.url || initial?.awardUrl || "";
		const initialDesc = initial?.desc || initial?.description || "";

		return (
			title.trim() !== initialTitle ||
			issuer.trim() !== initialIssuer ||
			assoc.trim() !== initialAssoc ||
			date !== initialDate ||
			url.trim() !== initialUrl ||
			desc.trim() !== initialDesc
		);
	}, [mode, initial, title, issuer, assoc, date, url, desc]);

	const canSave = Boolean(title.trim() && issuer.trim() && date && hasChanges && !loading);

	const assocOptions = useMemo(
		() => ["Department", "Hospital", "Clinic", "University", "Conference"],
		[]
	);

	const save = async () => {
		if (!canSave || !hospitalId) return;
		setLoading(true);
		try {
			let res;
			if (mode === "edit" && initial?.id) {
				const partialPayload = {};
				const initialTitle = initial?.title || initial?.awardName || "";
				const initialIssuer = initial?.issuer || initial?.issuerName || "";
				const initialAssoc = initial?.with || initial?.associatedWith || "";
				const initialDate = initial?.date || (initial?.issueDate ? initial.issueDate.split("T")[0] : "");
				const initialUrl = initial?.url || initial?.awardUrl || "";
				const initialDesc = initial?.desc || initial?.description || "";

				if (title.trim() !== initialTitle) partialPayload.awardName = title.trim();
				if (issuer.trim() !== initialIssuer) partialPayload.issuerName = issuer.trim();
				if (assoc.trim() !== initialAssoc) partialPayload.associatedWith = assoc.trim();
				if (date !== initialDate) partialPayload.issueDate = date;
				if (url.trim() !== initialUrl) partialPayload.awardUrl = url.trim();
				if (desc.trim() !== initialDesc) partialPayload.description = desc.trim();

				res = await updateHospitalAwardForSuperAdmin(hospitalId, initial.id, partialPayload);
			} else {
				const payload = {
					awardName: title.trim(),
					issuerName: issuer.trim(),
					associatedWith: assoc.trim(),
					issueDate: date,
					awardUrl: url.trim(),
					description: desc.trim()
				};
				res = await addHospitalAwardForSuperAdmin(hospitalId, payload);
			}

			if (res.success) {
				addToast({
					title: "Success",
					message: mode === "edit" ? "Award updated successfully" : "Award added successfully",
					type: "success"
				});
				onSuccess?.();
				onClose?.();
			}
		} catch (error) {
			console.error(`Failed to ${mode} award:`, error);
			addToast({
				title: "Error",
				message: error?.response?.data?.message || `Failed to ${mode} award`,
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
			title={mode === "edit" ? "Edit Award" : "Add Award"}
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
				<InputWithMeta label="Award Name" requiredDot value={title} onChange={setTitle} placeholder="Enter Award Name" />
				<InputWithMeta label="Issuer Name" requiredDot value={issuer} onChange={setIssuer} placeholder="Enter Issuer Name" />
				<div className="relative">
					<InputWithMeta label="Associated With" value={assoc} onChange={setAssoc} placeholder="Select or Enter Associated" RightIcon={ChevronDown} onFieldOpen={() => setAssocOpen((o) => !o)} dropdownOpen={assocOpen} onRequestClose={() => setAssocOpen(false)} readonlyWhenIcon={false} />
					<Dropdown open={assocOpen} onClose={() => setAssocOpen(false)} items={assocOptions.map((a) => ({ label: a, value: a }))} selectedValue={assoc} onSelect={(it) => { setAssoc(it.value); setAssocOpen(false); }} anchorClassName="absolute bottom-0 left-0 w-full h-0" className="input-meta-dropdown w-full" direction="down" />
				</div>
				<div className="relative">
					<InputWithMeta label="Issue Date" requiredDot value={date} onChange={setDate} placeholder="Select Date" RightIcon='/Doctor_module/settings/calendar.png' onIconClick={() => setShowIssueCalendar((v) => !v)} dropdownOpen={showIssueCalendar} onRequestClose={() => setShowIssueCalendar(false)} readonlyWhenIcon={true} />
					{showIssueCalendar && (
						<div className="shadcn-calendar-dropdown absolute right-1 top-full z-[10000] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
							<ShadcnCalendar mode="single" selected={date ? new Date(date) : undefined} onSelect={(d) => { if (!d) return; const yyyy = d.getFullYear(); const mm = String(d.getMonth() + 1).padStart(2, "0"); const dd = String(d.getDate()).padStart(2, "0"); setDate(`${yyyy}-${mm}-${dd}`); setShowIssueCalendar(false); }} />
						</div>
					)}
				</div>
				<InputWithMeta label="Award URL" value={url} onChange={setUrl} placeholder="Paste Award URL" />
				<RichTextBox label="Description" value={desc} onChange={(v) => setDesc(v.slice(0, 1600))} placeholder="Description" showCounter={true} maxLength={1600} />
			</div>
		</GeneralDrawer>
	);
}
