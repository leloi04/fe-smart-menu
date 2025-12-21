import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Image } from 'antd';

const QRCell = ({ tableNumber, token }: any) => {
  const [qr, setQr] = useState('');

  useEffect(() => {
    const ip = '192.168.1.2:3000';
    const url = `http://${ip}/tables/${tableNumber}?token=${token}`;

    QRCode.toDataURL(url).then(setQr);
  }, [tableNumber, token]);

  return (
    <div>
      {qr ? (
        <Image
          src={qr}
          width={100}
          height={100}
          style={{ borderRadius: 6, objectFit: 'cover' }}
        />
      ) : (
        'Đang tạo...'
      )}
    </div>
  );
};

export default QRCell;
