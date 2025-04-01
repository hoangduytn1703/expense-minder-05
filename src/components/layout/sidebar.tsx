
import { NavLink } from "react-router-dom";
import { Clock, PiggyBank } from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Quản lý nợ",
      path: "/debts",
      icon: <PiggyBank className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="bg-gray-100 w-64 min-h-screen">
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold mb-4">Quản Lý Chi Tiêu</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200"
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
