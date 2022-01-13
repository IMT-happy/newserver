var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017";
// MongoClient.connect(
//   url,
//   { useNewUrlParser: true, useUnifiedTopology: true },
//   function (err, db) {
//     if (err) throw err;
//     console.log("数据库已创建");
//     var dbase = db.db("newproject");
//     dbase.createCollection("proandsuggest", function (err, res) {
//       if (err) throw err;
//       console.log("创建集合!");
//       db.close();
//     });
//   }
// );

// MongoClient.connect(
//   url,
//   { useNewUrlParser: true, useUnifiedTopology: true },
//   function (err, db) {
//     if (err) throw err;
//     var mysort = { date: -1 };
//     var dbo = db.db("qualitydb");
//     dbo
//       .collection("eachquality")
//       .find({})
//       .sort(mysort)
//       .toArray(function (err, result) {
//         if (err) throw err;
//         console.log(result);
//         db.close();
//       });
//   }
// );

MongoClient.connect(
  url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, db) {
    if (err) throw err;
    var dbo = db.db("newproject");
    var whereStr = {}; // 查询条件
    dbo.collection("proandsuggest").deleteMany(whereStr, function (err, obj) {
      if (err) throw err;
      console.log(obj.result.n + " 条文档被删除");
      db.close();
    });
  }
);
