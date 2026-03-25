import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/cart', label: 'Cart' },
    { to: '/orders', label: 'My Orders' },
  ];

  const categories = [
    { to: '/products?category=1', label: 'Birthday Gifts' },
    { to: '/products?category=2', label: 'Anniversary' },
    { to: '/products?category=3', label: 'Wedding' },
    { to: '/products?category=4', label: 'Corporate' },
  ];

  return (
    <footer className="relative bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <span className="text-2xl">🎁</span>
              <span>About Artify Aura</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Delicious gifts delivered fast to your doorstep. We serve the best quality products with love and care.
            </p>
            <div className="flex space-x-3">
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                href="https://www.instagram.com/artify__aura"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Twitter size={20} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.to}>
                  <Link
                    to={category.to}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-primary-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Artify Aura Store<br />
                  BKN School Opposite<br />
                  Nasiyanur, Erode<br />
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-primary-400 flex-shrink-0" />
                <div className="text-gray-400">
                  <div>+91 8220038065</div>
                  <div>+91 6369869758</div>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-primary-400 flex-shrink-0" />
                <a href="mailto:artifyaura@gmail.com" className="text-gray-400 hover:text-primary-400 transition-colors">
                  artifyaura28@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400">
            © {currentYear} Artify Aura. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Developed by <span className="text-primary-400 font-semibold">HARISH RAGUL</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
