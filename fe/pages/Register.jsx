import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import './Login.css'; // Reuse styles
import './Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleName: 'SINHVIEN'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const resp = await axiosClient.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        roleName: formData.roleName
      });
      
      if (resp.status === 'success') {
        // Sau khi đăng ký thành công → chuyển sang trang đăng nhập
        navigate('/login');
      } else {
        setError(resp.message || 'Đăng ký thất bại.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="login-header">
          <div className="login-icon">
            <UserPlus size={28} />
          </div>
          <h2 className="login-title">Tạo Tài Khoản</h2>
          <p className="login-subtitle">Tham gia hệ thống với vai trò Sinh viên hoặc Giảng viên</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="username">Họ và Tên</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập họ tên đầy đủ"
              required
              minLength={3}
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="email">Địa chỉ Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="roleName">Vai Trò</label>
            <select
              id="roleName"
              name="roleName"
              className="select-input"
              value={formData.roleName}
              onChange={handleChange}
            >
              <option value="SINHVIEN">Sinh viên</option>
              <option value="GIANGVIEN">Giảng viên</option>
            </select>
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder={"••••••••"}
              required
              minLength={6}
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="confirmPassword">Nhập lại Mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={"••••••••"}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary login-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>

        <div className="login-footer">
          Đã có tài khoản? <Link to="/login" className="login-link">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
