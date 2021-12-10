/*
 * IMT project
 */
var MongoClient = require("mongodb").MongoClient;
const mongourl = "mongodb://127.0.0.1:27017/";
const formate = require("../utils/formatDate");

// get data from mango which need
const getdatafromdb = () => {
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
            .collection("proandsuggest")
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
const insertdatatodb = (rname, rdesc) => {
  return new Promise((res, rej) => {
    try {
      console.log("start get");
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var dbo = db.db("newproject");
          var myobj = {
            name: rname,
            desc: rdesc,
            date: formate(new Date()),
          };
          dbo
            .collection("proandsuggest")
            .insertOne(myobj, function (err, result) {
              if (err) throw err;
              console.log("建议文档插入成功");
              res(result);
              db.close();
            });
        }
      );
    } catch (e) {
      console.log("e", e);
      res(e);
    }
  });
};

const insertdata = async (ctx, next) => {
  try {
    console.log("start insert");
    const req = ctx.request.body;
    const resultdata = await insertdatatodb(req.name, req.desc).then((data) => {
      return data;
    });
    if (resultdata) {
      var finalobj = {
        code: "200",
        msg: "success",
        data: resultdata,
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
        msg: "哦哦~服务好像开小差了...尝试联系管理员吧",
      };
    }
  } catch (e) {
    console.log(e + "//////////");
    ctx.body = {
      code: 404,
      msg: "服务解析失败，请联系管理员检查服务且稍后再试",
    };
  }
};
const getalldata = async (ctx, next) => {
  try {
    console.log("start getting");
    const resultdata = await getdatafromdb().then((data) => {
      return data;
    });

    if (resultdata) {
      var finalobj = {
        code: "200",
        msg: "success",
        data: resultdata,
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
        msg: "哦哦~服务好像开小差了...尝试联系管理员吧",
      };
    }
  } catch (e) {
    console.log(e + "//////////");
    ctx.body = {
      code: 404,
      msg: "服务解析失败，请联系管理员检查服务且稍后再试",
    };
  }
};

module.exports = {
  insertdata, // 一键拉取
  getalldata,
};
