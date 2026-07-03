import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  //   ClipboardList,
  LayoutDashboard,
  ReceiptIndianRupee,
  //   Settings,
  Users,
  UserRoundPlus,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
}

const navigationItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Leads", to: "/leads", icon: UserRoundPlus },
  { label: "Members", to: "/members", icon: Users },
  { label: "Payments", to: "/payments", icon: ReceiptIndianRupee },
  { label: "Appointments", to: "/appointments", icon: CalendarDays },
];

const managementItems = [
  { label: "Expenses", to: "/expenses", icon: CircleDollarSign },
  { label: "Reports", to: "/reports", icon: BarChart3 },
  { label: "Membership Plans", to: "/plans", icon: CalendarDays },
];

function NavigationSection({
  items,
  onNavigate,
}: {
  items: typeof navigationItems;
  onNavigate: () => void;
}) {
  return (
    <nav className="space-y-1.5">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[0_8px_20px_rgb(217_12_19_/_24%)]"
                  : "text-white/80 hover:bg-white/8 hover:text-white",
              )
            }
          >
            <Icon className="size-[19px] shrink-0" strokeWidth={2} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppSidebar({ isOpen,
  onClose,
  onNavigate }: SidebarProps) {
  return (
    <>
      <button
        aria-label="Close navigation menu"
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden",
          isOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        type="button"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-[248px] flex-col bg-[#151515] px-3 py-4 shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-5 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <img
              alt="SK Fitness logo"
              className="size-12 rounded-full border border-white/20 bg-white object-cover"
              src="./sk-fitness-logo.png"
            />

            <div>
              <p className="text-base font-black tracking-tight text-white">
                SK FITNESS
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Fitness Center
              </p>
            </div>
          </div>

          <button
            aria-label="Close navigation menu"
            className="rounded-md p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-1">
          <NavigationSection items={navigationItems} onNavigate={onNavigate} />
          <NavigationSection items={managementItems} onNavigate={onNavigate} />
        </div>

        <div className="mt-5 rounded-xl border border-white/15 px-2 py-2">
          {/* <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-white/80 hover:bg-white/8 hover:text-white",
              )
            }
          >
        <Settings className="size-[19px]" strokeWidth={2} />
            Settings
          </NavLink> */}

          <div className="mx-3 border-t border-white/10" />

          <div className="px-3 py-3">
            <p className="text-sm font-bold text-primary">SK FITNESS</p>
            <p className="mt-1 text-xs leading-5 text-white/65">
              Indore, Madhya Pradesh
            </p>
            <p className="mt-2 text-xs font-medium text-white/80">
              +91 93991 40148
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}