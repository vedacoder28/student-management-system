import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Attendance from './components/Attendance';
import Reports from './components/Reports';

const API = 'http://localhost:5000/api';
const PAGES = { dashboard: 'Dashboard', students: 'Students', attendance: 'Attendance', reports: 'Reports' };

function App() {
  const [page, setPage] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(API + '/students');
      setStudents(res.data);
    } catch (err) {
      addToast('Failed to load students', 'error');
    }
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleSearch = (value) => {
    setSearch(value);
    if (page !== 'students') setPage('students');
  };

  return (
    <div className="flex h-screen bg-dark-900 text-dark-50 overflow-hidden">
      <Sidebar page={page} setPage={setPage} studentCount={students.length} onExport={() => exportCSV(students)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[60px] border-b border-dark-500/30 bg-dark-800 flex items-center justify-between px-7 shrink-0">
          <div>
            <h2 className="text-sm font-semibold">{PAGES[page]}</h2>
            <p className="text-[11px] text-dark-300">Home / {PAGES[page]}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-dark-700 border border-dark-500/40 rounded-lg px-3 py-1.5 focus-within:border-accent transition-colors">
              <i className="fa-solid fa-magnifying-glass text-dark-300 text-xs"></i>
              <input type="text" placeholder="Search students..." value={search} onChange={e => handleSearch(e.target.value)} className="bg-transparent border-none outline-none text-dark-50 text-xs w-44 placeholder-dark-300/50" />
            </div>
            <button onClick={() => window.print()} className="w-9 h-9 rounded-lg border border-dark-500/40 bg-dark-700 text-dark-300 hover:text-accent hover:border-accent transition-all flex items-center justify-center text-sm">
              <i className="fa-solid fa-print"></i>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-7">
          {page === 'dashboard' && <Dashboard students={students} addToast={addToast} />}
          {page === 'students' && <Students students={students} setStudents={setStudents} search={search} addToast={addToast} fetchStudents={fetchStudents} />}
          {page === 'attendance' && <Attendance students={students} setStudents={setStudents} addToast={addToast} />}
          {page === 'reports' && <Reports students={students} addToast={addToast} />}
        </main>
      </div>
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={"bg-dark-700 border border-dark-500/30 border-l-[3px] rounded-lg px-4 py-3 text-xs flex items-center gap-3 shadow-xl min-w-[260px] " + (t.type === 'success' ? 'border-l-accent' : t.type === 'error' ? 'border-l-rose2' : 'border-l-sky2')}>
            <i className={"fa-solid " + (t.type === 'success' ? 'fa-circle-check text-accent' : t.type === 'error' ? 'fa-circle-xmark text-rose2' : 'fa-circle-info text-sky2')}></i>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function exportCSV(students) {
  if (!students.length) return;
  const h = ['Name', 'Email', 'Phone', 'Age', 'Grade', 'Department', 'Status', 'Fee Status', 'Fee Amount', 'Attendance %', 'Enrolled'];
  const rows = students.map(s => [s.name, s.email, s.phone || '', s.age, s.grade, s.department, s.status, s.feeStatus, s.feeAmount || 0, s.attendance && s.attendance.totalClasses ? Math.round((s.attendance.present / s.attendance.totalClasses) * 100) : 0, s.enrollDate ? new Date(s.enrollDate).toISOString().split('T')[0] : '']);
  const csv = [h.join(','), ...rows.map(r => r.map(v => '"' + v + '"').join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'students_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default App;