import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getPublicUrl } from '@/services/uploadsService'
import AvatarCircle from '@/components/AvatarCircle'

const HospitalDoctorBanner = ({ doctor }) => {
    const [resolvedBanner, setResolvedBanner] = useState('')
    const [resolvedProfile, setResolvedProfile] = useState('')
    const navigate = useNavigate()

    const bannerKey = doctor?.coverImage || doctor?.bannerImage
    const profileKey = doctor?.image || doctor?.profileImage || doctor?.personalInfo?.photo

    useEffect(() => {
        let ignore = false

        const run = async () => {
            try {
                const [b, p] = await Promise.all([
                    bannerKey ? getPublicUrl(bannerKey) : null,
                    profileKey ? getPublicUrl(profileKey) : null,
                ])
                if (!ignore) {
                    setResolvedBanner(b || '')
                    setResolvedProfile(p || '')
                }
            } catch {
                if (!ignore) {
                    setResolvedBanner('')
                    setResolvedProfile('')
                }
            }
        }

        run()
        return () => (ignore = true)
    }, [bannerKey, profileKey])

    return (
        <div className="bg-secondary-grey50 pb-3">
            {/* Banner wrapper gives space for avatar overlap */}
            <div className="relative h-[180px]">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-7 h-7 z-20 bg-white p-1 rounded-sm shadow-md hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={19} className="text-gray-700" />
                </button>

                {/* Banner image */}
                <div className="h-[140px] w-full overflow-hidden">
                    <img
                        src={resolvedBanner || '/hospital-sample.png'}
                        className="h-full w-full object-cover"
                        alt="Doctor Banner"
                        onError={(e) => {
                            e.currentTarget.src = '/hospital-sample.png'
                        }}
                    />
                </div>

                {/* Avatar – overlaps bottom center */}
                <div className="absolute left-1/2 top-[140px] -translate-x-1/2 -translate-y-1/2 w-[104px] h-[104px]">
                    <div className="w-full h-full border-[7px] border-white rounded-full overflow-hidden bg-white flex items-center justify-center">
                        {resolvedProfile ? (
                            <img
                                src={resolvedProfile}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <AvatarCircle
                                name={doctor?.name || 'D'}
                                size="xl"
                                className="w-full h-full text-[2rem]"
                                color="blue"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HospitalDoctorBanner
