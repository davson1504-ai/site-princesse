export const availabilityConfig = {
  timezone: "Europe/Paris",
  openDays: [1, 2, 3, 4, 5, 6],
  openingTime: "09:00",
  closingTime: "19:00",
  breaks: [{ start: "13:00", end: "14:00" }],
  minimumLeadHours: 12,
  bufferMinutes: 15,
  slotStepMinutes: 30,
} as const;
