import { useEffect, useState } from 'react';
import { Calendar, Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { getAllTableAPI } from '@/services/api';
import { useCurrentApp } from '@/components/context/app.context';
import { socket } from '@/services/socket';
import { message } from 'antd';

export interface RestaurantTable {
  id: string;
  tableNumber: number;
  capacity: number;
  status: 'available' | 'booked';
}

export default function BookingPage() {
  const { user } = useCurrentApp();
  const [tables, setTables] = useState<ITableModal[]>([]);
  const [tablesFilter, setTablesFilter] = useState<RestaurantTable[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const customerName = user?.name || '';
  const customerPhone = user?.phone || '';
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Socket realtime
  useEffect(() => {
    if (!tables || tables.length === 0) return;

    //  Bỏ select bàn hiên tại
    setSelectedTableId(null);

    // Khách join vào phòng
    socket.emit('joinBookingRoom', {
      date: selectedDate,
      timeSlot: selectedTime,
    });

    socket.on('bookingCurrentState', (data) => {
      setLoading(true);

      // Lấy danh sách tableId đã được đặt
      const bookedTableIds: any[] = data.map((item: any) => item.tableId);

      // Update tables theo trạng thái booking
      const updatedTables: RestaurantTable[] = tables.map((table) => ({
        id: table._id,
        tableNumber: Number(table.tableNumber),
        capacity: table.seats,
        status: bookedTableIds.includes(table._id) ? 'booked' : 'available',
      }));

      setTablesFilter(updatedTables);
      setLoading(false);
    });

    socket.on('reservationSuccess', (data) => {
      setLoading(true);

      setTablesFilter((prev) =>
        prev.map((t) =>
          t.id === data.tableId ? { ...t, status: 'booked' } : t,
        ),
      );

      setLoading(false);
    });

    socket.on('reservationFailed', (data) => {
      message.error(data.message);
    });

    return () => {
      socket.emit('leaveBookingRoom', {
        date: selectedDate,
        timeSlot: selectedTime,
      });
      socket.off('reservationSuccess');
      socket.off('reservationFailed');
      socket.off('bookingCurrentState');
    };
  }, [selectedDate, selectedTime, tables]);

  // ===================================
  // 🔥 Fetch Table List
  // ===================================
  useEffect(() => {
    const fetchTable = async () => {
      const res = await getAllTableAPI();

      if (res.data && Array.isArray(res.data)) {
        setTables(res.data);
      }
    };

    fetchTable();
  }, []);

  // ===================================
  // 🔥 Fake Booking
  // ===================================
  function handleBooking() {
    if (!selectedTableId || !customerName || !customerPhone) {
      alert('Vui lòng điền đầy đủ thông tin và chọn bàn.');
      return;
    }

    const data = {
      customerName,
      customerPhone,
      notes,
      date: selectedDate,
      timeSlot: selectedTime,
      capacity: numberOfGuests,
      tableId: selectedTableId,
    };

    setSelectedTableId(null);
    setNotes('');

    socket.emit('createReservation', data);
  }

  // =======================
  // UI Helpers
  // =======================
  const timeSlots = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

  function getTableStatusColor(status: string) {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 hover:bg-green-200 cursor-pointer';
      case 'booked':
        return 'bg-red-100 border-red-300 cursor-not-allowed';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  }

  function getTableStatusText(status: string) {
    return status === 'available' ? 'Trống' : 'Đã có khách đặt';
  }

  function getTableStatusIcon(status: string) {
    return status === 'available' ? (
      <CheckCircle2 className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  }

  // ===================================
  // 🔥 RETURN UI
  // ===================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-[#FF6B35] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Đặt bàn</h1>
          <p className="text-orange-100">Chọn thời gian và bàn phù hợp</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* TIME PICKER */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Chọn thời gian</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" /> Ngày
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-lg border"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Clock className="inline w-4 h-4 mr-1" /> Giờ
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                >
                  {timeSlots.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Users className="inline w-4 h-4 mr-1" /> Số người
                </label>
                <select
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                  className="w-full px-4 py-3 border rounded-lg"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} người
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* TABLE SELECT */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Chọn bàn</h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 rounded-xl animate-pulse"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tablesFilter.map((table) => (
                  <button
                    key={table.id}
                    onClick={() =>
                      table.status === 'available' &&
                      setSelectedTableId(table.id)
                    }
                    disabled={table.status !== 'available'}
                    className={`aspect-square border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition 
                      ${getTableStatusColor(table.status)}
                      ${
                        selectedTableId === table.id
                          ? 'ring-4 ring-[#FF6B35] border-[#FF6B35]'
                          : ''
                      }`}
                  >
                    {getTableStatusIcon(table.status)}
                    <div className="text-center">
                      <p className="font-bold text-lg">
                        Bàn {table.tableNumber}
                      </p>
                      <p className="text-xs mt-1">
                        {getTableStatusText(table.status)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Thông tin đặt bàn</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Họ tên
                </label>
                <input
                  type="text"
                  value={user?.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed pointer-events-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={user?.phone}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed pointer-events-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg"
                ></textarea>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-orange-50 rounded-xl p-4 mb-6 space-y-2">
              <SummaryRow label="Ngày" value={selectedDate} />
              <SummaryRow label="Giờ" value={selectedTime} />
              <SummaryRow label="Số khách" value={`${numberOfGuests} người`} />
              <SummaryRow
                label="Bàn"
                value={
                  selectedTableId
                    ? 'Bàn ' +
                      tablesFilter.find((t) => t.id === selectedTableId)
                        ?.tableNumber
                    : 'Chưa chọn'
                }
              />
            </div>

            <button
              onClick={handleBooking}
              disabled={!selectedTableId || !customerName || !customerPhone}
              className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:bg-gray-300"
            >
              Xác nhận đặt bàn
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Đặt bàn thành công!</h3>
            <p className="text-gray-600">Chúng tôi đã nhận yêu cầu đặt bàn.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Component nhỏ giúp hiển thị summary
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
