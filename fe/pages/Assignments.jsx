import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, X, Download, File } from 'lucide-react';
import assignmentsApi from '../api/assignmentsApi';
import submissionsApi from '../api/submissionsApi';
import gradesApi from '../api/gradesApi';
import Toast from '../components/Toast';
import './Assignments.css';

export default function Assignments() {
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get('sectionId');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    sectionId: '', title: '', description: '', dueDate: ''
  });

  const [submitForm, setSubmitForm] = useState({ file: null });
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isTeacher = user.roleName === 'Giảng viên' || user.roleName === 'GIANGVIEN';
  const isStudent = user.roleName === 'Sinh viên' || user.roleName === 'SINHVIEN';

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await assignmentsApi.getAll({ sectionId });
      setAssignments(resp.data || []);
    } catch {
      showToast('Không tải được danh sách bài tập.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubmissions = useCallback(async (assignmentId) => {
    try {
      const resp = await submissionsApi.getByAssignment(assignmentId);
      setSubmissions(prev => ({ ...prev, [assignmentId]: resp.data || [] }));
    } catch {
      // Silently fail for non-teachers
    }
  }, []);

  const fetchGrades = useCallback(async () => {
    try {
      const resp = await gradesApi.getAll();
      const gradeMap = {};
      (resp.data || []).forEach(g => {
        gradeMap[g.submissionId._id] = g;
      });
      setGrades(gradeMap);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    if (!isStudent) fetchGrades();
  }, []);

  useEffect(() => {
    if (isTeacher) {
      assignments.forEach(a => fetchSubmissions(a._id));
    }
  }, [assignments]);

  const showToast = (message, type) => setToast({ message, type });

  const openCreate = () => {
    setEditingId(null);
    setForm({ sectionId: sectionId || '', title: '', description: '', dueDate: '' });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditingId(a._id);
    setForm({
      sectionId: a.sectionId?._id || '',
      title: a.title,
      description: a.description,
      dueDate: a.dueDate ? a.dueDate.slice(0, 10) : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Tiêu đề không được để trống', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await assignmentsApi.update(editingId, form);
        showToast('Cập nhật bài tập thành công', 'success');
      } else {
        await assignmentsApi.create(form);
        showToast('Tạo bài tập thành công', 'success');
      }
      setShowModal(false);
      fetchAssignments();
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu bài tập', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bài tập này?')) return;
    setLoading(true);
    try {
      await assignmentsApi.delete(id);
      showToast('Xóa bài tập thành công', 'success');
      fetchAssignments();
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa bài tập', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submitForm.file) {
      showToast('Vui lòng chọn file', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', submitForm.file);

      await submissionsApi.submit(selectedAssignmentId, formData);
      showToast('Nộp bài tập thành công', 'success');
      setShowSubmitModal(false);
      setSubmitForm({ file: null });
      fetchAssignments();
    } catch (err) {
      showToast(err.message || 'Lỗi khi nộp bài tập', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (gradeForm.score === '' || isNaN(gradeForm.score) || gradeForm.score < 0 || gradeForm.score > 100) {
      showToast('Điểm phải từ 0 đến 100', 'error');
      return;
    }

    setLoading(true);
    try {
      await gradesApi.gradeSubmission(selectedSubmissionId, gradeForm);
      showToast('Chấm điểm thành công', 'success');
      setShowGradeModal(false);
      setGradeForm({ score: '', feedback: '' });
      fetchGrades();
    } catch (err) {
      showToast(err.message || 'Lỗi khi chấm điểm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments
    .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const isDeadlinePassed = (dueDate) => dueDate && new Date(dueDate) < new Date();

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <h1>Bài Tập</h1>
        {isTeacher && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> Tạo Bài Tập
          </button>
        )}
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm bài tập..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : filteredAssignments.length === 0 ? (
        <div className="no-data">Chưa có bài tập nào</div>
      ) : (
        <div className="assignments-list">
          {filteredAssignments.map(assignment => (
            <div key={assignment._id} className="assignment-card">
              <div className="assignment-header">
                <h3>{assignment.title}</h3>
                {isTeacher && (
                  <div className="action-buttons">
                    <button onClick={() => openEdit(assignment)} title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(assignment._id)} title="Xóa" className="btn-danger">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {assignment.description && (
                <p className="assignment-description">{assignment.description}</p>
              )}

              <div className="assignment-meta">
                {assignment.dueDate && (
                  <span className={`due-date ${isDeadlinePassed(assignment.dueDate) ? 'expired' : ''}`}>
                    Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>

              {isStudent && (
                <button
                  onClick={() => {
                    setSelectedAssignmentId(assignment._id);
                    setShowSubmitModal(true);
                  }}
                  className="btn-submit"
                  disabled={isDeadlinePassed(assignment.dueDate)}
                >
                  {isDeadlinePassed(assignment.dueDate) ? 'Hạn nộp đã hết' : 'Nộp Bài'}
                </button>
              )}

              {isTeacher && (
                <div className="submissions-section">
                  <h4>Bài nộp ({submissions[assignment._id]?.length || 0})</h4>
                  {submissions[assignment._id]?.length > 0 ? (
                    <div className="submissions-list">
                      {submissions[assignment._id].map(sub => (
                        <div key={sub._id} className="submission-item">
                          <div className="submission-info">
                            <span className="student-name">{sub.studentId?.username}</span>
                            <span className="submission-date">
                              {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                            </span>
                            {sub.fileUrl && (
                              <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                                <Download size={14} /> Tải File
                              </a>
                            )}
                          </div>
                          <div className="submission-grade">
                            {grades[sub._id] ? (
                              <span className="grade-badge">Điểm: {grades[sub._id].score}</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedSubmissionId(sub._id);
                                  setGradeForm({ score: '', feedback: '' });
                                  setShowGradeModal(true);
                                }}
                                className="btn-grade"
                              >
                                Chấm Điểm
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-submissions">Chưa có bài nộp</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Tạo/Sửa Bài Tập */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Sửa Bài Tập' : 'Tạo Bài Tập'}</h2>
              <button onClick={() => setShowModal(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tiêu Đề *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Tiêu đề bài tập"
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô Tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả bài tập (tùy chọn)"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Hạn Nộp</label>
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nộp Bài */}
      {showSubmitModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nộp Bài Tập</h2>
              <button onClick={() => setShowSubmitModal(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitAssignment}>
              <div className="form-group">
                <label>Chọn File *</label>
                <input
                  type="file"
                  onChange={(e) => setSubmitForm({ file: e.target.files[0] })}
                  required
                />
                {submitForm.file && <p className="file-name">{submitForm.file.name}</p>}
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Đang nộp...' : 'Nộp Bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chấm Điểm */}
      {showGradeModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chấm Điểm</h2>
              <button onClick={() => setShowGradeModal(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleGradeSubmission}>
              <div className="form-group">
                <label>Điểm (0-100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                  placeholder="Nhập điểm"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nhận Xét</label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  placeholder="Nhận xét (tùy chọn)"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowGradeModal(false)} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu Điểm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
        />
      )}
    </div>
  );
}
