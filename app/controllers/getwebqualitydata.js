/*
 * IMT project
 */
var MongoClient = require("mongodb").MongoClient;
const mongourl = "mongodb://127.0.0.1:27017/";

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
          var dbo = db.db("qualitydb");
          var mysort = { date: -1 };
          dbo
            .collection("eachquality")
            .find()
            .sort(mysort)
            .limit(7)
            .toArray(function (err, result) {
              if (err) {
                return err;
              } else {
                const len = result.length;
                if (len > 0) {
                  db.close();
                  // console.log(result[0].url);
                  // console.log(result.length);
                  res(result); // 返回的对象是个 Array
                  console.log("End search");
                } else {
                  res("no data");
                }
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
const getdatafromdbeach = () => {
  return new Promise((res, rej) => {
    try {
      console.log("start get");
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var dbo = db.db("qualitydb");
          var mysort = { date: -1 };
          var whereStr = { name: "bilibili" };
          dbo
            .collection("eachquality")
            .find(whereStr)
            .sort(mysort)
            .limit(20)
            .toArray(function (err, result) {
              if (err) {
                return err;
              } else {
                const len = result.length;
                if (len > 0) {
                  db.close();
                  res(result);
                  console.log("End search");
                } else {
                  res("no data");
                }
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

const getneeddatafromdb = (datesearch) => {
  return new Promise((res, rej) => {
    try {
      console.log("start get");
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var dbo = db.db("qualitydb");
          var mysort = { date: -1 };
          var whereStr = { date: { $regex: datesearch } };
          dbo
            .collection("eachquality")
            .find(whereStr)
            .sort(mysort)
            .limit(7)
            .toArray(function (err, result) {
              if (err) {
                return err;
              } else {
                const len = result.length;
                if (len > 0) {
                  db.close();
                  // console.log(result[0].url);
                  // console.log(result.length);
                  res(result); // 返回的对象是个 Array
                  console.log("End search");
                } else {
                  res("no data");
                }
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

const getnewquailtydata = async (ctx, next) => {
  try {
    console.log("start getting");
    const resultdata = await getdatafromdb().then((data) => {
      return data;
    });
    const bilibiliresultdata = await getdatafromdbeach().then((data) => {
      return data;
    });

    if (resultdata && bilibiliresultdata) {
      var finalobj = {
        code: "200",
        msg: "success",
        data: resultdata,
        bilidata: bilibiliresultdata,
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

const changeneeddata = async (ctx, next) => {
  try {
    console.log("start getting");
    const req = ctx.request.body;
    const resultdata = await getneeddatafromdb(req.searchdata).then((data) => {
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
  getnewquailtydata, // 一键拉取
  changeneeddata,
};
