const express = require("express");
const router = express.Router();
const attendanceController = require("../controller/attendanceController");
router.get("/", attendanceController.getAllAttendances);
module.exports = router;