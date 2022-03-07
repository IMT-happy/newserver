/*
 * IMT project
 */
var MongoClient = require("mongodb").MongoClient;
const mongourl = "mongodb://127.0.0.1:27017/";
const formate = require("../utils/formatDate");

const getallwebcasedatafromdb = (casename, tagname) => {
  return new Promise((res, rej) => {
    try {
      var whereStr, casestr, tagstr;
      console.log("start get");
      if (casename && casename.length > 0) {
        casestr = { name: { $regex: casename } };
      } else {
        casestr = {};
      }
      if (tagname && tagname.length > 0) {
        tagstr = { tag: tagname };
      } else {
        tagstr = {};
      }
      whereStr = {
        $and: [casestr, tagstr],
      };

      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var dbo = db.db("newproject");
          var mysort = { date: -1 };

          dbo
            .collection("webcase")
            .find(whereStr)
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

const getallwebcasetagdatafromdb = () => {
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
            .collection("webcasetag")
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

const editwebcasealldata = (updateobj) => {
  return new Promise((res, rej) => {
    try {
      console.log("start get");
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var dbo = db.db("newproject");
          var whereStr = { id: updateobj.id };
          var updateStr = {
            $set: {
              name: updateobj.name,
              desc: updateobj.desc,
              tag: updateobj.tag,
              content: updateobj.content,
              date: formate(new Date()),
            },
          };
          dbo
            .collection("webcase")
            .updateOne(whereStr, updateStr, function (err, result) {
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

const editwebcaseataglldata = (casetag, caseid) => {
  return new Promise((res, rej) => {
    try {
      console.log("start get");
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var dbo = db.db("newproject");
          var whereStr = { id: caseid };
          var updateStr = {
            $set: {
              name: casetag,
              date: formate(new Date()),
            },
          };
          dbo
            .collection("webcasetag")
            .updateOne(whereStr, updateStr, function (err, result) {
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

const insertwebcasealldata = (webcaseobj) => {
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
            id: webcaseobj.id,
            name: webcaseobj.name,
            tag: webcaseobj.tag,
            desc: webcaseobj.desc,
            content: webcaseobj.contation,
            date: formate(new Date()),
          };
          dbo.collection("webcase").insertOne(myobj, function (err, result) {
            if (err) throw err;
            console.log("webcase插入成功");
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

const insertwebcasetagdata = (casename, caseid) => {
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
            id: caseid,
            name: casename,
            date: formate(new Date()),
          };
          dbo.collection("webcasetag").insertOne(myobj, function (err, result) {
            if (err) throw err;
            console.log("webcasetag插入成功");
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

const getallcasedata = async (ctx, next) => {
  try {
    console.log("start getting");
    const req = ctx.request.body;

    const webcase = await getallwebcasedatafromdb(req.name, req.tag).then(
      (data) => {
        return data;
      }
    );

    if (webcase) {
      var finalobj = {
        code: "200",
        msg: "success",
        data: webcase,
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

const gettagcasedata = async (ctx, next) => {
  try {
    console.log("start getting");

    const webcasetagdata = await getallwebcasetagdatafromdb().then((data) => {
      return data;
    });

    if (webcasetagdata) {
      var finalobj = {
        code: "200",
        msg: "success",
        data: webcasetagdata,
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

const insertcasedata = async (ctx, next) => {
  try {
    console.log("start getting");
    const req = ctx.request.body;

    const webcasedata = await insertwebcasealldata(req).then((data) => {
      return data;
    });
    const webcasetagdata = await insertwebcasetagdata(req.tag, req.id).then(
      (data) => {
        return data;
      }
    );

    if (webcasedata && webcasetagdata) {
      var finalobj = {
        code: "200",
        msg: "success",
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
const editcase = async (ctx, next) => {
  try {
    console.log("start edit");
    const req = ctx.request.body;

    const webcaseeditdata = await editwebcasealldata(req).then((data) => {
      return data;
    });

    const webcasetageditdata = await editwebcaseataglldata(
      req.tag,
      req.id
    ).then((data) => {
      return data;
    });

    if (webcaseeditdata && webcasetageditdata) {
      var finalobj = {
        code: "200",
        msg: "success",
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
  getallcasedata, // 一键拉取
  gettagcasedata, // 一键拉取
  insertcasedata,
  editcase,
};
