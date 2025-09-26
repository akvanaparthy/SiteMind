"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Settings,
  Globe,
  Shield,
  Database,
  Bot,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Key,
  Bell,
} from "lucide-react";

interface SiteConfig {
  maintenanceMode: boolean;
  lastCacheClear: string | null;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maxUploadSize: number;
  enableRegistration: boolean;
  enableComments: boolean;
  aiAgentEnabled: boolean;
  cacheEnabled: boolean;
  cacheTTL: number;
}

const mockConfig: SiteConfig = {
  maintenanceMode: false,
  lastCacheClear: "2024-01-15T10:30:00Z",
  siteName: "SiteMind",
  siteDescription: "AI-Native E-Commerce Platform",
  contactEmail: "admin@sitemind.com",
  maxUploadSize: 10,
  enableRegistration: true,
  enableComments: true,
  aiAgentEnabled: true,
  cacheEnabled: true,
  cacheTTL: 3600,
};

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig>(mockConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        setConfig({
          maintenanceMode: data.maintenanceMode || false,
          lastCacheClear: data.lastCacheClear || null,
          siteName: data.siteName || "SiteMind",
          siteDescription:
            data.siteDescription || "AI-Native E-Commerce Platform",
          contactEmail: data.contactEmail || "admin@sitemind.com",
          maxUploadSize: data.maxUploadSize || 10,
          enableRegistration:
            data.enableRegistration !== undefined
              ? data.enableRegistration
              : true,
          enableComments:
            data.enableComments !== undefined ? data.enableComments : true,
          aiAgentEnabled:
            data.aiAgentEnabled !== undefined ? data.aiAgentEnabled : true,
          cacheEnabled:
            data.cacheEnabled !== undefined ? data.cacheEnabled : true,
          cacheTTL: data.cacheTTL || 3600,
        });
      } catch (error) {
        console.error("Error fetching site config:", error);
      }
    };

    fetchConfig();
  }, []);

  const handleToggleMaintenance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maintenanceMode: !config.maintenanceMode,
        }),
      });

      if (response.ok) {
        setConfig((prev) => ({
          ...prev,
          maintenanceMode: !prev.maintenanceMode,
        }));
        setLastAction(
          `Maintenance mode ${!config.maintenanceMode ? "enabled" : "disabled"}`
        );
      }
    } catch (error) {
      console.error("Failed to toggle maintenance mode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clearCache: true,
        }),
      });

      if (response.ok) {
        setConfig((prev) => ({
          ...prev,
          lastCacheClear: new Date().toISOString(),
        }));
        setLastAction("Cache cleared successfully");
      }
    } catch (error) {
      console.error("Failed to clear cache:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteName: config.siteName,
          siteDescription: config.siteDescription,
          contactEmail: config.contactEmail,
        }),
      });

      if (response.ok) {
        setLastAction("Settings saved successfully");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiAgentEnabled: !config.aiAgentEnabled,
        }),
      });

      if (response.ok) {
        setConfig((prev) => ({
          ...prev,
          aiAgentEnabled: !prev.aiAgentEnabled,
        }));
        setLastAction(
          `AI Agent ${!config.aiAgentEnabled ? "enabled" : "disabled"}`
        );
      }
    } catch (error) {
      console.error("Failed to toggle AI agent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Site Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your site configuration and preferences
          </p>
        </div>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-green-600 dark:text-green-400"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{lastAction}</span>
          </motion.div>
        )}
      </div>

      {/* Site Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div
                className={`p-2 rounded-lg ${
                  config.maintenanceMode
                    ? "bg-rose-100 dark:bg-rose-900"
                    : "bg-emerald-100 dark:bg-emerald-900"
                }`}
              >
                <Globe
                  className={`h-6 w-6 ${
                    config.maintenanceMode
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Site Status
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {config.maintenanceMode ? "Maintenance" : "Live"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div
                className={`p-2 rounded-lg ${
                  config.aiAgentEnabled
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-gray-100 dark:bg-gray-900"
                }`}
              >
                <Bot
                  className={`h-6 w-6 ${
                    config.aiAgentEnabled
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  AI Agent
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {config.aiAgentEnabled ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div
                className={`p-2 rounded-lg ${
                  config.cacheEnabled
                    ? "bg-emerald-100 dark:bg-emerald-900"
                    : "bg-gray-100 dark:bg-gray-900"
                }`}
              >
                <Database
                  className={`h-6 w-6 ${
                    config.cacheEnabled
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cache
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {config.cacheEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last Cache Clear
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {config.lastCacheClear
                    ? new Date(config.lastCacheClear).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Site Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Site Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, siteName: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Site Description
            </label>
            <textarea
              rows={3}
              value={config.siteDescription}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  siteDescription: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Upload Size (MB)
              </label>
              <input
                type="number"
                value={config.maxUploadSize}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    maxUploadSize: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Cache TTL (seconds)
              </label>
              <input
                type="number"
                value={config.cacheTTL}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    cacheTTL: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Feature Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="font-medium">Maintenance Mode</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Put the site in maintenance mode
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {config.maintenanceMode && (
                <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              <Button
                onClick={handleToggleMaintenance}
                disabled={isLoading}
                variant={config.maintenanceMode ? "danger" : "secondary"}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4" />
                )}
                <span>{config.maintenanceMode ? "Disable" : "Enable"}</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bot className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="font-medium">AI Agent</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable AI agent functionality
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {config.aiAgentEnabled && (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              <Button
                onClick={handleToggleAI}
                disabled={isLoading}
                variant={config.aiAgentEnabled ? "primary" : "secondary"}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
                <span>{config.aiAgentEnabled ? "Disable" : "Enable"}</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="font-medium">Cache System</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable caching for better performance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.cacheEnabled}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      cacheEnabled: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="font-medium">User Registration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allow new users to register
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableRegistration}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      enableRegistration: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="font-medium">Comments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable comments on blog posts
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableComments}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      enableComments: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleClearCache}
              disabled={isLoading}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Clear Cache</span>
            </Button>

            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              <span>Save All Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
