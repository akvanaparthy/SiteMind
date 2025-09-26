"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
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
      "Experience superior sound quality with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and comfortable over-ear design. Perfect for music lovers, professionals, and anyone who values exceptional audio quality.",
    price: 299.99,
    imageUrl: "/api/placeholder/600/600",
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
      "Track your fitness journey with our advanced smart fitness watch. Monitor heart rate, track workouts, receive notifications, and enjoy GPS functionality. Water-resistant design makes it perfect for swimming and outdoor activities.",
    price: 199.99,
    imageUrl: "/api/placeholder/600/600",
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
      "Made from 100% organic cotton, this comfortable t-shirt is perfect for everyday wear. Available in multiple colors and sizes. Sustainable, soft, and durable - a wardrobe essential for the conscious consumer.",
    price: 29.99,
    imageUrl: "/api/placeholder/600/600",
    category: "Clothing",
    stock: 100,
    isActive: true,
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
];

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productImages = [
    product?.imageUrl || "/api/placeholder/600/600",
    "/api/placeholder/600/600",
    "/api/placeholder/600/600",
    "/api/placeholder/600/600",
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const resolvedParams = await params;
      const foundProduct = mockProducts.find(
        (p) => p.slug === resolvedParams.slug
      );

      if (foundProduct) {
        setProduct(foundProduct);
      }

      setIsLoading(false);
    };

    fetchProduct();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

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

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAddingToCart(false);
    // Show success message
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/products">
            <Button variant="secondary" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Products</span>
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-blue-500"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {product.category}
                </Badge>
                <Badge className={getStockStatus(product.stock).color}>
                  {getStockStatus(product.stock).text}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    (4.8) • 124 reviews
                  </span>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Quantity
              </h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-8 text-center">
                  {quantity}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
                className="w-full flex items-center justify-center space-x-2 h-12"
              >
                {isAddingToCart ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                <span>
                  {isAddingToCart
                    ? "Adding..."
                    : product.stock === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </span>
              </Button>

              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isWishlisted ? "fill-current text-red-500" : ""
                    }`}
                  />
                  <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Free shipping on orders over $50
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  2-year warranty included
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  30-day return policy
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <Card>
            <CardContent className="p-8">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Product Specifications
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Category
                        </span>
                        <span className="font-medium">{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Stock
                        </span>
                        <span className="font-medium">
                          {product.stock} units
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          SKU
                        </span>
                        <span className="font-medium">
                          SKU-{product.id.toString().padStart(4, "0")}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Weight
                        </span>
                        <span className="font-medium">0.5 kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Dimensions
                        </span>
                        <span className="font-medium">20 x 15 x 5 cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Material
                        </span>
                        <span className="font-medium">Premium Quality</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Customer Reviews
                  </h2>
                  <div className="space-y-4">
                    {[1, 2, 3].map((review) => (
                      <div
                        key={review}
                        className="border-b border-gray-200 dark:border-gray-700 pb-4"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-4 w-4 text-yellow-400 fill-current"
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">John D.</span>
                          <span className="text-sm text-gray-500">
                            2 days ago
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Excellent product! Great quality and fast shipping.
                          Highly recommend!
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
