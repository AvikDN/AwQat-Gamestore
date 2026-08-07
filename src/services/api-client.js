import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://awqatapi-production.up.railway.app/api/",
});

export default apiClient;