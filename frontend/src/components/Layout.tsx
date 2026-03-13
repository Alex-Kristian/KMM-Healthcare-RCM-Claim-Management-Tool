import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <NavLink to="/dashboard">Dashboard</NavLink>

        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>{user?.signInDetails?.loginId}</span>
          <button onClick={signOut}>Sign out</button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}