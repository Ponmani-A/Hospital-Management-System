import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  Building2,
  FileText,
  Receipt,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Patients",
      path: "/patients",
      icon: Users,
    },
    {
      name: "Doctors",
      path: "/doctors",
      icon: Stethoscope,
    },
    {
      name: "Appointments",
      path: "/appointments",
      icon: CalendarDays,
    },
    {
      name: "Departments",
      path: "/departments",
      icon: Building2,
    },
    {
      name: "Prescriptions",
      path: "/prescriptions",
      icon: FileText,
    },
    {
      name: "Billing",
      path: "/billing",
      icon: Receipt,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Overlay */}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}

        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
              +
            </div>

            <div>
              <h1 className="text-base font-bold text-slate-900">MediCare</h1>

              <p className="text-[11px] text-slate-400">Hospital Management</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={19} strokeWidth={isActive ? 2.3 : 2} />

                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Bottom */}

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              A
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                Admin
              </p>

              <p className="truncate text-xs text-slate-400">Hospital Staff</p>
            </div>
          </div>

          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}

        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Hospital Management System
              </p>
            </div>
          </div>

          {/* Right Side */}

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-700">Admin</p>

              <p className="text-xs text-slate-400">Administrator</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
