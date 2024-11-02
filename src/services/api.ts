import { ElLoading } from "element-plus";

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

export const getWithLoader = async <T>(url: string): Promise<T> => {
  const loading = ElLoading.service();

  return get<T>(url).finally(() => setTimeout(() => loading.close(), 200));
};
