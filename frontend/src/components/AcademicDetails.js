import { useState } from 'react';
import axios from 'axios';

const API = 'https://student-backend-05xx.onrender.com/api';

function AcademicDetails({ student, onClose, onSave, addToast }) {
    const [semResults, setSemResults] = useState(
        Array.from({ length: 8 }, (_, i) => {
            const existing = (student.semResults || []).find(r => r.sem === i + 1);
            return { sem: i + 1, sgpa: existing ? existing.sgpa : '', totalCredits: existing ? existing.totalCredits : '' };
        })
    );

    const [subjects, setSubjects] = useState(
        (student.currentSubjects || []).map(s => ({ ...s, _isNew: false }))
    );

    const totalCredits = subjects.reduce((sum, s) => sum + (parseInt(s.credits) || 0), 0);

    function addSubject() {
        if (totalCredits >= 40) { addToast('Total credits cannot exceed 40', 'error'); return; }
        setSubjects([...subjects, { name: '', code: '', credits: '', _isNew: true }]);
    }

    function updateSubject(idx, field, value) {
        const updated = subjects.map((s, i) => i === idx ? { ...s, [field]: value } : s);
        setSubjects(updated);
    }

    function removeSubject(idx) {
        setSubjects(subjects.filter((_, i) => i !== idx));
    }

    async function handleSave() {
        // Validate subjects
        for (const s of subjects) {
            if (!s.name.trim()) { addToast('All subjects must have a name', 'error'); return; }
            if (!s.credits || parseInt(s.credits) < 1) { addToast('All subjects must have valid credits', 'error'); return; }
        }
        if (totalCredits > 40) { addToast('Total credits cannot exceed 40', 'error'); return; }

        const cleanedResults = semResults
            .filter(r => r.sgpa !== '' && r.sgpa !== null)
            .map(r => ({ sem: r.sem, sgpa: parseFloat(r.sgpa), totalCredits: parseInt(r.totalCredits) || 0 }));

        const cleanedSubjects = subjects.map(s => ({
            ...(s._id ? { _id: s._id } : {}),
            name: s.name.trim(),
            code: s.code.trim(),
            credits: parseInt(s.credits)
        }));

        try {
            await axios.put(`${API}/students/${student._id}`, {
                semResults: cleanedResults,
                currentSubjects: cleanedSubjects
            });
            addToast('Academic details saved!');
            onSave();
            onClose();
        } catch (err) {
            addToast('Error saving academic details', 'error');
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5"
            onClick={onClose}>
            <div className="bg-dark-700 border border-dark-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500/30">
                    <div>
                        <h3 className="text-sm font-semibold">Academic Details</h3>
                        <p className="text-[10px] text-dark-300 mt-0.5">{student.name} · Sem {student.currentSem} · {student.department}</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-lg border border-dark-500/40 text-dark-300 hover:text-rose2 hover:border-rose2 flex items-center justify-center text-xs">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Previous Sem Results */}
                    <div>
                        <h4 className="text-xs font-bold text-dark-50 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-chart-line text-accent text-xs"></i>
                            Previous Semester Results (SGPA)
                        </h4>
                        <div className="grid grid-cols-4 gap-3">
                            {semResults.map((r, i) => (
                                <div key={i} className={"rounded-lg border p-3 " + (i + 1 < student.currentSem ? 'border-dark-500/40 bg-dark-800' : i + 1 === student.currentSem ? 'border-accent/30 bg-accent/5' : 'border-dark-500/20 bg-dark-800/50 opacity-50')}>
                                    <div className="text-[10px] text-dark-300 mb-1.5">
                                        Sem {i + 1}
                                        {i + 1 === student.currentSem && <span className="ml-1 text-accent">(current)</span>}
                                    </div>
                                    <input
                                        type="number" min="0" max="10" step="0.01"
                                        placeholder="SGPA"
                                        value={r.sgpa}
                                        disabled={i + 1 > student.currentSem}
                                        onChange={e => setSemResults(semResults.map((x, j) => j === i ? { ...x, sgpa: e.target.value } : x))}
                                        className="w-full bg-dark-700 border border-dark-500/40 text-dark-50 text-xs px-2 py-1.5 rounded outline-none focus:border-accent disabled:opacity-30 disabled:cursor-not-allowed"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Current Subjects */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-dark-50 flex items-center gap-2">
                                <i className="fa-solid fa-book text-accent text-xs"></i>
                                Current Sem Subjects
                                <span className={"ml-2 text-[10px] px-2 py-0.5 rounded font-semibold " + (totalCredits > 40 ? 'bg-rose2/15 text-rose2' : totalCredits === 40 ? 'bg-accent/15 text-accent' : 'bg-amber2/15 text-amber2')}>
                                    {totalCredits}/40 credits
                                </span>
                            </h4>
                            <button onClick={addSubject} disabled={totalCredits >= 40}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-accent text-dark-900 hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <i className="fa-solid fa-plus"></i>Add Subject
                            </button>
                        </div>

                        {subjects.length === 0 ? (
                            <div className="text-center py-8 text-dark-300 text-xs border border-dashed border-dark-500/40 rounded-xl">
                                <i className="fa-solid fa-book-open text-2xl opacity-20 mb-2 block"></i>
                                No subjects added yet. Click "Add Subject" to start.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-2 px-1 mb-1">
                                    <div className="col-span-5 text-[10px] text-dark-300 uppercase tracking-wider">Subject Name</div>
                                    <div className="col-span-3 text-[10px] text-dark-300 uppercase tracking-wider">Code</div>
                                    <div className="col-span-2 text-[10px] text-dark-300 uppercase tracking-wider">Credits</div>
                                    <div className="col-span-2"></div>
                                </div>
                                {subjects.map((s, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <input value={s.name} onChange={e => updateSubject(idx, 'name', e.target.value)}
                                            placeholder="e.g. Data Structures"
                                            className="col-span-5 bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-2.5 py-2 rounded-lg outline-none focus:border-accent" />
                                        <input value={s.code} onChange={e => updateSubject(idx, 'code', e.target.value)}
                                            placeholder="e.g. CS301"
                                            className="col-span-3 bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-2.5 py-2 rounded-lg outline-none focus:border-accent" />
                                        <input type="number" min="1" max="10" value={s.credits}
                                            onChange={e => updateSubject(idx, 'credits', e.target.value)}
                                            placeholder="Cr"
                                            className="col-span-2 bg-dark-800 border border-dark-500/40 text-dark-50 text-xs px-2.5 py-2 rounded-lg outline-none focus:border-accent" />
                                        <button onClick={() => removeSubject(idx)}
                                            className="col-span-2 w-7 h-7 rounded border border-dark-500/40 text-dark-300 hover:text-rose2 hover:border-rose2 hover:bg-rose2/10 flex items-center justify-center text-[10px] transition-all">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 justify-end px-6 py-4 border-t border-dark-500/30">
                    <button onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-dark-500/40 bg-dark-700 text-dark-50 hover:border-accent hover:text-accent">
                        Cancel
                    </button>
                    <button onClick={handleSave}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-dark-900 hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20">
                        Save Academic Details
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AcademicDetails;