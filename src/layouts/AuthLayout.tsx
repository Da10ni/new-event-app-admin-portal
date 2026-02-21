import { Outlet } from 'react-router-dom';
import { APP_NAME } from '../config/constants';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
          <p className="text-neutral-400 text-sm mt-1">Administration Portal</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-modal p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-neutral-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} Events Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
