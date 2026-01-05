import { useEffect, useState } from 'react';
import {
  User,
  Phone,
  Calendar,
  Clock,
  Users,
  StickyNote,
  Table2Icon,
} from 'lucide-react';
import {
  generateShiftsByDateAPI,
  getAllTableAPI,
  validateReservationAPI,
} from '@/services/api';
import { socket } from '@/services/socket';
import { message } from 'antd';

/* =========================
   🔥 VALIDATOR
========================= */

// Validate số điện thoại Việt Nam
function isValidVietnamPhone(phone: string) {
  const regex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  return regex.test(phone);
}

// Validate toàn bộ form
function validateForm(data: FormState) {
  const missingFields: string[] = [];

  if (!data.name) missingFields.push('Họ tên');
  if (!data.phone) missingFields.push('Số điện thoại');
  if (!data.date) missingFields.push('Ngày');
  if (!data.time) missingFields.push('Giờ');
  if (!data.guests) missingFields.push('Số lượng người');
  if (!data.tableId) missingFields.push('Bàn');

  if (missingFields.length > 0) {
    alert(`Vui lòng nhập: ${missingFields.join(', ')}`);
    return false;
  }

  if (!isValidVietnamPhone(data.phone)) {
    alert('Số điện thoại không đúng định dạng Việt Nam');
    return false;
  }

  return true;
}

/* =========================
   🔥 TYPES
========================= */

interface FormState {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  notes: string;
  tableId: string;
}

interface SelectOption {
  value: string;
  label: string;
}

/* =========================
   🔥 MAIN COMPONENT
========================= */

export default function BookingForm() {
  const [tables, setTables] = useState<SelectOption[]>([]);
  const [date, setDate] = useState<string>('');
  const [listTime, setListTime] = useState<any[]>([]);
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '',
    notes: '',
    tableId: '',
  });

  useEffect(() => {
    if (!date) return;

    const getListDateCurrent = async () => {
      const res = await generateShiftsByDateAPI(date);
      if (res.data) {
        const data = res.data;
        const listTime = data.reduce((acc: any, cur: any) => {
          return [...acc, cur.startTime];
        }, []);
        setListTime(listTime);
      }
    };
    getListDateCurrent();
  }, [date]);

  useEffect(() => {
    const fetchTables = async () => {
      const res = await getAllTableAPI();
      if (res?.data && Array.isArray(res.data)) {
        const dataTables = res.data.map((table: any) => ({
          value: table._id,
          label: `Bàn ${table.tableNumber}`,
        }));
        setTables(dataTables);
      }
    };
    fetchTables();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm(form)) return;

    const data = {
      customerName: form.name,
      customerPhone: form.phone,
      notes: form.notes,
      date: form.date,
      timeSlot: form.time,
      capacity: form.guests,
      tableId: form.tableId,
    };

    const res = await validateReservationAPI(
      form.date,
      form.time,
      form.tableId,
    );
    const tableNumber = tables.find((t) => t.value === form.tableId)?.label;
    if (res.data == 'yes') {
      message.warning(
        `${tableNumber} khung giờ đã chọn đã được đặt, vui lòng chọn bàn hoặc thời gian khác!`,
      );
      return;
    }

    message.success('Yêu cầu đặt bàn thành công!');

    socket.emit('createReservation', data);

    setForm({
      name: '',
      phone: '',
      date: '',
      time: '',
      guests: '',
      notes: '',
      tableId: '',
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-lg rounded-2xl p-6 space-y-5"
    >
      <h2 className="text-2xl font-bold text-gray-800">Thông tin đặt bàn</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Họ và tên"
          icon={<User size={18} />}
          placeholder="Nhập họ và tên"
          value={form.name}
          onChange={(v: string) => setForm({ ...form, name: v })}
        />

        <Input
          label="Số điện thoại"
          icon={<Phone size={18} />}
          placeholder="Nhập số điện thoại"
          value={form.phone}
          onChange={(v: string) => setForm({ ...form, phone: v })}
          onBlur={() => {
            if (form.phone && !isValidVietnamPhone(form.phone)) {
              alert('Số điện thoại không hợp lệ');
            }
          }}
        />

        <Input
          label="Ngày"
          type="date"
          icon={<Calendar size={18} />}
          min={new Date().toISOString().split('T')[0]}
          value={form.date}
          onChange={(v: string) => {
            setDate(v);
            setForm({ ...form, date: v });
          }}
        />

        <Select
          label="Giờ"
          icon={<Clock size={18} />}
          value={form.time}
          onChange={(v: string) => setForm({ ...form, time: v })}
          options={listTime}
        />

        <Select
          label="Số lượng người"
          icon={<Users size={18} />}
          value={form.guests}
          onChange={(v: string) => setForm({ ...form, guests: v })}
          options={['1', '2', '3', '4', '5', '6', '7', '8']}
        />

        <Select
          label="Chọn bàn"
          icon={<Table2Icon size={18} />}
          value={form.tableId}
          onChange={(v: string) => setForm({ ...form, tableId: v })}
          options={tables}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
          <StickyNote size={16} /> Ghi chú
        </label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Ghi chú (nếu có)"
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#FF6B35] text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition"
      >
        Đặt bàn ngay
      </button>
    </form>
  );
}

/* =========================
   🔹 REUSABLE COMPONENTS
========================= */

function Input({
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  onBlur,
}: any) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
        {icon} {label}
      </label>
      <input
        type={type}
        value={value}
        min={min}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
      />
    </div>
  );
}

function Select({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: Array<string | { value: string; label: string }>;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
        {icon} {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
      >
        <option value="">Chọn</option>

        {options.map((o) =>
          typeof o === 'string' ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </div>
  );
}
