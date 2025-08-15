
import { NavLink } from "react-router-dom";
import { 
  Home, 
  ActivitySquare, 
  MessageSquare, 
  History, 
  Settings,
  Users
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/patients", label: "Patients", icon: Users },
  { path: "/assessment", label: "Assessment", icon: ActivitySquare },
  { path: "/chatbot", label: "Chat Bot", icon: MessageSquare },
  { path: "/history", label: "History", icon: History },
  { path: "/settings", label: "Settings", icon: Settings },
];

const MainNav = () => {
  const isMobile = useIsMobile();
  
  // For mobile, show 5 main items including Patients
  const displayItems = isMobile 
    ? navItems.slice(0, 5) 
    : navItems;

  return (
    <nav className="bg-diabetesSense-background border-b border-white/10 pb-1">
      <div className="container mx-auto">
        <div className="flex items-center justify-between overflow-x-auto hide-scrollbar">
          <div className="flex space-x-1 md:space-x-4 w-full justify-between px-2">
            {displayItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex flex-col items-center py-2 px-2 md:px-3 transition-colors rounded-md
                  ${isActive 
                    ? "text-diabetesSense-accent border-b-2 border-diabetesSense-accent" 
                    : "text-gray-400 hover:text-white"
                  }
                `}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{isMobile ? '' : item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
