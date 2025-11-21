import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const PUBLIC_PATHS = ["/tables"]; // 👈 tất cả routes bắt đầu bằng /tables là PUBLIC

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve(token);
  });
  failedQueue = [];
};

// ==========================
// REQUEST INTERCEPTOR
// ==========================
instance.interceptors.request.use(
  function (config) {
    const currentPath = window.location.pathname;
    const isPublic = PUBLIC_PATHS.some((prefix) =>
      currentPath.startsWith(prefix)
    );

    // 👉 Nếu route là PUBLIC → không dùng Authorization
    if (isPublic) {
      return config;
    }

    const token = localStorage.getItem("access_token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// ==========================
// RESPONSE INTERCEPTOR
// ==========================
instance.interceptors.response.use(
  function (response) {
    if (response?.data?.data) return response.data;
    return response;
  },

  async function (error) {
    const originalRequest = error.config;

    const currentPath = window.location.pathname;
    const isPublic = PUBLIC_PATHS.some((prefix) =>
      currentPath.startsWith(prefix)
    );

    // 👉 PUBLIC MODE thì KHÔNG redirect login
    if (isPublic) {
      return Promise.reject(error);
    }

    // 👉 Không xử lý refresh ở trang login
    if (currentPath === "/login") {
      return Promise.reject(error);
    }

    // 👉 Token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await instance.get("/auth/refresh-token");
        const newToken = res.data?.access_token;

        if (!newToken) throw new Error("Refresh token expired");

        localStorage.setItem("access_token", newToken);
        instance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("access_token");

        if (currentPath !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (error && error.response && error.response.data)
      return error.response.data;

    return Promise.reject(error);
  }
);

export default instance;
