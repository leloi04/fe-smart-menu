import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

type PaymentStatus = 'loading' | 'success' | 'fail' | 'cancelled';

export default function VNPayReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = params.get('paymentId');

  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [countdown, setCountdown] = useState(10000000000000000000000000);

  // ===== Xác nhận thanh toán =====
  useEffect(() => {
    if (!paymentId) {
      setStatus('fail');
      return;
    }

    const verifyPayment = async () => {
      try {
        /**
         * 🚨 THỰC TẾ:
         * const res = await checkPaymentStatusAPI(paymentId);
         * const paymentStatus = res.data.status;
         */

        // ===== DEMO =====
        await new Promise((r) => setTimeout(r, 2200));

        // 👉 giả lập status (thay bằng response backend)
        const paymentStatus = 'SUCCESS';
        // const paymentStatus = 'CANCELLED';
        // const paymentStatus = 'FAILED';

        if (paymentStatus === 'SUCCESS') {
          setStatus('success');
        } else if (paymentStatus === 'CANCELLED') {
          setStatus('cancelled');
          setTimeout(() => navigate(-1), 1500);
        } else {
          setStatus('fail');
        }
      } catch {
        setStatus('fail');
      }
    };

    verifyPayment();
  }, [paymentId, navigate]);

  // ===== Countdown redirect (SUCCESS) =====
  useEffect(() => {
    if (status !== 'success') return;
    console.log('start countdown');

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/review');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

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
              Vui lòng không đóng trình duyệt trong lúc hệ thống xác nhận giao
              dịch.
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
              Giao dịch của bạn đã được xác nhận thành công.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl py-3">
              <p className="text-sm text-green-700">
                Tự động chuyển sang trang đánh giá sau{' '}
                <span className="font-semibold">{countdown}</span> giây
              </p>
            </div>

            <button
              onClick={() => navigate('/review')}
              className="w-full mt-2 rounded-xl bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 transition"
            >
              Chuyển ngay
            </button>
          </>
        )}

        {/* ===== CANCELLED ===== */}
        {status === 'cancelled' && (
          <>
            <div className="flex justify-center">
              <XCircle className="w-14 h-14 text-yellow-500" />
            </div>

            <h2 className="text-xl font-semibold text-yellow-600">
              Bạn đã hủy thanh toán
            </h2>

            <p className="text-gray-500 text-sm">
              Đang quay lại trang trước...
            </p>
          </>
        )}

        {/* ===== FAIL ===== */}
        {status === 'fail' && (
          <>
            <div className="flex justify-center">
              <XCircle className="w-14 h-14 text-red-600" />
            </div>

            <h2 className="text-xl font-semibold text-red-600">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-500 text-sm">
              Không thể xác nhận giao dịch. Vui lòng thử lại hoặc liên hệ hỗ
              trợ.
            </p>

            <button
              onClick={() => navigate(-1)}
              className="w-full rounded-xl bg-blue-600 text-white py-3 font-medium"
            >
              Quay lại
            </button>
          </>
        )}
      </div>
    </div>
  );
}
