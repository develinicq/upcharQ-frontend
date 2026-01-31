import React, { useEffect, useMemo, useState } from 'react'
import Header from '../../../../../../components/DoctorList/Header'
import { getAllDoctorsBySuperAdmin } from '../../../../../../services/doctorService'
import useSuperAdminAuthStore from '../../../../../../store/useSuperAdminAuthStore'
import SampleTable from '../../../../../../pages/SampleTable'
import { doctorColumns } from '../../../../Doctors/DoctorList/columns'
import sampleData from '../../../../Doctors/DoctorList/data.json'
import { getDoctorsByHospitalIdForSuperAdmin } from '../../../../../../services/hospitalService';
import UniversalLoader from '@/components/UniversalLoader';
import { useNavigate } from 'react-router-dom';

const Doctor = ({ hospital }) => {
  const navigate = useNavigate();
  const isAuthed = useSuperAdminAuthStore((s) => Boolean(s.token))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [active, setActive] = useState([])
  const [inactive, setInactive] = useState([])
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const hospitalId = hospital?.temp || hospital?.id || '';
        console.log("Doctors Section: Fetching for hospitalId:", hospitalId);

        // If no ID (yet), maybe don't fetch or wait? 
        // Assuming we always have at least an ID if we are at this stage.
        if (!hospitalId) {
          console.warn("Doctors Section: No hospital ID available");
          setLoading(false);
          return;
        }

        // Validate UUID to prevent 400 Bad Request
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hospitalId);
        if (!isUuid) {
          console.log("Doctors Section: hospitalId is not a UUID yet, waiting...", hospitalId);
          // Do not disable loading here if we expect it to eventually resolve to a UUID?
          // Or just set loading false?
          // If we stick in loading state forever it's bad.
          // But if it's the initial render with "HO-xxxx", we expect a re-render shortly with UUID.
          // So keep loading true? Or false.
          // If we say setLoading(false), it shows "No doctors" or empty table.
          // Let's keep it true if we think it's transient.
          return;
        }

        const resp = await getDoctorsByHospitalIdForSuperAdmin(hospitalId, page, pageSize);
        if (ignore) return;

        console.log("Doctors Section: API Response:", resp);
        const list = resp?.data?.doctors || [];
        // The API returns mixed status in one list. We need to filter for active/inactive tabs locally?
        // OR does the API return all and we bucket them?
        // The provided sample response shows "status": "ACTIVE".
        // Let's bucket them locally as before.

        const a = list.filter(d => (d?.status || '').toUpperCase() === 'ACTIVE');
        const i = list.filter(d => (d?.status || '').toUpperCase() === 'INACTIVE'); // Assuming 'INACTIVE' is possible

        // Current implementation expects separate arrays for active/inactive state usage
        setActive(a);
        setInactive(i);

      } catch (e) {
        if (ignore) return
        console.error("Doctors Section: API Error", e);
        setError("Failed to fetch doctors");

        // Fallback to empty
        setActive([]);
        setInactive([]);
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    if (isAuthed) load()
    else setLoading(false);

    return () => {
      ignore = true
    }
  }, [isAuthed, hospital, page])


  const doctorsAll = useMemo(() => {
    const mapOne = (d) => ({
      id: d?.docId || '',
      userId: d?.id || '',
      name: d?.name || '',
      gender: d?.gender || '',
      contact: d?.contactNumber || '',
      email: d?.email || '',
      location: d?.location || '',
      // Handle specializations string "Ophthalmology, General Medicine" to first item or count
      specialization: d?.specializations ? d.specializations.split(',')[0].trim() : '',
      specializationMore: d?.specializations ? Math.max(0, d.specializations.split(',').length - 1) : 0,
      designation: d?.designation || '',
      exp: d?.experience != null ? `${d.experience} years of experience` : '',
      status: d?.planStatus || d?.status,
      rating: d?.rating || 4.0,
      startDate: d?.startDate || '',
      plan: d?.plan || 'Basic',
      planStatus: d?.planStatus || 'Active',
    })
    return [
      ...active.map(mapOne),
      ...inactive.map(mapOne),
    ]
  }, [active, inactive])

  const counts = useMemo(() => ({
    all: (active?.length || 0) + (inactive?.length || 0),
    active: active?.length || 0,
    inactive: inactive?.length || 0,
  }), [active, inactive])

  const [selected, setSelected] = useState('all')

  const doctors = useMemo(() => {
    let filtered = doctorsAll;
    if (selected === 'active') filtered = doctorsAll.filter(d => d.status === 'Active')
    if (selected === 'inactive') filtered = doctorsAll.filter(d => d.status === 'Inactive')
    return filtered;
  }, [doctorsAll, selected])

  useEffect(() => {
    setPage(1);
  }, [selected]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return doctors.slice(start, start + pageSize);
  }, [doctors, page, pageSize]);

  const handleRowClick = (doc) => {
    navigate(`/doctor/${encodeURIComponent(doc.userId || doc.id)}`, { state: { doctor: doc } });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 mt-2">
        <Header counts={counts} selected={selected} onChange={setSelected} addLabel="Add New Doctor" addPath="/register/doctor" />
      </div>

      <div className="h-[600px] overflow-hidden m-3 border border-gray-200 rounded-lg shadow-sm bg-white relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <UniversalLoader size={30} className="bg-transparent" />
          </div>
        )}
        {!loading && error && <div className="p-6 text-red-600">{String(error)}</div>}
        {!loading && !error && (
          <SampleTable
            columns={doctorColumns}
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
    </div>
  )
}

export default Doctor
