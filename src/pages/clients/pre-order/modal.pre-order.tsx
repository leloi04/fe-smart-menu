import { useCart, type CartItem } from '@/components/context/cart.context';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';

interface IProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  dataItem: any;
  setDataItem: (v: any) => void;
}

interface Variant {
  _id: string;
  size: string;
  price: number;
}

interface Topping {
  _id: string;
  name: string;
  price: number;
}

export default function PreOderModal(props: IProps) {
  const { addItem } = useCart();
  const { open, dataItem, setDataItem, setOpen } = props;
  const [quantity, setQuantity] = useState(1);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<Variant | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  /* Khi mở modal hoặc đổi món ⇒ set giá base */
  useEffect(() => {
    if (!dataItem) return;

    // Nếu có size → lấy size đầu tiên làm base (nếu chưa chọn)
    if (dataItem.variants?.length > 0) {
      setSelectedSize(dataItem.variants[0]);
      setBasePrice(dataItem.variants[0].price);
    } else {
      setBasePrice(dataItem.price || 0);
      setSelectedSize(null);
    }

    // Reset toppings khi mở món mới
    setSelectedToppings([]);
    setQuantity(1);
  }, [dataItem]);

  /* Tính total price */
  useEffect(() => {
    if (!dataItem) return;

    const sizePrice = selectedSize ? selectedSize.price : basePrice;

    // Tính tổng tiền toppings đã chọn
    const toppingsPrice =
      dataItem.toppings
        ?.filter((t: Topping) => selectedToppings.includes(t._id))
        ?.reduce((sum: any, t: any) => sum + t.price, 0) || 0;

    setTotalPrice((sizePrice + toppingsPrice) * quantity);
  }, [quantity, selectedSize, selectedToppings, basePrice, dataItem]);

  /* Toggle topping */
  const toggleTopping = (id: string) => {
    setSelectedToppings((prev: string[]) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleConfirm = () => {
    if (!dataItem) return;

    const toppings = dataItem.toppings
      ?.filter((t: Topping) => selectedToppings.includes(t._id))
      .map((t: Topping) => ({
        name: t.name,
        price: t.price,
        _id: t._id,
      }));

    const data: CartItem = {
      menuItemId: dataItem._id,
      name: dataItem.name,
      quantity,
      variant: selectedSize,
      toppings,
      price: dataItem.price,
    };
    addItem(data);
    setDataItem(null);
    setOpen(false);
  };

  return (
    <Modal
      title={dataItem?.name}
      open={open}
      onCancel={() => {
        setOpen(false);
        setDataItem(null);
      }}
      footer={[
        <button
          key="cancel"
          onClick={() => {
            setOpen(false);
            setDataItem(null);
          }}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 mr-2 cursor-pointer"
        >
          Hủy
        </button>,

        <button
          key="add"
          onClick={() => handleConfirm()}
          className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white hover:opacity-90 cursor-pointer"
        >
          Thêm vào giỏ - {totalPrice.toLocaleString('vi-VN')}đ
        </button>,
      ]}
    >
      <div className="space-y-6">
        {/* Image */}
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}/images/menu/${
            dataItem?.image
          }`}
          alt={dataItem?.name}
          className="w-full h-64 object-cover rounded-lg"
        />

        {/* Description */}
        <p className="text-gray-600">{dataItem?.description}</p>

        {/* Price & Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[#FF6B35]">
            {(basePrice ?? 0).toLocaleString('vi-VN')}đ
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer"
            >
              -
            </button>

            <span className="text-lg font-medium w-8 text-center">
              {quantity}
            </span>

            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Size selection */}
        {dataItem?.variants?.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Chọn Size:</h3>
            <div className="flex gap-3">
              {dataItem.variants.map((s: Variant) => (
                <button
                  key={s._id}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 border rounded-lg cursor-pointer ${
                    selectedSize?._id === s._id
                      ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {s.size} • {s.price.toLocaleString('vi-VN')}đ
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toppings */}
        {dataItem?.toppings?.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Toppings:</h3>
            <div className="grid grid-cols-2 gap-3">
              {dataItem.toppings.map((t: Topping) => (
                <label
                  key={t._id}
                  className={`p-3 border rounded-lg flex items-center gap-3 cursor-pointer ${
                    selectedToppings.includes(t._id)
                      ? 'border-[#FF6B35] bg-orange-50'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedToppings.includes(t._id)}
                    onChange={() => toggleTopping(t._id)}
                  />
                  <div className="flex flex-col">
                    <span>{t.name}</span>
                    <span className="text-sm text-gray-500">
                      +{t.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
