export const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

export const formatTimeShort = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getKitchenAreaLabel = (area: string): string => {
  const labels: Record<string, string> = {
    HOT: 'Khu Nóng',
    GRILL: 'Khu Nướng',
    COLD: 'Khu Lạnh',
    DRINK: 'Khu Đồ Uống',
  };
  return labels[area] || area;
};

export const getStatusBadge = (
  status: string,
): { text: string; color: string } => {
  const badges: Record<string, { text: string; color: string }> = {
    pending: { text: 'Chờ xác nhận', color: 'orange' },
    preparing: { text: 'Đang xử lý', color: 'blue' },
    ready: { text: 'Đã xong', color: 'green' },
    served: { text: 'Đã phục vụ', color: 'default' },
    cancelled: { text: 'Đã hủy', color: 'red' },
  };
  return badges[status] || { text: status, color: 'default' };
};
