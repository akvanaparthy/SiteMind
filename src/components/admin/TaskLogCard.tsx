"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Bot,
  Calendar,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface AgentLogDetail {
  action: string;
  status: "pending" | "success" | "failed";
  timestamp: Date;
  details?: string;
}

interface AgentLog {
  id: number;
  taskId: string;
  task: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  timestamp: Date;
  details?: AgentLogDetail[];
  children?: AgentLog[];
}

interface TaskLogCardProps {
  log: AgentLog;
  level?: number;
}

export function TaskLogCard({ log, level = 0 }: TaskLogCardProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge variant="success" size="sm">
            Success
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="danger" size="sm">
            Failed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="warning" size="sm">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm">
            Unknown
          </Badge>
        );
    }
  };

  const getDetailStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-3 w-3 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-rose-500" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="h-3 w-3 text-slate-400" />;
    }
  };

  const hasChildren = log.children && log.children.length > 0;
  const hasDetails = log.details && log.details.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`${level > 0 ? "ml-6 border-l-2 border-slate-200 pl-4" : ""}`}
    >
      <Card
        variant="glass"
        className={`transition-all duration-200 ${
          isExpanded ? "shadow-lg" : "shadow-sm hover:shadow-md"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {/* Expand/Collapse Button */}
              {(hasChildren || hasDetails) && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  )}
                </button>
              )}

              {/* Status Icon */}
              <div className="mt-1">{getStatusIcon(log.status)}</div>

              {/* Task Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-slate-900 truncate">
                    {log.task}
                  </h3>
                  {getStatusBadge(log.status)}
                </div>

                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Bot className="h-3 w-3" />
                    <span>Task ID: {log.taskId}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(log.timestamp)}</span>
                  </div>
                </div>

                {/* Details Toggle */}
                {hasDetails && (
                  <button
                    onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                    className="mt-2 flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    <Activity className="h-3 w-3" />
                    <span>
                      {isDetailsExpanded ? "Hide" : "Show"}{" "}
                      {log.details!.length} action
                      {log.details!.length !== 1 ? "s" : ""}
                    </span>
                    {isDetailsExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <AnimatePresence>
            {isDetailsExpanded && hasDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-slate-200"
              >
                <div className="space-y-2">
                  {log.details!.map((detail, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg"
                    >
                      {getDetailStatusIcon(detail.status)}
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">
                          {detail.action}
                        </p>
                        {detail.details && (
                          <p className="text-xs text-slate-600 mt-1">
                            {detail.details}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatDate(detail.timestamp)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4"
          >
            {log.children!.map((child) => (
              <TaskLogCard key={child.id} log={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
