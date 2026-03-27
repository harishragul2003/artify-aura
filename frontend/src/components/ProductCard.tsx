import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ y: -15, scale: 1.02 }}
      className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 card-shine"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-accent-500/0 to-primary-500/0 group-hover:from-primary-500/20 group-hover:via-accent-500/20 group-hover:to-primary-500/20 transition-all duration-500 pointer-events-none"></div>
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-square group">
        <motion.div
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <OptimizedImage
            src={product.image_url}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
        </motion.div>
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {product.is_featured && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="absolute top-3 left-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg animate-pulse-slow"
          >
            ⭐ Featured
          </motion.div>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
          >
            🔥 Only {product.stock} left
          </motion.div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-2xl">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 relative z-10">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary-600 hover:to-accent-600 transition-all duration-300">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="text-3xl font-black bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
            >
              ₹{product.price}
            </motion.span>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 text-primary-600 dark:text-primary-300 hover:from-primary-200 hover:to-accent-200 dark:hover:from-primary-800 dark:hover:to-accent-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Heart size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full hover:shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold glow-effect"
            >
              <ShoppingCart size={18} />
              <span>Add</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Animated Border Glow */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 blur-xl opacity-30 animate-gradient"></div>
      </div>
    </motion.div>
  );
}
