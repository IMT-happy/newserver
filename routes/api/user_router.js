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

// webcase
const webcase = require("./../../app/controllers/webcase");

// videofuzzresultdata

const videofuzz = require("./../../app/controllers/videofuzz");

//router.post("/upload", user_controller.upload);
// insertdata, // 一键拉取
// getalldata,

router.get("/api/getnewquailtydata", getwebqualitydata.getnewquailtydata);
router.post("/api/changeneeddata", getwebqualitydata.changeneeddata);

router.get("/api/getalldata", getproandsug.getalldata);
router.post("/api/insertdata", getproandsug.insertdata);

// smoketestapi
router.get("/api/getallsmokedata", smokeonline.getallsmokedata);

// webcase
router.get("/api/gettagcasedata", webcase.gettagcasedata);
router.post("/api/getallcasedata", webcase.getallcasedata);
router.post("/api/insertcasedata", webcase.insertcasedata);
router.post("/api/editcase", webcase.editcase);
// router.post("/api/getneedcasedata", webcase.getneedcasedata);

// videofuzzresultdata
router.get("/api/runvideofuzz", videofuzz.runvideofuzz);
router.get("/api/getfuzzdata", videofuzz.getfuzzdata);

module.exports = router;
