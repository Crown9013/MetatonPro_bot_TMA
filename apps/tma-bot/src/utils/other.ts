
export const isOverDailyRewardPeriod = (date1:string | Date, date2:string | Date) => {
  var second = 1000, minute = second * 60, hour = minute * 60, day = hour * 24;
  const fstDateObj = new Date(date1)
  const sndDateObj = new Date(date2)
  var timeDiff = sndDateObj.getTime() - fstDateObj.getTime();
  if (isNaN(timeDiff)) return false

  const sndYear = sndDateObj.getFullYear()
  const sndMonth = sndDateObj.getMonth()
  const sndDate = sndDateObj.getDate()

  const fstYear = fstDateObj.getFullYear()
  const fstMonth = fstDateObj.getMonth()
  const fstDate = fstDateObj.getDate()

  var dayDiff = 12 * 31 * (sndYear - fstYear) + 31 * (sndMonth - fstMonth) + sndDate - fstDate
  
  if (dayDiff >= 1) {
    return true
  }
  return false
}