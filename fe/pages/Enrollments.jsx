import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Plus, Trash2, Users, BookOpen, Filter } from 'lucide-react';
import sectionsApi from '../api/sectionsApi';
import enrollmentsApi from '../api/enrollmentsApi';
import coursesApi from '../api/coursesApi';
import Toast from '../components/Toast';
import './Enrollments.css';

// ── Tree node: section row ─────────────────────────────────
function SectionRow({ section, enrolledSectionIds, enrolling, onEnroll, onCancel, myEnrollments }) {
  const enrolledCount = section.enrolledCount || 0;
  const capacity = section.capacity || 0;
  const isFull = enrolledCount >= capacity;
  const isEnrolled = enrolledSectionIds.has(section._id);
  const isProcessing = enrolling === section._id;

  return (
    <div className={`section-row ${isEnrolled ? 'section-row--enrolled' : ''} ${isFull && !isEnrolled ? 'section-row--full' : ''}`}>
      <div className="section-row-info">
        <div className="section-row-gv">
          <span className="teacher-badge">{section.teacherId?.username || '—'}</span>
          <span className="semester-tag">{section.semester || '—'}</span>
          <span className="date-tag">
            {section.startDate ? new Date(section.startDate).toLocaleDateString('vi-VN') : '—'}
            {' → '}
            {section.endDate ? new Date(section.endDate).toLocaleDateString('vi-VN') : '—'}
          </span>
        </div>
      </div>

      <div className="section-row-right">
        <span className={`enroll-count ${isFull ? 'text-danger' : 'text-success'}`}>
          {enrolledCount}/{capacity}
        </span>
        {isFull && !isEnrolled && <span className="full-tag">Đầy</span>}
        {isEnrolled && <span className="enrolled-tag">Đã đăng ký</span>}

        {isEnrolled ? (
          <button
            className="btn-cancel-sm"
            onClick={() => {
              const enrollment = myEnrollments.find((e) => e.sectionId?._id === section._id);
              if (enrollment) onCancel(enrollment._id);
            }}
          >
            <Trash2 size={14} /> Hủy
          </button>
        ) : isFull ? (
          <button className="btn-disabled-sm" disabled>Đầy</button>
        ) : (
          <button
            className="btn-enroll-sm"
            onClick={() => onEnroll(section._id)}
            disabled={isProcessing}
          >
            {isProcessing ? '...' : <><Plus size={14} /> Đăng ký</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Course group node ─────────────────────────────────────
function CourseGroup({ course, sections, enrolledSectionIds, enrolling, onEnroll, onCancel, myEnrollments, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const totalSections = sections.length;
  const enrolledCount = sections.filter((s) => enrolledSectionIds.has(s._id)).length;
  const fullCount = sections.filter((s) => (s.enrolledCount || 0) >= s.capacity).length;

  return (
    <div className="course-group">
      <button className="course-group-header" onClick={() => setOpen((o) => !o)}>
        <span className="chevron">{open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
        <span className="code-badge">{course.code}</span>
        <span className="course-group-name">{course.title}</span>
        <span className="course-group-meta">
          {totalSections} lớp HP
          {enrolledCount > 0 && <span className="meta-enrolled"> · {enrolledCount} đã đăng ký</span>}
          {fullCount > 0 && <span className="meta-full"> · {fullCount} đầy</span>}
        </span>
      </button>

      {open && (
        <div className="course-group-children">
          {sections.length === 0 ? (
            <div className="no-sections">Chưa có lớp học phần nào.</div>
          ) : sections.map((s) => (
            <SectionRow
              key={s._id}
              section={s}
              enrolledSectionIds={enrolledSectionIds}
              enrolling={enrolling}
              onEnroll={onEnroll}
              onCancel={onCancel}
              myEnrollments={myEnrollments}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Enrollments page ─────────────────────────────────
export default function Enrollments() {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [filter, setFilter] = useState({ semester: '', courseId: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.roleName === 'SINHVIEN';
  const canManage = ['ADMIN', 'GIANGVIEN'].includes(user.roleName);

  // Lấy sections
  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await sectionsApi.getAll(filter);
      setSections(resp.data || []);
    } catch {
      setToast({ message: 'Không tải được danh sách học phần.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Lấy đăng ký của SV
  const fetchMyEnrollments = useCallback(async () => {
    try {
      const resp = await enrollmentsApi.getAll();
      const enrolled = (resp.data || []).filter(
        (e) => e.status === 'ENROLLED' && e.studentId?._id === user.id
      );
      setMyEnrollments(enrolled);
    } catch {}
  }, [user.id]);

  // Lấy môn học
  const fetchCourses = useCallback(async () => {
    try {
      const resp = await coursesApi.getAll();
      setCourses(resp.data || []);
    } catch {}
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);
  useEffect(() => { fetchMyEnrollments(); }, [fetchMyEnrollments]);
  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const showToast = (message, type) => setToast({ message, type });

  const enrolledSectionIds = new Set(myEnrollments.map((e) => e.sectionId?._id));

  // ── Group sections by course ────────────────────────────
  const grouped = {};
  for (const s of sections) {
    const cid = s.courseId?._id || '__none__';
    if (!grouped[cid]) {
      grouped[cid] = {
        course: s.courseId || { _id: '__none__', code: '—', title: 'Không xác định' },
        sections: []
      };
    }
    grouped[cid].sections.push(s);
  }

  // Sắp xếp: môn đã đăng ký lên trên
  const groups = Object.values(grouped).sort((a, b) => {
    const aHas = a.sections.some((s) => enrolledSectionIds.has(s._id));
    const bHas = b.sections.some((s) => enrolledSectionIds.has(s._id));
    return bHas - aHas;
  });

  const handleEnroll = async (sectionId) => {
    setEnrolling(sectionId);
    try {
      await enrollmentsApi.enroll(sectionId);
      showToast('Đăng ký học phần thành công!', 'success');
      fetchMyEnrollments();
      fetchSections();
    } catch (err) {
      showToast(err.response?.data?.message || 'Đăng ký thất bại.', 'error');
    } finally {
      setEnrolling(null);
    }
  };

  const handleCancel = async (enrollmentId) => {
    if (!window.confirm('Hủy đăng ký học phần này?')) return;
    try {
      await enrollmentsApi.cancel(enrollmentId);
      showToast('Hủy đăng ký thành công!', 'success');
      fetchMyEnrollments();
      fetchSections();
    } catch (err) {
      showToast(err.response?.data?.message || 'Hủy thất bại.', 'error');
    }
  };

  return (
    <div className="enrollments-page">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: '' })} />

      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isStudent ? 'Đăng Ký Học Phần' : 'Quản Lý Đăng Ký'}
          </h1>
          <p className="page-subtitle">
            {isStudent
              ? 'Chọn môn học, mở rộng để xem các lớp học phần và đăng ký'
              : 'Danh sách sinh viên đã đăng ký học phần'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <BookOpen size={24} className="stat-icon icon-blue" />
          <div>
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">Môn học</div>
          </div>
        </div>
        <div className="stat-card">
          <Users size={24} className="stat-icon icon-green" />
          <div>
            <div className="stat-value">{myEnrollments.length}</div>
            <div className="stat-label">
              {isStudent ? 'Học phần đã đăng ký' : 'SV đang hoạt động'}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <Filter size={24} className="stat-icon icon-purple" />
          <div>
            <div className="stat-value">{sections.length}</div>
            <div className="stat-label">Lớp HP hiển thị</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="search-bar" style={{ minWidth: 220 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Tìm học kỳ..."
            value={filter.semester}
            onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
          />
        </div>
        <select
          className="form-input filter-select"
          style={{ minWidth: 260 }}
          value={filter.courseId}
          onChange={(e) => setFilter({ ...filter, courseId: e.target.value })}
        >
          <option value="">Tất cả môn học</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.code} — {c.title}</option>
          ))}
        </select>
      </div>

      {/* Tree */}
      {loading ? (
        <div className="loading-state">Đang tải dữ liệu...</div>
      ) : groups.length === 0 ? (
        <div className="empty-state">Không có lớp học phần nào phù hợp.</div>
      ) : (
        <div className="section-tree">
          {groups.map((group) => {
            const hasEnrolledChild = group.sections.some((s) => enrolledSectionIds.has(s._id));
            return (
              <CourseGroup
                key={group.course._id}
                course={group.course}
                sections={group.sections}
                enrolledSectionIds={enrolledSectionIds}
                enrolling={enrolling}
                onEnroll={handleEnroll}
                onCancel={handleCancel}
                myEnrollments={myEnrollments}
                defaultOpen={hasEnrolledChild || filter.courseId === group.course._id}
              />
            );
          })}
        </div>
      )}

      {/* Bảng đăng ký chi tiết (Admin/GiangVien) */}
      {canManage && <AdminEnrollmentsTable />}
    </div>
  );
}

// ── Bảng đăng ký chi tiết cho Admin/GiangVien ────────────
function AdminEnrollmentsTable() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalDocs: 0, totalPages: 0 });

  const fetchAll = async (pg = 1) => {
    setLoading(true);
    try {
      const resp = await enrollmentsApi.getAll({ page: pg, limit: 10 });
      setEnrollments(resp.data || []);
      if (resp.pagination) setPagination(resp.pagination);
    } catch {
      setToast({ message: 'Không tải được danh sách đăng ký.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(page); }, [page]); // eslint-disable-line

  const handleCancel = async (id) => {
    if (!window.confirm('Hủy đăng ký này?')) return;
    try {
      await enrollmentsApi.cancel(id);
      setToast({ message: 'Hủy thành công!', type: 'success' });
      fetchAll(page);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Thất bại.', type: 'error' });
    }
  };

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: '' })} />
      <div className="enrollment-table-section">
        <h3 className="section-list-title"><Users size={18} /> Danh Sách Đăng Ký Chi Tiết</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sinh Viên</th>
                <th>Email</th>
                <th>Môn Học</th>
                <th>Giảng Viên</th>
                <th>Học Kỳ</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="empty-row">Đang tải...</td></tr>
              ) : enrollments.length === 0 ? (
                <tr><td colSpan={8} className="empty-row">Chưa có đăng ký nào.</td></tr>
              ) : enrollments.map((e, i) => (
                <tr key={e._id}>
                  <td>{(page - 1) * 10 + i + 1}</td>
                  <td>{e.studentId?.username || '—'}</td>
                  <td>{e.studentId?.email || '—'}</td>
                  <td>
                    <span className="code-badge">{e.sectionId?.courseId?.code || '—'}</span>
                    {' '}{e.sectionId?.courseId?.title || '—'}
                  </td>
                  <td>{e.sectionId?.teacherId?.username || '—'}</td>
                  <td>{e.sectionId?.semester || '—'}</td>
                  <td>
                    <span className={`status-badge status-${e.status?.toLowerCase()}`}>
                      {e.status === 'ENROLLED' ? 'Đang học' : 'Đã hủy'}
                    </span>
                  </td>
                  <td>
                    {e.status === 'ENROLLED' && (
                      <button className="btn-icon btn-delete" onClick={() => handleCancel(e._id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Hiển thị {enrollments.length}/{pagination.totalDocs} đăng ký
              </span>
              <div className="pagination-controls">
                <button className="btn-page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft size={16} /> Trước
                </button>
                <span className="page-indicator">{page}/{pagination.totalPages}</span>
                <button className="btn-page" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                  Sau <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
