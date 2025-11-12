import React, { useEffect, useState } from 'react';
import paymentService from '../services/paymentService';
import '../css/PaymentResult.css';

const PaymentResult = () => {
    const [paymentStatus, setPaymentStatus] = useState('loading');
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const getErrorMessage = (responseCode) => {
        const errorMessages = {
            '05': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '06': 'Quý khách đã nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
            '07': 'Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
            '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
            '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
            '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
            '24': 'Khách hàng hủy giao dịch',
            '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '65': 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
            '75': 'Ngân hàng thanh toán đang bảo trì.',
            '79': 'KH nhập sai mật khẩu thanh toán quá số lần quy định.',
            '99': 'Lỗi không xác định'
        };
        return errorMessages[responseCode] || 'Giao dịch không thành công. Vui lòng thử lại sau.';
    };

    useEffect(() => {
        const checkPaymentStatus = async () => {
            console.log('=== PaymentResult Debug ===');
            console.log('Full URL:', window.location.href);
            console.log('Search params:', window.location.search);
            
            const urlParams = new URLSearchParams(window.location.search);
            
            // Log all parameters
            console.log('All URL parameters:');
            for (let [key, value] of urlParams.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            const orderId = urlParams.get('orderId') || urlParams.get('vnp_TxnRef');
            const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
            const vnp_TxnRef = urlParams.get('vnp_TxnRef');
            const vnp_Amount = urlParams.get('vnp_Amount');
            const vnp_PayDate = urlParams.get('vnp_PayDate');

            console.log('Extracted values:', {
                orderId,
                vnp_ResponseCode,
                vnp_TxnRef,
                vnp_Amount,
                vnp_PayDate
            });

            if (!vnp_ResponseCode || !vnp_TxnRef) {
                console.log('Missing required parameters, showing error');
                setPaymentStatus('error');
                setLoading(false);
                return;
            }

            try {
                if (vnp_ResponseCode === '00') {
                    // Thanh toán thành công
                    setPaymentStatus('success');
                    setPaymentDetails({
                        orderId: orderId,
                        transactionRef: vnp_TxnRef,
                        amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : 0,
                        paymentDate: vnp_PayDate ? 
                            new Date(
                                vnp_PayDate.slice(0, 4) + '-' + 
                                vnp_PayDate.slice(4, 6) + '-' + 
                                vnp_PayDate.slice(6, 8) + ' ' + 
                                vnp_PayDate.slice(8, 10) + ':' + 
                                vnp_PayDate.slice(10, 12) + ':' + 
                                vnp_PayDate.slice(12, 14)
                            ) : new Date(),
                        status: 'Paid'
                    });

                    // Gọi API để cập nhật trạng thái đơn hàng
                    try {
                        await paymentService.getPaymentStatus(orderId, vnp_TxnRef);
                    } catch (error) {
                        console.warn('Warning: Could not update order status:', error);
                    }

                    // ✅ Update orderHistory status to completed
                    try {
                        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
                        const orderIndex = orderHistory.findIndex(o => o.orderId === orderId);
                        
                        if (orderIndex !== -1) {
                            orderHistory[orderIndex].status = 'Processing'; // or 'Completed'
                            orderHistory[orderIndex].paymentDate = new Date().toISOString();
                            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
                            console.log('✅ Updated order status in history:', orderHistory[orderIndex]);
                        }
                    } catch (error) {
                        console.warn('Warning: Could not update order history:', error);
                    }
                } else {
                    // Thanh toán thất bại
                    setPaymentStatus('failed');
                    setPaymentDetails({
                        orderId: orderId,
                        transactionRef: vnp_TxnRef,
                        responseCode: vnp_ResponseCode
                    });
                }
            } catch (error) {
                console.error('Error processing payment result:', error);
                setPaymentStatus('error');
            } finally {
                setLoading(false);
            }
        };

        checkPaymentStatus();
    }, []);

    const handleBackToMenu = () => {
        window.location.href = '/menu';
    };

    const handleViewOrders = () => {
        // Check if user is still authenticated
        const idToken = localStorage.getItem('id_token');
        const accessToken = localStorage.getItem('access_token');
        
        if (!idToken && !accessToken) {
            // Token expired, redirect to login first
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem đơn hàng.');
            window.location.href = '/login?redirect=/orders';
        } else {
            window.location.href = '/orders';
        }
    };

    if (loading) {
        return (
            <div className="payment-result-container">
                <div className="payment-result-card">
                    <div className="loading-spinner"></div>
                    <h2>Đang xử lý kết quả thanh toán...</h2>
                    <p>Vui lòng đợi trong giây lát...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-result-container">
            <div className="payment-result-card">
                {paymentStatus === 'success' && (
                    <>
                        <div className="result-icon success">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#10B981"/>
                                <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h1 className="result-title success">Thanh toán thành công!</h1>
                        <p className="result-message">
                            Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xác nhận và đang được xử lý.
                        </p>
                        {paymentDetails && (
                            <div className="payment-details">
                                <div className="detail-row">
                                    <span className="detail-label">Mã đơn hàng:</span>
                                    <span className="detail-value">#{paymentDetails.orderId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Mã giao dịch:</span>
                                    <span className="detail-value">{paymentDetails.transactionRef}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Số tiền thanh toán:</span>
                                    <span className="detail-value amount">{paymentDetails.amount?.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Thời gian giao dịch:</span>
                                    <span className="detail-value">{paymentDetails.paymentDate?.toLocaleString('vi-VN')}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Trạng thái:</span>
                                    <span className="detail-value status-paid">Đã thanh toán</span>
                                </div>
                            </div>
                        )}
                        <div className="action-buttons">
                            <button className="btn btn-primary" onClick={handleViewOrders}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Xem đơn hàng của tôi
                            </button>
                            <button className="btn btn-secondary" onClick={handleBackToMenu}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3h18v18H3V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Tiếp tục đặt hàng
                            </button>
                        </div>
                    </>
                )}

                {paymentStatus === 'failed' && (
                    <>
                        <div className="result-icon failed">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#EF4444"/>
                                <path d="m15 9-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="m9 9 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h1 className="result-title failed">Thanh toán thất bại!</h1>
                        <p className="result-message">
                            {paymentDetails?.responseCode ? 
                                getErrorMessage(paymentDetails.responseCode) : 
                                'Giao dịch của bạn không thành công. Vui lòng kiểm tra lại thông tin và thử lại.'
                            }
                        </p>
                        {paymentDetails && (
                            <div className="payment-details">
                                <div className="detail-row">
                                    <span className="detail-label">Mã đơn hàng:</span>
                                    <span className="detail-value">#{paymentDetails.orderId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Mã giao dịch:</span>
                                    <span className="detail-value">{paymentDetails.transactionRef}</span>
                                </div>
                                {paymentDetails.responseCode && (
                                    <div className="detail-row">
                                        <span className="detail-label">Mã lỗi:</span>
                                        <span className="detail-value error-code">{paymentDetails.responseCode}</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="detail-label">Trạng thái:</span>
                                    <span className="detail-value status-failed">Thất bại</span>
                                </div>
                            </div>
                        )}
                        <div className="action-buttons">
                            <button className="btn btn-primary" onClick={handleBackToMenu}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Thử lại thanh toán
                            </button>
                            <button className="btn btn-secondary" onClick={() => window.location.href = '/contact'}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Liên hệ hỗ trợ
                            </button>
                        </div>
                    </>
                )}

                {paymentStatus === 'error' && (
                    <>
                        <div className="result-icon error">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#F59E0B"/>
                                <path d="M12 8v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="m12 16 .01 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h1 className="result-title error">Có lỗi xảy ra!</h1>
                        <p className="result-message">
                            Không thể xác minh trạng thái thanh toán. Vui lòng kiểm tra đơn hàng của bạn hoặc liên hệ hỗ trợ khách hàng.
                        </p>
                        <div className="action-buttons">
                            <button className="btn btn-primary" onClick={handleViewOrders}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Kiểm tra đơn hàng
                            </button>
                            <button className="btn btn-secondary" onClick={handleBackToMenu}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Về trang chủ
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentResult;