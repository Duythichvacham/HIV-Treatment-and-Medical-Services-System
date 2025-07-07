const managerService = require("../services/managers/managerService");

const getUsers = async (req, res) => {
  try {
    const users = await managerService.getUsers();
    return res.status(200).json({
      message: "Users fetched successfully",
      data: users || [],
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  getUsers,
};
