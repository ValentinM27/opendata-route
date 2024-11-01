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
