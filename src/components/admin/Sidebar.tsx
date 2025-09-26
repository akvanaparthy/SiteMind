"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  MessageSquare,
  Settings,
  Bot,
  Activity,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  Image,
  Tag,
  Mail,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    children: [
      { name: "All Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: Tag },
      { name: "Media Library", href: "/admin/media", icon: Image },
    ],
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    badge: "3",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Blog",
    href: "/admin/posts",
    icon: FileText,
    children: [
      { name: "All Posts", href: "/admin/posts", icon: FileText },
      { name: "Categories", href: "/admin/blog-categories", icon: Tag },
      { name: "Comments", href: "/admin/comments", icon: MessageSquare },
    ],
  },
  {
    name: "Support",
    href: "/admin/tickets",
    icon: MessageSquare,
    badge: "5",
  },
  {
    name: "AI Agent",
    href: "/admin/agent",
    icon: Bot,
    children: [
      { name: "Console", href: "/admin/agent/console", icon: Bot },
      { name: "Action Logs", href: "/admin/agent/logs", icon: Activity },
      { name: "Analytics", href: "/admin/agent/analytics", icon: BarChart3 },
    ],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { name: "General", href: "/admin/settings", icon: Settings },
      { name: "Email", href: "/admin/settings/email", icon: Mail },
      { name: "Security", href: "/admin/settings/security", icon: Shield },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }
    return pathname.startsWith(href);
  };

  const NavItem = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const active = isActive(item.href);

    return (
      <div>
        <div className="flex items-center">
          <Link
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
              active
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-secondary-200",
              level > 0 && "ml-6",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge
                    variant="danger"
                    className="h-5 w-5 rounded-full flex items-center justify-center text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
          {hasChildren && !isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(item.name)}
              className="h-6 w-6 p-0 ml-1"
            >
              {isExpanded ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        {hasChildren && isExpanded && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 space-y-1"
          >
            {item.children?.map((child) => (
              <NavItem key={child.href} item={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        "bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-700 flex flex-col h-full",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900 dark:text-white">
                SiteMind
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
        <Link
          href="/"
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-secondary-200",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Home className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>View Site</span>}
        </Link>
      </div>
    </motion.div>
  );
}
