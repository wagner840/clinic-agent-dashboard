
import { supabase } from '@/integrations/supabase/client'
import { DailyEarningsData, TotalEarningsData } from '@/types/historicalEarnings'

export class EarningsDataSaver {
  static async saveEarningsData(
    dailyEarnings: DailyEarningsData[], 
    totalEarnings: TotalEarningsData[]
  ): Promise<void> {
    console.log('💾 Saving earnings data to database...')
    
    // Save daily earnings
    if (dailyEarnings.length > 0) {
      const { error: dailyInsertError } = await supabase
        .from('doctor_daily_earnings')
        .insert(dailyEarnings)

      if (dailyInsertError) {
        console.error('Error inserting daily earnings:', dailyInsertError)
        throw dailyInsertError
      }
    }

    // Save total earnings
    if (totalEarnings.length > 0) {
      const { error: totalInsertError } = await supabase
        .from('doctor_total_earnings')
        .insert(totalEarnings)

      if (totalInsertError) {
        console.error('Error inserting total earnings:', totalInsertError)
        throw totalInsertError
      }
    }

    console.log('✅ All earnings data saved successfully')
  }
}
