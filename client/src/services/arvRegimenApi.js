import api from "./api";

// API functions for ARV Regimens management (Manager)
export const arvRegimenManagerApi = {
  // Get all ARV regimens
  getAll: async () => {
    try {
      const response = await api.get("VITE_API_API_PREFIX/arv-regimens/");
      console.log("✅ getAll ARV regimens response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ getAll ARV regimens error:", error);
      throw error;
    }
  },

  // Get ARV regimen by ID
  getById: async (regimenId) => {
    try {
      const response = await api.get(`VITE_API_API_PREFIX/arv-regimens/${regimenId}`);
      console.log("✅ getById ARV regimen response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ getById ARV regimen error:", error);
      throw error;
    }
  },

  // Create new ARV regimen
  create: async (regimenData) => {
    try {
      const response = await api.post("VITE_API_API_PREFIX/arv-regimens/", regimenData);
      console.log("✅ create ARV regimen response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ create ARV regimen error:", error);
      throw error;
    }
  },

  // Update ARV regimen
  update: async (regimenId, regimenData) => {
    try {
      const response = await api.patch(
        `VITE_API_API_PREFIX/arv-regimens/update/${regimenId}/`,
        regimenData
      );
      console.log("✅ update ARV regimen response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ update ARV regimen error:", error);
      throw error;
    }
  },

  // Toggle active status
  setActive: async (regimenId, isActive) => {
    try {
      const response = await api.patch(
        `VITE_API_API_PREFIX/arv-regimens/active/${regimenId}/`,
        {
          is_active: isActive,
        }
      );
      console.log("✅ setActive ARV regimen response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ setActive ARV regimen error:", error);
      throw error;
    }
  },
};
