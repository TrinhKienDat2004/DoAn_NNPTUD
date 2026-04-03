import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import Sections from './pages/Sections';
import Enrollments from './pages/Enrollments';
import Assignments from './pages/Assignments';
import Grades from './pages/Grades';

const Dashboard = () => (
  <div>
    <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Dashboard</h1>
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <p>Chào mừng bạn đã đăng nhập thành công vào Hệ thống Quản lý Đào tạo.</p>
    </div>
  </div>
);

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
