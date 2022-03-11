/*
 * IMT project
 */
const puppeteer = require("puppeteer");
const imgurl = "/Users/guchenghuan/onlineserver/img/";
const formate = require("../utils/formatDate");
const fs = require("fs");
var request = require("request");
var MongoClient = require("mongodb").MongoClient;
const mongourl = "mongodb://127.0.0.1:27017/";
const lunchibj = {
  headless: true, // 开启界面,
  timeout: 30 * 1000,
  //   devtools: true, // 开启开发者控制台
  //设置每个步骤放慢200毫秒
  slowMo: 200,
  //设置打开页面在浏览器中的宽高
  defaultViewport: null,
  args: ["--unhandled-rejections=strict", "--start-maximized"],
  ignoreDefaultArgs: ["--enable-automation"],
  executablePath: "/usr/bin/google-chrome", // /usr/bin/google-chrome
};

const runfuzz = async (type) => {
  try {
    console.log(`run = ${num} 's test`);
    let errcount = 0,
      rescount = 0;
    puppeteer.launch(lunchibj).then(async (browser) => {
      try {
        const page = await browser.newPage();
        const headlessUserAgent = await page.evaluate(
          () => navigator.userAgent
        );
        const chromeUserAgent = headlessUserAgent.replace(
          "HeadlessChrome",
          "Chrome"
        );
        await page.setUserAgent(chromeUserAgent);
        await page.setExtraHTTPHeaders({
          "accept-language": "zh-CN,zh;q=0.9",
        });
        const openoptions = {
          timeout: 0,
          waitUntil: [
            "load", //等待 “load” 事件触发
            "domcontentloaded", //等待 “domcontentloaded” 事件触发
            "networkidle0", //在 500ms 内没有任何网络连接
            "networkidle2", //在 500ms 内网络连接个数不超过 2 个
          ],
        };
        await page.setViewport({
          width: 1920,
          height: 1080,
        });
        // test onload m4s requests fail
        if (type === "run") {
          await page.goto(
            "https://www.bilibili.com/video/BV1U54y1J7uo",
            openoptions
          );
          await page.setRequestInterception(true);
          //   await delay(3000);
          page.on("request", async (req) => {
            if (req.url().includes("m4s")) {
              await req.abort();
            } else {
              await req.continue();
            }
          });
          page.on("requestfailed", async (req) => {
            errcount = errcount + 1;
            if (errcount > 15) {
              const pngpath = imgurl + type + ".png";
              await page.screenshot({
                path: pngpath,
                // fullPage: true,
              });
              await browser.close();
              await imgtransfertohttp(type, pngpath);
              await delay(2000);
              num = num + 1;
              if (num > 5) {
                console.log("done");
                requestnum = 0;
              } else {
                (async () => {
                  runfuzz(tmp[num]);
                })();
              }
            }
          });
        } else {
          try {
            await page.setRequestInterception(true);
            // test satrt all requests fail
            if (type === "all") {
              page.on("request", async (req) => {
                if (
                  [
                    // "xhr",
                    "image",
                    // "media",
                    "font",
                    "stylesheet",
                    // "script",
                    "webp",
                  ].indexOf(req.resourceType()) !== -1
                ) {
                  await req.abort();
                } else {
                  await req.continue();
                }
              });
            } else if (type === "header") {
              // test edit request headers fail
              page.on("request", async (req) => {
                if (req.url().includes("m4s")) {
                  let headers = await req.headers();
                  headers["range"] = "bytes=";
                  await req.continue({ headers });
                } else {
                  await req.continue();
                }
              });
            } else if (type === "response") {
              // test edit response data fail
              page.on("request", async (req) => {
                if (req.url().includes("m4s")) {
                  await req.respond({
                    status: 200,
                    headers: {
                      "Access-Control-Allow-Origin": "*",
                    },
                    contentType: "application/json; charset=utf-8",
                    body: JSON.stringify({ code: 0, data: "hello i'm test" }),
                  });
                  await req.continue();
                } else {
                  await req.continue();
                }
              });
            } else if (type === "m4s") {
              // test all m4s requests fail
              page.on("request", async (req) => {
                if (req.url().includes("m4s")) {
                  await req.abort();
                } else {
                  await req.continue();
                }
              });
            } else {
              // test source fail
              page.on("request", async (req) => {
                if (
                  [
                    //   "xhr",
                    "image",
                    "media",
                    //   "font",
                    //   "stylesheet",
                    //   "script",
                    "webp",
                  ].indexOf(req.resourceType()) !== -1
                ) {
                  await req.abort();
                } else {
                  await req.continue();
                }
              });
            }
            page.on("response", async (res) => {
              if (res["_url"].includes("m4s")) {
                rescount = rescount + 1;
                if (rescount > 15 || errcount > 20) {
                  const pngpath = imgurl + type + ".png";
                  await page.screenshot({
                    path: pngpath,
                    // fullPage: true,
                  });
                  await browser.close();
                  await imgtransfertohttp(type, pngpath);
                  await delay(2000);

                  num = num + 1;
                  if (num > 5) {
                    console.log("done");
                    requestnum = 0;
                  } else {
                    (async () => {
                      runfuzz(tmp[num]);
                    })();
                  }
                }
              }
            });

            page.on("requestfailed", async (req) => {
              errcount = errcount + 1;
              if (rescount > 15 || errcount > 20) {
                const pngpath = imgurl + type + ".png";
                await page.screenshot({
                  path: pngpath,
                  // fullPage: true,
                });
                await browser.close();
                await imgtransfertohttp(type, pngpath);
                await delay(2000);

                num = num + 1;
                if (num > 5) {
                  console.log("done");
                  requestnum = 0;
                } else {
                  (async () => {
                    runfuzz(tmp[num]);
                  })();
                }
              }
            });
            await page.goto(
              "https://www.bilibili.com/video/BV1U54y1J7uo",
              openoptions
            );
          } catch (e) {
            requestnum = 0;
            await browser.close();
            console.log("error: ", e);
          }
        }
      } catch (e) {
        console.log("error: ", e);
      }
    });
  } catch (e) {
    console.log("error: ", e);
  }
};

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

const imgtransfertohttp = async (type, imgpath) => {
  var imgoptions = {
    method: "POST",
    url: "http://uat-activity-template.bilibili.co/x/upload/files",
    headers: {
      "Content-Type":
        "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
      "x-auth-user": "guchenghuan",
      "x-auth-thirdtoken": "7fb9f12ba85b2dfb58a2db1dcbc06dae",
      Cookie:
        "connect.sid=s%3AEwbuYCbaaMHS01wW5enfE-M8R3WI78vv.v7LN3bq%2FhXfaLcnBsoh%2Bc68J5h5PUDzKmXS4Ccn0AhU",
    },
    formData: {
      forDeveloper: "true",
      needRandom: "false",
      imageIsBFS: "false",
      imagemin: "true",
      needTime: "false",
      file: {
        value: fs.createReadStream(imgpath),
        options: {
          filename: imgpath,
          contentType: null,
        },
      },
    },
  };
  request(imgoptions, function (error, response) {
    if (error) throw new Error(error);
    const newresult = JSON.parse(response.body);
    // console.log(newresult.data)
    var pngurlresult;
    if (newresult.code === 0) {
      pngurlresult = newresult.data[0].cdnPath.replace(/\"/g, ""); // url img

      // search data from db
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var mysort = { date: -1 };
          var whereStr = { type: type };
          var dbo = db.db("newproject");
          dbo
            .collection("videocatch")
            .find(whereStr)
            .sort(mysort)
            .toArray(function (err, result) {
              if (err) throw err;
              if (result.length > 0) {
                MongoClient.connect(
                  mongourl,
                  { useNewUrlParser: true, useUnifiedTopology: true },
                  function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("newproject");
                    var whereStr = { type: type };
                    var updateStr = {
                      $set: {
                        imgurl: pngurlresult,
                        date: formate(new Date()),
                      },
                    };
                    dbo
                      .collection("videocatch")
                      .updateOne(whereStr, updateStr, function (err, result) {
                        if (err) {
                          return err;
                        } else {
                          db.close();
                          console.log("update ok");
                        }
                      });
                  }
                );
              } else {
                // insert data urlfiles
                MongoClient.connect(
                  mongourl,
                  { useNewUrlParser: true, useUnifiedTopology: true },
                  function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("newproject");
                    var myobj = {
                      type: type,
                      imgurl: pngurlresult,
                      date: formate(new Date()),
                    };
                    dbo
                      .collection("videocatch")
                      .insertOne(myobj, function (err, res) {
                        if (err) throw err;
                        console.log("new videocatch case insert done");
                        db.close();
                      });
                  }
                );
              }
              db.close();
            });
        }
      );
    } else {
      var diffimgerror = {
        method: "POST",
        url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=279cea5c-03e3-4d88-a224-ab9b08a9ed67",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          msgtype: "text",
          text: {
            content: `videofuzz 异常测试中，上报图片接口失败啦，赶紧检查下呀～ `,
            mentioned_list: [""],
            mentioned_mobile_list: [""],
          },
        }),
      };
      request(diffimgerror, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
      });
    }
  });
};

const getfuzzdatafromdb = () => {
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
            .collection("videocatch")
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
var num;
let requestnum = 0;
const tmp = ["run", "m4s", "header", "response", "all", "rmimg"];
const runvideofuzz = async (ctx, next) => {
  try {
    console.log("requestnum: ", requestnum);
    if (requestnum > 0) {
      var finalobj = {
        code: "400",
        msg: "fuzz请求不可频繁发送",
      };
      if (finalobj) {
        ctx.status = 200;
        ctx.body = finalobj;
      } else {
        ctx.body = {
          code: 400,
          msg: "哦哦~服务好像开小差了...尝试联系IMT吧",
        };
      }
    } else {
      requestnum = 1;
      console.log("start run");
      num = 0;
      (async () => {
        runfuzz(tmp[num]);
      })();

      var finalobj = {
        code: "200",
        msg: "success",
      };
      if (finalobj) {
        ctx.status = 200;
        ctx.body = finalobj;
      } else {
        ctx.body = {
          code: 400,
          msg: "哦哦~服务好像开小差了...尝试联系IMT吧",
        };
      }
    }
  } catch (e) {
    console.log(e + "//////////");
    ctx.body = {
      code: 404,
      msg: "服务解析失败，请联系IMT检查服务且稍后再试",
    };
  }
};

const getfuzzdata = async (ctx, next) => {
  try {
    console.log("start edit");

    const videofuzzresultdata = await getfuzzdatafromdb().then((data) => {
      return data;
    });

    if (videofuzzresultdata) {
      var finalobj = {
        code: "200",
        msg: "success",
        data: videofuzzresultdata,
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
  runvideofuzz, // run
  getfuzzdata, // get
};
