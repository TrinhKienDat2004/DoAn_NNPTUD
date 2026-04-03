import { useState, useEffect } from 'react';
import gradesApi from '../api/gradesApi';
import Toast from '../components/Toast';
import './Grades.css';

export default function Grades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.roleName === 'SINHVIEN';

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const resp = await gradesApi.getAll();
      setGrades(resp.data || []);
    } catch (err) {
      showToast(err.message || 'Không tải được danh sách điểm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => setToast({ message, type });

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    const avg = grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length;
    return avg.toFixed(2);
  };

  return (
    <div className="grades-container">
      <div className="grades-header">
        <h1>Kết Quả Học Tập</h1>
      </div>

      {isStudent && grades.length > 0 && (
        <div className="gpa-card">
          <h3>GPA Trung Bình</h3>
          <div className="gpa-value">{calculateGPA()}</div>
        </div>
      )}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : grades.length === 0 ? (
        <div className="no-data">Chưa có điểm nào</div>
      ) : (
        <div className="grades-table-container">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Bài Tập</th>
                <th>Loại</th>
                <th>Điểm</th>
                <th>Ngày Chấm</th>
                <th>Nhận Xét</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(grade => (
                <tr key={grade._id} className="grade-row">
                  <td className="assignment-title">
                    {grade.submissionId?.assignmentId?.title || 'N/A'}
                  </td>
                  <td className="component-type">
                    {grade.componentType === 'assignment' && '📝 Bài Tập'}
                    {grade.componentType === 'quiz' && '❓ Kiểm Tra'}
                    {grade.componentType === 'exam' && '📋 Thi Cuối Kỳ'}
                    {grade.componentType === 'participation' && '🙋 Tham Gia'}
                  </td>
                  <td className="score">
                    <span className={`score-badge ${grade.score >= 7 ? 'good' : grade.score >= 5 ? 'ok' : 'poor'}`}>
                      {grade.score}
                    </span>
                  </td>
                  <td className="graded-date">
                    {grade.updatedAt ? new Date(grade.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="feedback">
                    {grade.feedback || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
