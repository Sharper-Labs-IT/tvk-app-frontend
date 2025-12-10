import axios from 'axios';
import Cookies from 'js-cookie';


const axiosClient = axios.create({
  baseURL: "https://api.tvkmembers.com/api/v1", //change here if API domain or version changes 
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  }, 
});

//attach auto header, if token exist in cookies
axiosClient.interceptors.request.use((config => {
  const token = Cookies.get('authToken');

  if(token){
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}))

export default axiosClient; 