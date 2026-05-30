import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  History,
  MessageSquare,
  Settings,
} from "lucide-react";

const mainNav = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/patients", label: "Patients", icon: Users },
  { path: "/assessment", label: "Assessment", icon: ClipboardList },
  { path: "/history", label: "History", icon: History },
];

const toolsNav = [
  { path: "/chatbot", label: "Clinical Chat", icon: MessageSquare },
  { path: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = () => {
  const renderItem = (item: (typeof mainNav)[0]) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        `sidebar-nav-item${isActive ? " sidebar-nav-item--active" : ""}`
      }
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <aside className="sidebar">
      <nav aria-label="Main navigation">
        <p className="sidebar-section-label">Clinical</p>
        {mainNav.map(renderItem)}

        <div
          className="mx-4 my-3"
          style={{ borderTop: "1px solid var(--color-border-default)" }}
          role="separator"
        />

        <p className="sidebar-section-label">Tools</p>
        {toolsNav.map(renderItem)}
      </nav>
    </aside>
  );
};

export default Sidebar;
