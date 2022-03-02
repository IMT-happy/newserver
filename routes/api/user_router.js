/*
 *  * IMT-project
 *   */

const Router = require("koa-router");
const router = new Router();
const getwebqualitydata = require("./../../app/controllers/getwebqualitydata");

// getproandsug
const getproandsug = require("./../../app/controllers/getproandsug");

// smoketest
const smokeonline = require("./../../app/controllers/smokeonline");

//router.post("/upload", user_controller.upload);
// insertdata, // 一键拉取
// getalldata,

router.get("/api/getnewquailtydata", getwebqualitydata.getnewquailtydata);
router.post("/api/changeneeddata", getwebqualitydata.changeneeddata);

router.get("/api/getalldata", getproandsug.getalldata);
router.post("/api/insertdata", getproandsug.insertdata);

// smoketestapi
router.get("/api/getallsmokedata", smokeonline.getallsmokedata);

module.exports = router;
