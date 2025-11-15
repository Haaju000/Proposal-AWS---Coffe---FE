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
            
            // Detect payment method from URL
            const isVNPayCallback = window.location.pathname.includes('/payment-result') && 
                                   (urlParams.has('vnp_ResponseCode') || urlParams.has('vnp_TxnRef'));
            const isMoMoSuccess = window.location.pathname.includes('/payment-success');
            const isMoMoFailed = window.location.pathname.includes('/payment-failed');
            
            console.log('Payment method detection:', {
                isVNPayCallback, isMoMoSuccess, isMoMoFailed
            });

            // ✅ Priority 1: Handle MoMo Success Redirect
            if (isMoMoSuccess) {
                console.log('✅ Processing MoMo success redirect');
                
                const orderId = urlParams.get('orderId');
                const amount = urlParams.get('amount');
                const transactionId = urlParams.get('transactionId');
                
                if (orderId) {
                    setPaymentStatus('success');
                    setPaymentDetails({
                        orderId: orderId,
                        transactionRef: transactionId || orderId,
                        amount: amount ? parseFloat(amount) : 0,
                        paymentDate: new Date(),
                        status: 'Processing',
                        message: 'Thanh toán MoMo thành công',
                        paymentMethod: 'MoMo'
                    });

                    // Update order history
                    try {
                        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
                        const orderIndex = orderHistory.findIndex(o => o.orderId === orderId);
                        
                        if (orderIndex !== -1) {
                            orderHistory[orderIndex].status = 'Processing';
                            orderHistory[orderIndex].paymentDate = new Date().toISOString();
                            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
                            console.log('✅ Updated order status to Processing via MoMo redirect');
                        }
                    } catch (error) {
                        console.warn('Warning: Could not update order history:', error);
                    }
                    
                    setLoading(false);
                    return;
                }
            }

            // ✅ Priority 2: Handle MoMo Failed Redirect
            if (isMoMoFailed) {
                console.log('❌ Processing MoMo failed redirect');
                
                const orderId = urlParams.get('orderId');
                const message = urlParams.get('message');
                
                setPaymentStatus('failed');
                setPaymentDetails({
                    orderId: orderId || 'Unknown',
                    message: decodeURIComponent(message || 'Thanh toán MoMo thất bại'),
                    paymentMethod: 'MoMo'
                });
                
                setLoading(false);
                return;
            }

            // ✅ Priority 3: Handle VNPay Callback (existing logic)
            if (isVNPayCallback) {
                console.log('💳 Processing VNPay callback');
                
                const vnp_OrderId = urlParams.get('vnp_TxnRef');
                const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
                const vnp_Amount = urlParams.get('vnp_Amount');
                const vnp_PayDate = urlParams.get('vnp_PayDate');
                const vnp_TransactionNo = urlParams.get('vnp_TransactionNo');
                const vnp_BankCode = urlParams.get('vnp_BankCode');

                console.log('VNPay callback params:', {
                    vnp_OrderId, vnp_ResponseCode, vnp_Amount, vnp_PayDate, vnp_TransactionNo, vnp_BankCode
                });

                if (!vnp_ResponseCode || !vnp_OrderId) {
                    console.log('Missing required VNPay parameters, showing error');
                    setPaymentStatus('error');
                    setLoading(false);
                    return;
                }

                try {
                    if (vnp_ResponseCode === '00') {
                        // VNPay success
                        setPaymentStatus('success');
                        setPaymentDetails({
                            orderId: vnp_OrderId,
                            transactionRef: vnp_TransactionNo || vnp_OrderId,
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
                            status: 'Processing',
                            bankCode: vnp_BankCode,
                            paymentMethod: 'VNPay'
                        });

                        // Update order history for VNPay
                        try {
                            const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
                            const orderIndex = orderHistory.findIndex(o => o.orderId === vnp_OrderId);
                            
                            if (orderIndex !== -1) {
                                orderHistory[orderIndex].status = 'Processing';
                                orderHistory[orderIndex].paymentDate = new Date().toISOString();
                                localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
                                console.log('✅ Updated order status to Processing via VNPay callback');
                            }
                        } catch (error) {
                            console.warn('Warning: Could not update order history:', error);
                        }
                    } else {
                        // VNPay failed
                        setPaymentStatus('failed');
                        setPaymentDetails({
                            orderId: vnp_OrderId,
                            transactionRef: vnp_TransactionNo || vnp_OrderId,
                            responseCode: vnp_ResponseCode,
                            message: getErrorMessage(vnp_ResponseCode),
                            paymentMethod: 'VNPay'
                        });
                    }
                } catch (error) {
                    console.error('Error processing VNPay result:', error);
                    setPaymentStatus('error');
                } finally {
                    setLoading(false);
                }
                return;
            }

            // ✅ Priority 4: Handle generic backend redirect params (fallback)
            const orderId = urlParams.get('orderId');
            const status = urlParams.get('status');
            const amount = urlParams.get('amount');
            const transactionId = urlParams.get('transactionId');
            const message = urlParams.get('message');

            if (orderId && status) {
                console.log('✅ Processing generic backend redirect result');
                
                if (status === 'success') {
                    setPaymentStatus('success');
                    setPaymentDetails({
                        orderId: orderId,
                        transactionRef: transactionId || orderId,
                        amount: amount ? parseFloat(amount) : 0,
                        paymentDate: new Date(),
                        status: 'Processing',
                        message: message || 'Thanh toán thành công'
                    });

                    // Update orderHistory
                    try {
                        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
                        const orderIndex = orderHistory.findIndex(o => o.orderId === orderId);
                        
                        if (orderIndex !== -1) {
                            orderHistory[orderIndex].status = 'Processing';
                            orderHistory[orderIndex].paymentDate = new Date().toISOString();
                            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
                            console.log('✅ Updated order status to Processing via generic redirect');
                        }
                    } catch (error) {
                        console.warn('Warning: Could not update order history:', error);
                    }
                } else {
                    setPaymentStatus('failed');
                    setPaymentDetails({
                        orderId: orderId,
                        message: message || 'Thanh toán thất bại'
                    });
                }
                
                setLoading(false);
                return;
            }

            // ✅ Priority 2: Fallback to VNPay direct params (OLD FLOW)
            console.log('⚠️ No backend redirect params, trying VNPay direct params...');
            
            const vnp_OrderId = urlParams.get('vnp_TxnRef');
            const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
            const vnp_Amount = urlParams.get('vnp_Amount');
            const vnp_PayDate = urlParams.get('vnp_PayDate');

            console.log('VNPay direct params:', {
                vnp_OrderId, vnp_ResponseCode, vnp_Amount, vnp_PayDate
            });

            if (!vnp_ResponseCode || !vnp_OrderId) {
                console.log('Missing required parameters, showing error');
                setPaymentStatus('error');
                setLoading(false);
                return;
            }

            try {
                if (vnp_ResponseCode === '00') {
                    // Thanh toán thành công (VNPay direct - fallback)
                    setPaymentStatus('success');
                    setPaymentDetails({
                        orderId: vnp_OrderId,
                        transactionRef: vnp_OrderId,
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

                    // ✅ Verify payment and get actual order status from backend
                    try {
                        console.log('🔍 Verifying payment status with backend...');
                        const backendStatus = await paymentService.getPaymentStatus(orderId, transactionId || orderId);
                        console.log('✅ Backend payment verification:', backendStatus);
                        
                        // If backend returns order status, use it
                        if (backendStatus?.order?.status) {
                            setPaymentDetails(prev => ({
                                ...prev,
                                backendStatus: backendStatus.order.status
                            }));
                        }
                    } catch (error) {
                        console.warn('⚠️ Could not verify payment status with backend:', error);
                    }

                    // ✅ Update orderHistory with actual backend status if available
                    try {
                        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
                        const orderIndex = orderHistory.findIndex(o => o.orderId === orderId);
                        
                        if (orderIndex !== -1) {
                            // Try to get real status from backend first
                            let newStatus = 'Processing'; // Default assumption after successful payment
                            
                            try {
                                console.log('📋 Fetching actual order status from backend...');
                                const orderResponse = await fetch(`http://localhost:5144/api/Order/${orderId}`, {
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('id_token') || localStorage.getItem('access_token') || localStorage.getItem('local_token')}`
                                    }
                                });
                                
                                if (orderResponse.ok) {
                                    const orderData = await orderResponse.json();
                                    newStatus = orderData.status || 'Processing';
                                    console.log('✅ Real order status from backend:', newStatus);
                                } else {
                                    console.warn('⚠️ Could not fetch order status, using default');
                                }
                            } catch (fetchError) {
                                console.warn('⚠️ Error fetching order status:', fetchError);
                            }
                            
                            orderHistory[orderIndex].status = newStatus;
                            orderHistory[orderIndex].paymentDate = new Date().toISOString();
                            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
                            console.log('✅ Updated order status in localStorage:', orderHistory[orderIndex]);
                        } else {
                            console.warn('⚠️ Order not found in localStorage history');
                        }
                    } catch (error) {
                        console.warn('⚠️ Could not update order history:', error);
                    }
                } else {
                    // Thanh toán thất bại (VNPay direct - fallback)
                    setPaymentStatus('failed');
                    setPaymentDetails({
                        orderId: vnp_OrderId,
                        transactionRef: vnp_OrderId,
                        responseCode: vnp_ResponseCode,
                        message: getErrorMessage(vnp_ResponseCode)
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
                                {paymentDetails.paymentMethod && (
                                    <div className="detail-row">
                                        <span className="detail-label">Phương thức thanh toán:</span>
                                        <span className="detail-value payment-method">{paymentDetails.paymentMethod}</span>
                                    </div>
                                )}
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
                            {paymentDetails?.message ? 
                                paymentDetails.message :
                                paymentDetails?.responseCode ? 
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
                                {paymentDetails.transactionRef && (
                                    <div className="detail-row">
                                        <span className="detail-label">Mã giao dịch:</span>
                                        <span className="detail-value">{paymentDetails.transactionRef}</span>
                                    </div>
                                )}
                                {paymentDetails.paymentMethod && (
                                    <div className="detail-row">
                                        <span className="detail-label">Phương thức thanh toán:</span>
                                        <span className="detail-value payment-method">{paymentDetails.paymentMethod}</span>
                                    </div>
                                )}
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