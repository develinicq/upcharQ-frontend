import React, { useEffect, useMemo, useState } from 'react'
import Header from '../../../../components/DoctorList/Header'
import useSuperAdminAuthStore from '../../../../store/useSuperAdminAuthStore'
import useSuperAdminListStore from '../../../../store/useSuperAdminListStore'
import SampleTable from '../../../../pages/SampleTable'
import { doctorColumns, draftColumns } from './columns'
import { useNavigate } from 'react-router-dom';
import UniversalLoader from '@/components/UniversalLoader'

const Doc_list = () => {
  const navigate = useNavigate();
  const isAuthed = useSuperAdminAuthStore((s) => Boolean(s.token));

  const {
    doctorsRaw,
    doctorsLoading: loading,
    doctorsError: error,
    fetchDoctors
  } = useSuperAdminListStore();

  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (isAuthed) {
      fetchDoctors();
    }
  }, [isAuthed, fetchDoctors]);

  // Bucket mapping from status to categories used in filters
  const statusToBucket = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'ACTIVE') return 'active';
    if (s === 'INACTIVE') return 'inactive';
    // Everything else goes to draft per requirement
    return 'draft';
  };

  const doctorsAll = useMemo(() => {
    // Map API response to UI table shape
    const mapOne = (d) => {
      const specsArray = Array.isArray(d?.specializations)
        ? d.specializations
        : (typeof d?.specializations === 'string' && d.specializations.length)
          ? d.specializations.split(',').map((x) => x.trim()).filter(Boolean)
          : [];
      const expYears = d?.yearOfExperience ?? d?.experience;
      return {
        id: d?.docId || '',
        userId: d?.id || d?.userId || '',
        name: d?.name || '',
        gender: d?.gender || '',
        contact: d?.contactNumber || '',
        email: d?.email || '',
        location: d?.location || '',
        specialization: specsArray[0] || '',
        specializationMore: specsArray.length > 1 ? specsArray.length - 1 : 0,
        designation: d?.designation || '',
        exp: expYears != null ? `${expYears} years of experience` : '',
        status: d?.status || '',
        rating: d?.rating ?? null,
        startDate: d?.startDate || '',
        draftDate: d?.draftDate || '',
        plan: d?.plan ?? '—',
        planStatus: d?.planStatus ?? '—',
        _bucket: statusToBucket(d?.status),
      };
    };
    return doctorsRaw.map(mapOne);
  }, [doctorsRaw])

  const counts = useMemo(() => {
    const c = { all: doctorsAll.length, active: 0, inactive: 0, draft: 0 };
    doctorsAll.forEach((d) => {
      const b = d._bucket;
      if (b === 'active') c.active += 1;
      else if (b === 'inactive') c.inactive += 1;
      else if (b === 'draft') c.draft += 1;
    });
    return c;
  }, [doctorsAll])

  const [selected, setSelected] = useState('all')

  const doctors = useMemo(() => {
    let filtered = doctorsAll;
    if (selected === 'active') filtered = doctorsAll.filter(d => d._bucket === 'active')
    if (selected === 'inactive') filtered = doctorsAll.filter(d => d._bucket === 'inactive')
    if (selected === 'draft') filtered = doctorsAll.filter(d => d._bucket === 'draft')
    return filtered;
  }, [doctorsAll, selected])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [selected]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return doctors.slice(start, start + pageSize);
  }, [doctors, page, pageSize]);

  const handleRowClick = (doc) => {
    console.log("Doc_list: Row clicked. Doc object:", doc);
    const targetUrl = `/doctor/${encodeURIComponent(doc.userId || doc.id)}`;
    console.log("Doc_list: Navigating to:", targetUrl);
    navigate(targetUrl, { state: { doctor: doc } });
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {!loading && (
        <div className="shrink-0 mt-2">
          <Header
            counts={counts}
            selected={selected}
            onChange={setSelected}
            addLabel="Add New Doctor"
            addPath="/register/doctor"
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
        <div className="flex items-center justify-center bg-white h-screen">
          <UniversalLoader size={32}  />
        </div>
      )}
      {!loading && error && <div className="p-6 bg-white h-screen text-red-600">{String(error)}</div>}
      {!loading && !error && (
        <div className="h-[calc(100vh-140px)] overflow-hidden m-3 border border-gray-200 rounded-lg shadow-sm bg-white">
          {doctors.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No Doctors found.
            </div>
          ) : (
            <SampleTable
              columns={selected === 'draft' ? draftColumns : doctorColumns}
              data={pagedData}
              page={page}
              pageSize={pageSize}
              total={doctors.length}
              onPageChange={setPage}
              stickyLeftWidth={300}
              stickyRightWidth={110}
              onRowClick={handleRowClick}
              hideSeparators={true}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default Doc_list
