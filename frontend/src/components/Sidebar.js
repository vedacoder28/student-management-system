function Sidebar({ page, setPage, studentCount, onExport }) {
    const navItems = [
        { key: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
        { key: 'students', icon: 'fa-users', label: 'Students', badge: studentCount },
        { key: 'attendance', icon: 'fa-clipboard-check', label: 'Attendance' },
    ];

    return (
        <aside className="no-print w-60 bg-dark-900 border-r border-dark-500/30 flex flex-col shrink-0 z-20">
            <div className="flex items-center gap-3 px-5 py-5 border-b border-dark-500/30">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-dark-900 text-sm font-bold">
                    <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <span className="font-bold text-sm tracking-tight">StudentMS</span>
            </div>
            <nav className="flex-1 p-3 flex flex-col gap-1">
                {navItems.map(item => (
                    <button key={item.key} onClick={() => setPage(item.key)}
                        className={"flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all w-full text-left " + (page === item.key ? 'bg-accent/10 text-accent font-semibold' : 'text-dark-300 hover:bg-dark-500/30 hover:text-dark-50')}>
                        <i className={"fa-solid " + item.icon + " w-5 text-center text-sm"}></i>
                        <span>{item.label}</span>
                        {item.badge !== undefined && <span className="ml-auto bg-accent text-dark-900 text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
                    </button>
                ))}
                <div className="h-px bg-dark-500/30 my-2"></div>
                <button onClick={() => setPage('reports')}
                    className={"flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all w-full text-left " + (page === 'reports' ? 'bg-accent/10 text-accent font-semibold' : 'text-dark-300 hover:bg-dark-500/30 hover:text-dark-50')}>
                    <i className="fa-solid fa-file-lines w-5 text-center text-sm"></i>
                    <span>Reports</span>
                </button>
                <button onClick={onExport}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all w-full text-left text-dark-300 hover:bg-dark-500/30 hover:text-dark-50">
                    <i className="fa-solid fa-download w-5 text-center text-sm"></i>
                    <span>Export CSV</span>
                </button>
            </nav>
            <div className="p-4 border-t border-dark-500/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky2 to-violet2 flex items-center justify-center text-white text-[10px] font-bold">AD</div>
                <div>
                    <div className="text-xs font-semibold">Admin User</div>
                    <div className="text-[10px] text-dark-300">Super Admin</div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;