const express = require("express");
const router = express.Router();
const testrequestController = require("../controllers/testRequestController");

router.patch("/:id/status", testrequestController.updateStatus);

router.get("/", testrequestController.getTestRequests);

module.exports = router;
