import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import './Profile.css';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Standard user fields
  const [userData, setUserData] = useState({ username: '', email: '', roleName: '' });
  
  // Profile specific fields
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const resp = await axiosClient.get('/users/me/profile');
      if (resp.status === 'success') {
        const { user, profile } = resp.data;
        setUserData({
          username: user.username,
          email: user.email,
          roleName: user.roleId?.name || 'Unknown'
        });
        
        if (profile) {
          // format date for date-type input
          let dob = '';
          if (profile.dob) {
            dob = new Date(profile.dob).toISOString().split('T')[0];
          }
          setProfileData({ ...profile, dob });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Không tải được hồ sơ.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        username: userData.username,
        ...profileData
      };
      
      const resp = await axiosClient.put('/users/me/profile', payload);
      if (resp.status === 'success') {
        setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
        
        // Update local storage user name
        const locUser = JSON.parse(localStorage.getItem('user'));
        if (locUser) {
          locUser.username = userData.username;
          localStorage.setItem('user', JSON.stringify(locUser));
          // Dispatch custom event to let Layout know to update header
          window.dispatchEvent(new Event('storage'));
        }
      } else {
        setMessage({ type: 'error', text: 'Có lỗi xảy ra: ' + resp.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể lưu hồ sơ' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Đang tải dữ liệu...</div>;

  const isStudent = userData.roleName === 'SINHVIEN';

  return (
    <div className="profile-container">
      <div className="profile-card glass-panel">
        <div className="profile-header">
          <div className="avatar-preview">
            {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="profile-title">Hồ Sơ Cá Nhân</h2>
          <p className="profile-subtitle">Cập nhật thông tin tài khoản của bạn</p>
        </div>

        {message.text && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="username">Họ và tên</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                value={userData.username || ''}
                onChange={handleUserChange}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={userData.email || ''}
                disabled
                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Vai trò hệ thống</label>
            <input
              type="text"
              className="form-input"
              value={userData.roleName}
              disabled
              style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', fontWeight: 'bold' }}
            />
          </div>

          <hr style={{ margin: '1.5rem 0', borderColor: 'var(--glass-border)' }} />

          {isStudent ? (
            /* Bảng cập nhật cho SINH VIÊN */
            <div className="grid-2">
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label htmlFor="mssv">Mã Số Sinh Viên (MSSV)</label>
                <input
                  type="text"
                  id="mssv"
                  name="mssv"
                  className="form-input"
                  value={profileData.mssv || ''}
                  onChange={handleProfileChange}
                  placeholder="Ví dụ: 12345678"
                  required
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label htmlFor="gender">Giới tính</label>
                <select
                  id="gender"
                  name="gender"
                  className="form-input"
                  value={profileData.gender || 'other'}
                  onChange={handleProfileChange}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label htmlFor="dob">Ngày sinh</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  className="form-input"
                  value={profileData.dob || ''}
                  onChange={handleProfileChange}
                />
              </div>
            </div>
          ) : (
            /* Bảng cập nhật cho GIẢNG VIÊN */
            <div className="grid-2">
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label htmlFor="giangVienCode">Mã Giảng Viên</label>
                <input
                  type="text"
                  id="giangVienCode"
                  name="giangVienCode"
                  className="form-input"
                  value={profileData.giangVienCode || ''}
                  onChange={handleProfileChange}
                  placeholder="Ví dụ: GV-102"
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label htmlFor="hocHam">Học Hàm / Học Vị</label>
                <input
                  type="text"
                  id="hocHam"
                  name="hocHam"
                  className="form-input"
                  value={profileData.hocHam || ''}
                  onChange={handleProfileChange}
                  placeholder="Ví dụ: ThS, TS, PGS.TS"
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label htmlFor="khoa">Khoa Công Tác</label>
                <input
                  type="text"
                  id="khoa"
                  name="khoa"
                  className="form-input"
                  value={profileData.khoa || ''}
                  onChange={handleProfileChange}
                  placeholder="Ví dụ: Khoa CNTT"
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-success" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
