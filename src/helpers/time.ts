export const getDateAsTimeString = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const getCurrentDateAsTimeString = (): string => {
  const now = new Date();
  return getDateAsTimeString(now);
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const minutesInHour = 60;
const secondsInMinute = 60;
const millisecondsInSecond = 1000;

export const hoursToMilliseconds = (hours: number) =>
  hours * minutesInHour * secondsInMinute * millisecondsInSecond;
