const gradeClasses = { A: 'bg-accent/15 text-accent', B: 'bg-sky2/15 text-sky2', C: 'bg-amber2/15 text-amber2', D: 'bg-rose2/15 text-rose2', F: 'bg-rose2/25 text-rose2' };

function Reports({ students }) {
    const total = students.length;
    const active = students.filter(s => s.status === 'Active').length;
    const attAvg = total ? Math.round(students.reduce((a, s) => a + (s.attendance && s.attendance.totalClasses ? Math.round((s.attendance.present / s.attendance.totalClasses) * 100) : 0), 0) / total) : 0;
    const gMap = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    const avgGPA = total ? (students.reduce((a, s) => a + (gMap[s.grade] || 0), 0) / total).toFixed(2) : '0.00';
    const toppers = students.filter(s => s.grade === 'A').length;

    const deptMap = {};
    students.forEach(s => {
        if (!deptMap[s.department]) deptMap[s.department] = { A: 0, B: 0, C: 0, D: 0, F: 0, total: 0 };
        deptMap[s.department][s.grade]++;
        deptMap[s.department].total++;
    });

    const feePaid = students.filter(s => s.feeStatus === 'Paid').reduce((a, s) => a + (s.feeAmount || 0), 0);
    const feePending = students.filter(s => s.feeStatus !== 'Paid').reduce((a, s) => a + (s.feeAmount || 0), 0);
    const paidCount = students.filter(s => s.feeStatus === 'Paid').length;
    const overdueCount = students.filter(s => s.feeStatus === 'Overdue').length;

    const metrics = [
        { label: 'Total Students', val: total, color: 'text-accent' },
        { label: 'Active', val: active, color: 'text-sky2' },
        { label: 'Avg Attendance', val: attAvg + '%', color: 'text-amber2' },
        { label: 'Avg GPA', val: avgGPA, color: 'text-violet2' },
        { label: 'Grade A Toppers', val: toppers, color: 'text-accent' },
        { label: 'Need Improvement', val: total - toppers, color: 'text-rose2' },
    ];

    return (
        <div>
            <div className="bg-dark-700 border border-dark-500/30 rounded-xl p-6 mb-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-chart-simple text-accent text-xs"></i>Academic Summary
                </h3>
                <div className="grid grid-cols-6 gap-3">
                    {metrics.map((m, i) => (
                        <div key={i} className="bg-dark-800 rounded-lg p-3.5 text-center">
                            <div className={"text-lg font-bold " + m.color}>{m.val}</div>
                            <div className="text-[9px] text-dark-300 uppercase tracking-wider mt-0.5">{m.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-dark-700 border border-dark-500/30 rounded-xl p-6 mb-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-ranking-star text-accent text-xs"></i>Grade Breakdown by Department
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-dark-800">
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-dark-300 uppercase tracking-wider">Department</th>
                                {['A', 'B', 'C', 'D', 'F'].map(g => (
                                    <th key={g} className="text-center px-4 py-3 text-[10px] font-bold text-dark-300 uppercase">{g}</th>
                                ))}
                                <th className="text-center px-4 py-3 text-[10px] font-bold text-dark-300 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-500/20">
                            {Object.entries(deptMap).map(([dept, g]) => (
                                <tr key={dept} className="hover:bg-accent/[.02] transition-colors">
                                    <td className="px-4 py-3 font-semibold">{dept}</td>
                                    {['A', 'B', 'C', 'D', 'F'].map(grade => (
                                        <td key={grade} className="px-4 py-3 text-center">
                                            <span className={"inline-flex px-2.5 py-0.5 rounded text-[10px] font-semibold " + gradeClasses[grade]}>{g[grade]}</span>
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-center font-bold">{g.total}</td>
                                </tr>
                            ))}
                            {Object.keys(deptMap).length === 0 && (
                                <tr><td colSpan={7} className="text-center py-8 text-dark-300">No data yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-dark-700 border border-dark-500/30 rounded-xl p-6 mb-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-money-bill-wave text-accent text-xs"></i>Fee Collection Report
                </h3>
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-dark-800 rounded-lg p-3.5 text-center">
                        <div className="text-lg font-bold text-accent">Rs. {feePaid.toLocaleString()}</div>
                        <div className="text-[9px] text-dark-300 uppercase tracking-wider mt-0.5">Collected ({paidCount})</div>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-3.5 text-center">
                        <div className="text-lg font-bold text-amber2">Rs. {feePending.toLocaleString()}</div>
                        <div className="text-[9px] text-dark-300 uppercase tracking-wider mt-0.5">Pending</div>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-3.5 text-center">
                        <div className="text-lg font-bold text-rose2">{overdueCount}</div>
                        <div className="text-[9px] text-dark-300 uppercase tracking-wider mt-0.5">Overdue</div>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-3.5 text-center">
                        <div className="text-lg font-bold text-sky2">{total ? Math.round(paidCount / total * 100) : 0}%</div>
                        <div className="text-[9px] text-dark-300 uppercase tracking-wider mt-0.5">Collection Rate</div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-dark-900 hover:bg-accent-light transition-all">
                    <i className="fa-solid fa-print"></i>Print Full Report
                </button>
            </div>
        </div>
    );
}

export default Reports;