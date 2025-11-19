'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from './ToastContext'

export interface CartItem {
  id: number
  productId: number
  name: string
  slug: string
  price: number
  quantity: number
  image?: string | null
  stock: number
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  tax: number
  total: number
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: number) => boolean
  getItemQuantity: (productId: number) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const TAX_RATE = 0.08 // 8% tax
const CART_STORAGE_KEY = 'sitemind_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const { success, error: showError, info } = useToast()

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setItems(parsed)
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error)
      }
    }
  }, [items, isInitialized])

  // Calculate totals
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  // Add item to cart
  const addItem = (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    const quantity = item.quantity || 1

    // Check if item already exists
    const existingItem = items.find((i) => i.productId === item.productId)

    if (existingItem) {
      // Check stock limit
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > item.stock) {
        showError(`Cannot add more. Only ${item.stock} in stock.`, 'Stock Limit')
        return
      }

      // Update quantity
      setItems((prev) =>
        prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: newQuantity }
            : i
        )
      )
      success(`Updated ${item.name} quantity to ${newQuantity}`, 'Cart Updated')
    } else {
      // Check stock
      if (quantity > item.stock) {
        showError(`Cannot add ${quantity}. Only ${item.stock} in stock.`, 'Stock Limit')
        return
      }

      // Add new item
      const newItem: CartItem = {
        id: Date.now(), // Simple ID generation
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        price: item.price,
        quantity,
        image: item.image,
        stock: item.stock,
      }
      setItems((prev) => [...prev, newItem])
      success(`Added ${item.name} to cart`, 'Item Added')
    }
  }

  // Remove item from cart
  const removeItem = (id: number) => {
    const item = items.find((i) => i.id === id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    if (item) {
      info(`Removed ${item.name} from cart`, 'Item Removed')
    }
  }

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    const item = items.find((i) => i.id === id)
    if (!item) return

    // Check stock limit
    if (quantity > item.stock) {
      showError(`Cannot add more. Only ${item.stock} in stock.`, 'Stock Limit')
      return
    }

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    )
  }

  // Clear all items
  const clearCart = () => {
    setItems([])
    info('Cart cleared', 'Cart Empty')
  }

  // Check if product is in cart
  const isInCart = (productId: number) => {
    return items.some((item) => item.productId === productId)
  }

  // Get quantity of product in cart
  const getItemQuantity = (productId: number) => {
    const item = items.find((i) => i.productId === productId)
    return item?.quantity || 0
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        tax,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
