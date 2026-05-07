import { useState } from 'react';
import axios from 'axios';
import AcademicDetails from './AcademicDetails';

const API = 'https://student-backend-05xx.onrender.com/api';

const gradeClasses = { A: 'bg-accent/15 text-accent', B: 'bg-sky2/15 text-sky2', C: 'bg-amber2/15 text-amber2', D: 'bg-rose2/15 text-rose2', F: 'bg-rose2/25 text-rose2' };
const feeClasses = { Paid: 'bg-accent/15 text-accent', Pending: 'bg-amber2/15 text-amber2', Overdue: 'bg-rose2/15 text-rose2' };
const statusClasses = { Active: 'bg-accent/15 text-accent', Inactive: 'bg-rose2/15 text-rose2' };
const COLORS = ['#00e5a0', '#38bdf8', '#f59e0b', '#ef4444', '#a78bfa', '#f472b6', '#34d399', '#fb923c', '#60a5fa', '#c084fc'];
const DEPARTMENTS = ['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Information Technology', 'Electrical Engineering'];

function initials(n) { return n.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2); }
function avatarColor(n) { var h = 0; for (var i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length]; }
function attPct(a) { return a && a.totalClasses ? Math.round((a.present / a.totalClasses) * 100) : 0; }
function attColor(p) { return p >= 75 ? '#00e5a0' : p >= 50 ? '#f59e0b' : '#ef4444'; }
function formatDate(d) { if (!d) return 'N/A'; var dt = new Date(d); return String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0') + '/' + dt.getFullYear(); }
function calcAge(dob) { if (!dob) return ''; var today = new Date(); var birth = new Date(dob); var age = today.getFullYear() - birth.getFullYear(); var m = today.getMonth() - birth.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--; return age; }

var emptyForm = { name: '', email: '', phone: '', dob: '', grade: 'A', department: 'Computer Science', status: 'Active', feeStatus: 'Pending', feeAmount: '', enrollDate: new Date().toISOString().split('T')[0], address: '', currentSem: 1, cgpa: '' };

function PrintCard({ student, onClose }) {
    var pct = attPct(student.attendance);
    function doPrint() { window.print(); }
    return (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl print:shadow-none print:max-h-none" onClick={function (e) { e.stopPropagation(); }}>
                {/* Print Controls - hidden when printing */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 print:hidden">
                    <span className="text-sm font-semibold text-gray-700">Student Report Card</span>
                    <div className="flex gap-2">
                        <button onClick={doPrint} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all">
                            <i className="fa-solid fa-print"></i> Print / Save PDF
                        </button>
                        <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                            <i className="fa-solid fa-xmark"></i> Close
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="p-8 text-gray-800 font-sans">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{ background: avatarColor(student.name) }}>
                                {initials(student.name)}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
                                <p className="text-sm text-gray-500">{student.email}</p>
                                <p className="text-sm text-gray-500">{student.phone ? '+91 ' + student.phone : ''}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">StudentMS</div>
                            <div className="text-xs text-gray-400 mt-1">Report generated: {new Date().toLocaleDateString('en-IN')}</div>
                            <div className={"inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold " + (student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                                {student.status}
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="mb-6">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Basic Information</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-[10px] text-gray-400 uppercase">Department</div>
                                <div className="text-sm font-semibold mt-0.5">{student.department}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-[10px] text-gray-400 uppercase">Current Semester</div>
                                <div className="text-sm font-semibold mt-0.5">Semester {student.currentSem || 1}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-[10px] text-gray-400 uppercase">Date of Birth</div>
                                <div className="text-sm font-semibold mt-0.5">{formatDate(student.dob)} ({calcAge(student.dob)} yrs)</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-[10px] text-gray-400 uppercase">Enrollment Date</div>
                                <div className="text-sm font-semibold mt-0.5">{formatDate(student.enrollDate)}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-[10px] text-gray-400 uppercase">Grade</div>
                                <div className="text-sm font-semibold mt-0.5">{student.grade}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-[10px] text-gray-400 uppercase">Address</div>
                                <div className="text-sm font-semibold mt-0.5">{student.address || 'Not provided'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Fee Details */}
                    <div className="mb-6">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Fee Details</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-[10px] text-gray-400 uppercase">Fee Status</div>
                                <div className={"text-sm font-bold mt-0.5 " + (student.feeStatus === 'Paid' ? 'text-green-600' : student.feeStatus === 'Overdue' ? 'text-red-600' : 'text-amber-600')}>{student.feeStatus}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-[10px] text-gray-400 uppercase">Fee Amount</div>
                                <div className="text-sm font-semibold mt-0.5">Rs. {(student.feeAmount || 0).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance */}
                    <div className="mb-6">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Attendance</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">Overall Attendance</span>
                                <span className={"text-sm font-bold " + (pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600')}>{pct}%</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: pct + '%', background: attColor(pct) }}></div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{student.attendance ? student.attendance.present : 0} present out of {student.attendance ? student.attendance.totalClasses : 0} classes</div>
                        </div>
                    </div>

                    {/* Academic Details */}
                    <div className="mb-6">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Academic Performance</h2>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3 flex-1 text-center">
                                <div className="text-[10px] text-gray-400 uppercase">CGPA</div>
                                <div className="text-2xl font-bold text-gray-800 mt-1">{student.cgpa != null ? student.cgpa : '—'}</div>
                            </div>
                        </div>

                        {/* Sem-wise SGPA */}
                        {student.semResults && student.semResults.length > 0 && (
                            <div className="mb-4">
                                <div className="text-xs text-gray-500 font-semibold mb-2">Semester-wise SGPA</div>
                                <div className="grid grid-cols-8 gap-1">
                                    {Array.from({ length: 8 }, function (_, i) {
                                        var r = (student.semResults || []).find(function (x) { return x.sem === i + 1; });
                                        return (
                                            <div key={i} className={"rounded p-2 text-center border " + (r ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200')}>
                                                <div className="text-[9px] text-gray-400">S{i + 1}</div>
                                                <div className={"text-xs font-bold mt-0.5 " + (r ? 'text-green-700' : 'text-gray-300')}>{r ? r.sgpa : '—'}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Current Subjects */}
                        {student.currentSubjects && student.currentSubjects.length > 0 && (
                            <div>
                                <div className="text-xs text-gray-500 font-semibold mb-2">Current Semester Subjects</div>
                                <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left px-3 py-2 text-gray-600 font-semibold">#</th>
                                            <th className="text-left px-3 py-2 text-gray-600 font-semibold">Subject</th>
                                            <th className="text-left px-3 py-2 text-gray-600 font-semibold">Code</th>
                                            <th className="text-center px-3 py-2 text-gray-600 font-semibold">Credits</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.currentSubjects.map(function (sub, i) {
                                            return (
                                                <tr key={i} className="border-t border-gray-100">
                                                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                                                    <td className="px-3 py-2 font-medium">{sub.name}</td>
                                                    <td className="px-3 py-2 text-gray-500">{sub.code || '—'}</td>
                                                    <td className="px-3 py-2 text-center font-semibold">{sub.credits}</td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="border-t-2 border-gray-300 bg-gray-50">
                                            <td colSpan={3} className="px-3 py-2 font-bold text-gray-700">Total Credits</td>
                                            <td className="px-3 py-2 text-center font-bold text-gray-700">
                                                {student.currentSubjects.reduce(function (s, x) { return s + (parseInt(x.credits) || 0); }, 0)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
                        This report was generated by StudentMS · {new Date().toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Students({ students, setStudents, search, addToast, fetchStudents }) {
    var [form, setForm] = useState(emptyForm);
    var [editId, setEditId] = useState(null);
    var [showForm, setShowForm] = useState(false);
    var [showProfile, setShowProfile] = useState(null);
    var [showAcademic, setShowAcademic] = useState(null);
    var [showPrint, setShowPrint] = useState(null);
    var [filterGrade, setFilterGrade] = useState('');
    var [filterDept, setFilterDept] = useState('');
    var [filterStatus, setFilterStatus] = useState('');
    var [filterFee, setFilterFee] = useState('');
    var [sortField, setSortField] = useState('name');
    var [sortDir, setSortDir] = useState('asc');
    var [page, setPage] = useState(1);
    var PER_PAGE = 6;

    var filtered = students.filter(function (s) {
        if (search && s.name.toLowerCase().indexOf(search.toLowerCase()) === -1 && s.email.toLowerCase().indexOf(search.toLowerCase()) === -1) return false;
        if (filterGrade && s.grade !== filterGrade) return false;
        if (filterDept && s.department !== filterDept) return false;
        if (filterStatus && s.status !== filterStatus) return false;
        if (filterFee && s.feeStatus !== filterFee) return false;
        return true;
    });

    filtered.sort(function (a, b) {
        var va = a[sortField], vb = b[sortField];
        if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    var totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (page > totalPages) setPage(totalPages);
    var paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    var depts = [];
    students.forEach(function (s) { if (depts.indexOf(s.department) === -1) depts.push(s.department); });
    depts.sort();

    function handleSort(field) {
        if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
        setPage(1);
    }

    function handleSubmit(e) {
        e.preventDefault();
        var data = {
            name: form.name, email: form.email, phone: form.phone, dob: form.dob,
            grade: form.grade, department: form.department, status: form.status,
            feeStatus: form.feeStatus, feeAmount: parseInt(form.feeAmount) || 0,
            enrollDate: form.enrollDate, address: form.address,
            currentSem: parseInt(form.currentSem) || 1,
            cgpa: form.cgpa ? parseFloat(form.cgpa) : null
        };
        axios({ method: editId ? 'put' : 'post', url: API + '/students' + (editId ? '/' + editId : ''), data: data })
            .then(function () {
                addToast(data.name + (editId ? ' updated successfully' : ' added successfully'));
                setForm(emptyForm); setEditId(null); setShowForm(false);
                fetchStudents();
            })
            .catch(function (err) {
                var msg = (err.response && err.response.data && err.response.data.message) ? err.response.data.message : 'Error saving student';
                addToast(msg, 'error');
            });
    }

    function handleDelete(id) {
        var s = students.find(function (x) { return x._id === id; });
        if (!s) return;
        if (!window.confirm('Delete ' + s.name + '?')) return;
        axios.delete(API + '/students/' + id)
            .then(function () { addToast(s.name + ' removed', 'error'); fetchStudents(); })
            .catch(function () { addToast('Error deleting student', 'error'); });
    }

    function openEdit(s) {
        setForm({
            name: s.name, email: s.email, phone: s.phone || '',
            dob: s.dob ? new Date(s.dob).toISOString().split('T')[0] : '',
            grade: s.grade, department: s.department, status: s.status,
            feeStatus: s.feeStatus, feeAmount: (s.feeAmount || '').toString(),
            enrollDate: s.enrollDate ? new Date(s.enrollDate).toISOString().split('T')[0] : '',
            address: s.address || '', currentSem: s.currentSem || 1,
            cgpa: s.cgpa != null ? s.cgpa.toString() : ''
        });
        setEditId(s._id);
        setShowForm(true);
    }

    function Field({ label, children }) {
        return (
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">{label}</label>
                {children}
            </div>
        );
    }

    var inputCls = "bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 placeholder-dark-300/40";
    var selectCls = "bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent cursor-pointer";

    return (
        <div>
            {/* Filters */}
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                    <select value={filterGrade} onChange={function (e) { setFilterGrade(e.target.value); setPage(1); }} className={selectCls}>
                        <option value="">All Grades</option><option>A</option><option>B</option><option>C</option><option>D</option><option>F</option>
                    </select>
                    <select value={filterDept} onChange={function (e) { setFilterDept(e.target.value); setPage(1); }} className={selectCls}>
                        <option value="">All Departments</option>{depts.map(function (d) { return <option key={d}>{d}</option>; })}
                    </select>
                    <select value={filterStatus} onChange={function (e) { setFilterStatus(e.target.value); setPage(1); }} className={selectCls}>
                        <option value="">All Status</option><option>Active</option><option>Inactive</option>
                    </select>
                    <select value={filterFee} onChange={function (e) { setFilterFee(e.target.value); setPage(1); }} className={selectCls}>
                        <option value="">All Fees</option><option>Paid</option><option>Pending</option><option>Overdue</option>
                    </select>
                </div>
                <button onClick={function () { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-dark-900 hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20 transition-all">
                    <i className="fa-solid fa-plus"></i>Add Student
                </button>
            </div>

            {/* Table */}
            <div className="bg-dark-700 border border-dark-500/30 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-dark-500/30">
                    <h3 className="text-sm font-semibold">All Students <span className="text-dark-300 font-normal text-xs">({filtered.length} found)</span></h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-dark-800">
                                <th onClick={function () { handleSort('name'); }} className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider cursor-pointer hover:text-accent">Student <i className="fa-solid fa-sort ml-1 opacity-30"></i></th>
                                <th onClick={function () { handleSort('grade'); }} className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider cursor-pointer hover:text-accent">Grade <i className="fa-solid fa-sort ml-1 opacity-30"></i></th>
                                <th onClick={function () { handleSort('department'); }} className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider cursor-pointer hover:text-accent">Department <i className="fa-solid fa-sort ml-1 opacity-30"></i></th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider">Sem / CGPA</th>
                                <th onClick={function () { handleSort('feeStatus'); }} className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider cursor-pointer hover:text-accent">Fee <i className="fa-solid fa-sort ml-1 opacity-30"></i></th>
                                <th onClick={function () { handleSort('status'); }} className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider cursor-pointer hover:text-accent">Status <i className="fa-solid fa-sort ml-1 opacity-30"></i></th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider min-w-[220px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-500/20">
                            {paged.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-dark-300"><i className="fa-solid fa-user-graduate text-3xl opacity-20 mb-3 block"></i><p>No students found</p></td></tr>
                            ) : paged.map(function (s) {
                                return (
                                    <tr key={s._id} className="hover:bg-accent/[.02] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-dark-900 shrink-0" style={{ background: avatarColor(s.name) }}>{initials(s.name)}</div>
                                                <div><div className="font-semibold">{s.name}</div><div className="text-[10px] text-dark-300">{s.email}</div></div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><span className={"inline-flex px-2.5 py-0.5 rounded text-[10px] font-semibold " + gradeClasses[s.grade]}>{s.grade}</span></td>
                                        <td className="px-4 py-3 text-dark-300 text-[11px]">{s.department}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs font-medium">Sem {s.currentSem || 1}</div>
                                            <div className="text-[10px] text-dark-300 mt-0.5">{s.cgpa != null ? 'CGPA: ' + s.cgpa : 'CGPA: —'}</div>
                                        </td>
                                        <td className="px-4 py-3"><span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold " + feeClasses[s.feeStatus]}><i className={"fa-solid " + (s.feeStatus === 'Paid' ? 'fa-check' : 'fa-clock') + " text-[8px]"}></i>{s.feeStatus}</span></td>
                                        <td className="px-4 py-3"><span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold " + statusClasses[s.status]}><span className={"w-1.5 h-1.5 rounded-full " + (s.status === 'Active' ? 'bg-accent shadow-[0_0_6px_rgba(0,229,160,.5)]' : 'bg-rose2')}></span>{s.status}</span></td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {/* View */}
                                                <button onClick={function () { setShowProfile(s); }} title="View Profile" className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:text-accent hover:border-accent hover:bg-accent/10 flex items-center justify-center text-[10px] transition-all"><i className="fa-solid fa-eye"></i></button>
                                                {/* Academic Details — prominent green button */}
                                                <button onClick={function () { setShowAcademic(s); }} title="Academic Details" className="flex items-center gap-1.5 px-2.5 h-7 rounded border border-accent/40 text-accent bg-accent/10 hover:bg-accent/20 hover:border-accent text-[10px] font-semibold transition-all">
                                                    <i className="fa-solid fa-graduation-cap text-xs"></i>
                                                    <span>Academic</span>
                                                </button>
                                                {/* Print */}
                                                <button onClick={function () { setShowPrint(s); }} title="Print Student Card" className="flex items-center gap-1.5 px-2.5 h-7 rounded border border-sky2/40 text-sky2 bg-sky2/10 hover:bg-sky2/20 hover:border-sky2 text-[10px] font-semibold transition-all">
                                                    <i className="fa-solid fa-print text-xs"></i>
                                                    <span>Print</span>
                                                </button>
                                                {/* Edit */}
                                                <button onClick={function () { openEdit(s); }} title="Edit" className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:text-accent hover:border-accent hover:bg-accent/10 flex items-center justify-center text-[10px] transition-all"><i className="fa-solid fa-pen"></i></button>
                                                {/* Delete */}
                                                <button onClick={function () { handleDelete(s._id); }} title="Delete" className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:text-rose2 hover:border-rose2 hover:bg-rose2/10 flex items-center justify-center text-[10px] transition-all"><i className="fa-solid fa-trash"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-t border-dark-500/30 text-xs text-dark-300">
                    <span>Showing {filtered.length ? (page - 1) * PER_PAGE + 1 : 0}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
                    <div className="flex gap-1">
                        <button onClick={function () { setPage(1); }} disabled={page === 1} className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:border-accent hover:text-accent flex items-center justify-center text-[10px] disabled:opacity-30 disabled:pointer-events-none"><i className="fa-solid fa-angles-left"></i></button>
                        <button onClick={function () { setPage(function (p) { return Math.max(1, p - 1); }); }} disabled={page === 1} className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:border-accent hover:text-accent flex items-center justify-center text-[10px] disabled:opacity-30 disabled:pointer-events-none"><i className="fa-solid fa-angle-left"></i></button>
                        {Array.from({ length: totalPages }, function (_, i) { return <button key={i} onClick={function () { setPage(i + 1); }} className={"w-7 h-7 rounded border flex items-center justify-center text-[10px] font-semibold " + (page === i + 1 ? 'bg-accent text-dark-900 border-accent' : 'border-dark-500/40 text-dark-300 hover:border-accent hover:text-accent')}>{i + 1}</button>; })}
                        <button onClick={function () { setPage(function (p) { return Math.min(totalPages, p + 1); }); }} disabled={page === totalPages} className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:border-accent hover:text-accent flex items-center justify-center text-[10px] disabled:opacity-30 disabled:pointer-events-none"><i className="fa-solid fa-angle-right"></i></button>
                        <button onClick={function () { setPage(totalPages); }} disabled={page === totalPages} className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:border-accent hover:text-accent flex items-center justify-center text-[10px] disabled:opacity-30 disabled:pointer-events-none"><i className="fa-solid fa-angles-right"></i></button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal — Single column */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={function () { setShowForm(false); }}>
                    <div className="bg-dark-700 border border-dark-500/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={function (e) { e.stopPropagation(); }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500/30">
                            <h3 className="text-sm font-semibold">{editId ? 'Edit Student' : 'Add New Student'}</h3>
                            <button onClick={function () { setShowForm(false); }} className="w-8 h-8 rounded-lg border border-dark-500/40 text-dark-300 hover:text-rose2 hover:border-rose2 flex items-center justify-center text-xs"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

                            <Field label="Full Name">
                                <input required value={form.name} onChange={function (e) { setForm(Object.assign({}, form, { name: e.target.value })); }} className={inputCls} placeholder="Arjun Sharma" />
                            </Field>

                            <Field label="Email">
                                <input type="email" required value={form.email} onChange={function (e) { setForm(Object.assign({}, form, { email: e.target.value })); }} className={inputCls} placeholder="arjun@example.com" />
                            </Field>

                            <Field label="Phone Number">
                                <div className="flex items-center">
                                    <span className="bg-dark-800 border border-r-0 border-dark-500/40 text-dark-300 text-xs px-3 py-2.5 rounded-l-lg">+91</span>
                                    <input required value={form.phone} onChange={function (e) { setForm(Object.assign({}, form, { phone: e.target.value })); }} maxLength="10" className="bg-dark-800 border border-l-0 border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-r-lg outline-none focus:border-accent placeholder-dark-300/40 w-full" placeholder="9876543210" />
                                </div>
                            </Field>

                            <Field label="Date of Birth">
                                <input type="date" required value={form.dob} onChange={function (e) { setForm(Object.assign({}, form, { dob: e.target.value })); }} max={new Date().toISOString().split('T')[0]} className={inputCls + " cursor-pointer"} />
                            </Field>

                            <Field label="Department">
                                <select value={form.department} onChange={function (e) { setForm(Object.assign({}, form, { department: e.target.value })); }} className={selectCls}>
                                    {DEPARTMENTS.map(function (d) { return <option key={d}>{d}</option>; })}
                                </select>
                            </Field>

                            <Field label="Current Semester">
                                <select value={form.currentSem} onChange={function (e) { setForm(Object.assign({}, form, { currentSem: e.target.value })); }} className={selectCls}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return <option key={n} value={n}>Semester {n}</option>; })}
                                </select>
                            </Field>

                            <Field label="CGPA">
                                <input type="number" min="0" max="10" step="0.01" value={form.cgpa} onChange={function (e) { setForm(Object.assign({}, form, { cgpa: e.target.value })); }} className={inputCls} placeholder="e.g. 8.50" />
                            </Field>

                            <Field label="Grade">
                                <select value={form.grade} onChange={function (e) { setForm(Object.assign({}, form, { grade: e.target.value })); }} className={selectCls}>
                                    <option>A</option><option>B</option><option>C</option><option>D</option><option>F</option>
                                </select>
                            </Field>

                            {/* Fee Section */}
                            <div className="border border-dark-500/30 rounded-lg p-4 flex flex-col gap-4">
                                <div className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Fee Details</div>
                                <Field label="Fee Status">
                                    <select value={form.feeStatus} onChange={function (e) { setForm(Object.assign({}, form, { feeStatus: e.target.value })); }} className={selectCls}>
                                        <option>Paid</option><option>Pending</option><option>Overdue</option>
                                    </select>
                                </Field>
                                <Field label="Fee Amount (Rs.)">
                                    <input type="number" min="0" value={form.feeAmount} onChange={function (e) { setForm(Object.assign({}, form, { feeAmount: e.target.value })); }} className={inputCls} placeholder="25000" />
                                </Field>
                                <Field label="Enrollment Date">
                                    <input type="date" value={form.enrollDate} onChange={function (e) { setForm(Object.assign({}, form, { enrollDate: e.target.value })); }} className={inputCls + " cursor-pointer"} />
                                </Field>
                                <Field label="Student Status">
                                    <select value={form.status} onChange={function (e) { setForm(Object.assign({}, form, { status: e.target.value })); }} className={selectCls}>
                                        <option>Active</option><option>Inactive</option>
                                    </select>
                                </Field>
                            </div>

                            <Field label="Communication / Current Address">
                                <textarea value={form.address} onChange={function (e) { setForm(Object.assign({}, form, { address: e.target.value })); }} rows="2" className={inputCls + " resize-y"} placeholder="Hostel Block A, Room 204"></textarea>
                            </Field>

                            <div className="flex gap-2 justify-end mt-2">
                                <button type="button" onClick={function () { setShowForm(false); }} className="px-4 py-2 text-xs font-semibold rounded-lg border border-dark-500/40 bg-dark-700 text-dark-50 hover:border-accent hover:text-accent">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-dark-900 hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20">{editId ? 'Save Changes' : 'Add Student'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={function () { setShowProfile(null); }}>
                    <div className="bg-dark-700 border border-dark-500/30 rounded-xl w-full max-w-md shadow-2xl" onClick={function (e) { e.stopPropagation(); }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500/30">
                            <h3 className="text-sm font-semibold">Student Profile</h3>
                            <button onClick={function () { setShowProfile(null); }} className="w-8 h-8 rounded-lg border border-dark-500/40 text-dark-300 hover:text-rose2 hover:border-rose2 flex items-center justify-center text-xs"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-5 mb-5 pb-5 border-b border-dark-500/30">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-dark-900 shrink-0" style={{ background: avatarColor(showProfile.name) }}>{initials(showProfile.name)}</div>
                                <div>
                                    <h4 className="text-base font-bold">{showProfile.name}</h4>
                                    <p className="text-xs text-dark-300 mt-0.5">{showProfile.email}{showProfile.phone ? ' · ' + showProfile.phone : ''}</p>
                                    <div className="flex gap-2 mt-2.5 flex-wrap">
                                        <span className={"inline-flex px-2.5 py-0.5 rounded text-[10px] font-semibold " + gradeClasses[showProfile.grade]}>Grade {showProfile.grade}</span>
                                        <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold " + statusClasses[showProfile.status]}><span className={"w-1.5 h-1.5 rounded-full " + (showProfile.status === 'Active' ? 'bg-accent' : 'bg-rose2')}></span>{showProfile.status}</span>
                                        <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold " + feeClasses[showProfile.feeStatus]}>{showProfile.feeStatus}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div><div className="text-[10px] text-dark-300 uppercase tracking-wider">Date of Birth</div><div className="font-medium mt-0.5">{formatDate(showProfile.dob)} <span className="text-dark-300">({calcAge(showProfile.dob)} yrs)</span></div></div>
                                <div><div className="text-[10px] text-dark-300 uppercase tracking-wider">Department</div><div className="font-medium mt-0.5">{showProfile.department}</div></div>
                                <div><div className="text-[10px] text-dark-300 uppercase tracking-wider">Current Semester</div><div className="font-medium mt-0.5">Sem {showProfile.currentSem || 1}</div></div>
                                <div><div className="text-[10px] text-dark-300 uppercase tracking-wider">CGPA</div><div className="font-medium mt-0.5">{showProfile.cgpa != null ? showProfile.cgpa : '—'}</div></div>
                                <div><div className="text-[10px] text-dark-300 uppercase tracking-wider">Fee Amount</div><div className="font-medium mt-0.5">Rs. {(showProfile.feeAmount || 0).toLocaleString()}</div></div>
                                <div><div className="text-[10px] text-dark-300 uppercase tracking-wider">Enrolled</div><div className="font-medium mt-0.5">{formatDate(showProfile.enrollDate)}</div></div>
                                <div className="col-span-2"><div className="text-[10px] text-dark-300 uppercase tracking-wider">Address</div><div className="font-medium mt-0.5">{showProfile.address || 'Not provided'}</div></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Academic Details — Right Drawer */}
            {showAcademic && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={function () { setShowAcademic(null); }}></div>
                    <div className="fixed top-0 right-0 h-full w-full max-w-2xl z-50 bg-dark-800 border-l border-dark-500/30 shadow-2xl overflow-y-auto transition-transform">
                        <AcademicDetails
                            student={showAcademic}
                            onClose={function () { setShowAcademic(null); }}
                            onSave={fetchStudents}
                            addToast={addToast}
                            isDrawer={true}
                        />
                    </div>
                </>
            )}

            {/* Print Card */}
            {showPrint && (
                <PrintCard student={showPrint} onClose={function () { setShowPrint(null); }} />
            )}
        </div>
    );
}

export default Students;