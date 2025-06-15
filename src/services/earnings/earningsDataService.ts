
import { supabase } from '@/integrations/supabase/client'
import { DoctorDailyEarnings, DoctorTotalEarnings } from '@/types/earnings'

export async function fetchDailyEarnings(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<DoctorDailyEarnings[]> {
  let query = supabase
    .from('doctor_daily_earnings')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching daily earnings:', error)
    throw error
  }

  console.log('📊 Daily earnings fetched:', data?.length || 0, 'records')
  return data || []
}

export async function fetchTotalEarnings(userId: string): Promise<DoctorTotalEarnings[]> {
  console.log('🔍 Fetching total earnings for user:', userId)
  
  const { data, error } = await supabase
    .from('doctor_total_earnings')
    .select('*')
    .eq('user_id', userId)
    .order('total_amount', { ascending: false })

  if (error) {
    console.error('❌ Error fetching total earnings:', error)
    throw error
  }

  console.log('📊 Total earnings fetched:', {
    recordsCount: data?.length || 0,
    records: data?.map(d => ({
      doctorName: d.doctor_name,
      totalAmount: d.total_amount,
      totalAppointments: d.total_appointments
    }))
  })

  return data || []
}
