import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout = () => {
    return (
        <div className="flex h-screen overflow-hidden relative z-10 w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
                <Topbar />

                {/* Background Glow Effects (subtle in main area too) */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

                <main className="flex-1 overflow-y-auto p-8 relative z-0">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
