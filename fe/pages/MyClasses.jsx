import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Users, ChevronRight } from 'lucide-react';
import sectionsApi from '../api/sectionsApi';
import Toast from '../components/Toast';
import './MyClasses.css';

export default function MyClasses() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roleName = user.roleName;

  useEffect(() => {
    const fetchMyClasses = async () => {
      setLoading(true);
      try {
        const resp = await sectionsApi.getAll({ myClasses: true });
        setSections(resp.data || []);
      } catch (err) {
        setToast({ message: 'Không thể tải danh sách lớp học của bạn.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchMyClasses();
  }, []);

  const getSemesterName = (semesterCode) => {
    if (!semesterCode) return 'Không rõ';
    const year = semesterCode.slice(0, 4);
    const term = semesterCode.slice(4);
    return `Học kỳ ${term} (${year}-${parseInt(year) + 1})`;
  };

  const handleClassClick = (sectionId) => {
    // Navigate to assignments and filter by sectionId
    navigate(`/assignments?sectionId=${sectionId}`);
  };

  return (
    <div className="my-classes-container">
      <div className="my-classes-header">
        <h1>Lớp Học Của Tôi</h1>
        <p className="subtitle">
          {roleName === 'GIANGVIEN' || roleName === 'Giảng viên'
            ? 'Danh sách các lớp học phần bạn đang phụ trách giảng dạy.'
            : 'Danh sách các lớp học phần bạn đã đăng ký.'}
        </p>
      </div>

      {loading ? (
        <div className="loading">Đang tải biểu mẫu...</div>
      ) : sections.length === 0 ? (
        <div className="no-data">
          <h3>Bạn chưa có lớp học nào</h3>
          <p>Hãy chờ giảng viên thêm bạn vào hoặc đăng ký học phần nhé.</p>
        </div>
      ) : (
        <div className="classes-grid">
          {sections.map((section) => (
            <div key={section._id} className="class-card" onClick={() => handleClassClick(section._id)}>
              <div className="class-banner">
                <BookOpen size={24} className="banner-icon" />
              </div>
              <div className="class-content">
                <h3 className="course-title">{section.courseId?.title || 'Chưa rõ tên môn'}</h3>
                <p className="course-code">Mã môn: {section.courseId?.code}</p>
                
                <div className="class-info">
                  <div className="info-item">
                    <Calendar size={16} />
                    <span>{getSemesterName(section.semester)}</span>
                  </div>
                  {(roleName === 'GIANGVIEN' || roleName === 'Giảng viên') && (
                    <div className="info-item">
                      <Users size={16} />
                      <span>{section.enrolledCount || 0} / {section.capacity} sinh viên</span>
                    </div>
                  )}
                  {(roleName === 'SINHVIEN' || roleName === 'Sinh viên') && (
                    <div className="info-item teacher-info">
                      Giảng viên: {section.teacherId?.username || 'Không rõ'}
                    </div>
                  )}
                </div>
              </div>
              <div className="class-footer">
                <span>Xem bài tập</span>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
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
