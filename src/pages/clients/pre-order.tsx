import { fetchMenuItemsAPI, getCategoryAPI } from '@/services/api';
import { useEffect, useState } from 'react';
import PreOderModal from './pre-order/modal.pre-order';
import { useCart } from '@/components/context/cart.context';
import { useNavigate } from 'react-router-dom';

function PreOrderPage() {
  const { cartCount, totalPrice, cart } = useCart();
  const [open, setOpen] = useState<boolean>(false);
  const [dataItem, setDataItem] = useState<IMenuModal | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // search theo tên
  const [categories, setCategories] = useState<any[]>([]);
  const defaultSelectedCategory = 'Tất cả';
  const [selectedCategory, setSelectedCategory] = useState<string>(
    defaultSelectedCategory,
  );
  const [menuItems, setMenuItems] = useState<IMenuModal[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<IMenuModal[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.ceil(filteredDishes.length / pageSize);

  const navigator = useNavigate();

  // Lấy dữ liệu theo trang
  const paginatedDishes = filteredDishes.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

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

    const searchText = searchQuery.toLowerCase();

    const filtered = menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'Tất cả' || item.category === selectedCategory;

      const matchesSearch =
        item.name.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });

    setFilteredDishes(filtered);
  }, [selectedCategory, searchQuery]);

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

  return (
    <div className="container mt-8 mb-16 mx-auto px-6">
      <h2 className="text-2xl font-bold mb-8">Đặt món</h2>

      {/* Search món theo tên và mô tả */}
      <input
        type="text"
        placeholder="Tìm kiếm món ăn (theo tên hoặc mô tả)..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg mb-8"
      />

      {/* CATEGORY FILTER */}
      <div className="flex gap-3 overflow-x-auto pb-3">
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-2xl whitespace-nowrap font-medium cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#FF6B35] text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID ITEMS */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {paginatedDishes.map((dish) => (
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
              <h4 className="font-semibold line-clamp-1">{dish.name}</h4>

              <p className="text-sm text-black/70 font-medium line-clamp-2 mt-2 mb-3">
                {dish.description}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-red-500 font-bold">
                  {dish.price.toLocaleString('vi-VN')}đ
                </p>

                <button
                  onClick={() => {
                    setOpen(true), setDataItem(dish);
                  }}
                  className="text-sm px-3 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 cursor-pointer"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        ))}

        {paginatedDishes.length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-500">
            Không có món nào trong danh mục này.
          </div>
        )}
      </div>

      {/* PAGINATION - GIỐNG ANTD */}
      <div className="flex justify-center items-center gap-2 mt-10 select-none">
        {/* Previous button */}
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-3 py-1 border rounded-md text-sm ${
            page === 1
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-gray-100 cursor-pointer'
          }`}
        >
          Previous
        </button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`w-9 h-9 flex items-center justify-center rounded-md border text-sm ${
              page === i + 1
                ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                : 'hover:bg-gray-100'
            }`}
          >
            {i + 1}
          </button>
        ))}

        {/* Next button */}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className={`px-3 py-1 border rounded-md text-sm ${
            page === totalPages
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-gray-100 cursor-pointer'
          }`}
        >
          Next
        </button>
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => navigator('/cart')}
            className="cursor-pointer bg-[#FF6B35] text-white px-6 py-4 rounded-full shadow-2xl hover:bg-orange-600 transition-all flex items-center gap-3"
          >
            <span className="font-bold">Giỏ hàng ({cartCount})</span>
            <span className="bg-white text-orange-600 px-3 py-1 rounded-full font-bold">
              {totalPrice.toLocaleString('vi-VN')}₫
            </span>
          </button>
        </div>
      )}

      <PreOderModal
        open={open}
        setOpen={setOpen}
        dataItem={dataItem}
        setDataItem={setDataItem}
      />
    </div>
  );
}

export default PreOrderPage;
