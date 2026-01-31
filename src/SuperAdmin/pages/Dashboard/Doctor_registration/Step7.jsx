import React from 'react';
import RegistrationSuccess from '../../../../components/RegistrationSuccess';
import useDoctorStep1Store from '../../../../store/useDoctorStep1Store';

const Step7 = () => {
  const { firstName, lastName } = useDoctorStep1Store();
  const doctorName = firstName && lastName ? `Dr. ${firstName} ${lastName}` : 'Doctor';

  return (
    <div className="h-full bg-white">
      <RegistrationSuccess name={doctorName} />
    </div>
  )
};

export default Step7;