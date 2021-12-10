/*
 *  * IMT-project
 *   */

const Router = require("koa-router");
const router = new Router();
const getwebqualitydata = require("./../../app/controllers/getwebqualitydata");

// getproandsug

const getproandsug = require("./../../app/controllers/getproandsug");

//router.post("/upload", user_controller.upload);
// insertdata, // 一键拉取
// getalldata,

router.get("/api/getnewquailtydata", getwebqualitydata.getnewquailtydata);

router.get("/api/getalldata", getproandsug.getalldata);
router.post("/api/insertdata", getproandsug.insertdata);

module.exports = router;
