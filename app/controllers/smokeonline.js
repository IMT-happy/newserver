/*
 * IMT project
 */
var MongoClient = require("mongodb").MongoClient;
const mongourl = "mongodb://127.0.0.1:27017/";

const getallchromesmokedatafromdb = () => {
  return new Promise((res, rej) => {
    try {
      console.log("start get");
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var dbo = db.db("newproject");
          var mysort = { date: -1 };
          dbo
            .collection("chromesmoketest")
            .find()
            .sort(mysort)
            .toArray(function (err, result) {
              if (err) {
                return err;
              } else {
                db.close();
                // console.log(result[0].url);
                // console.log(result.length);
                res(result); // 返回的对象是个 Array
                console.log("End search");
              }
            });
        }
      );
    } catch (e) {
      console.log("e", e);
      res(e);
    }
  });
};

const getallsmokedata = async (ctx, next) => {
  try {
    console.log("start getting");

    const chromeresultdata = await getallchromesmokedatafromdb().then(
      (data) => {
        return data;
      }
    );

    if (chromeresultdata) {
      var finalobj = {
        code: "200",
        msg: "success",
        chromesmokedata: chromeresultdata,
      };
    } else {
      var finalobj = {
        code: 404,
        msg: "拉取数据失败，请尝试重新拉取~",
      };
    }
    if (finalobj) {
      ctx.status = 200;
      ctx.body = finalobj;
    } else {
      ctx.body = {
        code: 400,
        msg: "哦哦~服务好像开小差了...尝试联系IMT吧",
      };
    }
  } catch (e) {
    console.log(e + "//////////");
    ctx.body = {
      code: 404,
      msg: "服务解析失败，请联系IMT检查服务且稍后再试",
    };
  }
};

module.exports = {
  getallsmokedata, // 一键拉取
};
