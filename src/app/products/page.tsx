"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Filter,
  Star,
  ShoppingCart,
  Heart,
  Grid,
  List,
  SlidersHorizontal,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    description:
      "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    price: 299.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Electronics",
    stock: 50,
    isActive: true,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description:
      "Advanced fitness tracking with heart rate monitoring, GPS, and water resistance.",
    price: 199.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Electronics",
    stock: 25,
    isActive: true,
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    slug: "organic-cotton-tshirt",
    description:
      "Comfortable and sustainable organic cotton t-shirt in various colors.",
    price: 29.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Clothing",
    stock: 100,
    isActive: true,
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
  {
    id: 4,
    name: "Professional Camera Lens",
    slug: "professional-camera-lens",
    description:
      "High-quality 50mm f/1.8 lens perfect for portrait and low-light photography.",
    price: 449.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Photography",
    stock: 15,
    isActive: true,
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
  },
  {
    id: 5,
    name: "Ergonomic Office Chair",
    slug: "ergonomic-office-chair",
    description:
      "Comfortable ergonomic chair with lumbar support and adjustable height.",
    price: 399.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Furniture",
    stock: 30,
    isActive: true,
    createdAt: "2024-01-11T11:30:00Z",
    updatedAt: "2024-01-11T11:30:00Z",
  },
  {
    id: 6,
    name: "Bluetooth Speaker",
    slug: "bluetooth-speaker",
    description:
      "Portable Bluetooth speaker with 360-degree sound and 12-hour battery life.",
    price: 79.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Electronics",
    stock: 75,
    isActive: true,
    createdAt: "2024-01-10T08:20:00Z",
    updatedAt: "2024-01-10T08:20:00Z",
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchProducts = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const categories = [
    "all",
    ...Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    ),
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        text: "Out of Stock",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    if (stock < 10)
      return {
        text: "Low Stock",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      };
    return {
      text: "In Stock",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6"
                >
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Products
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our curated collection of high-quality products
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-blue-500 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-blue-500 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range: {formatPrice(priceRange[0])} -{" "}
                {formatPrice(priceRange[1])}
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </motion.div>

        {/* Products Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {viewMode === "grid" ? (
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="text-gray-400 dark:text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {product.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      <Badge className={getStockStatus(product.stock).color}>
                        {getStockStatus(product.stock).text}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-4 w-4 text-yellow-400 fill-current"
                          />
                        ))}
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          (4.8)
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Link href={`/products/${product.slug}`}>
                        <Button variant="secondary" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Button className="w-full flex items-center justify-center space-x-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400 dark:text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {product.category}
                              </Badge>
                              <Badge
                                className={getStockStatus(product.stock).color}
                              >
                                {getStockStatus(product.stock).text}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {product.description}
                            </p>
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatPrice(product.price)}
                              </span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="h-4 w-4 text-yellow-400 fill-current"
                                  />
                                ))}
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                  (4.8)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Link href={`/products/${product.slug}`}>
                              <Button variant="secondary">View Details</Button>
                            </Link>
                            <Button className="flex items-center space-x-2">
                              <ShoppingCart className="h-4 w-4" />
                              <span>Add to Cart</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
