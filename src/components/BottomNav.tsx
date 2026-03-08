import { Home, Grid3X3, Calendar, BarChart3, ShoppingBag, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "الرئيسية", path: "/" },
  { icon: Grid3X3, label: "الخلايا", path: "/hives" },
  { icon: ShoppingBag, label: "المتجر", path: "/store" },
  { icon: BarChart3, label: "التحليلات", path: "/analytics" },
  { icon: Calendar, label: "الجدولة", path: "/schedule" },
  { icon: User, label: "حسابي", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "animate-pulse-honey" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
