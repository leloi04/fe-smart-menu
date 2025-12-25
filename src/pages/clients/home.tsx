import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Star } from 'lucide-react';
import { Card } from 'antd';
import { fetchMenuItemsAPI, getCategoryAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import BookingForm from './home/form.reservation';

export default function HomePage() {
  const slides = [
    {
      id: 1,
      title: 'Giảm giá 30% tất cả các món cuối tuần!',
      subtitle: 'Chỉ từ 99.000đ - Áp dụng cuối tuần',
      image:
        'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 2,
      title: 'Combo cặp đôi: 2 món + tráng miệng',
      subtitle: 'Tiết kiệm 20% cho 2 người',
      image:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 3,
      title: 'Món mới ra mắt: Lẩu Thái Hải Sản',
      subtitle: 'Hương vị cay nồng, ăn cùng bạn bè là tuyệt!',
      image:
        'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 4,
      title: 'Happy Hour: Đồ uống giảm 50%',
      subtitle: '15:00 - 18:00 mỗi ngày',
      image:
        'https://images.unsplash.com/photo-1541542684-6f8f3b3d06d7?auto=format&fit=crop&w=1600&q=80',
    },
  ];

  // --- STATE ---
  const [categories, setCategories] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimer = useRef<number | null>(null);
  const SLIDE_COUNT = slides.length;
  const defaultSelectedCategory = 'Tất cả';
  const [selectedCategory, setSelectedCategory] = useState<string>(
    defaultSelectedCategory,
  );
  const [menuItems, setMenuItems] = useState<IMenuModal[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<IMenuModal[]>([]);
  const navigate = useNavigate();

  // --- Slider: autoplay + smooth transition ---
  useEffect(() => {
    // start autoplay
    const start = () => {
      stop();
      slideTimer.current = window.setInterval(() => {
        setCurrentSlide((s) => (s + 1) % SLIDE_COUNT);
      }, 6000);
    };
    const stop = () => {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
        slideTimer.current = null;
      }
    };

    start();
    // pause on visibility change
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [SLIDE_COUNT]);

  // --- Categories ---
  useEffect(() => {
    const fetchCategory = async () => {
      const res = await getCategoryAPI();
      if (res.data) {
        const categories = ['Tất cả', ...res.data];
        setCategories(categories);
      }
    };

    fetchCategory();
  }, []);

  // --- Filter dishes when category changes ---
  useEffect(() => {
    if (!menuItems) return;

    if (selectedCategory === 'Tất cả') {
      setFilteredDishes(menuItems);
    } else {
      setFilteredDishes(
        menuItems.filter((d) => d.category === selectedCategory),
      );
    }
  }, [selectedCategory]);

  // --- Menu Items ---
  useEffect(() => {
    const fetchMenuItems = async () => {
      const res = await fetchMenuItemsAPI();
      if (res.data) {
        setMenuItems(res.data as any);
        if (defaultSelectedCategory === 'Tất cả') {
          setFilteredDishes(res.data as any);
        } else {
          setFilteredDishes(
            menuItems.filter((d) => d.category === selectedCategory),
          );
        }
      }
    };

    fetchMenuItems();
  }, []);

  // --- Helpers ---
  // const goToSlide = (index: number) => setCurrentSlide(index % SLIDE_COUNT);

  return (
    <div className="w-full flex flex-col gap-12">
      {/* Slider: chiều cao lớn hơn, chuyển động mượt */}
      {/* SLIDER */}
      <div className="relative w-full h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[currentSlide].id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${slides[currentSlide].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end md:items-center">
              <div className="px-6 md:px-12 lg:px-20 py-16">
                <h2 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg leading-tight">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-white/90 mt-4 text-lg md:text-xl">
                  {slides[currentSlide].subtitle}
                </p>
                <div className="mt-6 flex gap-4">
                  <button className="bg-[#FF6B35] text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition cursor-pointer">
                    Xem chi tiết
                  </button>
                  <button className="bg-white/80 text-black px-6 py-3 rounded-xl hover:bg-white transition cursor-pointer">
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-4 h-4 rounded-full transition ${
                i === currentSlide ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Featured Dishes */}
      <section className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Giao hàng nhanh</h3>
            <p className="text-gray-600">Giao hàng trong vòng 30 phút</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chất lượng đảm bảo</h3>
            <p className="text-gray-600">Nguyên liệu tươi mỗi ngày</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nhiều chi nhánh</h3>
            <p className="text-gray-600">Phục vụ toàn thành phố</p>
          </Card>
        </div>
      </section>

      {/* Category + Filtered list */}
      <section className="container mx-auto px-6">
        <h2 className="text-2xl font-bold mb-4">Danh mục món</h2>

        <div className="flex gap-3 overflow-x-auto pb-3">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl whitespace-nowrap font-medium cursor-pointer   ${
                selectedCategory === cat
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredDishes.map((dish) => (
            <div
              key={dish._id}
              className="bg-white shadow rounded-xl overflow-hidden"
            >
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}/images/menu/${
                  dish.image
                }`}
                alt={dish.name}
                className="w-full h-60 object-cover"
              />
              <div className="p-4">
                <h4 className="font-semibold">{dish.name}</h4>
                <p className="text-sm text-black/70 font-medium line-clamp-2 mt-2 mb-3">
                  {dish.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-red-500 font-bold">
                    {' '}
                    {dish.price.toLocaleString('vi-VN')}đ
                  </p>
                  <button
                    onClick={() => navigate('/pre-order')}
                    className="text-sm px-3 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 cursor-pointer"
                  >
                    Đi đặt món
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredDishes.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500">
              Không có món nào trong danh mục này.
            </div>
          )}
        </div>
      </section>

      {/* Quick Booking */}
      <section className="container mx-auto px-6 py-10 bg-gray-50 rounded-2xl mb-16">
        <h2 className="text-2xl font-bold mb-6">Đặt bàn nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left content */}
          <div className="text-gray-700 leading-relaxed">
            <h3 className="text-xl font-semibold mb-2">
              Đặt bàn ngay chỉ trong 1 phút
            </h3>
            <p>
              Hãy giữ chỗ trước để tránh hết bàn vào giờ cao điểm. Chúng tôi sẽ
              gọi xác nhận ngay khi nhận được yêu cầu.
            </p>
            <ul className="mt-4 list-disc pl-6 text-gray-600">
              <li>Không phải chờ đợi</li>
              <li>Ưu tiên phục vụ</li>
              <li>Nhận ưu đãi dành riêng</li>
            </ul>
          </div>

          {/* Right Form (demo, không gọi API) */}
          <BookingForm />
        </div>
      </section>
    </div>
  );
}
