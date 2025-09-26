"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    { className, variant = "default", size = "md", children, ...props },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center rounded-full font-medium transition-colors";

    const variants = {
      default: "bg-slate-100 text-slate-800",
      success: "bg-emerald-100 text-emerald-800",
      warning: "bg-yellow-100 text-yellow-800",
      danger: "bg-rose-100 text-rose-800",
      info: "bg-blue-100 text-blue-800",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
