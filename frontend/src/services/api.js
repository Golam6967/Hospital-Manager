const API_BASE_URL = "http://localhost:5000/api/hospitals";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || `HTTP Error: ${response.status}`,
      response.status,
      data,
    );
  }

  return data;
}

export const apiService = {
  // Get all hospitals with pagination
  async getAllHospitals(page = 1, limit = 50) {
    try {
      const response = await fetch(
        `${API_BASE_URL}?page=${page}&limit=${limit}`,
      );
      return await handleResponse(response);
    } catch (error) {
      console.error("[v0] getAllHospitals error:", error);
      throw error;
    }
  },

  // Get hospital by ID
  async getHospitalById(id) {
    try {
      if (!id) throw new Error("Hospital ID is required");
      const response = await fetch(`${API_BASE_URL}/${id}`);
      return await handleResponse(response);
    } catch (error) {
      console.error("[v0] getHospitalById error:", error);
      throw error;
    }
  },

  // Filter hospitals with advanced filters
  async filterHospitals(filters, page = 1, limit = 50) {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      params.append("page", page);
      params.append("limit", limit);

      const response = await fetch(
        `${API_BASE_URL}/filter/advanced?${params.toString()}`,
      );
      return await handleResponse(response);
    } catch (error) {
      console.error("[v0] filterHospitals error:", error);
      throw error;
    }
  },

  // Get distinct values for a field
  async getDistinctValues(field) {
    console.log(field);
    try {
      if (
        !["division", "district", "upazila", "type", "agency"].includes(field)
      ) {
        throw new Error(`Invalid field: ${field}`);
      }
      const response = await fetch(`${API_BASE_URL}/distinct/${field}`);
      console.log(response);
      return await handleResponse(response);
    } catch (error) {
      console.error("[v0] getDistinctValues error:", error);
      throw error;
    }
  },

  // Get statistics
  async getStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      return await handleResponse(response);
    } catch (error) {
      console.error("[v0] getStatistics error:", error);
      throw error;
    }
  },

  // Create a new hospital
  async createHospital(hospitalData) {
    try {
      if (!hospitalData.name) throw new Error("Hospital name is required");
      if (!hospitalData.code) throw new Error("Hospital code is required");

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hospitalData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("[v0] createHospital error:", error);
      throw error;
    }
  },

  // Update hospital
  async updateHospital(id, updates) {
    try {
      if (!id) throw new Error("Hospital ID is required");

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("[v0] updateHospital error:", error);
      throw error;
    }
  },

  // Delete hospital
  async deleteHospital(id) {
    try {
      if (!id) throw new Error("Hospital ID is required");

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("[v0] deleteHospital error:", error);
      throw error;
    }
  },

  // Delete hospitals by filter
  async deleteByFilter(filters) {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/delete/by-filter?${params.toString()}`,
        { method: "DELETE" },
      );
      return await handleResponse(response);
    } catch (error) {
      console.error("[v0] deleteByFilter error:", error);
      throw error;
    }
  },
};

export default apiService;
