import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ThankYouPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-8 text-center space-y-6">
        {/* ICON */}
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Cảm ơn bạn đã ghé thăm
        </h1>

        {/* CONTENT */}
        <p className="text-gray-600 leading-relaxed">
          Cảm ơn bạn đã dùng bữa tại cửa hàng của chúng tôi ❤️ <br />
          Chúc bạn có những phút giây thật ngon miệng và thoải mái.
        </p>

        <p className="text-gray-500">
          Hẹn gặp lại bạn trong những lần tiếp theo!
        </p>

        {/* BUTTON */}
        <button
          onClick={() => navigate('/')}
          className="w-full rounded-xl bg-green-600 text-white py-3 font-medium hover:bg-green-700 transition"
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
}
