import axios from "axios"

import { fetchAuthSession } from "aws-amplify/auth"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use(async (config) => {

  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  if(token && config.headers){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api