
import { PaymentWithAppointment, DailyEarningsData, TotalEarningsData } from '@/types/historicalEarnings'

export class EarningsDataProcessor {
  static processPaymentsIntoEarnings(
    payments: PaymentWithAppointment[], 
    userId: string
  ): { daily: DailyEarningsData[], total: TotalEarningsData[] } {
    console.log(`🔄 Processing ${payments.length} payments into earnings data...`)
    
    const dailyEarningsMap = new Map<string, DailyEarningsData>()
    const totalEarningsMap = new Map<string, TotalEarningsData>()

    payments.forEach((payment) => {
      const appointment = payment.appointments
      const paymentDate = new Date(appointment.start_time).toISOString().split('T')[0]
      const doctorName = appointment.doctor_name
      const doctorEmail = appointment.doctor_email
      const amount = Number(payment.amount)
      const isInsurance = payment.is_insurance

      // Process daily earnings
      this.processDailyEarnings({
        dailyEarningsMap,
        userId,
        doctorName,
        doctorEmail,
        paymentDate,
        amount,
        isInsurance
      })

      // Process total earnings
      this.processTotalEarnings({
        totalEarningsMap,
        userId,
        doctorName,
        doctorEmail,
        paymentDate,
        amount,
        isInsurance
      })
    })

    const dailyEarningsArray = Array.from(dailyEarningsMap.values())
    const totalEarningsArray = Array.from(totalEarningsMap.values())

    console.log(`📈 Processed ${dailyEarningsArray.length} daily earnings records`)
    console.log(`👨‍⚕️ Processed ${totalEarningsArray.length} doctors`)

    return {
      daily: dailyEarningsArray,
      total: totalEarningsArray
    }
  }

  private static processDailyEarnings({
    dailyEarningsMap,
    userId,
    doctorName,
    doctorEmail,
    paymentDate,
    amount,
    isInsurance
  }: {
    dailyEarningsMap: Map<string, DailyEarningsData>
    userId: string
    doctorName: string
    doctorEmail: string
    paymentDate: string
    amount: number
    isInsurance: boolean
  }): void {
    const dailyKey = `${doctorName}-${paymentDate}`
    
    if (!dailyEarningsMap.has(dailyKey)) {
      dailyEarningsMap.set(dailyKey, {
        user_id: userId,
        doctor_name: doctorName,
        doctor_email: doctorEmail,
        date: paymentDate,
        total_amount: 0,
        total_appointments: 0,
        insurance_amount: 0,
        insurance_appointments: 0,
        private_amount: 0,
        private_appointments: 0
      })
    }

    const dailyData = dailyEarningsMap.get(dailyKey)!
    dailyData.total_amount += amount
    dailyData.total_appointments += 1
    
    if (isInsurance) {
      dailyData.insurance_amount += amount
      dailyData.insurance_appointments += 1
    } else {
      dailyData.private_amount += amount
      dailyData.private_appointments += 1
    }
  }

  private static processTotalEarnings({
    totalEarningsMap,
    userId,
    doctorName,
    doctorEmail,
    paymentDate,
    amount,
    isInsurance
  }: {
    totalEarningsMap: Map<string, TotalEarningsData>
    userId: string
    doctorName: string
    doctorEmail: string
    paymentDate: string
    amount: number
    isInsurance: boolean
  }): void {
    if (!totalEarningsMap.has(doctorName)) {
      totalEarningsMap.set(doctorName, {
        user_id: userId,
        doctor_name: doctorName,
        doctor_email: doctorEmail,
        total_amount: 0,
        total_appointments: 0,
        insurance_amount: 0,
        insurance_appointments: 0,
        private_amount: 0,
        private_appointments: 0,
        first_appointment_date: paymentDate,
        last_appointment_date: paymentDate
      })
    }

    const totalData = totalEarningsMap.get(doctorName)!
    totalData.total_amount += amount
    totalData.total_appointments += 1
    
    if (isInsurance) {
      totalData.insurance_amount += amount
      totalData.insurance_appointments += 1
    } else {
      totalData.private_amount += amount
      totalData.private_appointments += 1
    }

    // Update date ranges
    if (paymentDate < totalData.first_appointment_date) {
      totalData.first_appointment_date = paymentDate
    }
    if (paymentDate > totalData.last_appointment_date) {
      totalData.last_appointment_date = paymentDate
    }
  }
}
