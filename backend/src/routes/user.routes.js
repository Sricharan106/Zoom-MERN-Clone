const { Router } = require("express");
const usercontroller = require("../controllers/user.controller.js");

const router = Router();

router
  .route("/login")
  .get((req, res) => res.send("HI! there"))
  .post(usercontroller.login);
router.route("/register").post(usercontroller.register);
router.route("/add_to_activity").post(usercontroller.addToHistory)
router.route("/get_all_activity").get(usercontroller.getUserHistory)
router.route("/getUsername").get(usercontroller.getUsername)
router.route("/validateToken").post(usercontroller.validateToken)



module.exports = router;
