"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavbarProps {
  title?: string;
  className?: string;
}

export function Navbar({ title = "Dashboard", className }: NavbarProps) {
  const [notifications] = useState(3);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm ${className}`}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600 mt-1">
              Welcome back! Here&apos;s what&apos;s happening with your store.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge
                    variant="danger"
                    size="sm"
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">Admin User</p>
                <p className="text-xs text-slate-600">admin@sitemind.com</p>
              </div>
              <Button variant="ghost" size="sm" className="p-2">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
