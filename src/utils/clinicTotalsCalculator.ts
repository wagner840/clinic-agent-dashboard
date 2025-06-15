
import { DoctorTotalEarnings, ClinicTotals } from '@/types/earnings'

export function calculateClinicTotals(totalEarnings: DoctorTotalEarnings[]): ClinicTotals {
  const totals = totalEarnings.reduce((acc, doctor) => ({
    totalAmount: acc.totalAmount + doctor.total_amount,
    totalAppointments: acc.totalAppointments + doctor.total_appointments,
    insuranceAmount: acc.insuranceAmount + doctor.insurance_amount,
    insuranceAppointments: acc.insuranceAppointments + doctor.insurance_appointments,
    privateAmount: acc.privateAmount + doctor.private_amount,
    privateAppointments: acc.privateAppointments + doctor.private_appointments
  }), {
    totalAmount: 0,
    totalAppointments: 0,
    insuranceAmount: 0,
    insuranceAppointments: 0,
    privateAmount: 0,
    privateAppointments: 0
  })

  console.log('🏥 Clinic totals calculated:', totals)
  return totals
}
