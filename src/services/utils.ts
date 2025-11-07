export const divideArray = <T>(arr: T[]) => {
  const length = arr.length;

  if (length === 0) {
    return { start: [], body: [], end: [] };
  } else if (length === 1) {
    return { start: [arr[0]], body: [], end: [] };
  } else if (length === 2) {
    return { start: [arr[0]], body: [], end: [arr[1]] };
  }

  const start = [arr[0]];
  const body = arr.slice(1, length - 1);
  const end = [arr[length - 1]];

  return { start, body, end };
};

export const formatNumber = (number: number, fraction: number) => {
  return Intl.NumberFormat("fr-FR", { maximumFractionDigits: fraction }).format(number);
};

export const convertDurationToString = (duration: number) => {
  const totalSeconds = duration * 3600;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let durationToString = "";

  if (hours > 0) {
    durationToString = `${hours} h `;
  }

  durationToString += `${minutes} min`;

  return durationToString;
};
