"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
} from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Navbar } from "@/components/admin/Navbar";
import { formatDate } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "AI_AGENT";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  [key: string]: unknown;
}

// Mock data removed - using real API data

const roleColors = {
  USER: "bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200",
  ADMIN:
    "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200",
  AI_AGENT:
    "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200",
};

const roleIcons = {
  USER: User,
  ADMIN: Shield,
  AI_AGENT: UserCheck,
};

export default function UsersPage() {
  const { success, error } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "USER" as "USER" | "ADMIN" | "AI_AGENT",
    password: "",
  });
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "USER" as "USER" | "ADMIN" | "AI_AGENT",
    isActive: true,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Active" && user.isActive) ||
      (selectedStatus === "Inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      key: "name" as const,
      label: "User",
      sortable: true,
      render: (value: unknown, item: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-secondary-400" />
          </div>
          <div>
            <div className="font-medium text-secondary-900 dark:text-white">
              {String(value)}
            </div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
              {item.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role" as const,
      label: "Role",
      sortable: true,
      render: (value: unknown) => {
        const role = value as keyof typeof roleColors;
        const Icon = roleIcons[role];
        return (
          <Badge
            className={`${roleColors[role]} flex items-center space-x-1 w-fit`}
          >
            <Icon className="h-3 w-3" />
            <span>{role}</span>
          </Badge>
        );
      },
    },
    {
      key: "isActive" as const,
      label: "Status",
      sortable: true,
      render: (value: unknown) => {
        const isActive = Boolean(value);
        return (
          <Badge variant={isActive ? "success" : "danger"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      key: "lastLogin" as const,
      label: "Last Login",
      sortable: true,
      render: (value: unknown) => (
        <span className="text-secondary-600 dark:text-secondary-400">
          {value ? formatDate(String(value)) : "Never"}
        </span>
      ),
    },
    {
      key: "createdAt" as const,
      label: "Joined",
      sortable: true,
      render: (value: unknown) => (
        <span className="text-secondary-600 dark:text-secondary-400">
          {formatDate(String(value))}
        </span>
      ),
    },
  ];

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleSubmitCreateUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        // Refresh users list
        const usersResponse = await fetch("/api/users");
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);

        // Reset form and close modal
        setNewUser({
          name: "",
          email: "",
          role: "USER",
          password: "",
        });
        setIsCreateModalOpen(false);

        success(
          "User created successfully!",
          "The new user has been added to the system."
        );
      } else {
        console.error("Error creating user:", await response.text());
        error(
          "Error creating user",
          "Please try again or check the form data."
        );
      }
    } catch (err) {
      console.error("Error creating user:", err);
      error("Error creating user", "Please try again or check the form data.");
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name || "",
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitEditUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUser),
      });

      if (response.ok) {
        // Refresh users list
        const usersResponse = await fetch("/api/users");
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);

        setIsEditModalOpen(false);
        success(
          "User updated successfully!",
          "The user information has been updated."
        );
      } else {
        console.error("Error updating user:", await response.text());
        error(
          "Error updating user",
          "Please try again or check the form data."
        );
      }
    } catch (err) {
      console.error("Error updating user:", err);
      error("Error updating user", "Please try again or check the form data.");
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isActive: !u.isActive } : u
          )
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const actions = (user: User) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleViewUser(user);
        }}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleEditUser(user);
        }}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleStatus(user.id);
        }}
        className="h-8 w-8 p-0"
      >
        {user.isActive ? (
          <UserX className="h-4 w-4" />
        ) : (
          <UserCheck className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteUser(user.id);
        }}
        className="h-8 w-8 p-0 text-danger-500 hover:text-danger-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const adminUsers = users.filter((u) => u.role === "ADMIN").length;
  const regularUsers = users.filter((u) => u.role === "USER").length;
  const aiAgents = users.filter((u) => u.role === "AI_AGENT").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="Users" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} variant="glass">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Users" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Users
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              Manage user accounts and permissions
            </p>
          </div>
          <Button
            onClick={handleCreateUser}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {totalUsers}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {activeUsers}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      Regular Users
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {regularUsers}
                    </p>
                  </div>
                  <User className="h-8 w-8 text-primary-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      Admins
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {adminUsers}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      AI Agents
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {aiAgents}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-success-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="All">All Roles</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="AI_AGENT">AI Agent</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <DataTable
            data={filteredUsers}
            columns={columns}
            actions={actions}
            onRowClick={handleViewUser}
          />
        </motion.div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <h2 className="text-xl font-bold mb-4 text-secondary-900 dark:text-white">
              Create New User
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                  placeholder="Enter full name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                  placeholder="Enter email address..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as "USER" | "ADMIN" | "AI_AGENT",
                    })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="AI_AGENT">AI Agent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                  placeholder="Enter password..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitCreateUser}>Create User</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedUser.name}</h2>
              <div className="flex space-x-2">
                <Badge
                  className={`${
                    roleColors[selectedUser.role]
                  } flex items-center space-x-1`}
                >
                  {(() => {
                    const Icon = roleIcons[selectedUser.role];
                    return <Icon className="h-3 w-3" />;
                  })()}
                  <span>{selectedUser.role}</span>
                </Badge>
                <Badge variant={selectedUser.isActive ? "success" : "danger"}>
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Email
                  </label>
                  <p className="text-secondary-900 dark:text-white">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Last Login
                  </label>
                  <p className="text-secondary-900 dark:text-white">
                    {selectedUser.lastLogin
                      ? formatDate(selectedUser.lastLogin)
                      : "Never"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Created
                  </label>
                  <p className="text-secondary-900 dark:text-white">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Updated
                  </label>
                  <p className="text-secondary-900 dark:text-white">
                    {formatDate(selectedUser.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditUser(selectedUser);
                }}
              >
                Edit User
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <h2 className="text-xl font-bold mb-4 text-secondary-900 dark:text-white">
              Edit User
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                  placeholder="Enter full name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                  placeholder="Enter email address..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Role
                </label>
                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      role: e.target.value as "USER" | "ADMIN" | "AI_AGENT",
                    })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="AI_AGENT">AI Agent</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editUser.isActive}
                    onChange={(e) =>
                      setEditUser({ ...editUser, isActive: e.target.checked })
                    }
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                    Active
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitEditUser}>Update User</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
