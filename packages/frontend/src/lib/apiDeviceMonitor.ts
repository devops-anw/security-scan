import axios from "axios";

const createApi = (orgKey: string) => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_CONSOLE_API_URL,
    headers: {
      "X-Org-Key": orgKey,
    },
  });
};

export default createApi;
