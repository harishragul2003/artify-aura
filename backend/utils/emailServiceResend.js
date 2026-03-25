import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Log configuration on startup
console.log('📧 Resend Email Configuration:', {
  hasApiKey: !!process.env.RESEND_API_KEY,
  fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  adminEmail: process.env.ADMIN_EMAIL
});

export const sendOrderConfirmation = async (userEmail, orderDetails) => {
  console.log('📧 Attempting to send order confirmation via Resend to:', userEmail);
  
  try {
    const itemsList = orderDetails.items?.map(item => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center;">
            <div style="flex: 1;">
              <p style="margin: 0; font-weight: 600; color: #1f2937;">${item.name || 'Product'}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Qty: ${item.quantity}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: 600; color: #ec4899;">₹${item.price}</p>
            </div>
          </div>
        </td>
      </tr>
    `).join('') || '';

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Artify Aura <onboarding@resend.dev>',
      to: [userEmail],
      subject: '🎉 Order Confirmed - Artify Aura',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
            
            <!-- Header with gradient -->
            <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 10px;">🎁</div>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Order Confirmed!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Thank you for shopping with us</p>
            </div>
            
            <!-- Success Badge -->
            <div style="text-align: center; margin-top: -25px;">
              <div style="display: inline-block; background: #10b981; color: white; padding: 10px 25px; border-radius: 25px; font-weight: 600; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
                ✓ Payment ${orderDetails.payment_status}
              </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">
                Hi there! 👋<br>
                Your order has been confirmed and we're getting it ready for you.
              </p>
              
              <!-- Order Info Card -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #f59e0b;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📋 Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #78350f; font-weight: 600;">Order ID:</td>
                    <td style="padding: 8px 0; color: #92400e; text-align: right; font-family: monospace;">#${orderDetails.id?.slice(0, 8).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #78350f; font-weight: 600;">Order Date:</td>
                    <td style="padding: 8px 0; color: #92400e; text-align: right;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #78350f; font-weight: 600;">Status:</td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${orderDetails.order_status}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Items List -->
              ${itemsList ? `
              <div style="background: #f9fafb; padding: 20px; border-radius: 15px; margin-bottom: 30px;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">🛍️ Order Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsList}
                </table>
              </div>
              ` : ''}
              
              <!-- Total Amount Card -->
              <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px; text-align: center;">
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Total Amount</p>
                <h2 style="color: white; margin: 0; font-size: 36px; font-weight: 700;">₹${orderDetails.total_amount}</h2>
              </div>
              
              <!-- Shipping Info -->
              <div style="background: #eff6ff; padding: 20px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">🚚 Delivery Information</h3>
                <p style="color: #1e3a8a; margin: 0; line-height: 1.6;">
                  <strong>Address:</strong><br>
                  ${orderDetails.shipping_address || 'As provided during checkout'}
                </p>
                <p style="color: #3b82f6; margin: 15px 0 0 0; font-size: 14px;">
                  📦 Estimated delivery: 3-5 business days
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.FRONTEND_URL}/my-orders" 
                   style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);">
                  Track Your Order →
                </a>
              </div>
              
              <!-- Help Section -->
              <div style="background: #f9fafb; padding: 20px; border-radius: 15px; text-align: center;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Need help with your order?</p>
                <p style="color: #ec4899; margin: 0; font-weight: 600;">Contact us at support@artifyaura.com</p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #1f2937; padding: 30px; text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">Thank you for choosing Artify Aura</p>
              <p style="color: #6b7280; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Artify Aura. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      throw error;
    }

    console.log('✅ Order confirmation email sent successfully via Resend:', data);
    return data;
  } catch (error) {
    console.error('❌ Resend email error:', error);
    throw error;
  }
};

export const sendAdminOrderNotification = async (orderDetails, customerInfo) => {
  console.log('📧 Attempting to send admin notification via Resend for order:', orderDetails.id);
  
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.error('❌ ADMIN_EMAIL not configured in environment variables');
      throw new Error('Admin email not configured');
    }
    
    console.log('📧 Admin email address:', adminEmail);
    console.log('📧 Using FROM email:', process.env.RESEND_FROM_EMAIL);
    
    const itemsList = orderDetails.items?.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; color: #1f2937;">${item.name || 'Product'}</td>
        <td style="padding: 12px; text-align: center; color: #6b7280;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; color: #ec4899; font-weight: 600;">₹${item.price}</td>
      </tr>
    `).join('') || '';

    const emailPayload = {
      from: process.env.RESEND_FROM_EMAIL || 'Artify Aura <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `🔔 New Order - #${orderDetails.id?.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 700px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
            
            <!-- Admin Header -->
            <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 10px;">🔔</div>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">New Order Alert!</h1>
              <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 16px;">Action required - Process this order</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Order ID Card -->
              <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px; text-align: center;">
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Order ID</p>
                <h2 style="color: white; margin: 0; font-size: 32px; font-weight: 700; font-family: monospace;">#${orderDetails.id?.slice(0, 8).toUpperCase()}</h2>
                <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">${new Date().toLocaleString('en-IN')}</p>
              </div>
              
              <!-- Customer Info -->
              <div style="background: #eff6ff; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
                <h3 style="color: #1e40af; margin: 0 0 20px 0;">👤 Customer Information</h3>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Name:</strong> ${customerInfo.name || 'N/A'}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Email:</strong> ${customerInfo.email || 'N/A'}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Phone:</strong> ${customerInfo.phone || 'N/A'}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Address:</strong> ${orderDetails.shipping_address || 'N/A'}</p>
              </div>
              
              <!-- Order Items -->
              ${itemsList ? `
              <div style="background: #f9fafb; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0;">📦 Order Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 12px; text-align: left;">Product</th>
                      <th style="padding: 12px; text-align: center;">Qty</th>
                      <th style="padding: 12px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsList}
                  </tbody>
                </table>
              </div>
              ` : ''}
              
              <!-- Total Amount -->
              <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; border-radius: 15px; margin-bottom: 30px; text-align: center;">
                <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">Total Order Value</p>
                <h2 style="color: white; margin: 0; font-size: 42px; font-weight: 700;">₹${orderDetails.total_amount}</h2>
              </div>
              
              <!-- Action Button -->
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/admin" 
                   style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600;">
                  Process Order →
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #1f2937; padding: 30px; text-align: center;">
              <p style="color: #9ca3af; margin: 0;">Artify Aura Admin System</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log('📧 Sending email with payload:', {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject
    });

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('❌ Resend API returned error:', error);
      throw error;
    }

    console.log('✅ Admin notification sent successfully via Resend:', data);
    return data;
  } catch (error) {
    console.error('❌ Resend admin email error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw error;
  }
};
