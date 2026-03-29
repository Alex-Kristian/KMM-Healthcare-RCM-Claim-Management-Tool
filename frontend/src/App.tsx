import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth';
import Layout from './components/Layout';
import Claims from './pages/Claims';
import Analytics from './pages/Analytics';


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/claims" replace />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/*" element={<Navigate to="/claims" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

