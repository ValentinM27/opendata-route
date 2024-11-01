export const get = (url: string) => {
  return fetch(url)
    .then((res) => {
      if (res.ok) {
        return res;
      }
    })
    .then((data) => {
      return data?.json();
    });
};
