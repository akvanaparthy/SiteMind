"use client";

import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";

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

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistedProducts?: number[];
  variant?: "default" | "compact" | "featured";
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

export function ProductGrid({
  products,
  onAddToCart,
  onToggleWishlist,
  wishlistedProducts = [],
  variant = "default",
  columns = 4,
  isLoading = false,
}: ProductGridProps) {
  const getGridCols = () => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case 5:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
      case 6:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  if (isLoading) {
    return (
      <div className={`grid ${getGridCols()} gap-6`}>
        {Array.from({ length: columns * 2 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-gray-400 dark:text-gray-600 mb-4">
          <svg
            className="h-12 w-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No products found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </motion.div>
    );
  }

  return (
    <div className={`grid ${getGridCols()} gap-6`}>
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={wishlistedProducts.includes(product.id)}
            variant={variant}
          />
        </motion.div>
      ))}
    </div>
  );
}
