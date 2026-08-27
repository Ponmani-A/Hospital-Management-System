import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.startsWith("/patients")) {
      return "Patients";
    }

    if (path.startsWith("/doctors")) {
      return "Doctors";
    }

    if (path.startsWith("/appointments")) {
      return "Appointments";
    }

    if (path.startsWith("/departments")) {
      return "Departments";
    }

    if (path.startsWith("/prescriptions")) {
      return "Prescriptions";
    }

    if (path.startsWith("/billing")) {
      return "Billing";
    }

    return "Dashboard";
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Page Title */}
        <div>
          <p className="text-xs text-slate-400">Hospital Management</p>

          <h2 className="text-sm font-semibold text-slate-800">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50">
            🔔
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200" />

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              A
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">Admin</p>

              <p className="text-[11px] text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
