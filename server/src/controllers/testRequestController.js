const testRequestService = require("../services/testRequestService");

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await testRequestService.updateStatus(id, status);
    if (!updated) {
      return res.status(404).json({ message: "Test request not found" });
    }

    res.json({ message: "Status updated successfully", data: updated });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTestRequests = async (req, res) => {
  try {
    const { status, date } = req.query;
    const requests = await testRequestService.getTestRequests(status, date);
    res.json(requests);
  } catch (err) {
    console.error("Get Test Requests Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  updateStatus,
  getTestRequests,
};
