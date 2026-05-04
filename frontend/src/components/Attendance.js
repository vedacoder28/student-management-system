import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://student-backend-05xx.onrender.com/api';
const COLORS = ['#00e5a0', '#38bdf8', '#f59e0b', '#ef4444', '#a78bfa', '#f472b6', '#34d399', '#fb923c', '#60a5fa', '#c084fc'];
const DEPARTMENTS = ['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Information Technology', 'Electrical Engineering'];

function initials(n) { return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
function avatarColor(n) { var h = 0; for (var i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length]; }

function Attendance({ students, setStudents, addToast }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterDept, setFilterDept] = useState('');
    const [filterSem, setFilterSem] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null); // { _id, name, code, credits }
    const [records, setRecords] = useState({});
    const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0 });

    // Get active students filtered by dept + sem
    const filteredStudents = students.filter(s => {
        if (s.status !== 'Active') return false;
        if (filterDept && s.department !== filterDept) return false;
        if (filterSem && String(s.currentSem) !== String(filterSem)) return false;
        return true;
    });

    // Get subjects common to filtered students (union of all their currentSubjects)
    const subjectMap = {};
    filteredStudents.forEach(s => {
        (s.currentSubjects || []).forEach(sub => {
            if (!subjectMap[sub._id]) subjectMap[sub._id] = sub;
        });
    });
    const availableSubjects = Object.values(subjectMap);

    // When filters change, reset subject selection
    useEffect(() => {
        setSelectedSubject(null);
        setRecords({});
        setSummary({ present: 0, absent: 0, late: 0 });
    }, [filterDept, filterSem]);

    // Load existing attendance when date or subject changes
    useEffect(() => {
        if (!selectedSubject) return;
        async function load() {
            try {
                const res = await axios.get(`${API}/attendance/${date}/${selectedSubject._id}`);
                const recs = {};
                res.data.forEach(r => { recs[r.studentId._id || r.studentId] = r.status; });
                setRecords(recs);
                updateSummary(recs);
            } catch {
                setRecords({});
                updateSummary({});
            }
        }
        load();
    }, [date, selectedSubject]);

    function updateSummary(recs) {
        let present = 0, absent = 0, late = 0;
        Object.values(recs).forEach(s => {
            if (s === 'Present') present++;
            else if (s === 'Absent') absent++;
            else if (s === 'Late') late++;
        });
        setSummary({ present, absent, late });
    }

    function setRecord(studentId, status) {
        const newRecs = { ...records, [studentId]: status };
        setRecords(newRecs);
        updateSummary(newRecs);
    }

    function markAllPresent() {
        const newRecs = {};
        studentsForSubject.forEach(s => { newRecs[s._id] = 'Present'; });
        setRecords(newRecs);
        updateSummary(newRecs);
        addToast('All marked as present', 'info');
    }

    async function saveAttendance() {
        if (!selectedSubject) { addToast('Please select a subject first', 'error'); return; }
        if (!Object.keys(records).length) { addToast('Please mark at least one student', 'error'); return; }
        try {
            await axios.post(API + '/attendance', {
                date,
                subjectId: selectedSubject._id,
                subjectName: selectedSubject.name,
                sem: parseInt(filterSem) || studentsForSubject[0]?.currentSem,
                department: filterDept || studentsForSubject[0]?.department,
                records: Object.keys(records).map(studentId => ({ studentId, status: records[studentId] }))
            });
            addToast(`Attendance saved for ${selectedSubject.name} on ${date}`);
            const res = await axios.get(API + '/students');
            setStudents(res.data);
        } catch {
            addToast('Error saving attendance', 'error');
        }
    }

    function radioStyle(studentId, value) {
        const isActive = records[studentId] === value;
        if (isActive) {
            if (value === 'Present') return 'bg-accent/15 text-accent border-accent/40';
            if (value === 'Absent') return 'bg-rose2/15 text-rose2 border-rose2/40';
            return 'bg-amber2/15 text-amber2 border-amber2/40';
        }
        return 'border-dark-500/40 text-dark-300';
    }

    // Students who have the selected subject in their list
    const studentsForSubject = selectedSubject
        ? filteredStudents.filter(s => (s.currentSubjects || []).some(sub => String(sub._id) === String(selectedSubject._id)))
        : filteredStudents;

    return (
        <div>
            {/* Top Controls */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="bg-dark-700 border border-dark-500/40 text-dark-50 text-xs px-3 py-2 rounded-lg outline-none focus:border-accent cursor-pointer" />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                    className="bg-dark-700 border border-dark-500/40 text-dark-50 text-xs px-3 py-2 rounded-lg outline-none focus:border-accent cursor-pointer">
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={filterSem} onChange={e => setFilterSem(e.target.value)}
                    className="bg-dark-700 border border-dark-500/40 text-dark-50 text-xs px-3 py-2 rounded-lg outline-none focus:border-accent cursor-pointer">
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Sem {n}</option>)}
                </select>
                <button onClick={saveAttendance}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-dark-900 hover:bg-accent-light transition-all">
                    <i className="fa-solid fa-check"></i>Save Attendance
                </button>
                <button onClick={markAllPresent}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-dark-500/40 bg-dark-700 text-dark-50 hover:border-accent hover:text-accent transition-all">
                    <i className="fa-solid fa-check-double"></i>Mark All Present
                </button>
            </div>

            {/* Subject Selector */}
            <div className="mb-5">
                <div className="text-[10px] font-bold text-dark-300 uppercase tracking-wider mb-2">
                    Select Subject to take Attendance
                </div>
                {availableSubjects.length === 0 ? (
                    <div className="bg-dark-700 border border-dark-500/30 rounded-xl p-5 text-center text-xs text-dark-300">
                        <i className="fa-solid fa-book text-2xl opacity-20 mb-2 block"></i>
                        {filteredStudents.length === 0
                            ? 'No active students match the selected filters.'
                            : 'No subjects found. Please add subjects to students via Academic Details.'}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {availableSubjects.map(sub => (
                            <button key={sub._id}
                                onClick={() => setSelectedSubject(String(selectedSubject?._id) === String(sub._id) ? null : sub)}
                                className={"px-3 py-2 rounded-lg text-xs font-semibold border transition-all " +
                                    (String(selectedSubject?._id) === String(sub._id)
                                        ? 'bg-accent/15 text-accent border-accent/40'
                                        : 'bg-dark-700 border-dark-500/40 text-dark-300 hover:border-accent hover:text-accent')}>
                                {sub.name}
                                {sub.code && <span className="ml-1 opacity-60">({sub.code})</span>}
                                <span className="ml-1.5 text-[10px] opacity-50">{sub.credits}cr</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-dark-700 border border-dark-500/30 rounded-xl p-4 text-center">
                    <div className="text-xl font-bold text-accent">{summary.present}</div>
                    <div className="text-[10px] text-dark-300 uppercase tracking-wider mt-1">Present</div>
                </div>
                <div className="bg-dark-700 border border-dark-500/30 rounded-xl p-4 text-center">
                    <div className="text-xl font-bold text-rose2">{summary.absent}</div>
                    <div className="text-[10px] text-dark-300 uppercase tracking-wider mt-1">Absent</div>
                </div>
                <div className="bg-dark-700 border border-dark-500/30 rounded-xl p-4 text-center">
                    <div className="text-xl font-bold text-amber2">{summary.late}</div>
                    <div className="text-[10px] text-dark-300 uppercase tracking-wider mt-1">Late</div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-dark-700 border border-dark-500/30 rounded-xl overflow-hidden">
                {selectedSubject && (
                    <div className="px-5 py-3 border-b border-dark-500/30 flex items-center gap-2">
                        <i className="fa-solid fa-book text-accent text-xs"></i>
                        <span className="text-xs font-semibold">{selectedSubject.name}</span>
                        {selectedSubject.code && <span className="text-[10px] text-dark-300">({selectedSubject.code})</span>}
                        <span className="ml-auto text-[10px] text-dark-300">{selectedSubject.credits} credits</span>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-dark-800">
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider">Student</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider">Dept / Sem</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider">Mark Attendance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-500/20">
                            {!selectedSubject ? (
                                <tr><td colSpan={3} className="text-center py-12 text-dark-300">
                                    <i className="fa-solid fa-hand-pointer text-3xl opacity-20 mb-3 block"></i>
                                    <p>Select a subject above to take attendance</p>
                                </td></tr>
                            ) : studentsForSubject.length === 0 ? (
                                <tr><td colSpan={3} className="text-center py-12 text-dark-300">
                                    <i className="fa-solid fa-clipboard-check text-3xl opacity-20 mb-3 block"></i>
                                    <p>No students found for this subject</p>
                                </td></tr>
                            ) : studentsForSubject.map(s => (
                                <tr key={s._id} className="hover:bg-accent/[.02] transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-dark-900 shrink-0"
                                                style={{ background: avatarColor(s.name) }}>{initials(s.name)}</div>
                                            <span className="font-semibold">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-[11px] text-dark-300">{s.department}</div>
                                        <div className="text-[10px] text-dark-300 mt-0.5">Sem {s.currentSem}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {['Present', 'Absent', 'Late'].map(status => (
                                                <button key={status} onClick={() => setRecord(s._id, status)}
                                                    className={"px-2.5 py-1 rounded text-[10px] font-semibold border transition-all cursor-pointer " + radioStyle(s._id, status)}>
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Attendance;