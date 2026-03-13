import { useEffect, useState } from "react"
import { useAuth } from '../auth';
import api from '../api/apiClient';

export default function Dashboard() {
    const { user } = useAuth();
    const [message, setMessage] = useState<String>()
    
    useEffect(() => {
        async function loadData() {
            try {
                const response = await api.get("/test")
                setMessage(response.data)
            } catch (error) {
                console.error("API error:", error)
            }
        }

    loadData()
    }, [])
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {user?.signInDetails?.loginId}</p>
      <p>{message}</p>
    </div>
  );
}