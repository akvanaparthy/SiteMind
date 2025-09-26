"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShoppingCart as ShoppingCartIcon,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
} from "lucide-react";

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  addedAt: string;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onClearCart: () => void;
}

export function ShoppingCart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: ShoppingCartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getSubtotal = () => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getShipping = () => {
    return getSubtotal() > 50 ? 0 : 9.99; // Free shipping over $50
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getShipping();
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsCheckingOut(false);
    onClearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <ShoppingCartIcon className="h-6 w-6 text-gray-900 dark:text-white" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Shopping Cart
                </h2>
                {items.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {items.length}
                  </Badge>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCartIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add some products to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400 dark:text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="h-6 w-6 p-0 mt-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatPrice(getSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatPrice(getTax())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {getShipping() === 0
                        ? "Free"
                        : formatPrice(getShipping())}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatPrice(getTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    {isCheckingOut ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    <span>{isCheckingOut ? "Processing..." : "Checkout"}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={onClearCart}
                    className="w-full"
                  >
                    Clear Cart
                  </Button>
                </div>

                {/* Free Shipping Notice */}
                {getSubtotal() < 50 && (
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Add {formatPrice(50 - getSubtotal())} more for free
                    shipping!
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
