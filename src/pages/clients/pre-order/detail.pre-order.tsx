import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  createCommentAPI,
  deleteCommentAPI,
  fetchListCommentAPI,
  fetchMenuItemsAPI,
  updateCommentAPI,
} from '@/services/api';
import { useCart, type CartItem } from '@/components/context/cart.context';
import { message } from 'antd';
import { useCurrentApp } from '@/components/context/app.context';
import { formatTime } from '@/utils/helpers';

const COMMENTS_PER_PAGE = 5;

const EDIT_TIME_LIMIT = 5 * 60 * 1000;

function MenuDetailPage() {
  const { user } = useCurrentApp();
  const { id } = useParams();
  const { addItem } = useCart();
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PER_PAGE);
  const [item, setItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedToppings, setSelectedToppings] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [reviews, setReviews] = useState<IReview[]>([]);

  useEffect(() => {
    const fetchItem = async () => {
      const res = await fetchMenuItemsAPI();
      if (res.data) {
        const data = res.data as any;
        const found = data.find((i: any) => i._id === id);
        setItem(found);
        setSelectedVariant(found?.variants?.[0] || null);
      }
    };
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchComment = async () => {
      const res = await fetchListCommentAPI(id);
      if (res.data) {
        const data = res.data;
        setReviews(data);
      }
    };
    fetchComment();
  }, [id]);

  const totalPrice = useMemo(() => {
    if (!item) return 0;

    const base = selectedVariant?.price ?? item?.price ?? 0;

    const toppingsPrice = selectedToppings.reduce(
      (sum, t) => sum + (t?.price ?? 0),
      0,
    );

    return (base + toppingsPrice) * quantity;
  }, [item, selectedVariant, selectedToppings, quantity]);

  const toggleTopping = (topping: any) => {
    setSelectedToppings((prev) =>
      prev.find((t) => t._id === topping._id)
        ? prev.filter((t) => t._id !== topping._id)
        : [...prev, topping],
    );
  };

  if (!item) return null;

  const handleAddToCart = () => {
    if (!item) return;

    const cartItem: CartItem = {
      menuItemId: item._id,
      name: item.name,
      quantity,
      variant: selectedVariant,
      toppings: selectedToppings.map((t) => ({
        _id: t._id,
        name: t.name,
        price: t.price,
      })),
      price: item.price, // giá gốc (để BE xử lý nếu cần)
    };

    addItem(cartItem);

    message.success(`Thêm thành công ${item.name} vào giỏ hàng`);
    message.info(`Vui lòng đến giỏ hàng để đặt món!`);
  };

  const isOwner = (review: IReview) => review.createdBy._id === user?._id;

  const canEdit = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    return Date.now() - createdTime <= EDIT_TIME_LIMIT;
  };

  const startEdit = (r: IReview) => {
    setEditingId(r.id);
    setEditRating(r.rating);
    setEditComment(r.comment);
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const payload = {
      rating: editRating,
      comment: editComment,
    };
    try {
      await updateCommentAPI(editingId, payload);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, rating: editRating, comment: editComment }
            : r,
        ),
      );

      setEditingId(null);
    } catch (error) {
      message.error('Lỗi cập nhật bình luận!');
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await deleteCommentAPI(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      message.error('Lỗi xóa bỏ bình luận!');
    }
  };

  const submitReview = async () => {
    if (!rating || !comment.trim() || !user) return;

    const payload = {
      type: 'item',
      user: user?.name,
      menuItemId: id,
      rating,
      comment,
    };

    try {
      const res = await createCommentAPI(payload);
      setReviews([
        {
          id: res.data._id,
          user: user?.name,
          rating,
          comment,
          createdAt: res.data.createdAt,
          createdBy: {
            _id: user?._id || '',
            email: user?.email || '',
          },
        },
        ...reviews,
      ]);

      setRating(0);
      setComment('');
    } catch (error) {
      message.error('Lỗi khi tạo bình luận!');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* GRID MAIN */}
      <div
        className="
        grid gap-8
        grid-cols-1
        [grid-template-areas:'image''order''reviews']
        lg:grid-cols-5
        lg:[grid-template-areas:'image_image_image_order_order''reviews_reviews_reviews_order_order']
      "
      >
        {/* IMAGE */}
        <div className="[grid-area:image]">
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/images/menu/${
              item.image
            }`}
            className="w-full h-[420px] object-cover rounded-2xl shadow"
          />
        </div>

        {/* ORDER INFO */}
        <div className="[grid-area:order]">
          <div className="lg:sticky lg:top-24 bg-white rounded-2xl shadow p-6">
            <h1 className="text-2xl font-bold">{item.name}</h1>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-yellow-500">★★★★★</span>
              <span className="text-gray-500 text-sm">
                {reviews.length} đánh giá
              </span>
            </div>

            <p className="text-[#FF6B35] text-3xl font-bold mt-4">
              {totalPrice.toLocaleString('vi-VN')}đ
            </p>

            <p className="mt-4 text-gray-700">{item.description}</p>

            {/* INGREDIENTS */}
            <div className="mt-4 flex flex-wrap gap-2">
              {item.ingredients.map((i: string) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                >
                  {i}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-medium text-gray-700">Số lượng</span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-lg hover:bg-gray-100"
                >
                  −
                </button>

                <span className="w-8 text-center font-semibold">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-lg hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* VARIANTS */}
            {item.variants.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Chọn size</h3>
                <div className="flex flex-wrap gap-3">
                  {item.variants.map((v: any) => (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl border ${
                        selectedVariant?._id === v._id
                          ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                          : 'hover:border-orange-400'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TOPPINGS */}
            {item.toppings.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Topping thêm</h3>
                <div className="space-y-2">
                  {item.toppings.map((t: any) => (
                    <label
                      key={t._id}
                      className="flex items-center justify-between border rounded-xl px-3 py-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            !!selectedToppings.find((x) => x._id === t._id)
                          }
                          onChange={() => toggleTopping(t)}
                        />
                        <span>{t.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        +{t.price.toLocaleString('vi-VN')}đ
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ADD CART */}
            <button
              onClick={handleAddToCart}
              className="mt-8 w-full bg-[#FF6B35] text-white py-4 rounded-2xl font-bold hover:bg-orange-600"
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="[grid-area:reviews]">
          <h2 className="text-2xl font-bold mb-4">Đánh giá món</h2>

          {/* WRITE REVIEW */}
          <div className="bg-orange-50 p-4 rounded-xl mb-6">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  onClick={() => setRating(i)}
                  className={`cursor-pointer text-2xl ${
                    i <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn..."
              className="w-full border rounded-lg p-3 mb-3"
            />

            <button
              onClick={submitReview}
              className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-orange-600"
            >
              Gửi đánh giá
            </button>
          </div>

          {/* LIST REVIEWS */}
          <div className="space-y-4">
            {reviews.slice(0, visibleCount).map((r) => {
              const owner = isOwner(r);
              const allowEdit = owner && canEdit(r.createdAt);
              const editing = editingId === r.id;

              return (
                <div key={r.id} className="border rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{r.user}</strong>
                      <div className="flex gap-0.5 text-sm">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={
                              i <= r.rating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {owner && (
                      <div className="flex gap-3 text-sm">
                        {allowEdit && (
                          <button
                            onClick={() => startEdit(r)}
                            className="text-blue-600 hover:underline"
                          >
                            Sửa
                          </button>
                        )}
                        <button
                          onClick={() => deleteReview(r.id)}
                          className="text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>

                  {editing ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            onClick={() => setEditRating(i)}
                            className={`cursor-pointer text-2xl ${
                              i <= editRating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full border rounded-lg p-2"
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={saveEdit}
                          className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 border rounded-lg"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 text-gray-700">{r.comment}</p>
                      <span className="text-xs text-gray-400">
                        {formatTime(new Date(r.createdAt))}
                      </span>
                    </>
                  )}
                </div>
              );
            })}

            {visibleCount < reviews.length && (
              <div className="text-center mt-4">
                <button
                  onClick={() =>
                    setVisibleCount((prev) => prev + COMMENTS_PER_PAGE)
                  }
                  className="px-6 py-2 rounded-xl border text-[#FF6B35] border-[#FF6B35] hover:bg-orange-50"
                >
                  Xem thêm đánh giá
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuDetailPage;
