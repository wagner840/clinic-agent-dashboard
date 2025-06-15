
import { HistoricalDataFetcher } from './historicalDataFetcher'
import { EarningsDataProcessor } from './earningsDataProcessor'
import { EarningsDataSaver } from './earningsDataSaver'

export class HistoricalEarningsRecalculationService {
  static async recalculateHistoricalEarnings(userId: string): Promise<{
    paymentsCount: number
    doctorsCount: number
  }> {
    console.log('🔄 Starting historical earnings recalculation...')
    
    // 1. Clear existing earnings data
    await HistoricalDataFetcher.clearExistingEarnings(userId)
    
    // 2. Fetch payments with their corresponding appointments
    const paymentsWithAppointments = await HistoricalDataFetcher.fetchPaymentsWithAppointments(userId)
    
    if (paymentsWithAppointments.length === 0) {
      throw new Error('No payments with matching appointments found')
    }
    
    // 3. Process payments into earnings data
    const { daily, total } = EarningsDataProcessor.processPaymentsIntoEarnings(
      paymentsWithAppointments, 
      userId
    )
    
    // 4. Save processed earnings data
    await EarningsDataSaver.saveEarningsData(daily, total)
    
    console.log('✅ Historical earnings recalculation completed successfully')
    
    return {
      paymentsCount: paymentsWithAppointments.length,
      doctorsCount: total.length
    }
  }
}
