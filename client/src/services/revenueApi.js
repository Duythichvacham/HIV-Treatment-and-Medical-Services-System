import api from "./api";

export const fetchRevenue = async (group = "yearly", status = "paid") => {
  try {
    const response = await api.get(
      `${import.meta.env.VITE_API_PREFIX}/managers/revenue?group=${group}&status=${status}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue:", error);
    throw error;
  }
};
