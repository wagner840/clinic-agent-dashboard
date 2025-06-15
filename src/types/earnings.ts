
export interface DoctorDailyEarnings {
  id: string
  doctor_name: string
  doctor_email: string
  date: string
  total_amount: number
  total_appointments: number
  insurance_amount: number
  insurance_appointments: number
  private_amount: number
  private_appointments: number
}

export interface DoctorTotalEarnings {
  id: string
  doctor_name: string
  doctor_email: string
  total_amount: number
  total_appointments: number
  insurance_amount: number
  insurance_appointments: number
  private_amount: number
  private_appointments: number
  first_appointment_date: string | null
  last_appointment_date: string | null
}

export interface ClinicTotals {
  totalAmount: number
  totalAppointments: number
  insuranceAmount: number
  insuranceAppointments: number
  privateAmount: number
  privateAppointments: number
}
