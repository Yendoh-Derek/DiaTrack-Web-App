import type { ReactNode } from "react";
import Topbar from "./Topbar.tsx";
import Sidebar from "./Sidebar.tsx";

interface AppLayoutProps {
  children: ReactNode;
  activePatient?: { name: string; mrn: string } | null;
}

const AppLayout = ({ children, activePatient }: AppLayoutProps) => {
  return (
    <div className="page-layout">
      <Topbar activePatient={activePatient} />
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default AppLayout;
