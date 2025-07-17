const express = require("express");
const router = express.Router();
const arvRegimenController = require("../controllers/arvRegimenController");

router.get("/", arvRegimenController.getAllARVRegimens);
router.get("/:id", arvRegimenController.getARVRegimenById);
router.post("/" , arvRegimenController.createARVRegiment);  
router.patch("/active/:id/" , arvRegimenController.setActiveARV);
router.patch("/update/:id/" , arvRegimenController.updateARVRegimen);  


module.exports = router;
