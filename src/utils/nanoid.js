export const nanoid = (len = 10) =>
  Math.random().toString(36).slice(2, 2 + len)
