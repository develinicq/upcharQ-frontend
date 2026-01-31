import React from 'react'
import { useNavigate } from 'react-router-dom';
import InfoBox from "../components/GetStarted/InfoBox";

const GetStarted = () => {
  const navigate = useNavigate();

  const handleHospitalRegistration = () => {
    navigate('/register/hospital');
  };

  const handleDoctorRegistration = () => {
    navigate('/register/doctor');
  };

  const handleHospitalLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex p-3 bg-white">
      
      <div className="flex-1 flex flex-col justify-center items-center">
        
        <div className="mb-7">
          <img 
            className="max-w-[160px] h-auto object-contain" 
            src="logo.png" 
            alt="logo" 
          />
        </div>

        <div className='text-center mb-8 flex flex-col gap-[1px]'>
            <span className="text-[36px] font-bold text-[#424242]">
          Healthcare Management System
            </span>
            <span className="text-[16px] font-normal text-[#626060]">
            Secure, compliant, and efficient hospital management platform
            </span>
        </div>
        

        <div className="flex flex-col gap-6 w-full max-w-[500px]">
          <InfoBox
            title="Hospital Registration"
            description="Register your hospital with our secure platform"
            steps={[
              {
                heading: "Basic Information Collection",
                text: "Hospital details and ROHINI ID verification",
              },
              {
                heading: "Admin Account Creation",
                text: "Set up primary administrator with secure access",
              },
              {
                heading: "Verification & Compliance",
                text: "Document verification and regulatory compliance",
              }
            ]}
            buttonText="Start Registration"
            buttonVariant="primary"
            onClick={handleHospitalRegistration}
          />
          
          <InfoBox
            title="Doctor Registration"
            description="Join our network of healthcare professionals"
            steps={[
              {
                heading: "Account Creation",
                text: "Personal and professional information setup",
              },
              {
                heading: "Document Verification",
                text: "Medical council registration and credentials",
              },
              {
                heading: "Profile Completion",
                text: "Specialization and practice details",
              }
            ]}
            buttonText="Register as Doctor"
            buttonVariant="primary"
            onClick={handleDoctorRegistration}
          />
          
          <InfoBox
            title="Hospital Login"
            description="Secure access to your hospital management system"
            steps={[
              {
                heading: "Secure Authentication",
                text: "Email/mobile & password with MFA protection",
              },
              {
                heading: "Role-Based Access",
                text: "Customized access based on staff roles",
              },
              {
                heading: "Enhanced Security",
                text: "IP whitelisting and session management",
              }
            ]}
            buttonText="Login to Dashboard"
            buttonVariant="secondary"
            onClick={handleHospitalLogin}
          />
        </div>
      </div>

      <div className="flex-1 bg-blue-600 flex items-center justify-center rounded-lg">
        <div className="text-white text-lg">Image Placeholder</div>
      </div>
    </div>
  )
}

export default GetStarted
