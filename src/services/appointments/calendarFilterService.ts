
export class CalendarFilterService {
  /**
   * Check if a calendar is a holiday calendar
   */
  static isHolidayCalendar(calendarSummary: string): boolean {
    const holidayKeywords = ['holiday', 'feriado', 'holidays in brazil', 'feriados']
    return holidayKeywords.some(keyword => 
      calendarSummary.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  /**
   * Filter calendars to get only doctor calendars (non-primary, non-holiday)
   */
  static filterDoctorCalendars(allCalendars: any[]) {
    return allCalendars.filter(cal => {
      const isNotPrimary = !cal.primary
      const isNotHoliday = !this.isHolidayCalendar(cal.summary || '')
      
      console.log(`📅 Calendar check: "${cal.summary}" - Primary: ${cal.primary}, Holiday: ${this.isHolidayCalendar(cal.summary || '')}, Include: ${isNotPrimary && isNotHoliday}`)
      
      return isNotPrimary && isNotHoliday
    })
  }
}
