"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";

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

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  variant?: "default" | "compact" | "featured";
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  variant = "default",
}: ProductCardProps) {
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

  if (variant === "compact") {
    return (
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Card className="h-full hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
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
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                  <Badge className={getStockStatus(product.stock).color}>
                    {getStockStatus(product.stock).text}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === "featured") {
    return (
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-2 border-blue-200 dark:border-blue-800">
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
              <div className="absolute top-2 left-2">
                <Badge className="bg-blue-500 text-white">Featured</Badge>
              </div>
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={() => onToggleWishlist?.(product)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isWishlisted ? "fill-current text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-2">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {product.category}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
              {product.description}
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              <Badge className={getStockStatus(product.stock).color}>
                {getStockStatus(product.stock).text}
              </Badge>
            </div>
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-4 w-4 text-yellow-400 fill-current"
                />
              ))}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                (4.8)
              </span>
            </div>
            <div className="space-y-2">
              <Link href={`/products/${product.slug}`}>
                <Button variant="secondary" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
              <Button
                onClick={() => onAddToCart?.(product)}
                disabled={product.stock === 0}
                className="w-full flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
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
                <div className="text-gray-400 dark:text-gray-500">No Image</div>
              )}
            </div>
            <div className="absolute top-2 right-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={() => onToggleWishlist?.(product)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isWishlisted ? "fill-current text-red-500" : ""
                  }`}
                />
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
          <div className="flex items-center mb-4">
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
          <div className="space-y-2">
            <Link href={`/products/${product.slug}`}>
              <Button variant="secondary" className="w-full">
                View Details
              </Button>
            </Link>
            <Button
              onClick={() => onAddToCart?.(product)}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
