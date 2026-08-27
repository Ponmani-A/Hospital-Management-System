import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▣",
    },
    {
      name: "Patients",
      path: "/patients",
      icon: "♙",
    },
    {
      name: "Doctors",
      path: "/doctors",
      icon: "⚕",
    },
    {
      name: "Appointments",
      path: "/appointments",
      icon: "▤",
    },
    {
      name: "Departments",
      path: "/departments",
      icon: "▦",
    },
    {
      name: "Prescriptions",
      path: "/prescriptions",
      icon: "▤",
    },
    {
      name: "Billing",
      path: "/billing",
      icon: "▣",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            +
          </div>

          <div>
            <h1 className="text-base font-bold text-slate-900">MediCare</h1>

            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Hospital Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <span className="flex w-5 justify-center text-base">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700">Hospital Admin</p>

          <p className="mt-1 text-[11px] text-slate-400">Management Portal</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
