import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const COLORS = ['#00e5a0', '#38bdf8', '#f59e0b', '#ef4444', '#a78bfa', '#f472b6', '#34d399', '#fb923c', '#60a5fa', '#c084fc'];

function initials(n) { return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
function avatarColor(n) { let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length]; }

function Attendance({ students, setStudents, addToast }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState({});
    const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0 });

    const activeStudents = students.filter(s => s.status === 'Active');

    useEffect(() => {
        loadAttendance(); // eslint-disable-next-line react-hooks/exhaustive-deps }, [date]);

        const loadAttendance = async () => {
            try {
                const res = await axios.get(API + '/attendance/' + date);
                const recs = {};
                res.data.forEach(r => {
                    recs[r.studentId._id || r.studentId] = r.status;
                });
                setRecords(recs);
                updateSummary(recs);
            } catch (err) {
                setRecords({});
                updateSummary({});
            }
        };

        const updateSummary = (recs) => {
            let present = 0, absent = 0, late = 0;
            Object.values(recs).forEach(s => {
                if (s === 'Present') present++;
                else if (s === 'Absent') absent++;
                else if (s === 'Late') late++;
            });
            setSummary({ present, absent, late });
        };

        const setRecord = (studentId, status) => {
            const newRecords = { ...records, [studentId]: status };
            setRecords(newRecords);
            updateSummary(newRecords);
        };

        const markAllPresent = () => {
            const newRecords = {};
            activeStudents.forEach(s => { newRecords[s._id] = 'Present'; });
            setRecords(newRecords);
            updateSummary(newRecords);
            addToast('All marked as present', 'info');
        };

        const saveAttendance = async () => {
            const hasAny = Object.keys(records).length > 0;
            if (!hasAny) { addToast('Please mark at least one student', 'error'); return; }

            const data = {
                date: date,
                records: Object.entries(records).map(([studentId, status]) => ({ studentId, status }))
            };

            try {
                await axios.post(API + '/attendance', data);
                addToast('Attendance saved for ' + date);
                const res = await axios.get(API + '/students');
                setStudents(res.data);
            } catch (err) {
                addToast('Error saving attendance', 'error');
            }
        };

        const radioStyle = (studentId, value) => {
            const isActive = records[studentId] === value;
            if (isActive) {
                if (value === 'Present') return 'bg-accent/15 text-accent border-accent/40';
                if (value === 'Absent') return 'bg-rose2/15 text-rose2 border-rose2/40';
                return 'bg-amber2/15 text-amber2 border-amber2/40';
            }
            return 'border-dark-500/40 text-dark-300';
        };

        return (
            <div>
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-dark-700 border border-dark-500/40 text-dark-50 text-xs px-3 py-2 rounded-lg outline-none focus:border-accent cursor-pointer" />
                    <button onClick={saveAttendance} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-dark-900 hover:bg-accent-light transition-all">
                        <i className="fa-solid fa-check"></i>Save Attendance
                    </button>
                    <button onClick={markAllPresent} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-dark-500/40 bg-dark-700 text-dark-50 hover:border-accent hover:text-accent transition-all">
                        <i className="fa-solid fa-check-double"></i>Mark All Present
                    </button>
                </div>

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

                <div className="bg-dark-700 border border-dark-500/30 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-dark-800">
                                    <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider">Student</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider">Department</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider">Mark Attendance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-500/20">
                                {activeStudents.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center py-12 text-dark-300"><i className="fa-solid fa-clipboard-check text-3xl opacity-20 mb-3 block"></i><p>No active students</p></td></tr>
                                ) : activeStudents.map(s => (
                                    <tr key={s._id} className="hover:bg-accent/[.02] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-dark-900 shrink-0" style={{ background: avatarColor(s.name) }}>{initials(s.name)}</div>
                                                <span className="font-semibold">{s.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-dark-300 text-[11px]">{s.department}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {['Present', 'Absent', 'Late'].map(status => (
                                                    <button key={status} onClick={() => setRecord(s._id, status)} className={"px-2.5 py-1 rounded text-[10px] font-semibold border transition-all cursor-pointer " + radioStyle(s._id, status)}>
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