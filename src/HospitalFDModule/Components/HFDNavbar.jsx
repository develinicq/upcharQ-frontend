import useHospitalFrontDeskAuthStore from '../../store/useHospitalFrontDeskAuthStore'
import FDNavbar from '../../FrontDeskModule/Components/FDNavbar'
import BookWalkinAppointment2 from '../../components/Appointment/BookWalkinAppointment2'

export default function HFDNavbar() {
  return <FDNavbar useAuthStore={useHospitalFrontDeskAuthStore} BookDrawer={BookWalkinAppointment2} />
}
