import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRGenerator() {
  const url =
    'http://192.168.1.7:3000/tables/7?token=ea9cd634b3fba2a247b787768c81b9ff3505bb7f517e8bd0f5fbc72c3d726b52';

  let qrImage;

  QRCode.toDataURL(url)
    .then((img) => {
      qrImage = img;
    })
    .catch((err) => {
      console.error(err);
    });

  console.log('qrImage: ', qrImage);
  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <h2>QR Code</h2>
      {qrImage && <img src={qrImage} alt="QR Code" />}
    </div>
  );
}
