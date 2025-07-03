const express = require("express");
const router = express.Router();
const arvRegimenController = require("../controllers/arvRegimenController");

router.get("/", arvRegimenController.getAllARVRegimens);
router.get("/:id", arvRegimenController.getARVRegimenById);

module.exports = router;
