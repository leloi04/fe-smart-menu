import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MenuPage() {
  const [addressA, setAddressA] = useState("");
  const [addressB, setAddressB] = useState("");
  const [coordsA, setCoordsA] = useState<[number, number] | null>(null);
  const [coordsB, setCoordsB] = useState<[number, number] | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔎 Lấy toạ độ từ địa chỉ
  const getCoordinates = async (address: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    } else {
      throw new Error("Không tìm thấy địa chỉ");
    }
  };

  // 🚗 Gọi API OSRM để tính đường đi thật
  const getRoute = async (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes?.length) {
      const route = data.routes[0];
      const distanceKm = route.distance / 1000;
      const coords = route.geometry.coordinates.map((c: [number, number]) => [
        c[1],
        c[0],
      ]);
      return { distanceKm, coords };
    } else {
      throw new Error("Không thể lấy dữ liệu đường đi");
    }
  };

  // 📍 Lấy vị trí hiện tại từ trình duyệt
  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordsA([latitude, longitude]);
        alert("Đã lấy vị trí hiện tại của bạn ✅");
      },
      (err) => {
        alert("Không thể lấy vị trí. Vui lòng bật GPS!");
        console.error(err);
      }
    );
  };

  // 🧮 Tính khoảng cách và vẽ đường
  const handleCalculate = async () => {
    try {
      setLoading(true);

      let locA = coordsA ? { lat: coordsA[0], lon: coordsA[1] } : null;
      if (!locA) locA = await getCoordinates(addressA);

      const locB = await getCoordinates(addressB);

      setCoordsA([locA.lat, locA.lon]);
      setCoordsB([locB.lat, locB.lon]);

      const { distanceKm, coords } = await getRoute(
        locA.lat,
        locA.lon,
        locB.lat,
        locB.lon
      );
      setDistance(distanceKm);
      setRouteCoords(coords);
    } catch (error) {
      alert("Không thể tính khoảng cách, kiểm tra lại địa chỉ!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h2>Tính khoảng cách giữa 2 địa điểm (OpenStreetMap + OSRM)</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Địa chỉ 1:</label>
        <input
          type="text"
          value={addressA}
          onChange={(e) => setAddressA(e.target.value)}
          placeholder="Nhập địa chỉ thứ nhất hoặc dùng vị trí hiện tại"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          disabled={coordsA !== null}
        />
        <button
          onClick={handleUseCurrentLocation}
          style={{
            marginTop: "6px",
            padding: "6px 10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          📍 Dùng vị trí hiện tại
        </button>
        {coordsA && (
          <button
            onClick={() => setCoordsA(null)}
            style={{
              marginLeft: "8px",
              padding: "6px 10px",
              borderRadius: "5px",
              background: "#f44336",
              color: "white",
              border: "none",
            }}
          >
            ✖ Hủy vị trí hiện tại
          </button>
        )}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Địa chỉ 2:</label>
        <input
          type="text"
          value={addressB}
          onChange={(e) => setAddressB(e.target.value)}
          placeholder="Nhập địa chỉ thứ hai"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <button
        onClick={handleCalculate}
        disabled={loading || (!addressA && !coordsA) || !addressB}
        style={{
          background: "#007bff",
          color: "#fff",
          padding: "10px 15px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading ? "Đang tính..." : "Tính khoảng cách"}
      </button>

      {distance !== null && (
        <p style={{ marginTop: "15px", fontSize: "18px" }}>
          📏 Khoảng cách theo đường bộ: <b>{distance.toFixed(2)} km</b>
        </p>
      )}

      {routeCoords.length > 0 && (
        <div style={{ height: "400px", marginTop: "20px" }}>
          <MapContainer
            center={routeCoords[0]}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {coordsA && <Marker position={coordsA}></Marker>}
            {coordsB && <Marker position={coordsB}></Marker>}
            <Polyline positions={routeCoords} color="blue" />
            <AutoFocusMap coords={routeCoords} />
          </MapContainer>
        </div>
      )}
    </div>
  );
}

function AutoFocusMap({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  if (coords.length > 0) {
    map.fitBounds(coords, { padding: [50, 50] });
  }
  return null;
}

export default MenuPage;
