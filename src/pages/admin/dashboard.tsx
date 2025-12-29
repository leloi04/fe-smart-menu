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
import { useEffect, useState } from 'react';
import {
  fetchMenuItemsAPI,
  getAllTableAPI,
  revenueTableAPI,
  summaryOrderAPI,
  summaryOrderForTableAPI,
  summaryPaymentAPI,
  summaryPaymentMonthlyAPI,
  summaryPreOrderAPI,
  summaryPreOrderOfOnlineAPI,
  summaryReservationAPI,
  summaryReservationTodayAPI,
  topItemsOnlineAPI,
  topItemsTableAPI,
} from '@/services/api';
import CountUp from 'react-countup';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [totalOrderTableThisMonth, setTotalOrderTableThisMonth] =
    useState<number>(0);
  const [totalOrderOnlineThisMonth, setTotalOrderOnlineThisMonth] =
    useState<number>(0);
  const [revenueOrderTableThisMonth, setRevenueOrderTableThisMonth] =
    useState<number>(0);
  const [revenueOrderOnlineThisMonth, setRevenueOrderOnlineThisMonth] =
    useState<number>(0);
  const [totalReservationThisMonth, setTotalReservationThisMonth] =
    useState<number>(0);
  const [totalRevenueThisMonth, setTotalRevenueThisMonth] = useState<number>(0);
  const [overviewStats, setOverviewStats] = useState<any[]>([]);
  const [monthlyOrderData, setMonthlyOrderData] = useState<any[]>([]);
  const [revenueByTypeData, setRevenueByTypeData] = useState<any[]>([]);
  const [revenueMonthlyData, setRevenueMonthlyData] = useState<any[]>([]);
  const [tablesRevenueData, setTablesRevenueData] = useState<any[]>([]);
  const [topDishesData, setTopDishesData] = useState<any[]>([]);
  const [bookingsToday, setBookingsToday] = useState<any[]>([]);

  // Fetch data for OverViewStats
  useEffect(() => {
    const fetchDataRevenueForOverView = async () => {
      const date = new Date();
      const month = (date.getMonth() + 1).toString();
      const year = date.getFullYear().toString();
      const orderTable = await summaryOrderAPI(month, year);
      if (orderTable.data) {
        setTotalOrderTableThisMonth(orderTable.data.totalOrders);
        setRevenueOrderTableThisMonth(orderTable.data.paidRevenue);
      }
      const orderOnline = await summaryPreOrderAPI(month, year);
      if (orderOnline.data) {
        setTotalOrderOnlineThisMonth(orderOnline.data.totalOrders);
        setRevenueOrderOnlineThisMonth(orderOnline.data.paidRevenue);
      }
      const reservations = await summaryReservationAPI(month, year);
      if (reservations.data) {
        setTotalReservationThisMonth(reservations.data.totalReservations);
      }
      const revenues = await summaryPaymentAPI(month, year);
      if (revenues.data) {
        setTotalRevenueThisMonth(revenues.data.completedAmount);
      }
    };
    fetchDataRevenueForOverView();
  }, []);

  // Set overViewStats
  useEffect(() => {
    const overviewStats = [
      {
        title: 'Order Tại Bàn',
        value: totalOrderTableThisMonth || 0,
        subtitle: 'Tháng này',
        icon: <ShoppingCart size={24} />,
        color: '#1890FF',
        bgColor: '#E6F7FF',
      },
      {
        title: 'Order Online',
        value: totalOrderOnlineThisMonth || 0,
        subtitle: 'Tháng này',
        icon: <ShoppingCart size={24} />,
        color: '#52C41A',
        bgColor: '#F6FFED',
      },
      {
        title: 'Tổng Doanh Thu',
        value: totalRevenueThisMonth ?? 0,
        subtitle: 'Tháng này',
        icon: <DollarSign size={24} />,
        color: '#FA8C16',
        bgColor: '#FFF7E6',
        isCurrency: true,
      },
      {
        title: 'Bàn Đặt Trước',
        value: totalReservationThisMonth || 0,
        subtitle: 'Tháng này',
        icon: <Calendar size={24} />,
        color: '#722ED1',
        bgColor: '#F9F0FF',
      },
    ];
    setOverviewStats(overviewStats);
  }, [
    totalOrderOnlineThisMonth,
    totalOrderTableThisMonth,
    totalReservationThisMonth,
    totalRevenueThisMonth,
  ]);

  // Fetch data monthly order of Table and Online
  useEffect(() => {
    const fetchDataMonthly = async () => {
      const date = new Date();
      const year = date.getFullYear().toString();
      const dataOrderTable = await summaryOrderForTableAPI(year);
      const dataOrderOnline = await summaryPreOrderOfOnlineAPI(year);
      if (dataOrderTable.data && dataOrderOnline.data) {
        const monthlyOrderOfTable = dataOrderTable.data.map((d: any) => ({
          month: `T${d.month}`,
          dineIn: d.totalOrders,
        }));
        const monthlyOrderOfOnline = dataOrderOnline.data.map((d: any) => ({
          month: `T${d.month}`,
          online: d.totalOrders,
        }));
        const monthlyOrderData = monthlyOrderOfTable.map((d: any) => {
          const onlineItem = monthlyOrderOfOnline.find(
            (o: any) => o.month === d.month,
          );

          return {
            month: d.month,
            dineIn: d.dineIn,
            online: onlineItem.online,
          };
        });

        setMonthlyOrderData(monthlyOrderData);
      }
    };
    fetchDataMonthly();
  }, []);

  // Fetch data for pipe diagram
  useEffect(() => {
    const revenueByTypeData = [
      { name: 'Tại Bàn', value: +revenueOrderTableThisMonth || 0 },
      { name: 'Online', value: +revenueOrderOnlineThisMonth || 0 },
    ];
    setRevenueByTypeData(revenueByTypeData);
  }, [revenueOrderOnlineThisMonth, revenueOrderTableThisMonth]);

  // Fetch data revenue of monthly
  useEffect(() => {
    const fetchRevenueMonthly = async () => {
      const date = new Date();
      const year = date.getFullYear().toString();
      const data = await summaryPaymentMonthlyAPI(year);
      if (data.data) {
        const revenueMonthlyData = data.data.map((d: any) => ({
          month: `T${d.month}`,
          revenue: d.totalRevenue,
        }));
        setRevenueMonthlyData(revenueMonthlyData);
      }
    };
    fetchRevenueMonthly();
  }, []);

  // Fetch revenue of table monthly
  useEffect(() => {
    const fetchRevenueTableMonthly = async () => {
      const date = new Date();
      const month = (date.getMonth() + 1).toString();
      const year = date.getFullYear().toString();
      const dataTable = await getAllTableAPI();
      const revenueTable = await revenueTableAPI(month, year);
      if (dataTable.data && revenueTable.data) {
        const tables = dataTable.data.map((t: any) => ({
          id: t._id,
          tableNumber: `Bàn ${t.tableNumber}`,
        }));
        const tablesRevenueData = tables.map((t: any) => {
          const revenue = revenueTable.data.find((r: any) => r.tableId == t.id);
          return {
            key: t.id,
            tableNumber: t.tableNumber,
            revenue: revenue?.revenue || 0,
          };
        });
        setTablesRevenueData(tablesRevenueData);
      }
    };
    fetchRevenueTableMonthly();
  }, []);

  // Fetch top items sold in this month
  useEffect(() => {
    const fetchTopItems = async () => {
      const date = new Date();
      const month = (date.getMonth() + 1).toString();
      const year = date.getFullYear().toString();
      const menu = await fetchMenuItemsAPI();
      const itemSoldOrderTable = await topItemsTableAPI(month, year);
      const itemSoldOrderOnline = await topItemsOnlineAPI(month, year);
      if (menu.data && itemSoldOrderOnline.data && itemSoldOrderTable.data) {
        const dataMenu = menu.data;
        const menuItems = (dataMenu as any).map((i: any) => ({
          id: i._id,
          name: i.name,
        }));
        const topDishesData = menuItems.map((i: any) => {
          const itemOrderTable = itemSoldOrderTable.data.find(
            (itemT: any) => itemT.menuItemId == i.id,
          );
          const itemOrderOnline = itemSoldOrderOnline.data.find(
            (itemO: any) => itemO.menuItemId == i.id,
          );

          return {
            key: i.id,
            name: i.name,
            sold:
              (itemOrderTable?.quantity || 0) +
              (itemOrderOnline?.quantity || 0),
          };
        });
        setTopDishesData(
          topDishesData.sort((a: any, b: any) => b.sold - a.sold),
        );
      }
    };
    fetchTopItems();
  }, []);

  // Fetch reservation in today
  useEffect(() => {
    const fetchReservationToday = async () => {
      const date = new Date();
      const dateConverse = date.toISOString().split('T')[0];
      const reservationsToday = await summaryReservationTodayAPI(dateConverse);
      if (reservationsToday.data) {
        const bookingsToday = reservationsToday.data.map((r: any) => ({
          key: r.tableData._id,
          customerName: r.customerName,
          customerPhone: r.customerPhone,
          tableNumber: r.tableData.tableNumber,
          guests: r.capacity,
          time: r.timeSlot,
          status: r.status,
        }));
        setBookingsToday(bookingsToday);
      }
    };
    fetchReservationToday();
  }, []);

  /* ================= COLUMNS ================= */

  const tableRevenueColumns = [
    { title: 'Số Bàn', dataIndex: 'tableNumber' },
    {
      title: 'Doanh Thu Tháng',
      dataIndex: 'revenue',
      align: 'right' as const,
      render: (v: number) => `${v.toLocaleString('vi-VN')} đ`,
    },
  ];

  const topDishesColumns = [
    { title: 'Tên Món', dataIndex: 'name' },
    { title: 'Đã Bán', dataIndex: 'sold', align: 'center' as const },
  ];

  const bookingsColumns = [
    { title: 'Tên Khách', dataIndex: 'customerName' },
    { title: 'SĐT', dataIndex: 'customerPhone' },
    { title: 'Số bàn', dataIndex: 'tableNumber' },
    { title: 'Số Người', dataIndex: 'guests', align: 'center' as const },
    { title: 'Giờ', dataIndex: 'time', align: 'center' as const },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      render: (s: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
          upcoming: {
            color: 'blue',
            label: 'Sắp tới',
          },
          checked_in: {
            color: 'green',
            label: 'Đã check-in',
          },
          expired: {
            color: 'orange',
            label: 'Đã hết hạn',
          },
          cancelled: {
            color: 'red',
            label: 'Đã hủy',
          },
        };

        const status = statusMap[s] || {
          color: 'default',
          label: s,
        };

        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
  ];

  const COLORS = ['#1890FF', '#52C41A'];

  /* ================= RENDER ================= */

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2}>Dashboard Nhà Hàng</Title>

      {/* OVERVIEW */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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
                    <CountUp
                      end={stat.value}
                      duration={1.2}
                      formattingFn={(v) =>
                        stat.isCurrency
                          ? v.toLocaleString('vi-VN')
                          : v.toString()
                      }
                    />
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

      {/* LINE + PIE */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Order Tại Bàn & Online Theo Tháng">
            <ResponsiveContainer height={300}>
              <LineChart data={monthlyOrderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="dineIn" stroke="#1890FF" name="Tại bàn" />
                <Line dataKey="online" stroke="#52C41A" name="Online" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Tỷ Trọng Doanh Thu">
            <ResponsiveContainer height={300}>
              <PieChart>
                <Pie
                  data={revenueByTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label={(e) => `${e.name}: ${(e.value / 1000000).toFixed(1)}M`}
                >
                  {revenueByTypeData.map((_: any, i: any) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    typeof value === 'number'
                      ? `${value.toLocaleString('vi-VN')} đ`
                      : value
                  }
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* REVENUE MONTHLY */}
      <Card title="Doanh Thu Theo Tháng" style={{ marginBottom: 24 }}>
        <ResponsiveContainer height={300}>
          <AreaChart data={revenueMonthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area dataKey="revenue" stroke="#FA8C16" fill="#FFE7BA" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* TABLES */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Quản Lý Bàn">
            <Table
              dataSource={tablesRevenueData}
              columns={tableRevenueColumns}
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

      {/* BOOKINGS */}
      <Card title="Đặt Bàn Hôm Nay" style={{ marginTop: 24 }}>
        <Table
          dataSource={bookingsToday}
          columns={bookingsColumns}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
