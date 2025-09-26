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
      default:
        "bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-100",
      success:
        "bg-success-100 text-success-800 dark:bg-success-800 dark:text-success-100",
      warning:
        "bg-warning-100 text-warning-800 dark:bg-warning-800 dark:text-warning-100",
      danger:
        "bg-danger-100 text-danger-800 dark:bg-danger-800 dark:text-danger-100",
      info: "bg-info-100 text-info-800 dark:bg-info-800 dark:text-info-100",
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
