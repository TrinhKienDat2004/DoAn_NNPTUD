import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Toast from '../components/Toast';
import './Profile.css';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [userData, setUserData] = useState({ username: '', email: '', roleName: '' });
  const [profileData, setProfileData] = useState({});

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const resp = await axiosClient.get('/users/me/profile');
      if (resp.status === 'success') {
        const { user, profile } = resp.data;
        setUserData({
          username: user.username || '',
          email: user.email || '',
          roleName: user.roleName || ''
        });
        if (profile) {
          const { dob } = profile;
          setProfileData({
            ...profile,
            dob: dob ? new Date(dob).toISOString().split('T')[0] : ''
          });
        }
      }
    } catch {
      setToast({ message: 'Không tải được hồ sơ.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { _id, userId, createdAt, updatedAt, isDeleted, __v, ...cleanProfile } = profileData;
      const resp = await axiosClient.put('/users/me/profile', cleanProfile);
      if (resp.status === 'success') {
        const locUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (locUser.username !== userData.username) {
          locUser.username = userData.username;
          localStorage.setItem('user', JSON.stringify(locUser));
          window.dispatchEvent(new Event('storage'));
        }
        setToast({ message: 'Cập nhật hồ sơ thành công!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Có lỗi xảy ra.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Đang tải dữ liệu...</div>;
  }

  const isAdmin = userData.roleName === 'Quản trị viên';
  const isGiangVien = userData.roleName === 'Giảng viên';
  const isSinhVien = userData.roleName === 'Sinh viên';

  return (
    <div className="profile-page">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="profile-card">
        {/* Header — tên + avatar */}
        <div className="profile-header">
          <div className="avatar-preview">
            {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="profile-username">{userData.username}</h2>
          <span className="profile-role-badge">{userData.roleName}</span>
        </div>

        {/* Thông tin cơ bản */}
        <div className="profile-chips">
          <span className="chip chip-email">{userData.email}</span>
          {profileData.mssv && <span className="chip chip-info">MSSV: {profileData.mssv}</span>}
          {profileData.giangVienCode && <span className="chip chip-info">GV: {profileData.giangVienCode}</span>}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Giảng viên */}
          {isGiangVien && (
            <>
              <p className="section-label">Thông tin giảng viên</p>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="giangVienCode">Mã Giảng Viên</label>
                  <input type="text" id="giangVienCode" name="giangVienCode" className="form-input"
                    value={profileData.giangVienCode || ''} onChange={handleProfileChange}
                    placeholder="Ví dụ: GV-102" />
                </div>
                <div className="form-group">
                  <label htmlFor="hocHam">Học Hàm / Học Vị</label>
                  <input type="text" id="hocHam" name="hocHam" className="form-input"
                    value={profileData.hocHam || ''} onChange={handleProfileChange}
                    placeholder="Ví dụ: ThS, TS, PGS.TS" />
                </div>
                <div className="form-group form-group-full">
                  <label htmlFor="khoa">Khoa Công Tác</label>
                  <input type="text" id="khoa" name="khoa" className="form-input"
                    value={profileData.khoa || ''} onChange={handleProfileChange}
                    placeholder="Ví dụ: Khoa Công nghệ thông tin" />
                </div>
              </div>
            </>
          )}

          {/* Sinh viên */}
          {isSinhVien && (
            <>
              <p className="section-label">Thông tin sinh viên</p>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="mssv">Mã Số Sinh Viên (MSSV)</label>
                  <input type="text" id="mssv" name="mssv" className="form-input"
                    value={profileData.mssv || ''} onChange={handleProfileChange}
                    placeholder="Ví dụ: 12345678" />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Giới tính</label>
                  <select id="gender" name="gender" className="form-input"
                    value={profileData.gender || 'other'} onChange={handleProfileChange}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="form-group form-group-full">
                  <label htmlFor="dob">Ngày sinh</label>
                  <input type="date" id="dob" name="dob" className="form-input"
                    value={profileData.dob || ''} onChange={handleProfileChange} />
                </div>
              </div>
            </>
          )}

          {!isAdmin && (
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
