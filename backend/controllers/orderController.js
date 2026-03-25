import pool from '../config/db.js';
import { sendOrderConfirmation, sendAdminOrderNotification } from '../utils/emailServiceResend.js';

export const createOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { items, total_amount, shipping_address, phone, transaction_id, payment_screenshot_url } = req.body;
    const user_id = req.user.id;

    await client.query('BEGIN');

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, payment_status, order_status, transaction_id, payment_screenshot_url, shipping_address, phone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, total_amount, 'Payment Verification Pending', 'Pending', transaction_id, payment_screenshot_url, shipping_address, phone]
    );

    const order = orderResult.rows[0];

    // Create order items and collect product details
    const orderItems = [];
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );

      // Get product details for email
      const productResult = await client.query(
        'SELECT name FROM products WHERE id = $1',
        [item.product_id]
      );
      
      orderItems.push({
        name: productResult.rows[0]?.name || 'Product',
        quantity: item.quantity,
        price: item.price
      });

      // Update product stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Get user details for emails
    const userResult = await client.query(
      'SELECT name, email, phone FROM users WHERE id = $1',
      [user_id]
    );
    const user = userResult.rows[0];

    await client.query('COMMIT');

    // Send confirmation email to customer
    const orderDetailsForCustomer = {
      id: order.id,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      order_status: order.order_status,
      shipping_address: order.shipping_address,
      items: orderItems
    };
    
    console.log('📧 Sending customer email to:', user.email);
    sendOrderConfirmation(user.email, orderDetailsForCustomer)
      .then(() => console.log('✅ Customer email queued successfully'))
      .catch(err => {
        console.error('❌ Failed to send customer email:', err.message);
        console.error('Customer email details:', { email: user.email, orderId: order.id });
      });

    // Send notification email to admin
    const customerInfo = {
      name: user.name,
      email: user.email,
      phone: user.phone || order.phone
    };
    
    console.log('📧 Sending admin email for order:', order.id);
    sendAdminOrderNotification(orderDetailsForCustomer, customerInfo)
      .then(() => console.log('✅ Admin email queued successfully'))
      .catch(err => {
        console.error('❌ Failed to send admin email:', err.message);
      });

    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user orders
    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    // Get order items with product details for each order
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(`
          SELECT 
            oi.*,
            p.name as product_name,
            p.image_url as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.id]);

        return {
          ...order,
          items: itemsResult.rows
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    console.log('📦 Fetching all orders...');
    
    // Get all orders with user information
    const ordersResult = await pool.query(`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    console.log(`✅ Found ${ordersResult.rows.length} orders`);

    // Get order items with product details for each order
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(`
          SELECT 
            oi.*,
            p.name as product_name,
            p.image_url as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.id]);

        return {
          ...order,
          items: itemsResult.rows
        };
      })
    );

    console.log('✅ Orders with items fetched successfully');
    res.json(ordersWithItems);
  } catch (error) {
    console.error('❌ Get all orders error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    let query = 'UPDATE orders SET ';
    const params = [];
    let paramCount = 1;

    if (order_status) {
      query += `order_status = $${paramCount}`;
      params.push(order_status);
      paramCount++;
    }

    if (payment_status) {
      if (params.length > 0) query += ', ';
      query += `payment_status = $${paramCount}`;
      params.push(payment_status);
      paramCount++;
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
