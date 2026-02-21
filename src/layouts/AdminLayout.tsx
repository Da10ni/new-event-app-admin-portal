import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
