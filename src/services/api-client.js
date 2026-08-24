import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://awqatapi.vercel.app/api/",
});

export default apiClient;