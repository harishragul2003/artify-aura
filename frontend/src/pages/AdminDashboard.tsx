import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Users, TrendingUp, LayoutDashboard, ShoppingBag, Settings, Menu, X, UserCircle } from 'lucide-react';
import { orderAPI, userAPI, productAPI, categoryAPI } from '../services/api';
import type { Order } from '../types/order';
import type { ProductInput } from '../types/product';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadOrders();
    loadUsers();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await orderAPI.getAllOrders();
      console.log('Loaded orders:', data); // Debug log
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders', error);
      console.error('Error response:', error.response?.data); // Debug log
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await userAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, type: 'order' | 'payment') => {
    try {
      await orderAPI.updateOrderStatus(orderId, {
        [type === 'order' ? 'order_status' : 'payment_status']: status
      });
      loadOrders();
    } catch (error) {
      console.error('Failed to update order', error);
    }
  };

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
    pendingOrders: orders.filter(o => o.order_status === 'Pending').length,
    completedOrders: orders.filter(o => o.order_status === 'Delivered').length,
  };

  const orderStatusData = {
    labels: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [{
      data: [
        orders.filter(o => o.order_status === 'Pending').length,
        orders.filter(o => o.order_status === 'Shipped').length,
        orders.filter(o => o.order_status === 'Delivered').length,
        orders.filter(o => o.order_status === 'Cancelled').length,
      ],
      backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#ef4444'],
    }],
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen -mt-8 -mx-4">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className={`fixed lg:sticky top-0 left-0 h-screen glass-effect border-r border-primary-200 dark:border-gray-700 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 shadow-2xl`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold animate-gradient-text">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/50'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-primary-200 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-h-screen bg-transparent dark:bg-gradient-to-br dark:from-gray-900 dark:via-rose-900 dark:to-gray-900">
        {/* Mobile Menu Button */}
        <div className="lg:hidden sticky top-0 z-30 glass-effect border-b border-primary-200 dark:border-gray-700 p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'dashboard' && <DashboardContent stats={stats} orders={orders} orderStatusData={orderStatusData} />}
          {activeTab === 'products' && <ProductsContent />}
          {activeTab === 'categories' && <CategoriesContent />}
          {activeTab === 'orders' && <OrdersContent orders={orders} loading={loading} updateOrderStatus={updateOrderStatus} />}
          {activeTab === 'customers' && <CustomersContent users={users} loadUsers={loadUsers} />}
          {activeTab === 'settings' && <SettingsContent />}
        </div>
      </div>
    </div>
  );
}

// Dashboard Tab Content
function DashboardContent({ stats, orders, orderStatusData }: any) {
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          <span className="animate-gradient-text">
            Dashboard Overview
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your store today.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'from-pink-500 to-rose-500' },
          { label: 'Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
          { label: 'Pending', value: stats.pendingOrders, icon: TrendingUp, color: 'from-yellow-500 to-amber-500' },
          { label: 'Completed', value: stats.completedOrders, icon: Users, color: 'from-blue-500 to-cyan-500' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary-100 dark:border-primary-900"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <span className="text-3xl font-bold animate-gradient-text">{stat.value}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-primary-100 dark:border-primary-900"
        >
          <h2 className="text-xl font-bold mb-4 animate-gradient-text">Order Status Distribution</h2>
          <Pie data={orderStatusData} />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-primary-100 dark:border-primary-900"
        >
          <h2 className="text-xl font-bold mb-4 animate-gradient-text">Recent Orders</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
            {orders.slice(0, 5).map((order: Order, index: number) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-700 dark:to-gray-700 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <p className="font-semibold text-lg">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">₹{order.total_amount}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    order.order_status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.order_status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    order.order_status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Products Tab Content
function ProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    is_featured: false,
    image_url: ''
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const loadProducts = async () => {
    try {
      const { data } = await productAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await categoryAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData: ProductInput = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        stock: parseInt(formData.stock),
        is_featured: formData.is_featured,
        image_url: formData.image_url
      };

      console.log('Submitting product:', editingProduct ? 'UPDATE' : 'CREATE', productData);

      if (editingProduct) {
        const response = await productAPI.update(editingProduct.id, productData);
        console.log('Update response:', response);
      } else {
        const response = await productAPI.create(productData);
        console.log('Create response:', response);
      }
      
      loadProducts();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save product', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to save product: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productAPI.delete(id);
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  const openModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        stock: product.stock,
        is_featured: product.is_featured,
        image_url: product.image_url
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock: '',
        is_featured: false,
        image_url: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="animate-gradient-text">Products Management</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your product inventory</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <span className="text-xl">+</span>
            <span>Add Product</span>
          </motion.button>
        </div>

        {/* Search and Filter Bar */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-md"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-md"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-bounce">📦</div>
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-primary-100 dark:border-primary-900 hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={product.image_url || 'https://via.placeholder.com/300'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                  ₹{product.price}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Stock: {product.stock}
                </span>
              </div>

              {product.is_featured && (
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs rounded-full mb-3">
                  ⭐ Featured
                </span>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(product)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-12 shadow-xl border border-primary-100 dark:border-primary-900 text-center"
        >
          <div className="text-6xl mb-4">
            {searchQuery || selectedCategory ? '🔍' : '📦'}
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {searchQuery || selectedCategory ? 'No Products Found' : 'No Products Yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || selectedCategory 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first product'
            }
          </p>
          {!searchQuery && !selectedCategory && (
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Add Your First Product
            </button>
          )}
        </motion.div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Price (₹)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mark as Featured Product
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Orders Tab Content
function OrdersContent({ orders, loading, updateOrderStatus }: any) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const openScreenshotModal = (url: string) => {
    setScreenshotModal(url);
  };

  const closeScreenshotModal = () => {
    setScreenshotModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          <span className="animate-gradient-text">Orders Management</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage all customer orders</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-primary-100 dark:border-primary-900"
      >
        <h2 className="text-2xl font-bold mb-6 animate-gradient-text">All Orders ({orders.length})</h2>

        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-bold">Order ID</th>
                  <th className="text-left py-4 px-4 font-bold">Customer</th>
                  <th className="text-left py-4 px-4 font-bold">Date</th>
                  <th className="text-left py-4 px-4 font-bold">Amount</th>
                  <th className="text-left py-4 px-4 font-bold">Payment</th>
                  <th className="text-left py-4 px-4 font-bold">Status</th>
                  <th className="text-left py-4 px-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <React.Fragment key={order.id}>
                    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-200/50 dark:hover:bg-gray-700 transition-all duration-300">
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">#{order.id.slice(0, 8)}</td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        <div className="text-sm">
                          <div className="font-medium">{order.user_name || 'Guest'}</div>
                          <div className="text-gray-500 dark:text-gray-400">{order.phone}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">₹{order.total_amount}</td>
                      <td className="py-4 px-4">
                        <select
                          value={order.payment_status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value, 'payment')}
                          className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium border border-primary-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="Payment Verification Pending">Payment Verification Pending</option>
                          <option value="Payment Verified">Payment Verified</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value, 'order')}
                          className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium border border-primary-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => toggleOrderDetails(order.id)}
                          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
                        >
                          {expandedOrder === order.id ? 'Hide' : 'View'} Details
                        </button>
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={7} className="bg-primary-50 dark:bg-gray-900 p-6">
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Shipping Address</h4>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{order.shipping_address}</p>
                                <p className="text-gray-700 dark:text-gray-300 mt-2">Phone: {order.phone}</p>
                              </div>
                              <div>
                                <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Payment Details</h4>
                                <p className="text-gray-700 dark:text-gray-300">Transaction ID: {order.transaction_id || 'N/A'}</p>
                                <p className="text-gray-700 dark:text-gray-300">Status: {order.payment_status}</p>
                                {order.payment_screenshot_url ? (
                                  <button
                                    onClick={() => openScreenshotModal(order.payment_screenshot_url)}
                                    className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                                  >
                                    <span>🖼️</span>
                                    <span>View Payment Screenshot</span>
                                  </button>
                                ) : (
                                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">No payment screenshot uploaded</p>
                                )}
                              </div>
                            </div>
                            
                            {order.items && order.items.length > 0 && (
                              <div>
                                <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Order Items</h4>
                                <div className="space-y-2">
                                  {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg">
                                      <div className="flex items-center space-x-4">
                                        <img 
                                          src={item.product_image || 'https://via.placeholder.com/80'} 
                                          alt={item.product_name}
                                          className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div>
                                          <p className="font-semibold text-gray-900 dark:text-white">{item.product_name}</p>
                                          <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                                        </div>
                                      </div>
                                      <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                                        ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Payment Screenshot Modal */}
      {screenshotModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeScreenshotModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Screenshot</h3>
              <button
                onClick={closeScreenshotModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
              {screenshotModal.startsWith('data:image') ? (
                <img
                  src={screenshotModal}
                  alt="Payment Screenshot"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    console.error('Failed to load screenshot');
                    e.currentTarget.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-center p-8 text-gray-600 dark:text-gray-400';
                    errorDiv.innerHTML = '<p class="text-xl mb-2">❌</p><p>Failed to load screenshot</p><p class="text-sm mt-2">The image data may be corrupted</p>';
                    e.currentTarget.parentElement?.appendChild(errorDiv);
                  }}
                />
              ) : (
                <div className="text-center p-8 text-gray-600 dark:text-gray-400">
                  <p className="text-xl mb-2">⚠️</p>
                  <p>Invalid screenshot format</p>
                  <p className="text-sm mt-2">Screenshot URL: {screenshotModal.substring(0, 50)}...</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              {screenshotModal.startsWith('data:image') && (
                <a
                  href={screenshotModal}
                  download="payment-screenshot.png"
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Download
                </a>
              )}
              <button
                onClick={closeScreenshotModal}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Categories Tab Content
function CategoriesContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await categoryAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoryAPI.create(formData);
      loadCategories();
      closeModal();
    } catch (error) {
      console.error('Failed to create category', error);
      alert('Failed to create category. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will have their category removed.')) return;
    
    try {
      await categoryAPI.delete(id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', description: '', icon: '' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="animate-gradient-text">Categories Management</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage product categories</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <span className="text-xl">+</span>
            <span>Add Category</span>
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-bounce">📁</div>
          <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-primary-100 dark:border-primary-900 hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-5xl mb-4">{category.icon || '📦'}</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{category.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{category.description || 'No description'}</p>
              <div className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Created: {new Date(category.created_at).toLocaleDateString()}
              </div>
              <button
                onClick={() => handleDelete(category.id)}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
              >
                Delete Category
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {categories.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-12 shadow-xl border border-primary-100 dark:border-primary-900 text-center"
        >
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Categories Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Start by adding your first category</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Add Your First Category
          </button>
        </motion.div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Add New Category</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Wedding Gifts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Icon (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 💍 or 🎁"
                  maxLength={2}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Category
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Settings Tab Content
function SettingsContent() {
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          <span className="animate-gradient-text">Settings</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your store settings</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-primary-100 dark:border-primary-900 text-center"
      >
        <div className="text-6xl mb-4">⚙️</div>
        <h3 className="text-2xl font-bold mb-2">Settings Panel</h3>
        <p className="text-gray-600 dark:text-gray-400">Settings configuration coming soon...</p>
      </motion.div>
    </div>
  );
}

// Customers Tab Content
function CustomersContent({ users, loadUsers }: { users: User[]; loadUsers: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery))
      );
    }

    // Filter by role
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await userAPI.updateRole(userId, newRole);
      loadUsers();
    } catch (error) {
      console.error('Failed to update user role', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userAPI.delete(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          <span className="animate-gradient-text">Customers Management</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage all registered users</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-primary-100 dark:border-primary-900"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold animate-gradient-text">All Customers</h2>
          <div className="text-lg font-semibold">
            Total Users: <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">{users.length}</span>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-md"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-md"
            >
              <option value="">All Roles</option>
              <option value="user">Users Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredUsers.length} of {users.length} customers
          </p>
          {(searchQuery || roleFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('');
              }}
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-primary-200 dark:border-gray-700">
                <th className="text-left py-4 px-4 font-bold">Name</th>
                <th className="text-left py-4 px-4 font-bold">Email</th>
                <th className="text-left py-4 px-4 font-bold">Phone</th>
                <th className="text-left py-4 px-4 font-bold">Role</th>
                <th className="text-left py-4 px-4 font-bold">Joined Date</th>
                <th className="text-left py-4 px-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: User) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-200/50 dark:hover:bg-gray-700 transition-all duration-300">
                  <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{user.name}</td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{user.phone || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium border border-primary-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {searchQuery || roleFilter ? '🔍' : '👥'}
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {searchQuery || roleFilter ? 'No Customers Found' : 'No Customers Yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchQuery || roleFilter 
                ? 'Try adjusting your search or filter criteria'
                : 'No customers have registered yet'
              }
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
