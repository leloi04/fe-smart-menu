import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle } from "lucide-react";

/* =======================
   TYPE DEFINITIONS
======================= */

type Table = {
  id: number;
  name: string;
  isBooked: boolean;
};

type ReservationInfo = {
  name: string;
  partySize: number;
  date: string;
  time: string;
  tableId: number;
  tableName: string;
  status: "confirmed" | "checkedIn" | "cancelled";
};

/* =======================
   FAKE DATA & HELPERS
======================= */

const initialFakeTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Bàn ${i + 1}`,
  isBooked: Math.random() < 0.25,
}));

const fetchTables = (date: string, time: string): Table[] => {
  if (!date || !time) return initialFakeTables;
  const seed = date.split("-").join("").length + time.length;
  return initialFakeTables.map((t) => ({
    ...t,
    isBooked: (t.id + seed) % 4 === 0,
  }));
};

/* =======================
   RESERVATION MODAL
======================= */

const ReservationModal = ({
  table,
  isOpen,
  onClose,
  onConfirm,
  date,
  time,
}: {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (info: { name: string; partySize: number }) => void;
  date: string;
  time: string;
}) => {
  const [guestName, setGuestName] = useState("");
  const [partySize, setPartySize] = useState(2);

  useEffect(() => {
    if (!isOpen) {
      setGuestName("");
      setPartySize(2);
    }
  }, [isOpen]);

  if (!isOpen || !table) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || partySize < 1) return;
    onConfirm({ name: guestName.trim(), partySize });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
        <h3 className="text-2xl font-semibold mb-2 text-gray-800">
          Xác nhận đặt bàn: <span className="text-amber-700">{table.name}</span>
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Thời gian: <span className="font-medium">{date || "---"}</span> lúc{" "}
          <span className="font-medium">{time || "---"}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên khách hàng
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Ví dụ: Trần Văn A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng người (1-10)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
            >
              Xác nhận Đặt bàn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =======================
   RESERVATION ITEM
======================= */

const ReservationItem = ({
  res,
  onCheckIn,
  onCancel,
}: {
  res: ReservationInfo;
  onCheckIn: (res: ReservationInfo) => void;
  onCancel: (res: ReservationInfo) => void;
}) => {
  const isCheckInEnabled = useCallback(() => {
    if (res.status !== "confirmed") return false;
    // create datetime local
    const dt = new Date(`${res.date}T${res.time}:00`);
    const now = new Date();
    const diffMin = (dt.getTime() - now.getTime()) / 60000;
    return diffMin >= 0 && diffMin <= 15;
  }, [res]);

  const [enabled, setEnabled] = useState(isCheckInEnabled());

  useEffect(() => {
    if (res.status !== "confirmed") return;
    const id = setInterval(() => setEnabled(isCheckInEnabled()), 5000);
    return () => clearInterval(id);
  }, [res.status, isCheckInEnabled]);

  const classes =
    res.status === "confirmed"
      ? "border-amber-600 bg-amber-50"
      : res.status === "checkedIn"
      ? "border-green-600 bg-green-50"
      : "border-red-600 bg-red-50";

  return (
    <div className={`p-4 rounded-lg border-l-4 ${classes} flex justify-between items-center`}>
      <div>
        <p className="font-semibold text-lg">
          {res.tableName} — {res.partySize} khách
        </p>
        <p className="text-sm text-gray-600">
          Khách: <span className="font-semibold text-gray-800">{res.name}</span> | Lúc{" "}
          {res.time} — {res.date}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {res.status === "confirmed" && (
          <>
            <button
              onClick={() => onCheckIn(res)}
              disabled={!enabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                enabled ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-500"
              }`}
              title={enabled ? "Check-in" : "Chỉ có thể check-in 15 phút trước giờ"}
            >
              <CheckCircle size={16} /> Check-in
            </button>

            <button
              onClick={() => onCancel(res)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              <XCircle size={16} /> Hủy
            </button>
          </>
        )}

        {res.status === "checkedIn" && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-green-300 rounded-lg text-green-700 font-semibold">
            <CheckCircle size={16} /> Đã Check-in
          </div>
        )}

        {res.status === "cancelled" && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-red-300 rounded-lg text-red-700 font-semibold">
            <XCircle size={16} /> Đã hủy
          </div>
        )}
      </div>
    </div>
  );
};

/* =======================
   MAIN PAGE
======================= */

export default function ReservationPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [tables, setTables] = useState<Table[]>(initialFakeTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reservations, setReservations] = useState<ReservationInfo[]>([]);

  useEffect(() => {
    if (date && time) setTables(fetchTables(date, time));
    if (!date || !time) setTables(initialFakeTables);
  }, [date, time]);

  const selectTable = (t: Table) => {
    if (t.isBooked || !date || !time) return;
    setSelectedTable(t);
    setModalOpen(true);
  };

  const confirmBooking = ({ name, partySize }: { name: string; partySize: number }) => {
    if (!selectedTable) return;
    const newRes: ReservationInfo = {
      name,
      partySize,
      date,
      time,
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      status: "confirmed",
    };
    setReservations((p) => [newRes, ...p]);
    setTables((p) => p.map((t) => (t.id === selectedTable.id ? { ...t, isBooked: true } : t)));
    setModalOpen(false);
    setSelectedTable(null);
  };

  const handleCheckIn = (r: ReservationInfo) => {
    setReservations((p) => p.map((x) => (x === r ? { ...x, status: "checkedIn" } : x)));
  };

  const handleCancel = (r: ReservationInfo) => {
    setReservations((p) => p.map((x) => (x === r ? { ...x, status: "cancelled" } : x)));
    setTables((p) => p.map((t) => (t.id === r.tableId ? { ...t, isBooked: false } : t)));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-800">Quản lý Đặt Bàn Nhà Hàng</h1>
          <p className="text-gray-500">Vui lòng chọn ngày, giờ và bàn trống để đặt chỗ.</p>
        </div>

        {/* Recent reservations */}
        {reservations.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-2xl font-semibold mb-4 text-center border-b pb-3">Đơn Đặt Bàn Gần Nhất</h3>
            <div className="space-y-3">
              {reservations.slice(0, 5).map((r, i) => (
                <ReservationItem key={`${r.tableId}-${r.date}-${r.time}-${i}`} res={r} onCheckIn={handleCheckIn} onCancel={handleCancel} />
              ))}
            </div>
          </div>
        )}

        {/* Booking panel */}
        <div className="bg-white p-8 rounded-xl shadow">
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-6">
            <div>
              <label className="block text-sm font-semibold mb-1">Ngày</label>
              <input
                type="date"
                className="px-4 py-2 border rounded-lg shadow-sm"
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Giờ</label>
              <input
                type="time"
                className="px-4 py-2 border rounded-lg shadow-sm"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* legend */}
          <div className="flex justify-center gap-6 text-sm mb-6 text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-600 block" />
              <span>Trống</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 block" />
              <span>Đã đặt</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400 block" />
              <span>Chưa chọn ngày/giờ</span>
            </div>
          </div>

          {/* notice */}
          {!date || !time ? (
            <div className="bg-gray-100 p-3 rounded-lg text-center text-gray-600 mb-6 border-l-4 border-gray-300">
              💡 Vui lòng <strong>chọn ngày và giờ</strong> để xem tình trạng bàn và tiến hành đặt.
            </div>
          ) : null}

          <h3 className="text-xl font-semibold text-center mb-4">Sơ đồ Bàn</h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((t) => {
              const unavailable = !date || !time;
              const isDisabled = t.isBooked || unavailable;
              const baseClass = "p-5 h-20 rounded-lg shadow font-semibold border-b-4 transition transform";
              const stateClass = unavailable
                ? "bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed"
                : t.isBooked
                ? "bg-red-200 text-red-800 border-red-400 cursor-not-allowed"
                : "bg-green-100 text-green-800 border-green-400 hover:scale-105";

              return (
                <button
                  key={t.id}
                  disabled={isDisabled}
                  onClick={() => selectTable(t)}
                  className={`${baseClass} ${stateClass} ${selectedTable?.id === t.id && !t.isBooked ? "ring-4 ring-amber-600" : ""}`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ReservationModal
        table={selectedTable}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTable(null);
        }}
        onConfirm={confirmBooking}
        date={date}
        time={time}
      />

      {/* small animation css */}
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.22s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px)} to { opacity: 1; transform: translateY(0)} }
      `}</style>
    </div>
  );
}
