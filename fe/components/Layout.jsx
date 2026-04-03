import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, FileText, User, LogOut, ClipboardList, CheckSquare, Award } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const [user, setUser] = useState(() => {
    try { return userStr ? JSON.parse(userStr) : null; }
    catch { return null; }
  });

  // Guard: chờ user load xong mới render
  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888' }}>
        Đang tải...
      </div>
    );
  }

  useEffect(() => {
    const handleStorage = () => {
      const updatedUserStr = localStorage.getItem('user');
      if (updatedUserStr) {
        setUser(JSON.parse(updatedUserStr));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const canManageCourses = ['Quản trị viên', 'Giảng viên'].includes(user?.roleName);

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">
          <BookOpen />
          <span>Edu Portal</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={20} /> Trang Chủ
          </Link>

          {canManageCourses && (
            <>
              <div className="nav-label">Quản lý</div>
              <Link to="/courses" className={`nav-item ${location.pathname === '/courses' ? 'active' : ''}`}>
                <FileText size={20} /> Môn Học
              </Link>
              <Link to="/sections" className={`nav-item ${location.pathname === '/sections' ? 'active' : ''}`}>
                <Users size={20} /> Lớp HP
              </Link>
            </>
          )}

          <Link to="/enrollments" className={`nav-item ${location.pathname === '/enrollments' ? 'active' : ''}`}>
            <ClipboardList size={20} /> Đăng Ký HP
          </Link>

          <div className="nav-label">Học Tập</div>
          <Link to="/assignments" className={`nav-item ${location.pathname === '/assignments' ? 'active' : ''}`}>
            <CheckSquare size={20} /> Bài Tập
          </Link>
          <Link to="/grades" className={`nav-item ${location.pathname === '/grades' ? 'active' : ''}`}>
            <Award size={20} /> Điểm
          </Link>

          <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={20} /> Cá nhân
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
