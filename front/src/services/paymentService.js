const API_BASE_URL = 'http://localhost:5144/api';

class PaymentService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Tạo payment URL cho VNPay - theo backend API format
  async createVNPayPayment(paymentRequest) {
    try {
      // Get token với logic giống authService
      const accessToken = localStorage.getItem('access_token');
      const localToken = localStorage.getItem('local_token'); 
      const idToken = localStorage.getItem('id_token');
      
      const token = idToken || accessToken || localToken;
      
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thanh toán');
      }
      
      console.log('Creating VNPay payment:', paymentRequest);
      
      const response = await fetch(`${this.baseURL}/Payment/vnpay/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentRequest)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('VNPay payment creation failed:', data);
        throw new Error(data.error || data.Error || 'Tạo payment URL thất bại');
      }

      console.log('VNPay payment created:', data);
      
      // Backend trả về VNPayPaymentResponse: { Success, PaymentUrl, Message }
      return {
        success: data.Success || data.success || false,
        paymentUrl: data.PaymentUrl || data.paymentUrl || '',
        message: data.Message || data.message || ''
      };
    } catch (error) {
      console.error('Create VNPay payment error:', error);
      throw error;
    }
  }

  // Kiểm tra trạng thái thanh toán
  async getPaymentStatus(orderId) {
    try {
      const accessToken = localStorage.getItem('access_token');
      const localToken = localStorage.getItem('local_token'); 
      const idToken = localStorage.getItem('id_token');
      
      const token = idToken || accessToken || localToken;
      
      const response = await fetch(`${this.baseURL}/Payment/status/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Lấy trạng thái thanh toán thất bại');
      }

      return data;
    } catch (error) {
      console.error('Get payment status error:', error);
      throw error;
    }
  }

  // Redirect đến VNPay
  redirectToVNPay(paymentUrl) {
    console.log('Redirecting to VNPay:', paymentUrl);
    window.location.href = paymentUrl;
  }
}

// Export instance
const paymentService = new PaymentService();
export { paymentService };
export default paymentService;