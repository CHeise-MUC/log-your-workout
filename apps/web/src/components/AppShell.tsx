"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  type LucideIcon,
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  Zap,
  TrendingUp,
  Inbox,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { apiUrl } from "@/lib/api";

type DbProfile = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "TRAINER";
};

type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

// ─── Sidebar-Breiten ─────────────────────────────────────────────
const SIDEBAR_DEFAULT = 256;
const SIDEBAR_MIN = 64;
const SIDEBAR_MAX = 360;
const COLLAPSE_THRESHOLD = 140;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState<DbProfile | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = sessionStorage.getItem("userProfile");
      return cached ? (JSON.parse(cached) as DbProfile) : null;
    } catch {
      return null;
    }
  });

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [viewAsUser, setViewAsUser] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("dashboardViewAsUser") === "true";
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ─── Dropdown bei Klick außen schließen ──────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Drag-to-Resize ───────────────────────────────────────────
  function onResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStartX.current;
      const next = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, dragStartWidth.current + delta));
      setSidebarWidth(next);
    }
    function onMouseUp(e: MouseEvent) {
      if (!isDragging.current) return;
      isDragging.current = false;
      const w = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, dragStartWidth.current + (e.clientX - dragStartX.current)));
      if (w < COLLAPSE_THRESHOLD) setSidebarWidth(SIDEBAR_MIN);
      else if (w < 200) setSidebarWidth(SIDEBAR_DEFAULT);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem("dashboardViewAsUser", String(viewAsUser));
  }, [viewAsUser]);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(apiUrl("/users/me"), {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data: DbProfile) => {
        setProfile(data);
        sessionStorage.setItem("userProfile", JSON.stringify(data));
      })
      .catch(() => {});
  }, [session]);

  const isCollapsed = sidebarWidth < COLLAPSE_THRESHOLD;
  const isTrainerAccount = profile?.role === "TRAINER";
  const isTrainerView = isTrainerAccount && !viewAsUser;

  // ─── Nav-Items mit Lucide-Icons ───────────────────────────────
  const navItems: NavItem[] = isTrainerView
    ? [
        { icon: LayoutDashboard, label: "Übersicht", href: "/trainer" },
        { icon: Users, label: "Kunden & Pläne", href: "/trainer/clients" },
        { icon: Dumbbell, label: "Übungen", href: "/dashboard/exercises" },
        { icon: ClipboardList, label: "Trainingspläne", href: "/dashboard/training-plans" },
      ]
    : [
        { icon: LayoutDashboard, label: "Übersicht", href: "/dashboard" },
        { icon: Zap, label: "Training starten", href: "/dashboard/workout" },
        { icon: Dumbbell, label: "Übungen", href: "/dashboard/exercises" },
        { icon: ClipboardList, label: "Trainingspläne", href: "/dashboard/training-plans" },
        { icon: TrendingUp, label: "Trainingshistorie", href: "/dashboard/history" },
        { icon: Inbox, label: "Zugewiesene Pläne", href: "/dashboard/assigned-plans" },
      ];

  const displayName = user?.user_metadata?.name ?? user?.email ?? "Unknown User";
  const initials = displayName.replace(/@.*/, "").slice(0, 2).toUpperCase();

  async function handleLogout() {
    sessionStorage.removeItem("userProfile");
    sessionStorage.removeItem("dashboardViewAsUser");
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Laden...</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className="fixed left-0 top-0 h-full flex flex-col z-20"
        style={{
          width: sidebarWidth,
          backgroundColor: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          transition: isDragging.current ? "none" : "width 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center flex-shrink-0"
          style={{
            height: "64px",
            padding: isCollapsed ? "0" : "0 1rem 0 1.25rem",
            justifyContent: isCollapsed ? "center" : "flex-start",
            borderBottom: isTrainerAccount ? "none" : "1px solid var(--color-border)",
          }}
        >
          <Dumbbell size={22} style={{ flexShrink: 0, color: "var(--color-accent)" }} />
          {!isCollapsed && (
            <span className="font-bold text-sm whitespace-nowrap ml-2.5"
              style={{ color: "var(--color-text-primary)" }}>
              Log your Workout
            </span>
          )}
        </div>

        {/* Ansicht-Umschalter: direkt unter dem Logo, nur für Trainer */}
        {isTrainerAccount && (
          <div
            className="flex-shrink-0"
            style={{
              padding: isCollapsed ? "0.5rem" : "0.625rem 0.75rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {isCollapsed ? (
              // Eingeklappt: nur ein kleines rundes Icon das die aktive Ansicht zeigt
              <button
                onClick={() => {
                  const next = !viewAsUser;
                  setViewAsUser(next);
                  router.push(next ? "/dashboard" : "/trainer");
                }}
                className="w-full flex items-center justify-center rounded-lg py-1.5 cursor-pointer text-xs font-bold"
                style={{
                  backgroundColor: "var(--color-accent-light)",
                  color: "var(--color-accent-text)",
                  border: "none",
                }}
                title={isTrainerView ? "Trainer-Ansicht (wechseln)" : "Nutzer-Ansicht (wechseln)"}
              >
                {isTrainerView ? "T" : "N"}
              </button>
            ) : (
              // Ausgeklappt: Segment-Control passend zur Sidebar
              <div
                className="flex w-full rounded-lg overflow-hidden"
                style={{
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                }}
              >
                <button
                  onClick={() => { setViewAsUser(true); router.push("/dashboard"); }}
                  className="flex-1 py-1.5 text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: !isTrainerView ? "var(--color-accent)" : "transparent",
                    color: !isTrainerView ? "#ffffff" : "var(--color-text-secondary)",
                    border: "none",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                  }}
                >
                  Nutzer
                </button>
                <button
                  onClick={() => { setViewAsUser(false); router.push("/trainer"); }}
                  className="flex-1 py-1.5 text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: isTrainerView ? "var(--color-accent)" : "transparent",
                    color: isTrainerView ? "#ffffff" : "var(--color-text-secondary)",
                    border: "none",
                    borderLeft: "1px solid var(--color-border)",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                  }}
                >
                  Trainer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav
          className="flex-1 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden"
          style={{ padding: isCollapsed ? "1rem 0.5rem" : "1rem 0.75rem" }}
        >
          {navItems.map((item) => {
            // Exact match always wins.
            // Prefix match (e.g. /dashboard/workout/123) only applies when the
            // href has ≥ 2 path segments – otherwise /dashboard would also
            // highlight when the user is on /dashboard/workout.
            const hrefDepth = item.href.split("/").filter(Boolean).length;
            const isActive =
              pathname === item.href ||
              (hrefDepth >= 2 && pathname.startsWith(item.href + "/"));
            const isHovered = hoveredItem === item.href;
            const Icon = item.icon;

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className="w-full flex items-center rounded-lg text-sm font-medium cursor-pointer"
                style={{
                  gap: isCollapsed ? 0 : "0.625rem",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  padding: isCollapsed ? "0.625rem" : "0.625rem 0.75rem",
                  backgroundColor: isActive
                    ? "var(--color-accent-light)"
                    : isHovered
                    ? "var(--color-bg)"
                    : "transparent",
                  color: isActive ? "var(--color-accent-text)" : "var(--color-text-secondary)",
                  transition: "background-color 0.1s ease, color 0.1s ease",
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse-Toggle */}
        <div
          className="flex-shrink-0 flex"
          style={{
            borderTop: "1px solid var(--color-border)",
            padding: isCollapsed ? "0.625rem 0.5rem" : "0.625rem 0.75rem",
            justifyContent: isCollapsed ? "center" : "flex-end",
          }}
        >
          <button
            onClick={() => setSidebarWidth((w) => w < COLLAPSE_THRESHOLD ? SIDEBAR_DEFAULT : SIDEBAR_MIN)}
            className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              transition: "background-color 0.1s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            title={isCollapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
          >
            {isCollapsed
              ? <ChevronRight size={16} />
              : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Resize-Handle */}
        <div
          onMouseDown={onResizeMouseDown}
          className="absolute top-0 right-0 h-full"
          style={{ width: "4px", cursor: "col-resize", zIndex: 30 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent-light)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        />
      </aside>

      {/* ── Rechter Bereich ───────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: sidebarWidth,
          transition: isDragging.current ? "none" : "margin-left 0.2s ease",
        }}
      >
        {/* Top Bar */}
        <header
          className="fixed top-0 right-0 z-10 flex items-center justify-end px-6"
          style={{
            left: sidebarWidth,
            height: "64px",
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            transition: isDragging.current ? "none" : "left 0.2s ease",
          }}
        >
          {/* Avatar-Dropdown (einziger Inhalt im Top Bar rechts) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer"
              style={{
                backgroundColor: dropdownOpen ? "var(--color-bg)" : "transparent",
                border: "none",
                transition: "background-color 0.1s ease",
              }}
              onMouseEnter={(e) => { if (!dropdownOpen) e.currentTarget.style.backgroundColor = "var(--color-bg)"; }}
              onMouseLeave={(e) => { if (!dropdownOpen) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor: "var(--color-accent-light)",
                  color: "var(--color-accent-text)",
                }}
              >
                {initials}
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                {displayName}
              </span>
              <ChevronRight
                size={14}
                style={{
                  color: "var(--color-text-muted)",
                  transform: dropdownOpen ? "rotate(90deg)" : "rotate(270deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                className="absolute right-0 rounded-xl py-1 z-50"
                style={{
                  top: "calc(100% + 6px)",
                  minWidth: "200px",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {displayName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {user.email}
                  </p>
                </div>
                <div className="py-1">
                  <DropdownItem
                    icon={Settings}
                    label="Einstellungen"
                    onClick={() => { setDropdownOpen(false); router.push("/dashboard/settings"); }}
                  />
                </div>
                <div className="py-1" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <DropdownItem
                    icon={LogOut}
                    label="Logout"
                    onClick={handleLogout}
                    danger
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Seiteninhalt */}
        <main className="flex-1 overflow-y-auto p-8" style={{ marginTop: "64px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── DropdownItem ─────────────────────────────────────────────────
function DropdownItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm cursor-pointer"
      style={{
        backgroundColor: hovered
          ? danger ? "var(--color-danger-light)" : "var(--color-bg)"
          : "transparent",
        color: danger ? "var(--color-danger-text)" : "var(--color-text-primary)",
        border: "none",
        transition: "background-color 0.1s ease",
      }}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}
