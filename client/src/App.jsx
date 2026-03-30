import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';

// Placeholder Pages
const Dashboard = () => (
  <div>
    <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Dashboard Vui Lòng Cập Nhật Dữ Liệu</h1>
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <p>Chào mừng bạn đã đăng nhập thành công vào Hệ thống Đăng ký Học phần.</p>
      <p>Các thành viên 2, 3, 4 sẽ tiếp tục code các tính năng còn lại tại đây!</p>
    </div>
  </div>
);

const Profile = () => (
  <div>
    <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Trang Cá Nhân</h1>
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <p>Cập nhật thông tin Sinh viên / Giảng viên tại đây.</p>
    </div>
  </div>
);

const Courses = () => (
  <div>
    <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Danh Sách Môn Học</h1>
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <p>Giao diện Đăng ký học phần...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes directly using Layout component */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="courses" element={<Courses />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
