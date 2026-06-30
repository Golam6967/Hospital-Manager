const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const HOSPITAL_BASE = `${BACKEND_BASE}/api/hospitals`;
const AUTH_BASE = `${BACKEND_BASE}/api/auth`;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function setAccessToken(token) {
  localStorage.setItem("accessToken", token);
}

function clearAccessToken() {
  localStorage.removeItem("accessToken");
}

async function refreshAccessToken() {
  const res = await fetch(`${AUTH_BASE}/refresh-token`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    clearAccessToken();
    throw new ApiError("Session expired, please log in again", 401);
  }
  const data = await res.json();
  if (data.data?.accessToken) {
    setAccessToken(data.data.accessToken);
    return data.data.accessToken;
  }
  throw new ApiError("Failed to refresh token", 401);
}

async function apiFetch(url, options = {}, retry = true) {
  const token = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Auto-refresh on 401 and retry once
  if (response.status === 401 && retry) {
    try {
      await refreshAccessToken();
      return apiFetch(url, options, false);
    } catch {
      throw new ApiError("Unauthorized", 401);
    }
  }

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(
      data.message || data.error || `HTTP Error: ${response.status}`,
      response.status,
      data,
    );
  }

  return data;
}

// ─── Auth API ───────────────────────────────────────────────────────────────

export const authService = {
  async register(firstName, lastName, email, password, role) {
    return apiFetch(`${AUTH_BASE}/register`, {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password, role }),
    });
  },

  async login(idToken) {
    console.log(idToken);
    const data = await apiFetch(`${AUTH_BASE}/login`, {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
    console.log(data);
    if (data.data?.accessToken) setAccessToken(data.data.accessToken);
    return data;
  },

  async logout() {
    try {
      await apiFetch(`${AUTH_BASE}/logout`, { method: "POST" });
    } finally {
      clearAccessToken();
    }
  },

  async getMe() {
    return apiFetch(`${AUTH_BASE}/me`);
  },

  async updateProfile(updates) {
    return apiFetch(`${AUTH_BASE}/profile`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async changePassword(newPassword) {
    return apiFetch(`${AUTH_BASE}/change-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
  },
};

// ─── Hospital API ────────────────────────────────────────────────────────────

export const apiService = {
  async getAllHospitals(page = 1, limit = 50) {
    return apiFetch(`${HOSPITAL_BASE}?page=${page}&limit=${limit}`);
  },

  async getHospitalById(id) {
    if (!id) throw new Error("Hospital ID is required");
    return apiFetch(`${HOSPITAL_BASE}/${id}`);
  },

  async filterHospitals(filters, page = 1, limit = 50) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        params.append(key, value);
    });
    params.append("page", page);
    params.append("limit", limit);
    return apiFetch(`${HOSPITAL_BASE}/filter/advanced?${params.toString()}`);
  },

  async getDistinctValues(field) {
    if (
      !["division", "district", "upazila", "type", "agency"].includes(field)
    ) {
      throw new Error(`Invalid field: ${field}`);
    }
    return apiFetch(`${HOSPITAL_BASE}/distinct/${field}`);
  },

  async getStatistics() {
    return apiFetch(`${HOSPITAL_BASE}/stats`);
  },

  async createHospital(hospitalData) {
    if (!hospitalData.name) throw new Error("Hospital name is required");
    if (!hospitalData.code) throw new Error("Hospital code is required");
    return apiFetch(HOSPITAL_BASE, {
      method: "POST",
      body: JSON.stringify(hospitalData),
    });
  },

  async updateHospital(id, updates) {
    if (!id) throw new Error("Hospital ID is required");
    return apiFetch(`${HOSPITAL_BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteHospital(id) {
    if (!id) throw new Error("Hospital ID is required");
    return apiFetch(`${HOSPITAL_BASE}/${id}`, { method: "DELETE" });
  },

  async getEmergencyHospitals(problemType = "") {
    const params = new URLSearchParams();
    if (problemType) params.append("problemType", problemType);
    return apiFetch(`${HOSPITAL_BASE}/emergency?${params.toString()}`);
  },

  async geocodeHospital(id) {
    if (!id) throw new Error("Hospital ID is required");
    return apiFetch(`${HOSPITAL_BASE}/${id}/geocode`, { method: "POST" });
  },

  async deleteByFilter(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        params.append(key, value);
    });
    return apiFetch(`${HOSPITAL_BASE}/delete/by-filter?${params.toString()}`, {
      method: "DELETE",
    });
  },
};

export default apiService;
