export const getCurrentDateAsTimeString = (): string => {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const minutesInHour = 60;
const secondsInMinute = 60;
const millisecondsInSecond = 1000;

export const hoursToMilliseconds = (hours: number) =>
  hours * minutesInHour * secondsInMinute * millisecondsInSecond;
