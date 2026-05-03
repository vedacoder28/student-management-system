import { useState } from 'react';
import axios from 'axios';

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
function formatDate(d) { if (!d) return 'N/A'; var dt = new Date(d); var dd = String(dt.getDate()).padStart(2, '0'); var mm = String(dt.getMonth() + 1).padStart(2, '0'); var yyyy = dt.getFullYear(); return dd + '/' + mm + '/' + yyyy; }
function calcAge(dob) { if (!dob) return ''; var today = new Date(); var birth = new Date(dob); var age = today.getFullYear() - birth.getFullYear(); var m = today.getMonth() - birth.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--; return age; }

var emptyForm = { name: '', email: '', phone: '', dob: '', grade: 'A', department: 'Computer Science', status: 'Active', feeStatus: 'Pending', feeAmount: '', enrollDate: new Date().toISOString().split('T')[0], address: '' };

function Students({ students, setStudents, search, addToast, fetchStudents }) {
    var [form, setForm] = useState(emptyForm);
    var [editId, setEditId] = useState(null);
    var [showForm, setShowForm] = useState(false);
    var [showProfile, setShowProfile] = useState(null);
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
            name: form.name,
            email: form.email,
            phone: form.phone,
            dob: form.dob,
            grade: form.grade,
            department: form.department,
            status: form.status,
            feeStatus: form.feeStatus,
            feeAmount: parseInt(form.feeAmount) || 0,
            enrollDate: form.enrollDate,
            address: form.address
        };
        axios({ method: editId ? 'put' : 'post', url: API + '/students' + (editId ? '/' + editId : ''), data: data })
            .then(function (res) {
                addToast(data.name + (editId ? ' updated successfully' : ' added successfully'));
                setForm(emptyForm); setEditId(null); setShowForm(false);
                fetchStudents();
            })
            .catch(function (err) {
                var msg = (err.response && err.response && err.response.data && err.response.data.message) ? err.response.data.message : 'Error saving student';
                addToast(msg, 'error');
            });
    }

    function handleDelete(id) {
        var s = students.find(function (x) { return x._id === id; });
        if (!s) return;
        if (!window.confirm('Delete ' + s.name + '?')) return;
        axios.delete(API + '/students/' + id)
            .then(function () {
                addToast(s.name + ' removed', 'error');
                fetchStudents();
            })
            .catch(function () { addToast('Error deleting student', 'error'); });
    }

    function openEdit(s) {
        setForm({
            name: s.name, email: s.email, phone: s.phone || '',
            dob: s.dob ? new Date(s.dob).toISOString().split('T')[0] : '',
            grade: s.grade, department: s.department, status: s.status, feeStatus: s.feeStatus,
            feeAmount: (s.feeAmount || '').toString(), enrollDate: s.enrollDate ? new Date(s.enrollDate).toISOString().split('T')[0] : '',
            address: s.address || ''
        });
        setEditId(s._id);
        setShowForm(true);
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                    <select value={filterGrade} onChange={function (e) { setFilterGrade(e.target.value); setPage(1); }} className="bg-dark-700 border border-dark-500/40 text-dark-50 text-xs px-3 py-2 rounded-lg outline-none focus:border-accent cursor-pointer">
                        <option value="">All Grades</option><option>A</option><option>B</option><option>C</option><option>D</option><option>F</option>
                    </select>
                    <select value={filterDept} onChange={function (e) { setFilterDept(e.target.value); setPage(1); }} className="bg-dark-700 border border-dark-500/40 text-dark-50 text-xs px-3 py-2 rounded-lg outline-none focus:border-accent cursor-pointer">
                        <option value="">All Departments</option>{depts.map(function (d) { return <option key={d}>{d}</option>; })}
                    </select>
                    <select value={filterStatus} onChange={function (e) { setFilterStatus(e.target.value); setPage(1); }} className="bg-dark-700 border border-dark-500/40 text-dark-50 text-xs px-3 py-2 rounded-lg outline-none focus:border-accent cursor-pointer">
                        <option value="">All Status</option><option>Active</option><option>Inactive</option>
                    </select>
                    <select value={filterFee} onChange={function (e) { setFilterFee(e.target.value); setPage(1); }} className="bg-dark-700 border border-dark-500/40 text-dark-50 text-xs px-3 py-2 rounded-lg outline-none focus:border-accent cursor-pointer">
                        <option value="">All Fees</option><option>Paid</option><option>Pending</option><option>Overdue</option>
                    </select>
                </div>
                <button onClick={function () { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-dark-900 hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20 transition-all">
                    <i className="fa-solid fa-plus"></i>Add Student
                </button>
            </div>

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
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider">DOB / Age</th>
                                <th onClick={function () { handleSort('feeStatus'); }} className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider cursor-pointer hover:text-accent">Fee <i className="fa-solid fa-sort ml-1 opacity-30"></i></th>
                                <th onClick={function () { handleSort('status'); }} className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider cursor-pointer hover:text-accent">Status <i className="fa-solid fa-sort ml-1 opacity-30"></i></th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-500/20">
                            {paged.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-dark-300"><i className="fa-solid fa-user-graduate text-3xl opacity-20 mb-3 block"></i><p>No students found</p></td></tr>
                            ) : paged.map(function (s) {
                                // var pct = attPct(s.attendance);
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
                                            <div className="text-xs"><span className="text-dark-50 font-medium">{formatDate(s.dob)}</span><span className="text-dark-300 ml-2">({calcAge(s.dob)} yrs)</span></div>
                                        </td>
                                        <td className="px-4 py-3"><span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold " + feeClasses[s.feeStatus]}><i className={"fa-solid " + (s.feeStatus === 'Paid' ? 'fa-check' : 'fa-clock') + " text-[8px]"}></i>{s.feeStatus}</span></td>
                                        <td className="px-4 py-3"><span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold " + statusClasses[s.status]}><span className={"w-1.5 h-1.5 rounded-full " + (s.status === 'Active' ? 'bg-accent shadow-[0_0_6px_rgba(0,229,160,.5)]' : 'bg-rose2')}></span>{s.status}</span></td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={function () { setShowProfile(s); }} className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:text-accent hover:border-accent hover:bg-accent/10 flex items-center justify-center text-[10px] transition-all"><i className="fa-solid fa-eye"></i></button>
                                                <button onClick={function () { openEdit(s); }} className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:text-accent hover:border-accent hover:bg-accent/10 flex items-center justify-center text-[10px] transition-all"><i className="fa-solid fa-pen"></i></button>
                                                <button onClick={function () { handleDelete(s._id); }} className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:text-rose2 hover:border-rose2 hover:bg-rose2/10 flex items-center justify-center text-[10px] transition-all"><i className="fa-solid fa-trash"></i></button>
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
                        {Array.from({ length: totalPages }, function (_, i) {
                            return <button key={i} onClick={function () { setPage(i + 1); }} className={"w-7 h-7 rounded border flex items-center justify-center text-[10px] font-semibold " + (page === i + 1 ? 'bg-accent text-dark-900 border-accent' : 'border-dark-500/40 text-dark-300 hover:border-accent hover:text-accent')}>{i + 1}</button>;
                        })}
                        <button onClick={function () { setPage(function (p) { return Math.min(totalPages, p + 1); }); }} disabled={page === totalPages} className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:border-accent hover:text-accent flex items-center justify-center text-[10px] disabled:opacity-30 disabled:pointer-events-none"><i className="fa-solid fa-angle-right"></i></button>
                        <button onClick={function () { setPage(totalPages); }} disabled={page === totalPages} className="w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:border-accent hover:text-accent flex items-center justify-center text-[10px] disabled:opacity-30 disabled:pointer-events-none"><i className="fa-solid fa-angles-right"></i></button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={function () { setShowForm(false); }}>
                    <div className="bg-dark-700 border border-dark-500/30 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={function (e) { e.stopPropagation(); }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500/30">
                            <h3 className="text-sm font-semibold">{editId ? 'Edit Student' : 'Add New Student'}</h3>
                            <button onClick={function () { setShowForm(false); }} className="w-8 h-8 rounded-lg border border-dark-500/40 text-dark-300 hover:text-rose2 hover:border-rose2 flex items-center justify-center text-xs"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Full Name</label>
                                    <input required value={form.name} onChange={function (e) { setForm(Object.assign({}, form, { name: e.target.value })); }} className="bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 placeholder-dark-300/40" placeholder="Arjun Sharma" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Email</label>
                                    <input type="email" required value={form.email} onChange={function (e) { setForm(Object.assign({}, form, { email: e.target.value })); }} className="bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 placeholder-dark-300/40" placeholder="arjun@example.com" />
                                    <span className="text-[10px] text-dark-300 mt-1">Must be a valid email like name@example.com</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Phone</label>
                                    <div className="flex items-center">
                                        <span className="bg-dark-800 border border-r-0 border-dark-500/40 text-dark-300 text-xs px-3 py-2.5 rounded-l-lg">+91</span>
                                        <input required value={form.phone} onChange={function (e) { setForm(Object.assign({}, form, { phone: e.target.value })); }} maxLength="10" className="bg-dark-800 border border-l-0 border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-r-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 placeholder-dark-300/40" placeholder="9876543210" />
                                    </div>
                                    <span className="text-[10px] text-dark-300 mt-1">Enter exactly 10 digits after +91</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Date of Birth</label>
                                    <input type="date" required value={form.dob} onChange={function (e) { setForm(Object.assign({}, form, { dob: e.target.value })); }} max={new Date().toISOString().split('T')[0]} className="bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 cursor-pointer" />
                                    <span className="text-[10px] text-dark-300 mt-1">Age is calculated automatically from DOB</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Grade</label>
                                    <select value={form.grade} onChange={function (e) { setForm(Object.assign({}, form, { grade: e.target.value })); }} className="bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent cursor-pointer"><option>A</option><option>B</option><option>C</option><option>D</option><option>F</option></select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Department</label>
                                    <select value={form.department} onChange={function (e) { setForm(Object.assign({}, form, { department: e.target.value })); }} className="bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent cursor-pointer">
                                        {DEPARTMENTS.map(function (d) { return <option key={d}>{d}</option>; })}
                                    </select>
                                    <span className="text-[10px] text-dark-300 mt-1">6 predefined departments</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Status</label>
                                    <select value={form.status} onChange={function (e) { setForm(Object.assign({}, form, { status: e.target.value })); }} className="bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent cursor-pointer"><option>Active</option><option>Inactive</option></select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Fee Status</label>
                                    <select value={form.feeStatus} onChange={function (e) { setForm(Object.assign({}, form, { feeStatus: e.target.value })); }} className="bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent cursor-pointer"><option>Paid</option><option>Pending</option><option>Overdue</option></select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Fee Amount</label>
                                    <input type="number" min="0" value={form.feeAmount} onChange={function (e) { setForm(Object.assign({}, form, { feeAmount: e.target.value })); }} className="bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 placeholder-dark-300/40" placeholder="25000" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Enrollment Date</label>
                                    <input type="date" value={form.enrollDate} onChange={function (e) { setForm(Object.assign({}, form, { enrollDate: e.target.value })); }} className="bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent cursor-pointer" />
                                </div>
                                <div className="flex flex-col gap-1.5 col-span-2">
                                    <label className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Address</label>
                                    <textarea value={form.address} onChange={function (e) { setForm(Object.assign({}, form, { address: e.target.value })); }} rows="2" className="bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 placeholder-dark-300/40 resize-y" placeholder="Hostel Block A, Room 204"></textarea>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end mt-5">
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
                                    <p className="text-xs text-dark-300 mt-0.5">{showProfile.email}{showProfile.phone ? ' . ' + showProfile.phone : ''}</p>
                                    <div className="flex gap-2 mt-2.5 flex-wrap">
                                        <span className={"inline-flex px-2.5 py-0.5 rounded text-[10px] font-semibold " + gradeClasses[showProfile.grade]}>Grade {showProfile.grade}</span>
                                        <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold " + statusClasses[showProfile.status]}><span className={"w-1.5 h-1.5 rounded-full " + (showProfile.status === 'Active' ? 'bg-accent' : 'bg-rose2')}></span>{showProfile.status}</span>
                                        <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold " + feeClasses[showProfile.feeStatus]}><i className={"fa-solid " + (showProfile.feeStatus === 'Paid' ? 'fa-check' : 'fa-clock') + " text-[8px]"}></i>{showProfile.feeStatus}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div><div className="text-[10px] text-dark-300 uppercase tracking-wider">Date of Birth</div><div className="font-medium mt-0.5">{formatDate(showProfile.dob)} <span className="text-dark-300">({calcAge(showProfile.dob)} yrs)</span></div></div>
                                <div><div className="text-[10px] text-dark-300 uppercase tracking-wider">Department</div><div className="font-medium mt-0.5">{showProfile.department}</div></div>
                                <div><div className="text-[10px] text-dark-300 uppercase tracking-wider">Enrolled</div><div className="font-medium mt-0.5">{showProfile.enrollDate ? new Date(showProfile.enrollDate).toISOString().split('T')[0] : 'N/A'}</div></div>
                                <div><div className="text-[10px] text-dark-300 uppercase tracking-wider">Fee Amount</div><div className="font-medium mt-0.5">Rs. {(showProfile.feeAmount || 0).toLocaleString()}</div></div>
                                <div className="col-span-2">
                                    <div className="text-[10px] text-dark-300 uppercase tracking-wider">Attendance — {attPct(showProfile.attendance)}%</div>
                                    <div className="w-full h-2.5 rounded-full bg-dark-800 mt-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: attPct(showProfile.attendance) + '%', background: attColor(attPct(showProfile.attendance)) }}></div></div>
                                    <div className="text-[10px] text-dark-300 mt-1">{showProfile.attendance ? showProfile.attendance.present : 0} of {showProfile.attendance ? showProfile.attendance.totalClasses : 0} classes</div>
                                </div>
                                <div className="col-span-2"><div className="text-[10px] text-dark-300 uppercase tracking-wider">Address</div><div className="font-medium mt-0.5">{showProfile.address || 'Not provided'}</div></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Students;