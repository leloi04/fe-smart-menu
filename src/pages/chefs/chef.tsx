import React, { useMemo, useState } from "react";
import { Button, Badge, Card, Col, Divider, Empty, Modal, Row, Space, Tabs, Typography } from "antd";
import { ChefLayout } from "@/components/layout/chef/chefLayout";
import { TableOutlined, SwapOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * Chef & Staff unified page
 * - Top navbar: grouped Orders button (toggles sub-buttons for Table / Online) + Pending button (opens modal)
 * - Table overview: show table cards with "Xem chi tiết" only
 * - Online view: show only preparing orders
 * - Pending modal: two tabs (Table pending / Online pending) with Confirm / Cancel
 * - Confirm moves order into table list (dine-in) or online preparing list
 * - Fake data covers cases requested
 * - Uses uploaded image at /mnt/data/e95fb7be-a72b-4826-9be3-5eb8538f291d.png for detail header
 */

// -------------------- Types --------------------
type ItemStatus = "preparing" | "initial" | "added" | "completed";

type OrderItem = {
  id: string;
  dishName: string;
  variant?: string;
  toppings?: string[];
  qty: number;
  notes?: string;
  status: ItemStatus;
};

type Order = {
  id: string;
  orderNumber: number;
  type: "dine-in" | "online";
  table?: { number: number };
  createdAt: string;
  status: "pending" | "preparing" | "ready" | "cancelled";
  notes?: string;
  items: OrderItem[];
};

const nowIso = () => new Date().toISOString();

// -------------------- Fake data --------------------
const fakeOrdersSeed: Order[] = [
  // Table 1 mixed
  {
    id: "t1_a",
    orderNumber: 5001,
    type: "dine-in",
    table: { number: 1 },
    createdAt: nowIso(),
    status: "preparing",
    notes: "Ít dầu",
    items: [
      { id: "t1_i1", dishName: "Phở Bò", variant: "M", toppings: ["Hành"], qty: 1, status: "preparing" },
      { id: "t1_i2", dishName: "Gỏi Cuốn", variant: "S", toppings: ["Tôm"], qty: 2, status: "initial" },
      { id: "t1_i3", dishName: "Nước Cam", variant: "L", toppings: [], qty: 1, status: "added" },
      { id: "t1_i4", dishName: "Cà phê sữa đá", variant: "M", toppings: [], qty: 1, status: "completed" },
    ],
  },
  // Table 2 only initial
  {
    id: "t2_a",
    orderNumber: 5002,
    type: "dine-in",
    table: { number: 2 },
    createdAt: nowIso(),
    status: "pending",
    notes: "",
    items: [{ id: "t2_i1", dishName: "Bún Chả", qty: 1, status: "initial" }],
  },
  // Table 4 completed only
  {
    id: "t4_a",
    orderNumber: 5004,
    type: "dine-in",
    table: { number: 4 },
    createdAt: nowIso(),
    status: "ready",
    notes: "",
    items: [{ id: "t4_i1", dishName: "Coca", qty: 2, status: "completed" }],
  },
  // Table 1 another order (aggregation demo)
  {
    id: "t1_b",
    orderNumber: 5005,
    type: "dine-in",
    table: { number: 1 },
    createdAt: nowIso(),
    status: "pending",
    notes: "",
    items: [{ id: "t1_i5", dishName: "Chè Ba Màu", qty: 1, status: "initial" }],
  },
  // Online pending
  {
    id: "o_100",
    orderNumber: 6001,
    type: "online",
    createdAt: nowIso(),
    status: "pending",
    notes: "Giao nhanh",
    items: [{ id: "o100_i1", dishName: "Trà Sữa", variant: "L", toppings: ["Trân châu"], qty: 2, status: "initial" }],
  },
  // Online preparing
  {
    id: "o_101",
    orderNumber: 6002,
    type: "online",
    createdAt: nowIso(),
    status: "preparing",
    notes: "",
    items: [{ id: "o101_i1", dishName: "Cơm Rang", qty: 1, status: "preparing" }],
  },
];

// -------------------- Helper utilities --------------------
const groupDineInByTable = (orders: Order[]) => {
  const map = new Map<number, Order[]>();
  orders.forEach((o) => {
    if (o.type !== "dine-in") return;
    const t = o.table!.number;
    if (!map.has(t)) map.set(t, []);
    map.get(t)!.push(o);
  });
  return map;
};

const flattenItemsForTable = (orders: Order[]) => {
  const res: { orderId: string; item: OrderItem }[] = [];
  orders.forEach((o) => o.items.forEach((it) => res.push({ orderId: o.id, item: it })));
  return res;
};

// -------------------- Main Component --------------------
export default function ChefKitchenPage() {
  const [orders, setOrders] = useState<Order[]>(fakeOrdersSeed);

  // UI states
  const [showOrdersOptions, setShowOrdersOptions] = useState(false); // group button toggles sub buttons
  const [viewMode, setViewMode] = useState<"table" | "onlinePreparing">("table");
  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const [selectedTableForDetail, setSelectedTableForDetail] = useState<number | null>(null);

  // compute lists
  const active = useMemo(() => orders.filter((o) => o.status !== "cancelled"), [orders]);
  const dineIn = useMemo(() => active.filter((o) => o.type === "dine-in"), [active]);
  const online = useMemo(() => active.filter((o) => o.type === "online"), [active]);
  const onlinePending = useMemo(() => online.filter((o) => o.status === "pending"), [online]);
  const onlinePreparing = useMemo(() => online.filter((o) => o.status === "preparing"), [online]);

  const dineInGrouped = useMemo(() => groupDineInByTable(dineIn), [dineIn]);

  // -------------------- Actions --------------------
  // Confirm pending order: change status, and place into preparing list (if online->preparing in online list, if table->in table view remain but set status)
  const confirmPendingOrder = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "preparing" } : o)));
  };

  const cancelPendingOrder = (orderId: string) => {
    // For demo: just alert and mark cancelled
    alert(`Hủy đơn ${orderId}`);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
  };

  // open table detail
  const openTableDetail = (tableNumber: number) => {
    setSelectedTableForDetail(tableNumber);
  };

  // close detail
  const closeTableDetail = () => setSelectedTableForDetail(null);

  // -------------------- Renderers --------------------
  const renderTableCard = (tableNumber: number, ordersForTable: Order[]) => {
    const flat = flattenItemsForTable(ordersForTable);
    const total = flat.length;
    const preparingCount = flat.filter((f) => f.item.status === "preparing").length;
    return (
      <Col key={tableNumber} xs={24} sm={12} md={8} lg={6}>
        <Card title={`Bàn ${tableNumber}`} extra={<Button size="small" onClick={() => openTableDetail(tableNumber)}>Xem chi tiết</Button>} hoverable>
          <Text>{total > 0 ? `${total} món` : "Chưa có món"}</Text>
          <div style={{ marginTop: 8 }}>
            <Space>
              <Badge count={preparingCount} style={{ backgroundColor: "#1890ff" }} />
              <Text type="secondary">Đang chế biến</Text>
            </Space>
          </div>
        </Card>
      </Col>
    );
  };

  const renderTableOverview = () => {
    const tableNumbers = Array.from(dineInGrouped.keys()).sort((a, b) => a - b);
    if (tableNumbers.length === 0) return <Empty description="Không có bàn đang hoạt động" />;
    return (
      <Row gutter={[16, 16]}>
        {tableNumbers.map((tn) => renderTableCard(tn, dineInGrouped.get(tn)!))}
      </Row>
    );
  };

  const TableDetailModal = ({ tableNumber }: { tableNumber: number }) => {
    const ordersForTable = dineInGrouped.get(tableNumber) || [];
    const flat = flattenItemsForTable(ordersForTable);
    const preparing = flat.filter((f) => f.item.status === "preparing");
    const initial = flat.filter((f) => f.item.status === "initial");
    const added = flat.filter((f) => f.item.status === "added");
    const completed = flat.filter((f) => f.item.status === "completed");

    const section = (title: string, list: { orderId: string; item: OrderItem }[]) => (
      <div style={{ marginBottom: 12 }}>
        <Title level={5} style={{ color: "#7f1d1d" }}>{title}</Title>
        {list.length === 0 ? <Text type="secondary">Chưa có món nào.</Text> : (
          <div className="space-y-2">
            {list.map((l) => (
              <div key={l.item.id} style={{ padding: 8, background: '#fff', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>{l.item.dishName}{l.item.variant ? ` • ${l.item.variant}` : ''}</Text>
                    <div><Text type="secondary">x{l.item.qty} {l.item.toppings?.length ? `• ${l.item.toppings.join(', ')}` : ''}</Text></div>
                    {l.item.notes && <div><Text type="secondary">{l.item.notes}</Text></div>}
                  </div>
                  <div><Text type="secondary">{l.orderId}</Text></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <Modal visible title={`Chi tiết Bàn ${tableNumber}`} onCancel={closeTableDetail} footer={<Button onClick={closeTableDetail}>Đóng</Button>} width={720}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <img src="/mnt/data/e95fb7be-a72b-4826-9be3-5eb8538f291d.png" alt="ic" style={{ width: 36, height: 36 }} />
          <Title level={4} style={{ margin: 0 }}>Chi tiết Order - Bàn {tableNumber}</Title>
        </div>
        {section('Món đang chế biến', preparing)}
        {section('Món gọi ban đầu', initial)}
        {section('Món gọi thêm sau', added)}
        {section('Món đã xong', completed)}
      </Modal>
    );
  };

  const renderOnlinePreparing = () => {
    if (onlinePreparing.length === 0) return <Empty description="Không có đơn đang chế biến (Online)" />;
    return (
      <Row gutter={[16, 16]}>
        {onlinePreparing.map((o) => (
          <Col key={o.id} xs={24} md={12}>
            <Card title={`#${o.orderNumber}`} size="small">
              <Text type="secondary">Đơn Online • {o.items.length} món</Text>
              <Divider />
              <div className="space-y-2">
                {o.items.map((it) => (
                  <div key={it.id} style={{ padding: 8, background: '#fff', borderRadius: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong>{it.dishName}{it.variant ? ` • ${it.variant}` : ''}</Text>
                        <div><Text type="secondary">x{it.qty}</Text></div>
                      </div>
                      <div><Badge color={it.status === 'preparing' ? '#1890ff' : '#faad14'} text={it.status === 'preparing' ? 'Đang xử lý' : 'Chờ'} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const PendingModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    const tablePending = orders.filter((o) => o.type === 'dine-in' && o.status === 'pending');
    const onlinePendingList = onlinePending;

    return (
      <Modal visible={visible} onCancel={onClose} footer={null} width="100%" style={{ top: 0 }} bodyStyle={{ height: '100vh', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <Title level={4}>Đơn chờ xác nhận</Title>
          <Button onClick={onClose}>Đóng</Button>
        </div>
        <Tabs defaultActiveKey="table">
          <TabPane tab={`Đơn bàn (${tablePending.length})`} key="table">
            {tablePending.length === 0 ? <Empty description="Không có đơn chờ của bàn" /> : (
              <div className="space-y-3">
                {tablePending.map((o) => (
                  <Card key={o.id} size="small" title={`Bàn ${o.table?.number} • #${o.orderNumber}`}>
                    <Text type="secondary">{o.items.length} món • {o.notes}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Space>
                        <Button onClick={() => { confirmPendingOrder(o.id); }}>Xác nhận</Button>
                        <Button danger onClick={() => cancelPendingOrder(o.id)}>Hủy</Button>
                        <Button onClick={() => openTableDetail(o.table!.number)}>Xem chi tiết</Button>
                      </Space>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabPane>

          <TabPane tab={`Đơn online (${onlinePendingList.length})`} key="online">
            {onlinePendingList.length === 0 ? <Empty description="Không có đơn chờ online" /> : (
              <div className="space-y-3">
                {onlinePendingList.map((o) => (
                  <Card key={o.id} size="small" title={`#${o.orderNumber} • Đặt ngoài`}>
                    <Text type="secondary">{o.items.length} món • {o.notes}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Space>
                        <Button onClick={() => confirmPendingOrder(o.id)}>Xác nhận</Button>
                        <Button danger onClick={() => cancelPendingOrder(o.id)}>Hủy</Button>
                        <Button onClick={() => { setSelectedTableForDetail(-1); openTableDetail(-1); }}>Xem chi tiết</Button>
                      </Space>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  return (
    <ChefLayout
      navbarContent={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            {/* Grouped Orders button toggles two options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button onClick={() => setShowOrdersOptions((s) => !s)} icon={<SwapOutlined />}>Orders</Button>
              {showOrdersOptions && (
                <Space>
                  <Button type={viewMode === 'table' ? 'primary' : 'default'} icon={<TableOutlined />} onClick={() => { setViewMode('table'); setShowOrdersOptions(false); }}>Order theo Bàn</Button>
                  <Button type={viewMode === 'onlinePreparing' ? 'primary' : 'default'} icon={<SwapOutlined />} onClick={() => { setViewMode('onlinePreparing'); setShowOrdersOptions(false); }}>Order Online</Button>
                </Space>
              )}
            </div>
          </Space>

          <Space>
            <Button type="primary" icon={<FileTextOutlined />} onClick={() => setPendingModalVisible(true)}>
              <Badge count={orders.filter(o => o.status === 'pending' && o.type === 'dine-in').length} offset={[6, -6]}>Đơn chờ</Badge>
            </Button>
            <Button onClick={() => setPendingModalVisible(true)}>
              <Badge count={onlinePending.length} offset={[6, -6]}>Đơn chờ (Online)</Badge>
            </Button>
          </Space>
        </Space>
      }
    >
      <Title level={3} style={{ color: 'white', marginTop: 0 }}>{viewMode === 'table' ? 'Order theo Bàn' : 'Đơn đang chế biến (Online)'}</Title>
      <Divider />

      {viewMode === 'table' ? renderTableOverview() : renderOnlinePreparing()}

      {selectedTableForDetail !== null && selectedTableForDetail !== undefined && selectedTableForDetail !== -1 && (
        <TableDetailModal tableNumber={selectedTableForDetail} />
      )}

      {selectedTableForDetail === -1 && (
        // online detail: reuse modal but show first online pending for demo
        <Modal visible title="Chi tiết Order Online (demo)" onCancel={() => { closeTableDetail(); setSelectedTableForDetail(null); }} footer={<Button onClick={() => { closeTableDetail(); setSelectedTableForDetail(null); }}>Đóng</Button>} width={720}>
          <div>
            {onlinePending.length === 0 ? <Text>Không có đơn online chờ</Text> : (
              <div>
                <Title level={4}>Chi tiết Order Online #{onlinePending[0].orderNumber}</Title>
                {onlinePending[0].items.map(it => (
                  <div key={it.id} style={{ padding: 8, background: '#fff', borderRadius: 6, marginBottom: 8 }}>
                    <Text strong>{it.dishName}{it.variant ? ` • ${it.variant}` : ''}</Text>
                    <div><Text type="secondary">x{it.qty}</Text></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      <PendingModal visible={pendingModalVisible} onClose={() => setPendingModalVisible(false)} />
    </ChefLayout>
  );
}
