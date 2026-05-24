"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { CRUDConfig } from "@repo/crud";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  Menu,
  Moon,
  Sun,
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Separator,
  cn,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  FolderOpen,
  Folder,
  ChevronDown,
  LogOut,
  NAV_ICONS,
} from "@repo/ui";
import type { LucideIcon } from "@repo/ui";
import type { AdminNavLink } from "../types";
import { useTheme } from "./ThemeProvider";

export interface AdminNavProps {
  navItems: (CRUDConfig | AdminNavLink)[];
  userEmail: string;
  appName?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
}

function isCRUDConfig(item: CRUDConfig | AdminNavLink): item is CRUDConfig {
  return "model" in item;
}

const MODEL_ICONS: Record<string, LucideIcon> = {
  user: Users,
  role: ShieldCheck,
  settings: Settings,
};

function getItemIcon(item: CRUDConfig | AdminNavLink): LucideIcon | null {
  if (isCRUDConfig(item)) {
    if (item.icon && NAV_ICONS[item.icon]) return NAV_ICONS[item.icon];
    return MODEL_ICONS[item.model.toLowerCase()] ?? null;
  }
  if (item.icon && NAV_ICONS[item.icon]) return NAV_ICONS[item.icon];
  return null;
}

function getItemHref(item: CRUDConfig | AdminNavLink): string {
  return isCRUDConfig(item) ? `/admin/${item.model}` : item.href;
}

function getItemGroup(item: CRUDConfig | AdminNavLink): string | undefined {
  return isCRUDConfig(item) ? item.navGroup : item.navGroup;
}

function BrandMark({ logoUrl, appName }: { logoUrl?: string | null; appName?: string | null }) {
  const name = appName || "Admin";
  const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl);

  useEffect(() => {
    setLocalLogoUrl(logoUrl);
  }, [logoUrl]);

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {localLogoUrl ? (
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={localLogoUrl}
            alt={name}
            fill
            className="object-contain"
            unoptimized
            onError={() => setLocalLogoUrl(null)}
          />
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold leading-none text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <span className="truncate text-sm font-bold text-foreground">{name}</span>
    </div>
  );
}

function NavLink({ href, label, active, onClick, icon: Icon, collapsed, indent }: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
  icon: LucideIcon | null;
  collapsed?: boolean;
  indent?: boolean;
}) {
  const link = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 py-2 rounded-md text-sm font-medium transition-colors border-l-2",
        indent && !collapsed ? "pl-6 pr-[10px]" : "px-[10px]",
        active
          ? "bg-primary/10 text-primary border-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent",
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className={cn(
        "truncate transition-opacity duration-150",
        collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
      )}>
        {label}
      </span>
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function NavContent({
  navItems,
  userEmail,
  appName,
  logoLightUrl,
  logoDarkUrl,
  onNavigate,
  collapsed,
  onToggleCollapse,
}: {
  navItems: (CRUDConfig | AdminNavLink)[];
  userEmail: string;
  appName?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { theme, toggle, mounted } = useTheme();
  const logoUrl = mounted && theme === "dark"
    ? logoDarkUrl ?? logoLightUrl
    : logoLightUrl ?? logoDarkUrl;

  // Build ordered group structure — group order follows first appearance in navItems
  type NavSection =
    | { type: "ungrouped"; item: CRUDConfig | AdminNavLink }
    | { type: "group"; label: string; icon?: string; items: (CRUDConfig | AdminNavLink)[] };

  const groupOrder: string[] = [];
  const groupMap: Record<string, (CRUDConfig | AdminNavLink)[]> = {};
  const groupIconMap: Record<string, string | undefined> = {};

  for (const item of navItems) {
    const group = getItemGroup(item);
    if (group) {
      if (!groupMap[group]) {
        groupMap[group] = [];
        groupOrder.push(group);
        groupIconMap[group] = isCRUDConfig(item) ? item.navGroupIcon : item.navGroupIcon;
      }
      groupMap[group].push(item);
    }
  }

  // Merge groups into sections at the position of their first member
  const orderedSections: NavSection[] = [];
  const insertedGroups = new Set<string>();

  for (const item of navItems) {
    const group = getItemGroup(item);
    if (group) {
      if (!insertedGroups.has(group)) {
        insertedGroups.add(group);
        orderedSections.push({ type: "group", label: group, icon: groupIconMap[group], items: groupMap[group] });
      }
    } else {
      orderedSections.push({ type: "ungrouped", item });
    }
  }

  const initialGroupOpen = Object.fromEntries(
    groupOrder.map((g) => [
      g,
      groupMap[g].some((item) => pathname === getItemHref(item)),
    ]),
  );
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>(initialGroupOpen);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn(
          "px-4 py-5 border-b border-border flex-shrink-0 flex items-center",
          collapsed ? "justify-center" : "justify-between",
        )}>
          {!collapsed && <BrandMark logoUrl={logoUrl} appName={appName} />}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="h-7 w-7 shrink-0"
          >
            {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <div className="px-2">
            <NavLink
              href="/admin"
              label="Dashboard"
              active={pathname === "/admin"}
              onClick={onNavigate}
              icon={LayoutDashboard}
              collapsed={collapsed}
            />
          </div>

          {orderedSections.map((section, i) => {
            if (section.type === "ungrouped") {
              const item = section.item;
              const href = getItemHref(item);
              return (
                <div key={href} className="px-2 pt-1">
                  <NavLink
                    href={href}
                    label={item.label}
                    active={pathname === href}
                    onClick={onNavigate}
                    icon={getItemIcon(item)}
                    collapsed={collapsed}
                  />
                </div>
              );
            }

            const { label: groupLabel, icon: groupIcon, items } = section;
            const isOpen = !!groupOpen[groupLabel];
            const GroupIcon = groupIcon && NAV_ICONS[groupIcon]
              ? NAV_ICONS[groupIcon]
              : isOpen ? FolderOpen : Folder;
            return (
              <div key={groupLabel} className="px-2 pt-2">
                {collapsed ? (
                  <div className="px-1 py-1"><Separator /></div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setGroupOpen((o) => ({ ...o, [groupLabel]: !o[groupLabel] }))}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted transition-colors"
                  >
                    <GroupIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 text-left">{groupLabel}</span>
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      !isOpen && "-rotate-90",
                    )} />
                  </button>
                )}
                {(collapsed || isOpen) && items.map((item) => {
                  const href = getItemHref(item);
                  return (
                    <NavLink
                      key={href}
                      href={href}
                      label={item.label}
                      active={pathname === href}
                      onClick={onNavigate}
                      icon={getItemIcon(item)}
                      collapsed={collapsed}
                      indent
                    />
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        {onToggleCollapse && (
          <div className="px-2 py-2 border-t border-border flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="h-8 w-8"
                >
                  {collapsed
                    ? <PanelLeftOpen className="h-4 w-4" />
                    : <PanelLeftClose className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Expand sidebar</TooltipContent>}
            </Tooltip>
          </div>
        )}

        {/* Footer */}
        <div className={cn(
          "px-4 py-4 border-t border-border flex-shrink-0",
          collapsed && "px-2 flex justify-center",
        )}>
          {!collapsed ? (
            <>
              <p className="text-xs text-muted-foreground truncate mb-2">{userEmail}</p>
              <Button
                variant="link"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
              >
                Sign out
              </Button>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  aria-label="Sign out"
                  className="h-8 w-8"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out ({userEmail})</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function AdminNav({ navItems, userEmail, appName, logoLightUrl, logoDarkUrl }: AdminNavProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside className={cn(
        "hidden md:flex flex-col h-screen sticky top-0",
        "bg-background border-r border-border overflow-hidden",
        "transition-[width] duration-200 ease-in-out",
        collapsed ? "w-14" : "w-56",
      )}>
        <NavContent
          navItems={navItems}
          userEmail={userEmail}
          appName={appName}
          logoLightUrl={logoLightUrl}
          logoDarkUrl={logoDarkUrl}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>

      <div className="md:hidden fixed top-3 left-3 z-50">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu" className="h-11 w-11 bg-background">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <NavContent
              navItems={navItems}
              userEmail={userEmail}
              appName={appName}
              logoLightUrl={logoLightUrl}
              logoDarkUrl={logoDarkUrl}
              onNavigate={() => setSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
