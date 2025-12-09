import axios from 'axios';


const axiosClient = axios.create({
  baseURL: "https://api.tvkmembers.com/api/v1", //change here if API domain or version changes
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient; 