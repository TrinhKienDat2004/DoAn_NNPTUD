import { Outlet, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, LogOut, FileText } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">
          <BookOpen />
          <span>Edu Portal</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={20} /> Dashboard
          </Link>
          <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={20} /> Cá nhân
          </Link>
          <Link to="/courses" className={`nav-item ${location.pathname === '/courses' ? 'active' : ''}`}>
            <FileText size={20} /> Môn Học
          </Link>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} /> Đăng xuất
        </button>
      </aside>
      <main className="main-wrapper">
        <header className="top-header">
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{user?.username || 'User'}</span>
              <span className="user-role">{user?.roleName || 'Unknown Role'}</span>
            </div>
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
