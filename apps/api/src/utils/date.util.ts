export const differenceInDays = (fromDate:string | Date, toDate:string | Date) => {
  var second = 1000, minute = second * 60, hour = minute * 60, day = hour * 24;
  const fstDateObj = new Date(fromDate)
  const sndDateObj = new Date(toDate)
  var timeDiff = sndDateObj.getTime() - fstDateObj.getTime();
  if (isNaN(timeDiff)) return 0

  const sndYear = sndDateObj.getFullYear()
  const sndMonth = sndDateObj.getMonth()
  const sndDate = sndDateObj.getDate()

  const fstYear = fstDateObj.getFullYear()
  const fstMonth = fstDateObj.getMonth()
  const fstDate = fstDateObj.getDate()

  var dayDiff = 12 * 31 * (sndYear - fstYear) + 31 * (sndMonth - fstMonth) + sndDate - fstDate
  
  return dayDiff
}