import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Filler, Tooltip, Legend);

const COLORS = ['#00e5a0', '#38bdf8', '#f59e0b', '#ef4444', '#a78bfa', '#f472b6', '#34d399', '#fb923c'];

function Dashboard({ students }) {
    const total = students.length;
    const active = students.filter(s => s.status === 'Active').length;
    const attAvg = total ? Math.round(students.reduce((a, s) => a + (s.attendance && s.attendance.totalClasses ? Math.round((s.attendance.present / s.attendance.totalClasses) * 100) : 0), 0) / total) : 0;
    const feeCollected = students.filter(s => s.feeStatus === 'Paid').reduce((a, s) => a + (s.feeAmount || 0), 0);

    const statCards = [
        { icon: 'fa-users', label: 'Total Students', val: total, change: active + ' active', iconBg: 'bg-accent/10', iconColor: 'text-accent', valColor: 'text-accent', changeColor: 'text-accent', changeIcon: 'fa-arrow-up' },
        { icon: 'fa-clipboard-check', label: 'Avg Attendance', val: attAvg + '%', change: attAvg >= 75 ? 'Healthy' : 'Low', iconBg: 'bg-sky2/10', iconColor: 'text-sky2', valColor: 'text-sky2', changeColor: attAvg >= 75 ? 'text-accent' : 'text-rose2', changeIcon: attAvg >= 75 ? 'fa-check' : 'fa-triangle-exclamation' },
        { icon: 'fa-indian-rupee-sign', label: 'Fee Collected', val: (feeCollected / 1000).toFixed(0) + 'K', change: students.filter(s => s.feeStatus === 'Paid').length + ' paid', iconBg: 'bg-amber2/10', iconColor: 'text-amber2', valColor: 'text-amber2', changeColor: 'text-accent', changeIcon: 'fa-arrow-up' },
        { icon: 'fa-building-columns', label: 'Departments', val: new Set(students.map(s => s.department)).size, change: 'across campus', iconBg: 'bg-violet2/10', iconColor: 'text-violet2', valColor: 'text-violet2', changeColor: 'text-dark-300', changeIcon: 'fa-layer-group' },
    ];

    const deptMap = {};
    students.forEach(s => { deptMap[s.department] = (deptMap[s.department] || 0) + 1; });
    const deptLabels = Object.keys(deptMap);
    const deptData = Object.values(deptMap);
    const deptColors = deptLabels.map((_, i) => COLORS[i % COLORS.length]);

    const deptChartData = {
        labels: deptLabels,
        datasets: [{ data: deptData, backgroundColor: deptColors.map(c => c + '30'), borderColor: deptColors, borderWidth: 1.5, borderRadius: 6 }]
    };

    const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    students.forEach(s => { if (grades[s.grade] !== undefined) grades[s.grade]++; });

    const gradeChartData = {
        labels: Object.keys(grades),
        datasets: [{ data: Object.values(grades), backgroundColor: ['rgba(0,229,160,.65)', 'rgba(56,189,248,.65)', 'rgba(245,158,11,.65)', 'rgba(239,68,68,.65)', 'rgba(239,68,68,.35)'], borderWidth: 0, hoverOffset: 8 }]
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const enrollByMonth = months.map((_, i) => students.filter(s => new Date(s.enrollDate).getMonth() + 1 === i + 1).length);

    const trendChartData = {
        labels: months,
        datasets: [
            { label: 'Enrolled', data: enrollByMonth, borderColor: '#00e5a0', backgroundColor: 'rgba(0,229,160,.06)', fill: true, tension: .4, pointRadius: 4, pointBackgroundColor: '#00e5a0', borderWidth: 2 },
            { label: 'Active', data: enrollByMonth, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,.04)', fill: true, tension: .4, pointRadius: 4, pointBackgroundColor: '#38bdf8', borderWidth: 2 }
        ]
    };

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#5a6a85', usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } } } },
        scales: { x: { ticks: { color: '#5a6a85', font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: '#5a6a85', font: { size: 10 } }, grid: { color: '#1a2338' } } }
    };

    return (
        <div>
            <div className="grid grid-cols-4 gap-4 mb-6">
                {statCards.map((c, i) => (
                    <div key={i} className="bg-dark-700 border border-dark-500/30 rounded-xl p-5 hover:border-accent/40 transition-all relative overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-dark-500/10"></div>
                        <div className={"w-10 h-10 rounded-lg " + c.iconBg + " " + c.iconColor + " flex items-center justify-center text-sm mb-3"}>
                            <i className={"fa-solid " + c.icon}></i>
                        </div>
                        <div className={"text-2xl font-bold " + c.valColor + " leading-none"}>{c.val}</div>
                        <div className="text-[10px] text-dark-300 uppercase tracking-wider mt-1">{c.label}</div>
                        <div className={"text-[10px] font-semibold " + c.changeColor + " mt-2 flex items-center gap-1"}>
                            <i className={"fa-solid " + c.changeIcon + " text-[8px]"}></i>{c.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="col-span-3 bg-dark-700 border border-dark-500/30 rounded-xl p-5">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><i className="fa-solid fa-chart-bar text-accent text-xs"></i>Students by Department</h3>
                    <div className="h-52"><Bar data={deptChartData} options={{ ...chartOpts, plugins: { legend: { display: false } } }} /></div>
                </div>
                <div className="col-span-2 bg-dark-700 border border-dark-500/30 rounded-xl p-5">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><i className="fa-solid fa-chart-pie text-accent text-xs"></i>Grade Distribution</h3>
                    <div className="h-52"><Doughnut data={gradeChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'right', labels: { color: '#5a6a85', padding: 12, usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } } } } }} /></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-700 border border-dark-500/30 rounded-xl p-5">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><i className="fa-solid fa-chart-line text-accent text-xs"></i>Enrollment Trend</h3>
                    <div className="h-52"><Line data={trendChartData} options={chartOpts} /></div>
                </div>
                <div className="bg-dark-700 border border-dark-500/30 rounded-xl p-5">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><i className="fa-solid fa-clock-rotate-left text-amber2 text-xs"></i>Recent Activity</h3>
                    <div className="space-y-1 max-h-52 overflow-y-auto text-xs text-dark-300">
                        {students.slice(0, 8).map(s => (
                            <div key={s._id} className="flex items-start gap-3 py-2.5 border-b border-dark-500/20 last:border-0">
                                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-accent"></div>
                                <span>Student <strong className="text-accent">{s.name}</strong> enrolled in {s.department}</span>
                            </div>
                        ))}
                        {students.length === 0 && <p className="text-center py-8 opacity-50">No students yet</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;