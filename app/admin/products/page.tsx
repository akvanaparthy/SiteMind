'use client'

import React, { useState } from 'react'
import { Package, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { useProducts, useProductActions } from '@/hooks/useAPI'
import { useToast } from '@/contexts/ToastContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import type { Product } from '@/types/api'

export default function AdminProductsPage() {
  const { data: response, isLoading, mutate } = useProducts()
  const products = response?.data || []
  const productActions = useProductActions()
  const { success, error: showError } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    featured: false,
    active: true,
  })

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      featured: false,
      active: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || '',
      featured: product.featured,
      active: product.active,
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Validation
      if (!formData.name || !formData.slug || !formData.description || !formData.price || !formData.stock) {
        showError('Please fill in all required fields')
        return
      }

      if (editingProduct) {
        // Update
        await productActions.update(editingProduct.id, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category: formData.category || null,
          featured: formData.featured,
          active: formData.active,
        })
        success('Product updated successfully')
      } else {
        // Create
        await productActions.create({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category: formData.category || null,
          images: null,
          featured: formData.featured,
          active: formData.active,
        })
        success('Product created successfully')
      }

      setShowModal(false)
      mutate()
    } catch (error: any) {
      showError(error.message || 'Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await productActions.delete(id)
      success('Product deleted successfully')
      setShowDeleteConfirm(null)
      mutate()
    } catch (error: any) {
      showError(error.message || 'Failed to delete product')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (row: Product) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {row.name}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {row.slug}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row: Product) => (
        <span className="text-slate-700 dark:text-slate-300">
          {row.category || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row: Product) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          ${row.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row: Product) => (
        <div>
          <span className={`font-medium ${row.stock > 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
            {row.stock}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
            units
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Product) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.active ? 'success' : 'default'} dot>
            {row.active ? 'Active' : 'Inactive'}
          </Badge>
          {row.featured && (
            <Badge variant="warning">Featured</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Product) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteConfirm(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Products
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your product catalog
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={handleOpenCreate}
        >
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Total Products
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {products?.length || 0}
                </div>
              </div>
              <Package className="w-10 h-10 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Active
                </div>
                <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                  {products?.filter((p: Product) => p.active).length || 0}
                </div>
              </div>
              <Eye className="w-10 h-10 text-success-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Low Stock
                </div>
                <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                  {products?.filter((p: Product) => p.stock > 0 && p.stock < 10).length || 0}
                </div>
              </div>
              <Package className="w-10 h-10 text-warning-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Out of Stock
                </div>
                <div className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                  {products?.filter((p: Product) => p.stock === 0).length || 0}
                </div>
              </div>
              <Package className="w-10 h-10 text-danger-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : products?.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Get started by adding your first product"
              action={{
                label: 'Add Product',
                onClick: handleOpenCreate,
              }}
            />
          ) : (
            <Table columns={columns} data={products || []} />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
            required
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            placeholder="product-slug"
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter product description"
            rows={4}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              step="0.01"
              required
            />
            <Input
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="0"
              required
            />
          </div>
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Electronics, Clothing"
          />
          <div className="flex items-center gap-6">
            <Switch
              label="Featured Product"
              enabled={formData.featured}
              onChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
            <Switch
              label="Active"
              enabled={formData.active}
              onChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Product"
      >
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
