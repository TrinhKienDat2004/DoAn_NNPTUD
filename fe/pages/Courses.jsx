import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import coursesApi from '../api/coursesApi';
import Toast from '../components/Toast';
import './Courses.css';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ code: '', title: '', description: '', category: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = ['Quản trị viên', 'Giảng viên'].includes(user.roleName);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await coursesApi.getAll(search ? { title: search } : {});
      setCourses(resp.data || []);
    } catch {
      setToast({ message: 'Không tải được danh sách môn học.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const showToast = (message, type) => setToast({ message, type });

  const openCreate = () => {
    setEditingId(null);
    setForm({ code: '', title: '', description: '', category: '' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({ code: c.code, title: c.title, description: c.description || '', category: c.category || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await coursesApi.update(editingId, form);
        showToast('Cập nhật môn học thành công!', 'success');
      } else {
        await coursesApi.create(form);
        showToast('Thêm môn học thành công!', 'success');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa môn học này?')) return;
    try {
      await coursesApi.delete(id);
      showToast('Xóa môn học thành công!', 'success');
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.message || 'Xóa thất bại.', 'error');
    }
  };

  return (
    <div className="courses-page">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: '' })} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Danh Sách Môn Học</h1>
          <p className="page-subtitle">Quản lý danh mục các môn học trong hệ thống</p>
        </div>
        {canManage && (
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={18} /> Thêm Môn Học
          </button>
        )}
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="form-input search-input"
          placeholder="Tìm theo mã hoặc tên môn học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state">Đang tải dữ liệu...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã MH</th>
                <th>Tên Môn Học</th>
                <th>Loại</th>
                <th>Mô Tả</th>
                {canManage && <th>Hành Động</th>}
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr><td colSpan={5} className="empty-row">Chưa có môn học nào.</td></tr>
              ) : courses.map((c) => (
                <tr key={c._id}>
                  <td><span className="code-badge">{c.code}</span></td>
                  <td className="title-cell">{c.title}</td>
                  <td>{c.category || '—'}</td>
                  <td className="desc-cell">{c.description || '—'}</td>
                  {canManage && (
                    <td className="action-cell">
                      <button className="btn-icon btn-edit" onClick={() => openEdit(c)} title="Sửa">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(c._id)} title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingId ? 'Sửa Môn Học' : 'Thêm Môn Học'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Mã Môn Học *</label>
                <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required maxLength={20} />
              </div>
              <div className="form-group">
                <label>Tên Môn Học *</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
              </div>
              <div className="form-group">
                <label>Loại / Chuyên ngành</label>
                <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="VD: Công nghệ thông tin" maxLength={100} />
              </div>
              <div className="form-group">
                <label>Mô Tả</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">{editingId ? 'Lưu Thay Đổi' : 'Tạo Mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
