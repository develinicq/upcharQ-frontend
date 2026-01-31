import React, { useMemo, useState, useEffect } from 'react'
import Header from '../../../components/DoctorList/Header'
import SampleTable from '../../../pages/SampleTable'
import { doctorColumns } from './columns'
import { useNavigate } from 'react-router-dom';

import { getDoctorsForHospital } from '../../../services/doctorService';
import useHospitalAuthStore from '../../../store/useHospitalAuthStore';
import useHospitalDataStore from '../../../store/hospital/useHospitalDataStore';
import UniversalLoader from '../../../components/UniversalLoader';

export default function HDoctors() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('all')
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { hospitalId } = useHospitalAuthStore();
  const { doctors: cachedDoctors, doctorsLoaded, setDoctors } = useHospitalDataStore();
  const [loading, setLoading] = useState(!doctorsLoaded);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!hospitalId || doctorsLoaded) {
        return;
      }
      setLoading(true);
      try {
        const res = await getDoctorsForHospital(hospitalId);
        if (res.success && res.data && Array.isArray(res.data.doctors)) {
          // Map API response to UI shape
          const mapped = res.data.doctors.map(d => {
            const specsArray = d.specialization ? d.specialization.split(',').map(s => s.trim()) : [];
            const rawStatus = (d.status || '').toUpperCase();
            const status = rawStatus === 'ACTIVE' ? 'Active' : (rawStatus === 'INACTIVE' ? 'Inactive' : 'Draft');

            return {
              id: d.doctorCode,
              userId: d.doctorId,
              name: d.name,
              gender: d.gender === 'MALE' ? 'M' : (d.gender === 'FEMALE' ? 'F' : '-'),
              contact: d.phone,
              email: d.email,
              location: '-',
              specialization: specsArray[0] || '-',
              specializationMore: specsArray.length > 1 ? specsArray.length - 1 : 0,
              designation: '-',
              exp: '-',
              status,
              consultationFee: d.consultationFee,
            };
          });
          setDoctors(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [hospitalId, doctorsLoaded, setDoctors]);

  const counts = useMemo(() => ({
    all: cachedDoctors.length,
    active: cachedDoctors.filter(d => d.status === 'Active').length,
    inactive: cachedDoctors.filter(d => d.status === 'Inactive').length,
    draft: cachedDoctors.filter(d => d.status === 'Draft').length,
  }), [cachedDoctors])

  const doctorsFiltered = useMemo(() => {
    let filtered = cachedDoctors;
    if (selected === 'active') filtered = cachedDoctors.filter(d => d.status === 'Active')
    if (selected === 'inactive') filtered = cachedDoctors.filter(d => d.status === 'Inactive')
    if (selected === 'draft') filtered = cachedDoctors.filter(d => d.status === 'Draft')
    return filtered;
  }, [cachedDoctors, selected])

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return doctorsFiltered.slice(start, start + pageSize);
  }, [doctorsFiltered, page, pageSize]);

  const handleRowClick = (doc) => {
    navigate(`/hospital/doctor/${encodeURIComponent(doc.userId || doc.id)}`, { state: { doctor: doc } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-grey50">
        <UniversalLoader size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-secondary-grey50">
      <div className="shrink-0 mt-2">
        <Header
          counts={counts}
          selected={selected}
          onChange={setSelected}
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
            { key: 'draft', label: 'Draft' }
          ]}
          addLabel="Add New Doctor"
        />
      </div>

      <div className="h-[calc(100vh-140px)] overflow-hidden m-3 border border-gray-200 rounded-lg shadow-sm bg-white">
        {doctorsFiltered.length > 0 ? (
          <SampleTable
            columns={doctorColumns}
            data={pagedData}
            page={page}
            pageSize={pageSize}
            total={doctorsFiltered.length}
            onPageChange={setPage}
            stickyLeftWidth={335}
            stickyRightWidth={120}
            onRowClick={handleRowClick}
            hideSeparators={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-secondary-grey300 font-medium">No doctor</span>
          </div>
        )}
      </div>
    </div>
  )
}
