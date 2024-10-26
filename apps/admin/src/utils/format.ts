export function formatDate(str_date: string): string {
  if (!str_date) return '-'

  const now = new Date(str_date)

  if (!now) return '-'

  const year = now.getFullYear()
  const month = ('0' + (now.getMonth() + 1)).substr(-2)
  const day = ('0' + now.getDay()).substr(-2)

  return `${day}/${month}/${year}`
}