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
function formatDate(d) { if (!d) return 'N/A'; var dt = new Date(d); var dd = String(dt.getDate()).padStart(2, '0'); var mm = String(dt.getMonth() + 1).padStart(2, '0'); var yyyy = dt.getFullYear(); return dd + '/' + mm + '/' + yyyy; }
function calcAge(dob) { if (!dob) return ''; var today = new Date(); var birth = new Date(dob); var age = today.getFullYear() - birth.getFullYear(); var m = today.getMonth() - birth.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--; return age; }

var emptyForm = {
    name: '', email: '', phone: '', dob: '', grade: 'A',
    department: 'Computer Science', status: 'Active', feeStatus: 'Pending',
    feeAmount: '', enrollDate: new Date().toISOString().split('T')[0],
    address: '',
    currentSem: 1,
    cgpa: ''
};

function Students({ students, setStudents, search, addToast, fetchStudents }) {

    // ✅ FIXED: moved inside component
    var [showAcademic, setShowAcademic] = useState(null);

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
        setForm(s);
        setEditId(s._id);
        setShowForm(true);
    }

    return (
        <div>

            {/* TABLE */}
            <table className="w-full text-xs">
                <tbody>
                    {paged.map(function (s) {
                        return (
                            <tr key={s._id}>
                                <td>{s.name}</td>

                                <td>
                                    <div className="flex gap-1">
                                        <button onClick={() => setShowProfile(s)}>👁</button>
                                        <button onClick={() => openEdit(s)}>✏️</button>
                                        <button onClick={() => handleDelete(s._id)}>🗑</button>

                                        {/* ✅ FIXED: moved inside map */}
                                        <button onClick={() => setShowAcademic(s)} title="Academic Details">
                                            🎓
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* PROFILE */}
            {showProfile && (
                <div>
                    <h3>{showProfile.name}</h3>
                    <button onClick={() => setShowProfile(null)}>Close</button>
                </div>
            )}

            {/* ✅ FIXED: added at bottom */}
            {showAcademic && (
                <AcademicDetails
                    student={showAcademic}
                    onClose={() => setShowAcademic(null)}
                    onSave={fetchStudents}
                    addToast={addToast}
                />
            )}

        </div>
    );
}

export default Students;