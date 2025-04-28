import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  BarChart, 
  Users, 
  FileText, 
  Building, 
  User, 
  Banknote 
} from "lucide-react";

export function Sidebar({ className }: { className?: string }) {
  const isMobile = useIsMobile();

  const links = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart,
    },
    {
      title: "Users",
      href: "/users",
      icon: Users,
    },
    {
      title: "Sites",
      href: "/sites",
      icon: Building,
    },
    {
      title: "Account Logins",
      href: "/account-logins",
      icon: User,
    },
    {
      title: "Bank Accounts",
      href: "/bank-accounts",
      icon: Banknote,
    },
    {
      title: "Logs",
      href: "/logs",
      icon: FileText,
    },
  ];

  return (
    <div
      className={cn(
        "pb-12 w-full lg:w-60",
        isMobile && "hidden lg:block",
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Main Menu
          </h2>
          <div className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                    isActive
                      ? "bg-muted font-medium text-primary"
                      : "text-muted-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span>{link.title}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
