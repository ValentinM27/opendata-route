import { ElLoading } from "element-plus";
export const get = async <T>(url: string): Promise<T> => {
  const loading = ElLoading.service();

  return fetch(url)
    .then((res) => {
      if (res.ok) {
        return res;
      }
    })
    .then((data) => {
      return data?.json();
    })
    .finally(() => setTimeout(() => loading.close(), 200));
};
