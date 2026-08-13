const pad = (value) => String(value).padStart(2, '0')

const formatDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const timeSlots = Array.from({ length: 26 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60
  const endMinutes = totalMinutes + 30

  return {
    start: `${pad(hour)}:${pad(minute)}`,
    end: `${pad(Math.floor(endMinutes / 60))}:${pad(endMinutes % 60)}`,
  }
})

export const fixedDates = (() => {
  const dates = []
  const current = new Date(2026, 7, 12)
  const last = new Date(2026, 9, 3)

  while (current <= last) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
})()

export const fixedScheduleCandidates = fixedDates.flatMap((date) =>
  timeSlots.map(({ start, end }) => ({
    id: `${date}-${start}`,
    date,
    start,
    end,
  })),
)
