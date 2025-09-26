"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShoppingCart } from "./ShoppingCart";
import { ShoppingCart as ShoppingCartIcon } from "lucide-react";

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

interface CartButtonProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onClearCart: () => void;
  variant?: "default" | "floating" | "minimal";
  size?: "sm" | "md" | "lg";
}

export function CartButton({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  variant = "default",
  size = "md",
}: CartButtonProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (variant === "floating") {
    return (
      <>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-30"
        >
          <Button
            onClick={() => setIsCartOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg relative"
            size="lg"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            {getTotalItems() > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Badge className="bg-red-500 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              </motion.div>
            )}
          </Button>
        </motion.div>

        <ShoppingCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={items}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClearCart={onClearCart}
        />
      </>
    );
  }

  if (variant === "minimal") {
    return (
      <>
        <Button
          variant="secondary"
          onClick={() => setIsCartOpen(true)}
          className="relative"
          size={size}
        >
          <ShoppingCartIcon className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-5 w-5 rounded-full flex items-center justify-center text-xs">
              {getTotalItems()}
            </Badge>
          )}
        </Button>

        <ShoppingCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={items}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClearCart={onClearCart}
        />
      </>
    );
  }

  // Default variant
  return (
    <>
      <Button
        onClick={() => setIsCartOpen(true)}
        className="relative flex items-center space-x-2"
        size={size}
      >
        <ShoppingCartIcon className="h-4 w-4" />
        <span>Cart</span>
        {getTotalItems() > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-1"
          >
            <Badge className="bg-red-500 text-white h-5 w-5 rounded-full flex items-center justify-center text-xs">
              {getTotalItems()}
            </Badge>
          </motion.div>
        )}
      </Button>

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onClearCart={onClearCart}
      />
    </>
  );
}
