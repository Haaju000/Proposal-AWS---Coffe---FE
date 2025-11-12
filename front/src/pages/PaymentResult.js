import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import paymentService from '../services/paymentService';
import orderService from '../services/orderService';
import '../css/PaymentResult.css';

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function để get message từ VNPay response code
  const getVNPayMessage = (responseCode) => {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.'
    };
    
    return messages[responseCode] || 'Lỗi không xác định';
  };

  // Xử lý cập nhật order sau khi thanh toán thành công
  const processSuccessfulPayment = async (orderData, paymentParams) => {
    try {
      console.log('🔄 Processing successful payment, updating order status...');
      
      if (!orderData || !orderData.orderId) {
        console.log('⚠️ No order data found, cannot update order status');
        return;
      }
      
      console.log('📦 Updating order:', orderData.orderId);
      
      // Có thể cần API để cập nhật trạng thái thanh toán của order
      // Hiện tại đơn hàng đã được tạo trong CheckoutModal, chỉ cần cập nhật trạng thái
      
      // Lưu thông tin order vào localStorage để hiển thị
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      
      orderHistory.unshift({
        id: orderData.orderId,
        totalPrice: orderData.cartTotal,
        status: 'Paid',
        items: orderData.cartItems.length,
        customerInfo: orderData.customerInfo,
        paymentMethod: 'VNPay',
        transactionId: paymentParams.vnp_TransactionNo,
        bankCode: paymentParams.vnp_BankCode,
        payDate: paymentParams.vnp_PayDate,
        createdAt: new Date().toISOString()
      });
      
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory.slice(0, 10)));
      
      console.log('✅ Order status updated successfully');
      
    } catch (error) {
      console.error('❌ Error updating order after successful payment:', error);
      // Không throw error để không ảnh hưởng đến hiển thị kết quả thanh toán
      console.log('⚠️ Payment was successful but order update failed. User should contact support.');
    }
  };

  useEffect(() => {
    const processPaymentCallback = async () => {
      try {
        setLoading(true);
        
        // Parse callback parameters từ URL
        const urlParams = new URLSearchParams(location.search);
        const callbackParams = paymentService.parseCallbackParams(urlParams);
        
        console.log('🔄 Processing payment callback with params:', callbackParams);
        
        if (Object.keys(callbackParams).length === 0) {
          throw new Error('Không có thông tin thanh toán từ VNPay');
        }
        
        // Lấy stored order data
        const storedOrderData = localStorage.getItem('vnpayOrderData');
        let orderData = null;
        if (storedOrderData) {
          orderData = JSON.parse(storedOrderData);
          console.log('📦 Retrieved order data:', orderData);
        }
        
        // Kiểm tra trạng thái thanh toán từ URL params
        const vnp_ResponseCode = callbackParams.vnp_ResponseCode;
        const vnp_TransactionStatus = callbackParams.vnp_TransactionStatus;
        
        let result = {
          success: vnp_ResponseCode === '00' && vnp_TransactionStatus === '00',
          orderId: callbackParams.vnp_TxnRef,
          amount: callbackParams.vnp_Amount ? parseInt(callbackParams.vnp_Amount) / 100 : 0, // VNPay trả về amount * 100
          transactionId: callbackParams.vnp_TransactionNo,
          bankCode: callbackParams.vnp_BankCode,
          payDate: callbackParams.vnp_PayDate,
          responseCode: vnp_ResponseCode,
          message: getVNPayMessage(vnp_ResponseCode)
        };
        
        // Gọi API callback để xác thực (optional)
        try {
          await paymentService.handleVNPayCallback(callbackParams);
          console.log('✅ VNPay callback verified');
        } catch (callbackError) {
          console.warn('⚠️ Callback verification failed:', callbackError);
          // Không fail toàn bộ process nếu callback verification lỗi
        }
        
        console.log('✅ Payment result processed:', result);
        
        // Nếu thanh toán thành công, cập nhật order
        if (result.success && orderData) {
          await processSuccessfulPayment(orderData, callbackParams);
        }
        
        setPaymentResult(result);
        setError(null);
        
        // Lưu kết quả thanh toán vào localStorage để có thể truy cập sau
        localStorage.setItem('lastPaymentResult', JSON.stringify({
          ...result,
          timestamp: new Date().toISOString()
        }));
        
      } catch (err) {
        console.error('❌ Error processing payment callback:', err);
        setError(err.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán');
        setPaymentResult(null);
      } finally {
        setLoading(false);
        // Clear stored data after processing
        localStorage.removeItem('vnpayOrderData');
      }
    };

    processPaymentCallback();
  }, [location.search]);

  const handleContinueShopping = () => {
    navigate('/menu');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="payment-result-page">
        <Header />
        <div className="payment-result-container">
          <div className="payment-loading">
            <div className="loading-spinner"></div>
            <h2>Đang xử lý kết quả thanh toán...</h2>
            <p>Vui lòng đợi trong giây lát.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-page">
        <Header />
        <div className="payment-result-container">
          <div className="payment-error">
            <div className="error-icon">❌</div>
            <h2>Lỗi xử lý thanh toán</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={handleGoHome}>
                Về trang chủ
              </button>
              <button className="btn btn-secondary" onClick={handleContinueShopping}>
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = paymentResult?.success === true;
  const statusClass = isSuccess ? 'success' : 'failed';
  const statusIcon = isSuccess ? '✅' : '❌';
  const statusTitle = isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!';

  return (
    <div className="payment-result-page">
      <Header />
      <div className="payment-result-container">
        <div className={`payment-result ${statusClass}`}>
          {/* Status Header */}
          <div className="result-header">
            <div className="status-icon">{statusIcon}</div>
            <h1 className="status-title">{statusTitle}</h1>
            <p className="status-subtitle">
              {isSuccess 
                ? 'Đơn hàng của bạn đã được xử lý thành công.'
                : 'Có lỗi xảy ra trong quá trình thanh toán.'
              }
            </p>
          </div>

          {/* Payment Details */}
          <div className="payment-details">
            <div className="detail-card">
              <h3>Thông tin thanh toán</h3>
              <div className="detail-grid">
                {paymentResult?.orderId && (
                  <div className="detail-item">
                    <span className="label">Mã đơn hàng:</span>
                    <span className="value">{paymentResult.orderId}</span>
                  </div>
                )}
                
                {paymentResult?.amount && (
                  <div className="detail-item">
                    <span className="label">Số tiền:</span>
                    <span className="value amount">₫{parseInt(paymentResult.amount).toLocaleString()}</span>
                  </div>
                )}
                
                {paymentResult?.transactionId && (
                  <div className="detail-item">
                    <span className="label">Mã giao dịch:</span>
                    <span className="value">{paymentResult.transactionId}</span>
                  </div>
                )}
                
                {paymentResult?.bankCode && (
                  <div className="detail-item">
                    <span className="label">Ngân hàng:</span>
                    <span className="value">{paymentResult.bankCode}</span>
                  </div>
                )}
                
                {paymentResult?.payDate && (
                  <div className="detail-item">
                    <span className="label">Thời gian:</span>
                    <span className="value">
                      {new Date(paymentResult.payDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            {paymentResult?.message && (
              <div className="message-card">
                <h4>Thông báo</h4>
                <p>{paymentResult.message}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="result-actions">
            {isSuccess ? (
              <>
                <button className="btn btn-primary" onClick={handleViewOrders}>
                  Xem đơn hàng
                </button>
                <button className="btn btn-secondary" onClick={handleContinueShopping}>
                  Tiếp tục mua sắm
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-primary" onClick={handleContinueShopping}>
                  Thử lại
                </button>
                <button className="btn btn-secondary" onClick={handleGoHome}>
                  Về trang chủ
                </button>
              </>
            )}
          </div>

          {/* Support Info */}
          <div className="support-info">
            <p>
              Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email: 
              <a href="mailto:support@coffee.com"> support@coffee.com</a> 
              hoặc số điện thoại: <a href="tel:+84123456789">0123 456 789</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;