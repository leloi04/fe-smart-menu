import { useState, useEffect } from 'react';
import { Package, Trash2, Pencil } from 'lucide-react';
import { useCart } from '@/components/context/cart.context';
import { createPreOrderAPI, fetchMenuItemsAPI } from '@/services/api';
import { useCurrentApp } from '@/components/context/app.context';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { cart: dataCart, removeItem, updateItem, totalPrice } = useCart();
  const { user, infoWeb } = useCurrentApp();
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  // ===================== EDIT MODAL =====================
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editVariantId, setEditVariantId] = useState<string | null>(null);
  const [editToppingIds, setEditToppingIds] = useState<string[]>([]);
  const [editQty, setEditQty] = useState<number>(1);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Ship, payment
  const [method, setMethod] = useState<'pickup' | 'ship'>('pickup');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<'cod' | 'bank'>('cod');
  const FIXED_STORE_ADDRESS = infoWeb?.address || 'Học viện kỹ thuật mật mã';

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [shipFee, setShipFee] = useState<number>(0);
  const [isCalculatingShip, setIsCalculatingShip] = useState(false);

  const [note, setNote] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Calculate distance of Address
  const getCoordinates = async (address: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address,
    )}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.length) throw new Error('Không tìm thấy địa chỉ');

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  };

  const getDistanceByOSRM = async (
    a: { lat: number; lon: number },
    b: { lat: number; lon: number },
  ) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes?.length) throw new Error('Không tính được khoảng cách');

    return data.routes[0].distance / 1000; // km
  };

  const calculateShippingFee = async (deliveryAddress: string) => {
    try {
      setIsCalculatingShip(true);

      // 1️⃣ Toạ độ quán (fix cứng)
      const storeCoords = await getCoordinates(FIXED_STORE_ADDRESS!);

      // 2️⃣ Toạ độ khách
      const customerCoords = await getCoordinates(deliveryAddress);

      // 3️⃣ Khoảng cách
      const km = await getDistanceByOSRM(storeCoords, customerCoords);
      setDistanceKm(km);

      // 4️⃣ Công thức tính ship
      const BASE_FEE = 15000; // phí mở đơn
      const PRICE_PER_KM = 1000; // 1k / km

      const fee = Math.round(BASE_FEE + km * PRICE_PER_KM);
      setShipFee(fee);
    } catch (err) {
      message.error('Không thể tính phí ship');
      setShipFee(0);
      setDistanceKm(null);
    } finally {
      setIsCalculatingShip(false);
    }
  };

  useEffect(() => {
    if (method === 'ship' && address.trim().length > 5) {
      const delay = setTimeout(() => {
        calculateShippingFee(address);
      }, 800); // debounce tránh spam API

      return () => clearTimeout(delay);
    } else {
      setShipFee(0);
      setDistanceKm(null);
    }
  }, [address, method]);

  //   Fetch data menuItem and fill data cart
  useEffect(() => {
    const fetchMenuItems = async () => {
      const res = await fetchMenuItemsAPI();
      if (res.data) {
        setMenuItems(res.data as any);
      }
    };

    fetchMenuItems();
  }, []);

  // Build cart for UI from dataCart + menuItems
  useEffect(() => {
    if (!dataCart || !menuItems) return;

    const items = dataCart
      .map((item) => {
        const menu = menuItems.find((m) => m._id === item.menuItemId);
        if (!menu) return null;

        // Resolve variant: prefer variant price from item.variant if exists; fallback to menu variant price
        const mappedVariant = item.variant
          ? {
              id: item.variant._id,
              label: item.variant.size,
              price: item.variant.price ?? item.price ?? menu.price,
            }
          : null;

        return {
          kitchenArea: menu.kitchenArea,
          id: item.menuItemId,
          name: menu.name,
          image: `${import.meta.env.VITE_BACKEND_URL}/images/menu/${
            menu.image
          }`,

          variant: mappedVariant,

          toppings:
            item.toppings?.map((t: any) => ({
              id: t._id,
              name: t.name,
              price: t.price,
            })) || [],

          quantity: item.quantity,
          price: menu.price,

          variantsAvailable:
            menu.variants?.map((v: any) => ({
              id: v._id,
              label: v.size,
              price: v.price,
            })) || [],
          toppingsAvailable:
            menu.toppings?.map((t: any) => ({
              id: t._id,
              name: t.name,
              price: t.price,
            })) || [],
        };
      })
      .filter(Boolean);

    setCart(items);
  }, [dataCart, menuItems]);

  // ===================== DELETE =====================
  const deleteItem = (id: string) => {
    removeItem(id);
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // ===================== QUICK QTY EDIT =====================
  const editQuantity = (id: string, qty: number) => {
    // updateItem expects an object shaped like your back-end model; here we only change quantity
    updateItem(id, { quantity: qty });
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  };

  // ===================== OPEN EDIT MODAL =====================
  const openEdit = (item: any) => {
    setEditingItem(item);
    setEditVariantId(item.variant?.id ?? null);
    setEditToppingIds(item.toppings?.map((t: any) => t.id) ?? []);
    setEditQty(item.quantity ?? 1);
    setIsEditOpen(true);
  };

  const toggleEditTopping = (tId: string) => {
    setEditToppingIds((prev) =>
      prev.includes(tId) ? prev.filter((x) => x !== tId) : [...prev, tId],
    );
  };

  // ===================== SAVE EDIT =====================
  const saveEdit = () => {
    if (!editingItem) return;

    // build final data here
    const i = editingItem;

    const foundVariant = i.variantsAvailable.find(
      (v: any) => v.id === editVariantId,
    );

    const newVariantForUI = foundVariant
      ? {
          id: foundVariant.id,
          label: foundVariant.label,
          price: foundVariant.price,
        }
      : null;

    const newToppingsForUI = i.toppingsAvailable
      .filter((t: any) => editToppingIds.includes(t.id))
      .map((t: any) => ({ id: t.id, name: t.name, price: t.price }));

    const updatedVariantForBackend = foundVariant
      ? {
          _id: foundVariant.id,
          size: foundVariant.label,
          price: foundVariant.price,
        }
      : null;

    const updatedToppingsForBackend = i.toppingsAvailable
      .filter((t: any) => editToppingIds.includes(t.id))
      .map((t: any) => ({ _id: t.id, name: t.name, price: t.price }));

    // ❗ 1. Update UI cart state (local UI only)
    setCart((prev) =>
      prev.map((item) =>
        item.id !== i.id
          ? item
          : {
              ...item,
              variant: newVariantForUI,
              toppings: newToppingsForUI,
              quantity: editQty,
            },
      ),
    );

    // ❗ 2. Update global cart provider (after the render cycle)
    setTimeout(() => {
      updateItem(i.id, {
        quantity: editQty,
        variant: updatedVariantForBackend,
        toppings: updatedToppingsForBackend,
      });
    }, 0);

    setIsEditOpen(false);
    setEditingItem(null);
  };

  // ===================== CONFIRM CHECKOUT =====================
  const confirmCheckout = async () => {
    if (method === 'pickup') {
      if (!pickupTime) {
        message.warning('Thiếu thông tin về thời gian nhận hàng!');
        return;
      }
    }

    if (method === 'ship') {
      if (!address) {
        message.warning('Thiếu thông tin về địa điểm nhận hàng!');
        return;
      }
      if (distanceKm === null) {
        message.warning(
          'Địa chỉ của bạn nhập vào không hợp lệ vui lòng nhập địa chỉ khác!',
        );
        return;
      }
    }

    if (isCalculatingShip) {
      message.warning('Chưa tính xong phí vận chuyển xin chờ đôi lát!');
      return;
    }

    const payload = {
      paymentStatus: 'unpaid',
      customerId: user?._id,
      method,
      payment,
      deliveryAddress: method === 'ship' ? address : null,
      pickupTime: method === 'pickup' ? pickupTime : null,
      note: note || null,
      totalItemPrice: totalPrice,
      totalPayment: totalPrice + shipFee,
      orderItems: cart.map((it) => {
        const variantObj = it.variant
          ? {
              _id: it.variant.id,
              size: it.variant.label,
              price: it.variant.price,
            }
          : null;
        return {
          kitchenArea: it.kitchenArea,
          menuItemId: it.id,
          name: it.name,
          quantity: it.quantity,
          price: it.variant?.price ?? it.price,
          variant: variantObj,
          toppings:
            it.toppings?.map((t: any) => ({
              _id: t.id,
              name: t.name,
              price: t.price,
            })) || [],
        };
      }),
    };

    setIsSubmit(true);
    const result = await createPreOrderAPI(payload);
    if (result?.data) {
      setTimeout(() => {
        message.success('Đặt hàng thành công!');
        localStorage.removeItem('cart');
        setCart([]);
        setIsSubmit(false);
        setNote('');
        setAddress('');
        setPickupTime('');
      }, 3000);
    } else {
      setTimeout(() => {
        message.error('Đặt hàng thất bại!');
        setIsSubmit(false);
        setNote('');
        setAddress('');
        setPickupTime('');
      }, 3000);
    }
  };

  // ===================== UI RENDER =====================
  return (
    <div>
      {cart.length > 0 ? (
        <div className="w-full min-h-screen bg-gray-50 py-10 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* ========= CART ========= */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-bold mb-4">Giỏ hàng</h2>

                {cart.length === 0 ? (
                  <p className="text-gray-500">Giỏ hàng trống.</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b py-4 items-start"
                    >
                      <img
                        src={item.image}
                        className="w-20 h-20 rounded-xl object-cover"
                        alt={item.name}
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {item.name}
                            </h3>
                            {item?.variant?.label && (
                              <p className="text-sm text-gray-600">
                                Size: {item.variant.label}
                              </p>
                            )}

                            {item?.toppings.length > 0 && (
                              <p className="text-sm text-gray-600">
                                Toppings:{' '}
                                {item.toppings
                                  .map((t: any) => t.name)
                                  .join(', ')}
                              </p>
                            )}

                            <p className="text-[#FF6B35] font-bold mt-1">
                              {(
                                ((item.variant?.price ?? item.price) +
                                  (item.toppings.reduce(
                                    (acc: any, cur: any) => {
                                      return acc + cur.price;
                                    },
                                    0,
                                  ) || 0)) *
                                item.quantity
                              ).toLocaleString('vi-VN')}
                              đ
                            </p>
                          </div>

                          <div className="text-right">
                            {/* QTY */}
                            <div className="flex items-center justify-end gap-2 mb-3">
                              <button
                                onClick={() =>
                                  editQuantity(
                                    item.id,
                                    Math.max(1, item.quantity - 1),
                                  )
                                }
                                className="px-2 py-1 bg-gray-100 rounded"
                              >
                                -
                              </button>

                              <span className="px-3">{item.quantity}</span>

                              <button
                                onClick={() =>
                                  editQuantity(item.id, item.quantity + 1)
                                }
                                className="px-2 py-1 bg-gray-100 rounded"
                              >
                                +
                              </button>
                            </div>

                            {/* EDIT + DELETE */}
                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => openEdit(item)}
                                className="px-3 py-1 rounded-md bg-white border text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Pencil size={16} /> Sửa
                              </button>

                              <button
                                onClick={() => deleteItem(item.id)}
                                className="px-3 py-1 rounded-md bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 size={16} /> Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ========= CHECKOUT BOX ========= */}
              <div className="bg-white p-6 rounded-2xl shadow-md h-fit">
                <h2 className="text-xl font-bold mb-4">Thanh toán</h2>

                {/* METHOD */}
                <div className="mb-5">
                  <label className="font-medium">Phương thức nhận</label>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => setMethod('pickup')}
                      className={`px-4 py-2 border rounded-lg ${
                        method === 'pickup'
                          ? 'bg-[#FF6B35] text-white'
                          : 'bg-gray-50'
                      }`}
                    >
                      Đến lấy
                    </button>

                    <button
                      onClick={() => setMethod('ship')}
                      className={`px-4 py-2 border rounded-lg ${
                        method === 'ship'
                          ? 'bg-[#FF6B35] text-white'
                          : 'bg-gray-50'
                      }`}
                    >
                      Giao hàng
                    </button>
                  </div>
                </div>

                {/* ADDRESS */}
                {method === 'ship' && (
                  <div className="mb-5">
                    <label className="font-medium">Địa chỉ giao hàng</label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full mt-2 border px-4 py-2 rounded-lg relative"
                      placeholder="Nhập địa chỉ..."
                    />
                  </div>
                )}

                {/* PICKUP TIME */}
                {method === 'pickup' && (
                  <div className="mb-5">
                    <label className="font-medium">Thời gian đến lấy</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full mt-2 border px-4 py-2 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Chọn giờ bạn dự định đến nhận món (HH:MM)
                    </p>
                  </div>
                )}

                {/* NOTE */}
                <div className="mb-5">
                  <label className="font-medium">Ghi chú</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full mt-2 border px-4 py-2 rounded-lg"
                    rows={3}
                    placeholder="Ví dụ: Ít đá, thêm phô mai..."
                  />
                </div>

                {/* PAYMENT */}
                <div className="mb-5">
                  <label className="font-medium">Thanh toán</label>
                  <div className="mt-3 space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={payment === 'cod'}
                        onChange={() => setPayment('cod')}
                      />
                      COD khi nhận hàng
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={payment === 'bank'}
                        onChange={() => setPayment('bank')}
                      />
                      Chuyển khoản ngân hàng
                    </label>
                  </div>
                </div>

                {/* SUMMARY */}
                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    Tổng món: {totalPrice.toLocaleString('vi-VN')}đ
                  </p>
                  {method == 'ship' && (
                    <p className="text-sm text-gray-600">
                      Phí ship:{' '}
                      {isCalculatingShip
                        ? 'Đang tính...'
                        : shipFee.toLocaleString('vi-VN') + 'đ'}
                    </p>
                  )}

                  {distanceKm !== null && (
                    <p className="text-xs text-gray-500">
                      Khoảng cách: {distanceKm.toFixed(2)} km
                    </p>
                  )}

                  <p className="font-bold text-lg">
                    Tổng thanh toán:{' '}
                    <span className="text-[#FF6B35]">
                      {(totalPrice + shipFee).toLocaleString('vi-VN')}đ
                    </span>
                  </p>
                </div>

                <button
                  onClick={confirmCheckout}
                  disabled={isSubmit}
                  className={`
                    w-full mt-5 py-2 rounded-lg font-semibold text-white
                    bg-[#FF6B35] relative overflow-hidden
                    transition-all duration-200 select-none
                    ${
                      isSubmit
                        ? 'opacity-80 cursor-not-allowed'
                        : 'hover:opacity-90'
                    }
                  `}
                >
                  {isSubmit ? (
                    <div>
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {/* {'Xác nhận đặt món'} */}
                    </div>
                  ) : (
                    'Xác nhận đặt món'
                  )}
                </button>
              </div>
            </div>
            {/* EDIT MODAL */}
            {isEditOpen && editingItem && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-white w-full max-w-lg rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4">
                    Sửa: {editingItem.name}
                  </h2>

                  {/* VARIANT */}
                  {editingItem.variantsAvailable.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium mb-1">Size</p>
                      <div className="flex gap-3 flex-wrap">
                        {editingItem.variantsAvailable.map((v: any) => (
                          <button
                            key={v.id}
                            onClick={() => setEditVariantId(v.id)}
                            className={`px-3 py-1 border rounded-lg ${
                              editVariantId === v.id
                                ? 'bg-[#FF6B35] text-white'
                                : 'bg-gray-50'
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TOPPINGS */}
                  {editingItem.toppingsAvailable.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium mb-1">Toppings</p>
                      <div className="flex gap-3 flex-wrap">
                        {editingItem.toppingsAvailable.map((t: any) => (
                          <button
                            key={t.id}
                            onClick={() => toggleEditTopping(t.id)}
                            className={`px-3 py-1 border rounded-lg ${
                              editToppingIds.includes(t.id)
                                ? 'bg-[#FF6B35] text-white'
                                : 'bg-gray-50'
                            }`}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* QTY */}
                  <div className="mb-4">
                    <p className="font-medium mb-1">Số lượng</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditQty(Math.max(1, editQty - 1))}
                        className="px-3 py-1 bg-gray-100 rounded"
                      >
                        -
                      </button>
                      <span className="px-3">{editQty}</span>
                      <button
                        onClick={() => setEditQty(editQty + 1)}
                        className="px-3 py-1 bg-gray-100 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setIsEditOpen(false)}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                <Package size={32} className="text-[#FF6B35]" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>

            <p className="text-gray-500 mb-6">
              Bạn chưa thêm món nào vào giỏ hàng.
              <br />
              Hãy chọn món ngon nhé 🍔🥤
            </p>

            <button
              onClick={() => navigate('/pre-order')}
              className="
            w-full py-3 rounded-xl font-semibold text-white
            bg-[#FF6B35]
            hover:opacity-90 transition
          "
            >
              Đi đặt món
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
