import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth';
import UploadModal from '../components/UploadModal';
import kmm_logo from '../assets/kmm_logo.jpg';
 
interface LayoutProps {
  children: React.ReactNode;
}
 
const NAV_ITEMS = [
  { to: '/claims',    icon: 'bi-file-medical', label: 'Healthcare Claims'  },
  { to: '/analytics', icon: 'bi-bar-chart-line', label: 'Payer Performance' },
];
 
export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
 
  return (
    <div className="d-flex flex-column vh-100 overflow-hidden">
 
      {/* Top Navbar */}
      <nav className="navbar bg-white border-bottom px-4 flex-shrink-0" style={{ minHeight: 56, padding: 0 }}>
        <span className="navbar-brand mb-0">
          <img
            src={kmm_logo}
            alt="RCM Dashboard"
            style={{ height: 56, width: 'auto', objectFit: 'contain' }}
          />
        </span>
 
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted" style={{ fontSize: 13 }}>
            <i className="bi bi-person-circle me-1" />
            {user?.signInDetails?.loginId}
          </span>
          <button className="btn btn-outline-danger btn-sm" onClick={signOut}>
            <i className="bi bi-box-arrow-right me-1" />
            Sign out
          </button>
        </div>
      </nav>
 
      {/* Body */}
      <div className="d-flex flex-grow-1 overflow-hidden">
 
        {/* Sidebar */}
        <div
          className="bg-white border-end d-flex flex-column flex-shrink-0"
          style={{
            width: collapsed ? 60 : 220,
            transition: 'width 0.2s ease',
            overflow: 'hidden',
          }}
        >
          {/* Sidebar toolbar */}
          <div className="d-flex align-items-center px-2 py-2 border-bottom justify-content-between">
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center flex-shrink-0"
              onClick={() => setCollapsed(!collapsed)}
              style={{ width: 36, height: 36 }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <i className="bi bi-list" style={{ fontSize: 16 }} />
            </button>
 
            {!collapsed && (
              <button
                className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center flex-shrink-0"
                onClick={() => setShowModal(true)}
                style={{ width: 36, height: 36 }}
                title="Upload data"
              >
                <i className="bi bi-upload" style={{ fontSize: 14 }} />
              </button>
            )}
          </div>
 
          {/* Nav links */}
          <nav className="d-flex flex-column pt-2">
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `d-flex align-items-center gap-2 px-3 py-2 text-decoration-none fw-medium ${
                    isActive
                      ? ''
                      : 'text-secondary'
                  }`
                }
                style={({ isActive }) => ({
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s',
                  color: isActive ? '#1A5BB0' : undefined,
                  backgroundColor: isActive ? '#1A5BB010' : undefined,
                })}
              >
                <i className={`bi ${icon} flex-shrink-0`} style={{ fontSize: 16 }} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
 
        {/* Main Content */}
        <div className="flex-grow-1 overflow-auto">
          {children}
        </div>
      </div>
 
      <UploadModal
        show={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}