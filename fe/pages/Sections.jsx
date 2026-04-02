import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import sectionsApi from '../api/sectionsApi';
import coursesApi from '../api/coursesApi';
import usersApi from '../api/usersApi';
import Toast from '../components/Toast';
import './Sections.css';

export default function Sections() {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [filter, setFilter] = useState({ semester: '', courseId: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalDocs: 0, totalPages: 0 });

  const [form, setForm] = useState({
    courseId: '', teacherId: '', semester: '',
    startDate: '', endDate: '', capacity: 50
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = ['Quản trị viên', 'Giảng viên'].includes(user.roleName);

  const fetchSections = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const resp = await sectionsApi.getAll({ ...filter, page: pg, limit: 10 });
      setSections(resp.data || []);
      if (resp.pagination) setPagination(resp.pagination);
    } catch {
      setToast({ message: 'Không tải được danh sách lớp học phần.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Reset page về 1 khi filter thay đổi
  useEffect(() => { setPage(1); fetchSections(1); }, [filter]); // eslint-disable-line
  useEffect(() => { fetchSections(page); }, [page]); // eslint-disable-line

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cr, th] = await Promise.all([
          coursesApi.getAll(),
          usersApi.getTeachers()
        ]);
        setCourses(cr.data || []);
        setTeachers(th.data || []);
      } catch {}
    };
    loadMeta();
  }, []);

  const showToast = (message, type) => setToast({ message, type });

  const openCreate = () => {
    setEditingId(null);
    setForm({ courseId: '', teacherId: '', semester: '', startDate: '', endDate: '', capacity: 50 });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      courseId: s.courseId?._id || '',
      teacherId: s.teacherId?._id || '',
      semester: s.semester || '',
      startDate: s.startDate ? s.startDate.slice(0, 10) : '',
      endDate: s.endDate ? s.endDate.slice(0, 10) : '',
      capacity: s.capacity || 50
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await sectionsApi.update(editingId, form);
        showToast('Cập nhật lớp học phần thành công!', 'success');
      } else {
        await sectionsApi.create(form);
        showToast('Thêm lớp học phần thành công!', 'success');
      }
      setShowModal(false);
      fetchSections();
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa lớp học phần này? Tất cả đăng ký liên quan sẽ bị xóa.')) return;
    try {
      await sectionsApi.delete(id);
      showToast('Xóa lớp học phần thành công!', 'success');
      fetchSections();
    } catch (err) {
      showToast(err.response?.data?.message || 'Xóa thất bại.', 'error');
    }
  };

  return (
    <div className="sections-page">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: '' })} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Lớp Học Phần</h1>
          <p className="page-subtitle">Danh sách các lớp học phần mở trong kỳ</p>
        </div>
        {canManage && (
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={18} /> Thêm Lớp HP
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Tìm theo học kỳ..."
            value={filter.semester}
            onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
          />
        </div>
        <select
          className="form-input filter-select"
          value={filter.courseId}
          onChange={(e) => setFilter({ ...filter, courseId: e.target.value })}
        >
          <option value="">Tất cả môn học</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.code} - {c.title}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state">Đang tải dữ liệu...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Môn Học</th>
                <th>Giảng Viên</th>
                <th>Học Kỳ</th>
                <th>Ngày BD - KT</th>
                <th>SV Đăng Ký</th>
                <th>Sĩ Số</th>
                {canManage && <th>Hành Động</th>}
              </tr>
            </thead>
            <tbody>
              {sections.length === 0 ? (
                <tr><td colSpan={7} className="empty-row">Chưa có lớp học phần nào.</td></tr>
              ) : sections.map((s) => {
                const isFull = (s.enrolledCount || 0) >= s.capacity;
                return (
                  <tr key={s._id}>
                    <td>
                      <div className="course-info">
                        <span className="code-badge">{s.courseId?.code || '—'}</span>
                        <span className="course-name">{s.courseId?.title || '—'}</span>
                      </div>
                    </td>
                    <td>{s.teacherId?.username || '—'}</td>
                    <td><span className="semester-badge">{s.semester || '—'}</span></td>
                    <td className="date-cell">
                      {s.startDate ? new Date(s.startDate).toLocaleDateString('vi-VN') : '—'}
                      {' → '}
                      {s.endDate ? new Date(s.endDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td>
                      <div className="enrollment-bar">
                        <span className={isFull ? 'text-danger' : 'text-primary'}>{s.enrolledCount || 0}</span>
                        <span className="capacity-text"> / {s.capacity || 0}</span>
                      </div>
                      {isFull && <span className="full-badge">Đầy</span>}
                    </td>
                    <td>{s.capacity || 0}</td>
                    {canManage && (
                      <td className="action-cell">
                        <button className="btn-icon btn-edit" onClick={() => openEdit(s)} title="Sửa"><Edit2 size={16} /></button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(s._id)} title="Xóa"><Trash2 size={16} /></button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Hiển thị {sections.length}/{pagination.totalDocs} lớp HP
              </span>
              <div className="pagination-controls">
                <button
                  className="btn-page"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} /> Trước
                </button>
                <span className="page-indicator">{page}/{pagination.totalPages}</span>
                <button
                  className="btn-page"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingId ? 'Sửa Lớp Học Phần' : 'Thêm Lớp Học Phần'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Môn Học *</label>
                  <select className="form-input" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
                    <option value="">— Chọn môn học —</option>
                    {courses.map((c) => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giảng Viên *</label>
                  <select className="form-input" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} required>
                    <option value="">— Chọn giảng viên —</option>
                    {teachers.map((t) => <option key={t._id} value={t._id}>{t.username} ({t.email})</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Học Kỳ *</label>
                <input className="form-input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required
                  placeholder="VD: 20241 (2024 - HK1)" maxLength={50} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Bắt Đầu</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Ngày Kết Thúc</label>
                  <input type="date" className="form-input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Sĩ Số Tối Đa</label>
                <input type="number" className="form-input" value={form.capacity} min={1} max={500}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 50 })} />
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