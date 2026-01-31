// Unify Patient header with the same shared header used by Doctors/Hospitals
// so the look-and-feel matches across sections.
import Header from "../DoctorList/Header";

export default function PatientHeader(props) {
  // For Patients, product wants a non-tab header: show only title + total
  // Allow override via props if needed in other contexts
  const tabs = props.tabs ?? [];
  const counts = props.counts ?? { all: 0 };

  return (
    <Header
      {...props}
      tabs={tabs}
      counts={counts}
      addLabel={props.addLabel ?? "Add New Patient"}
  showTabs={props.showTabs ?? false}
  title={props.title ?? "Patients"}
  showTitle={props.showTitle ?? false}
  countsVariant={props.countsVariant ?? 'plain'}
  countsLabel={props.countsLabel ?? `${counts?.all ?? 0} Total Patients`}
    />
  );
}
