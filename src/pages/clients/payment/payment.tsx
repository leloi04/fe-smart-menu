import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import {
  handlePaymentFailed,
  handlePaymentSuccess,
  vnpayReturnAPI,
} from '@/services/api';

type PaymentStatus = 'loading' | 'success' | 'fail';

export default function VNPayReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = params.get('paymentId');
  const urlReturn = localStorage.getItem('urlReturn') || '/';

  const vnpResponseCode = params.get('vnp_ResponseCode');
  const vnpTransactionStatus = params.get('vnp_TransactionStatus');

  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!paymentId) {
      setStatus('fail');
      return;
    }

    const isSuccess = vnpResponseCode === '00' && vnpTransactionStatus === '00';

    if (isSuccess) {
      setStatus('success');
    } else {
      setStatus('fail');
    }
  }, [paymentId, vnpResponseCode, vnpTransactionStatus]);

  useEffect(() => {
    if (status !== 'success' || !paymentId) return;

    const finalizePayment = async () => {
      try {
        await vnpayReturnAPI();
        await handlePaymentSuccess(paymentId);
      } catch {
        setStatus('fail');
      }
    };

    finalizePayment();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem('urlReturn');
          navigate('/payments/success', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, paymentId, navigate]);

  useEffect(() => {
    if (status !== 'fail') return;

    let isMounted = true;

    console.log(paymentId);

    const processFailedPayment = async () => {
      try {
        await handlePaymentFailed(paymentId!);
      } catch (error) {
        console.error('handlePaymentFailed error:', error);
      }

      if (!isMounted) return;

      setTimeout(() => {
        navigate(urlReturn, { replace: true });
      }, 2000);
    };

    processFailedPayment();

    return () => {
      isMounted = false;
    };
  }, [
    status,
    paymentId,
    navigate,
    urlReturn,
    vnpResponseCode,
    vnpTransactionStatus,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center space-y-6">
        {/* ===== LOADING ===== */}
        {status === 'loading' && (
          <>
            <div className="flex justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Đang xử lý thanh toán
            </h2>
            <p className="text-gray-500 text-sm">
              Vui lòng không đóng trình duyệt.
            </p>
          </>
        )}

        {/* ===== SUCCESS ===== */}
        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <CheckCircle2 className="w-14 h-14 text-green-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              Thanh toán thành công
            </h2>

            <p className="text-gray-600 text-sm">
              Giao dịch của bạn đã được xác nhận.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl py-3">
              <p className="text-sm text-green-700">
                Tự động chuyển trang sau{' '}
                <span className="font-semibold">{countdown}</span> giây
              </p>
            </div>
          </>
        )}

        {/* ===== FAIL / CANCEL ===== */}
        {status === 'fail' && (
          <>
            <div className="flex justify-center">
              <XCircle className="w-14 h-14 text-red-600" />
            </div>

            <h2 className="text-xl font-semibold text-red-600">
              Thanh toán không thành công
            </h2>

            <p className="text-gray-500 text-sm">
              Giao dịch đã bị hủy hoặc xảy ra lỗi.
            </p>

            <p className="text-gray-500 text-sm">
              Đang quay lại trang trước...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
