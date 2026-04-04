import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axiosClient from './api/axiosClient';

import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import Sections from './pages/Sections';
import Enrollments from './pages/Enrollments';
import Assignments from './pages/Assignments';
import Grades from './pages/Grades';

const Dashboard = () => {
  const [stats, setStats] = useState({ courses: 0, enrollments: 0 });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Gọi song song 2 API lấy Môn học và Thông báo
        const [coursesRes, notifRes] = await Promise.all([
          axiosClient.get('/courses'),
          axiosClient.get('/notifications')
        ]);
        
        setStats({
          courses: coursesRes.data?.length || 0,
          enrollments: 0 // Có thể nâng cấp gọi API lấy count enrollment sau
        });
        
        setNotifications(notifRes.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu Dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p style={{ padding: '2rem' }}>Đang tải dữ liệu bảng điều khiển...</p>;

  return (
    <div>
      <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Dashboard Tổng Quan</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="glass-panel" style={{ padding: '2rem', flex: 1, textAlign: 'center' }}>
          <h3>Tổng số Khóa học</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', margin: '10px 0' }}>
            {stats.courses}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', flex: 1, textAlign: 'center' }}>
          <h3>Thông báo chưa đọc</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444', margin: '10px 0' }}>
            {notifications.filter(n => !n.isRead).length}
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '15px' }}>Thông báo cá nhân</h3>
        {notifications.length === 0 ? (
          <p>Chưa có thông báo nào.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {notifications.map(notif => (
              <li key={notif._id} style={{ 
                padding: '12px', 
                marginBottom: '10px',
                borderRadius: '8px',
                border: '1px solid #eee',
                backgroundColor: notif.isRead ? 'transparent' : '#f0fdf4' 
              }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>
                  {notif.title} {notif.isRead ? '' : <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>(Mới)</span>}
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                  {notif.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="courses" element={<Courses />} />
          <Route path="sections" element={<Sections />} />
          <Route path="enrollments" element={<Enrollments />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="grades" element={<Grades />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;