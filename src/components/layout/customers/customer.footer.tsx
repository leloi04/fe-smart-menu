import { Phone, Mail, MapPin, Facebook, Instagram, } from 'lucide-react';

function AppFooter() {

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">SmartMenu</h3>
            <p className="text-sm mb-4">
              Hệ thống menu điện tử thông minh, giúp bạn gọi món dễ dàng và trải nghiệm ẩm thực tuyệt vời.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500" />
                <span className="text-sm">0123 456 789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" />
                <span className="text-sm">contact@smartmenu.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-sm">123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4">Giờ mở cửa</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Thứ 2 - Thứ 6:</span>
                <span className="text-white">10:00 - 22:00</span>
              </div>
              <div className="flex justify-between">
                <span>Thứ 7 - Chủ nhật:</span>
                <span className="text-white">09:00 - 23:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2025 SmartMenu. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter
