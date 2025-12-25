import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Image } from 'antd';

interface QRCellProps {
  tableNumber: string | number;
  token: string;
}

const QRCell = ({ tableNumber, token }: QRCellProps) => {
  const [qr, setQr] = useState('');

  useEffect(() => {
    const url = `${
      import.meta.env.VITE_FRONTEND_URL
    }/tables/${tableNumber}?token=${token}`;

    QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
    }).then(setQr);
  }, [tableNumber, token]);

  return (
    <div className="flex flex-col items-center space-y-2">
      {qr ? (
        <>
          {/* QR image */}
          <div className="border border-gray-200 rounded-lg p-2 bg-white">
            <Image
              src={qr}
              width={100}
              height={100}
              preview={false}
              style={{
                borderRadius: 4,
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Table label */}
          <div className="text-sm font-semibold text-gray-800">
            Bàn {tableNumber}
          </div>
        </>
      ) : (
        <span className="text-xs text-gray-500">Đang tạo QR...</span>
      )}
    </div>
  );
};

export default QRCell;
