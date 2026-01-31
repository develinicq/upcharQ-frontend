import { useEffect, useMemo, useState } from "react";
import Header from "../../../../components/DoctorList/Header";
import HospitalGrid from "../../../../components/HospitalList/HospitalGrid";
import useSuperAdminAuthStore from "../../../../store/useSuperAdminAuthStore";
import TablePagination from "@/pages/TablePagination";
import UniversalLoader from "@/components/UniversalLoader";
import useSuperAdminListStore from "../../../../store/useSuperAdminListStore";

function HospitalList() {
  const isAuthed = useSuperAdminAuthStore((s) => Boolean(s.token));

  const {
    hospitalsRaw,
    hospitalsLoading: loading,
    hospitalsError: error,
    fetchHospitals
  } = useSuperAdminListStore();

  useEffect(() => {
    if (isAuthed) {
      fetchHospitals();
    }
  }, [isAuthed, fetchHospitals]);

  // Bucket mapping
  // Bucket mapping
  const statusToBucket = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'ACTIVE') return 'active';
    if (s === 'INACTIVE') return 'inactive';
    return 'draft';
  };

  const hospitalsAll = useMemo(() => {
    const mapOne = (h) => {
      const bucket = statusToBucket(h?.status);
      // Status label for UI
      let statusLabel = 'Draft';
      if (bucket === 'active') statusLabel = 'Active';
      if (bucket === 'inactive') statusLabel = 'Inactive';

      // Format Start Date from createdAt
      const startDate = h?.createdAt ? new Date(h.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric' // e.g. 14 Dec 2025
      }) : "-";

      // Plan
      const plan = (h?.subscription?.isActive && h?.subscription?.planName)
        ? h.subscription.planName
        : "-";

      return {
        temp: h?.id || "",
        id: h?.hospitalCode || "",
        name: h?.name || "-",
        address: [
          h?.address?.street,
          h?.address?.area,
          h?.city,
          h?.state,
          h?.pincode
        ].filter(Boolean).join(", ") || "-",
        email: h?.emailId || "-",
        phone: h?.phone || "-",
        type: h?.type || "-",
        doctors: h?.noOfDoctors != null ? `${h.noOfDoctors} Users` : "0 Users",
        beds: h?.noOfBeds != null ? `${h.noOfBeds} Beds` : "0 Beds",
        estYear: h?.establishmentYear || "-",
        startDate: startDate, // Mapped start date
        plan: plan,           // Mapped plan
        validity: "",
        status: statusLabel,
        _bucket: bucket, // internal use for filtering
        logo: h?.logo || "",
        image: h?.image || "/hospital-sample.png",
      };
    };
    return hospitalsRaw.map(mapOne);
  }, [hospitalsRaw]);

  const counts = useMemo(() => {
    const c = { all: hospitalsAll.length, active: 0, inactive: 0, draft: 0 };
    hospitalsAll.forEach(h => {
      c[h._bucket] = (c[h._bucket] || 0) + 1;
    });
    return c;
  }, [hospitalsAll]);


  const [selected, setSelected] = useState('all');

  const hospitalsFiltered = useMemo(() => {
    if (selected === 'all') return hospitalsAll;
    return hospitalsAll.filter(h => h._bucket === selected);
  }, [hospitalsAll, selected]);

  return (
    <div className="flex flex-col h-[calc(100vh-50px)] bg-white overflow-hidden relative">
      {!loading && (
        <div className="shrink-0 mt-2 z-10 px-3">
          <Header
            counts={counts}
            selected={selected}
            onChange={setSelected}
            addLabel="Add New Hospital"
            addPath="/register/hospital"
            tabs={[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' },
              { key: 'draft', label: 'Draft' },
            ]}
          />
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center bg-white h-full">
          <UniversalLoader size={30}  />
        </div>
      )}

      {!loading && error && <div className="p-6 text-red-600">{String(error)}</div>}

      {!loading && !error && (
        <div className="flex-1 overflow-y-auto p-3 bg-white">
          <HospitalGrid hospitals={hospitalsFiltered} />
        </div>
      )}

      {!loading && !error && (
        <div className="shrink-0 h-[48px] bg-white border-t flex items-center justify-center p-2 z-20">
          <TablePagination />
        </div>
      )}

    </div>
  )
}

export default HospitalList;
