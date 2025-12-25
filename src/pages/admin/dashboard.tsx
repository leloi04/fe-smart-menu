import { Card, Row, Col, Table, Tag, Typography } from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ShoppingCart, DollarSign, Calendar } from 'lucide-react';

const { Title, Text } = Typography;

const Dashboard = () => {
  const monthlyOrderData = [
    { month: 'T1', dineIn: 120, online: 85 },
    { month: 'T2', dineIn: 135, online: 92 },
    { month: 'T3', dineIn: 148, online: 105 },
    { month: 'T4', dineIn: 162, online: 118 },
    { month: 'T5', dineIn: 175, online: 130 },
    { month: 'T6', dineIn: 188, online: 145 },
    { month: 'T7', dineIn: 210, online: 165 },
    { month: 'T8', dineIn: 195, online: 158 },
    { month: 'T9', dineIn: 205, online: 172 },
    { month: 'T10', dineIn: 220, online: 185 },
    { month: 'T11', dineIn: 238, online: 198 },
    { month: 'T12', dineIn: 255, online: 215 },
  ];

  const revenueReservationData = [
    { month: 'T1', revenue: 45000000, reservations: 35 },
    { month: 'T2', revenue: 52000000, reservations: 42 },
    { month: 'T3', revenue: 58000000, reservations: 48 },
    { month: 'T4', revenue: 65000000, reservations: 55 },
    { month: 'T5', revenue: 72000000, reservations: 62 },
    { month: 'T6', revenue: 78000000, reservations: 68 },
    { month: 'T7', revenue: 88000000, reservations: 75 },
    { month: 'T8', revenue: 82000000, reservations: 70 },
    { month: 'T9', revenue: 85000000, reservations: 72 },
    { month: 'T10', revenue: 92000000, reservations: 78 },
    { month: 'T11', revenue: 98000000, reservations: 85 },
    { month: 'T12', revenue: 105000000, reservations: 92 },
  ];

  const orderStatusData = [
    { name: 'Chờ xác nhận', value: 45, color: '#FFA500' },
    { name: 'Đang chế biến', value: 78, color: '#1890FF' },
    { name: 'Đang giao', value: 32, color: '#52C41A' },
    { name: 'Hoàn thành', value: 385, color: '#13C2C2' },
    { name: 'Hủy', value: 28, color: '#FF4D4F' },
  ];

  const tablesData = [
    { key: 1, tableNumber: 'Bàn 01', status: 'empty', billAmount: null },
    { key: 2, tableNumber: 'Bàn 02', status: 'serving', billAmount: 850000 },
    { key: 3, tableNumber: 'Bàn 03', status: 'reserved', billAmount: null },
    { key: 4, tableNumber: 'Bàn 04', status: 'serving', billAmount: 1200000 },
    { key: 5, tableNumber: 'Bàn 05', status: 'empty', billAmount: null },
    { key: 6, tableNumber: 'Bàn 06', status: 'serving', billAmount: 650000 },
    { key: 7, tableNumber: 'Bàn 07', status: 'reserved', billAmount: null },
    { key: 8, tableNumber: 'Bàn 08', status: 'empty', billAmount: null },
    { key: 9, tableNumber: 'Bàn 09', status: 'serving', billAmount: 980000 },
    { key: 10, tableNumber: 'Bàn 10', status: 'empty', billAmount: null },
    { key: 11, tableNumber: 'Bàn 11', status: 'serving', billAmount: 1450000 },
    { key: 12, tableNumber: 'Bàn 12', status: 'reserved', billAmount: null },
  ];

  const topDishesData = [
    { key: 1, name: 'Phở Bò Đặc Biệt', sold: 342, revenue: 54720000 },
    { key: 2, name: 'Bún Chả Hà Nội', sold: 298, revenue: 35760000 },
    { key: 3, name: 'Cơm Tấm Sườn Bì', sold: 275, revenue: 27500000 },
    { key: 4, name: 'Bánh Mì Thịt Nướng', sold: 456, revenue: 18240000 },
    { key: 5, name: 'Gỏi Cuốn Tôm Thịt', sold: 189, revenue: 11340000 },
    { key: 6, name: 'Cà Phê Sữa Đá', sold: 523, revenue: 15690000 },
    { key: 7, name: 'Trà Sữa Trân Châu', sold: 412, revenue: 20600000 },
  ];

  const bookingsToday = [
    {
      key: 1,
      customerName: 'Nguyễn Văn An',
      guests: 4,
      time: '11:30',
      status: 'arrived',
    },
    {
      key: 2,
      customerName: 'Trần Thị Bình',
      guests: 6,
      time: '12:00',
      status: 'pending',
    },
    {
      key: 3,
      customerName: 'Lê Hoàng Cường',
      guests: 2,
      time: '12:30',
      status: 'arrived',
    },
    {
      key: 4,
      customerName: 'Phạm Minh Đức',
      guests: 8,
      time: '18:00',
      status: 'pending',
    },
    {
      key: 5,
      customerName: 'Vũ Thu Hà',
      guests: 5,
      time: '18:30',
      status: 'pending',
    },
    {
      key: 6,
      customerName: 'Hoàng Văn Khoa',
      guests: 3,
      time: '19:00',
      status: 'pending',
    },
    {
      key: 7,
      customerName: 'Đặng Thị Lan',
      guests: 4,
      time: '19:30',
      status: 'pending',
    },
  ];

  const overviewStats = [
    {
      title: 'Order Tại Bàn',
      value: '2,241',
      subtitle: 'Tháng này',
      icon: <ShoppingCart size={24} />,
      color: '#1890FF',
      bgColor: '#E6F7FF',
    },
    {
      title: 'Order Online',
      value: '1,568',
      subtitle: 'Tháng này',
      icon: <ShoppingCart size={24} />,
      color: '#52C41A',
      bgColor: '#F6FFED',
    },
    {
      title: 'Tổng Doanh Thu',
      value: '105.2M',
      subtitle: 'Tháng này',
      icon: <DollarSign size={24} />,
      color: '#FA8C16',
      bgColor: '#FFF7E6',
    },
    {
      title: 'Bàn Đặt Trước',
      value: '92',
      subtitle: 'Tháng này',
      icon: <Calendar size={24} />,
      color: '#722ED1',
      bgColor: '#F9F0FF',
    },
  ];

  const tableColumns = [
    {
      title: 'Số Bàn',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          empty: { text: 'Trống', color: 'default' },
          serving: { text: 'Đang phục vụ', color: 'processing' },
          reserved: { text: 'Đã đặt trước', color: 'warning' },
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Hóa Đơn',
      dataIndex: 'billAmount',
      key: 'billAmount',
      render: (amount: number | null) =>
        amount ? `${amount.toLocaleString('vi-VN')} đ` : '-',
    },
  ];

  const topDishesColumns = [
    {
      title: 'Tên Món',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Đã Bán',
      dataIndex: 'sold',
      key: 'sold',
      align: 'center' as const,
    },
    {
      title: 'Doanh Thu',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right' as const,
      render: (revenue: number) => `${revenue.toLocaleString('vi-VN')} đ`,
    },
  ];

  const bookingsColumns = [
    {
      title: 'Tên Khách',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Số Người',
      dataIndex: 'guests',
      key: 'guests',
      align: 'center' as const,
    },
    {
      title: 'Giờ Đặt',
      dataIndex: 'time',
      key: 'time',
      align: 'center' as const,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'arrived' ? 'success' : 'default'}>
          {status === 'arrived' ? 'Đã đến' : 'Chưa đến'}
        </Tag>
      ),
    },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    }
    return `${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Dashboard Nhà Hàng
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {overviewStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card hoverable>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {stat.title}
                  </Text>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      marginTop: '4px',
                    }}
                  >
                    {stat.value}
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {stat.subtitle}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Order Tại Bàn & Online Theo Tháng">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyOrderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="dineIn"
                  stroke="#1890FF"
                  strokeWidth={2}
                  name="Tại Bàn"
                />
                <Line
                  type="monotone"
                  dataKey="online"
                  stroke="#52C41A"
                  strokeWidth={2}
                  name="Online"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Phân Loại Trạng Thái Đơn Hàng">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <Card title="Doanh Thu & Bàn Đặt Trước Theo Tháng">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueReservationData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FA8C16" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FA8C16" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="colorReservations"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#722ED1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#722ED1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={formatCurrency}
                  label={{
                    value: 'Doanh Thu (VNĐ)',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: 'Số Bàn',
                    angle: 90,
                    position: 'insideRight',
                  }}
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'Doanh Thu'
                      ? [`${(value || 0).toLocaleString('vi-VN')} đ`, name]
                      : [value, name]
                  }
                />

                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FA8C16"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Doanh Thu"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="reservations"
                  stroke="#722ED1"
                  fillOpacity={1}
                  fill="url(#colorReservations)"
                  name="Bàn Đặt Trước"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Quản Lý Bàn">
            <Table
              dataSource={tablesData}
              columns={tableColumns}
              pagination={{ pageSize: 6 }}
              scroll={{ x: 400 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Top Món Bán Chạy">
            <Table
              dataSource={topDishesData}
              columns={topDishesColumns}
              pagination={{ pageSize: 6 }}
              scroll={{ x: 400 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title="Đặt Bàn Hôm Nay">
            <Table
              dataSource={bookingsToday}
              columns={bookingsColumns}
              pagination={{ pageSize: 7 }}
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
