// API service placeholder
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const getDashboard = () => {
  return API.get("/dashboard");
};

export const getAssets = () => {
  return API.get("/assets");
};

export const getActivity = () => {
  return API.get("/activity");
};

export default API;