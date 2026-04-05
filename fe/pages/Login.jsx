import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import Toast from '../components/Toast';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Thay thế error state bằng toastConfig
  const [toastConfig, setToastConfig] = useState({ message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect to Dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Hàm tiện ích để gọi Toast nhanh
  const showToast = (message, type = 'error') => {
    setToastConfig({ message, type });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Vui lòng nhập Email và Mật khẩu.', 'error');
      return;
    }
    setLoading(true);

    try {
      const resp = await axiosClient.post('/auth/login', { email, password });
      
      if (resp.status === 'success') {
        localStorage.setItem('token', resp.data.token);
        localStorage.setItem('user', JSON.stringify(resp.data.user));
        navigate('/');
      } else {
        showToast(resp.message || 'Đăng nhập thất bại.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Đã có lỗi xảy ra từ máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Component Toast được đặt ở ngoài cùng container */}
      <Toast 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onClose={() => setToastConfig({ message: '', type: 'info' })} 
      />

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
             {/* Nếu muốn dùng icon LogIn đã import, bạn có thể uncomment dòng dưới */}
             {/* <LogIn size={32} /> */}
          </div>
          <h2 className="login-title">Chào mừng trở lại</h2>
          <p className="login-subtitle">Đăng nhập để vào Hệ thống Quản lý Đào tạo</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="email">Địa chỉ Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              required
            />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={"••••••••"}
              required
            />
          </div>
          <button type="submit" className="btn-primary login-submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-footer">
          Chưa có tài khoản? <Link to="/register" className="login-link">Tạo ngay</Link>
        </div>
      </div>
    </div>
  );
}