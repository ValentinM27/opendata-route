export const get = async <T>(url: string): Promise<T> => {
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
