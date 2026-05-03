// Returns YYYY-MM-DD in the device's local timezone for a given Date object or ISO string.
export const localDateOf = (dateOrStr) => {
  const d = dateOrStr instanceof Date ? dateOrStr : new Date(dateOrStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const localToday = () => localDateOf(new Date())
