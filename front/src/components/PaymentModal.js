import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import '../css/PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, order, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('vnpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('vnpay');
      setError(null);
      setPaymentData(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!order?.orderId) {
      setError('Thông tin đơn hàng không hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (selectedMethod === 'vnpay') {
        await handleVNPayPayment();
      } else if (selectedMethod === 'momo') {
        await handleMoMoPayment();
      } else {
        setError('Phương thức thanh toán không được hỗ trợ');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleVNPayPayment = async () => {
    const response = await paymentService.createVNPayPayment(order.orderId);
    
    if (response.success && response.paymentUrl) {
      // Close modal and redirect to VNPay
      onClose();
      paymentService.redirectToVNPay(response.paymentUrl);
      
      // Call success callback
      if (onPaymentSuccess) {
        onPaymentSuccess({
          method: 'vnpay',
          orderId: order.orderId,
          redirectUrl: response.paymentUrl
        });
      }
    } else {
      throw new Error(response.message || 'Không thể tạo URL thanh toán VNPay');
    }
  };

  const handleMoMoPayment = async () => {
    const response = await paymentService.createMoMoPayment(order.orderId);
    
    if (response.success) {
      setPaymentData(response);
      
      // Auto redirect after showing QR code for a moment
      setTimeout(() => {
        if (response.payUrl) {
          onClose();
          paymentService.redirectToMoMo(response.payUrl);
          
          // Call success callback
          if (onPaymentSuccess) {
            onPaymentSuccess({
              method: 'momo',
              orderId: order.orderId,
              payUrl: response.payUrl,
              qrCodeUrl: response.qrCodeUrl
            });
          }
        }
      }, 2000);
    } else {
      throw new Error(response.message || 'Không thể tạo thanh toán MoMo');
    }
  };

  const paymentMethods = [
    {
      id: 'vnpay',
      name: 'VNPay',
      icon: '💳',
      description: 'Thanh toán qua VNPay (ATM, Visa, MasterCard)',
      color: '#1e88e5'
    },
    {
      id: 'momo',
      name: 'MoMo',
      icon: '🍑',
      description: 'Ví điện tử MoMo',
      color: '#d91a7a'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-modal-header">
          <h3 className="payment-modal-title">
            <span className="payment-icon">💳</span>
            Chọn phương thức thanh toán
          </h3>
          <button className="payment-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Order Info */}
        <div className="payment-order-info">
          <div className="order-summary">
            <h4>Thông tin đơn hàng</h4>
            <div className="order-details">
              <div className="order-row">
                <span>Mã đơn hàng:</span>
                <span className="order-id">#{order?.orderId?.substring(0, 8)}</span>
              </div>
              <div className="order-row">
                <span>Tổng tiền:</span>
                <span className="order-total">₫{order?.finalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <h4>Chọn phương thức thanh toán:</h4>
          <div className="payment-methods-list">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
                style={{ '--method-color': method.color }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  disabled={loading}
                />
                <div className="payment-method-content">
                  <div className="payment-method-icon">{method.icon}</div>
                  <div className="payment-method-info">
                    <div className="payment-method-name">{method.name}</div>
                    <div className="payment-method-desc">{method.description}</div>
                  </div>
                  <div className="payment-method-check">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* MoMo Payment Data Display */}
        {paymentData && selectedMethod === 'momo' && (
          <div className="payment-momo-data">
            <div className="momo-success-message">
              <span className="success-icon">✅</span>
              <div>
                <div className="success-title">Tạo thanh toán MoMo thành công!</div>
                <div className="success-subtitle">Đang chuyển hướng...</div>
              </div>
            </div>
            
            {paymentData.qrCodeUrl && (
              <div className="momo-qr-section">
                <h4>Quét mã QR để thanh toán:</h4>
                <div className="momo-qr-container">
                  <img src={paymentData.qrCodeUrl} alt="MoMo QR Code" className="momo-qr-code" />
                </div>
                <p className="momo-qr-instruction">
                  Mở ứng dụng MoMo và quét mã QR trên để thanh toán
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="payment-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="payment-modal-actions">
          <button 
            className="payment-cancel-btn" 
            onClick={onClose}
            disabled={loading}
          >
            Hủy bỏ
          </button>
          <button 
            className="payment-confirm-btn"
            onClick={handlePayment}
            disabled={loading || !selectedMethod}
          >
            {loading ? (
              <>
                <div className="payment-loading-spinner"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span className="payment-confirm-icon">
                  {paymentService.getPaymentMethodIcon(selectedMethod)}
                </span>
                <span>Thanh toán với {paymentService.getPaymentMethodName(selectedMethod)}</span>
              </>
            )}
          </button>
        </div>

        {/* Payment Note */}
        <div className="payment-note">
          <div className="note-icon">ℹ️</div>
          <div className="note-text">
            Bạn sẽ được chuyển hướng đến trang thanh toán của nhà cung cấp dịch vụ.
            Vui lòng không đóng trình duyệt trong quá trình thanh toán.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;