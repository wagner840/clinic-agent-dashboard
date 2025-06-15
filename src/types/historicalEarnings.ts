
export interface PaymentWithAppointment {
  id: string
  amount: number
  is_insurance: boolean
  appointment_id: string
  created_at: string
  user_id: string
  appointments: {
    doctor_name: string
    doctor_email: string
    start_time: string
  }
}

export interface DailyEarningsData {
  user_id: string
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

export interface TotalEarningsData {
  user_id: string
  doctor_name: string
  doctor_email: string
  total_amount: number
  total_appointments: number
  insurance_amount: number
  insurance_appointments: number
  private_amount: number
  private_appointments: number
  first_appointment_date: string
  last_appointment_date: string
}
