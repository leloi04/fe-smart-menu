import { useRef, useEffect, useState } from 'react';
import * as htmlToImage from 'html-to-image';

export default function BillPreview({ bill }: any) {
  const billRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (billRef.current) {
      htmlToImage.toPng(billRef.current).then((img) => setImage(img));
    }
  }, [bill]);

  return (
    <div className="w-full">
      {/* HIỂN THỊ CHO NGƯỜI DÙNG (ẢNH ĐƯỢC TẠO TỰ ĐỘNG) */}
      {image && (
        <img src={image} alt="bill" className="rounded-lg w-full mb-4 shadow" />
      )}

      {/* BILL JSX – KHÔNG HIỆN RA, CHỈ DÙNG ĐỂ CHỤP ẢNH */}
      <div
        ref={billRef}
        className="p-5 w-[300px] mx-auto text-black bg-white"
        style={{ fontFamily: 'monospace', fontSize: 14 }}
      >
        <h2 className="text-center font-bold text-lg mb-2">
          NHÀ HÀNG HƯƠNG VỊ VIỆT
        </h2>
        <p className="text-center text-xs mb-3">
          123 Đường ABC, TP.HCM – 0909 999 999
        </p>

        <hr className="my-2" />

        <p>
          Mã hóa đơn: <b>{bill.id}</b>
        </p>
        <p>
          Bàn: <b>{bill.tableNumber}</b>
        </p>
        <p>Ngày: {bill.createdAt}</p>

        <hr className="my-3" />

        {/* Danh sách món */}
        {bill.items.map((item: any, i: number) => (
          <div key={i} className="flex justify-between">
            <span>
              {item.name} x{item.qty}
            </span>
            <span>{(item.qty * item.price).toLocaleString()}₫</span>
          </div>
        ))}

        <hr className="my-3" />

        <h3 className="text-right font-bold text-lg">
          Tổng: {bill.total.toLocaleString()}₫
        </h3>

        <p className="text-center text-xs mt-4">Cảm ơn quý khách!</p>
      </div>
    </div>
  );
}
