/*
 * IMT project
 */
const puppeteer = require("puppeteer");
const imgurl = "/data1/newproserver/";
// const imgurl = "/Users/guchenghuan/onlineserver/";
const formate = require("../utils/formatDate");
const formatymd = require("../utils/formateymd");
const fs = require("fs");
const path = require("path");
var request = require("request");
const typedescs = require("../utils/typesdesc");
var MongoClient = require("mongodb").MongoClient;
const mongourl = "mongodb://127.0.0.1:27017/";
const lunchobj = {
  headless: true, // 开启界面,
  timeout: 30 * 1000,
  //   devtools: true, // 开启开发者控制台
  //设置每个步骤放慢200毫秒
  slowMo: 200,
  //设置打开页面在浏览器中的宽高
  defaultViewport: null,
  args: [
    "--unhandled-rejections=strict",
    "--start-maximized",
    "--disable-web-security",
  ],
  ignoreDefaultArgs: ["--enable-automation"],
  executablePath: "/usr/bin/google-chrome",
  //   executablePath:
  //     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
};

const runwebfuzz = async (
  type,
  newcookie,
  nowpath,
  nowurl,
  id,
  iscookie,
  tmplen,
  user
) => {
  try {
    console.log("nowtype: " + type);
    puppeteer.launch(lunchobj).then(async (browser) => {
      try {
        const page = await browser.newPage();
        ps = await browser.pages();
        await ps[0].close();
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

        let cookieString = newcookie;
        const addCookies = async (cookies_str, page, domain) => {
          let cookies = cookies_str.split(";").map((pair) => {
            let name = pair.trim().slice(0, pair.trim().indexOf("="));
            let value = pair.trim().slice(pair.trim().indexOf("=") + 1);
            return { name, value, domain };
          });
          await Promise.all(
            cookies.map((pair) => {
              // console.log(pair);
              return page.setCookie(pair);
            })
          );
        };

        // test onload m4s requests fail
        await page.setRequestInterception(true);

        console.log(`now type is : ${type}`);
        console.log(`run = ${num} 's test`);
        // change change req header
        if (type === "allheader") {
          try {
            // clear all xhr's req header data
            page.on("request", async (req) => {
              if (["xhr"].indexOf(req.resourceType()) !== -1) {
                req.continue({
                  // url: newurl,
                  // method: '',
                  // postData: {},
                  headers: "{}",
                });
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "someheader") {
          try {
            // clear some xhr's req header data
            page.on("request", async (req) => {
              let reqheader = Math.floor(Math.random() * 100 + 1);
              if (
                ["xhr"].indexOf(req.resourceType()) !== -1 &&
                reqheader % 2 === 0
              ) {
                req.continue({
                  // url: newurl,
                  // method: '',
                  // postData: {},
                  headers: "{}",
                });
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "allquerydata") {
          try {
            // change req querydata
            page.on("request", async (req) => {
              if (["xhr"].indexOf(req.resourceType()) !== -1) {
                if (req.method() == "GET") {
                  // ressolve data do not change data ,just in road change
                  let url = req.url();
                  const arr = url.split("?");
                  if (arr && arr.length > 0) {
                    let newurl = arr[0] + "?name=fuzzing-test";
                    req.continue({
                      url: newurl,
                      // method: '',
                      // postData: {},
                      // headers: header,
                    });
                  } else {
                    req.continue({});
                  }
                } else {
                  let reqdata = req.postData();
                  if (reqdata && reqdata.length > 0) {
                    req.continue({
                      // url: newurl,
                      // method: '',
                      postData: "{}",
                      // headers: header,
                    });
                  } else {
                    req.continue({});
                  }
                }
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "somequerydata") {
          try {
            // change req querydata
            page.on("request", async (req) => {
              let querynum = Math.floor(Math.random() * 100 + 1);
              if (
                ["xhr"].indexOf(req.resourceType()) !== -1 &&
                querynum % 2 === 0
              ) {
                if (req.method() == "GET") {
                  // ressolve data do not change data ,just in road change
                  let url = req.url();
                  const arr = url.split("?");
                  if (arr && arr.length > 0) {
                    let newurl = arr[0] + "?name=fuzzing-test";
                    req.continue({
                      url: newurl,
                      // method: '',
                      // postData: {},
                      // headers: header,
                    });
                  } else {
                    req.continue({});
                  }
                } else {
                  let reqdata = req.postData();
                  if (reqdata && reqdata.length > 0) {
                    req.continue({
                      // url: newurl,
                      // method: '',
                      postData: "{}",
                      // headers: header,
                    });
                  } else {
                    req.continue({});
                  }
                }
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "mainresponse") {
          try {
            // change main page response data
            page.on("request", async (req) => {
              await req.respond({
                status: 200,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                },
                contentType: "application/json; charset=utf-8",
                body: JSON.stringify({ code: 0, data: "hello i'm fuzz" }),
              });
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "allresponse") {
          try {
            // // change xhr response data
            page.on("request", async (req) => {
              if (["xhr"].indexOf(req.resourceType()) !== -1) {
                await req.respond({
                  status: 200,
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                  },
                  contentType: "application/json; charset=utf-8",
                  body: JSON.stringify({ code: 0, data: "hello i'm fuzz" }),
                });
              } else {
                req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "someresponse") {
          try {
            // change xhr response data
            page.on("request", async (req) => {
              let someresponsenum = Math.floor(Math.random() * 100 + 1);
              if (
                ["xhr"].indexOf(req.resourceType()) !== -1 &&
                someresponsenum % 2 === 0
              ) {
                await req.respond({
                  status: 200,
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                  },
                  contentType: "application/json; charset=utf-8",
                  body: JSON.stringify({ code: 0, data: "hello i'm fuzz" }),
                });
              } else {
                req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "allxhr") {
          try {
            page.on("request", async (req) => {
              if (["xhr"].indexOf(req.resourceType()) !== -1) {
                await req.abort();
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "somexhr") {
          try {
            page.on("request", async (req) => {
              let scriptnum = Math.floor(Math.random() * 100 + 1);
              if (
                ["xhr"].indexOf(req.resourceType()) !== -1 &&
                scriptnum % 2 === 0
              ) {
                await req.abort();
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "allimg") {
          try {
            page.on("request", async (req) => {
              if (
                ["image", "jpeg", "png", "svg", "gif", "webp"].indexOf(
                  req.resourceType()
                ) !== -1
              ) {
                await req.abort();
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "someimg") {
          try {
            page.on("request", async (req) => {
              let scriptnum = Math.floor(Math.random() * 100 + 1);
              if (
                ["image", "jpeg", "png", "svg", "gif", "webp"].indexOf(
                  req.resourceType()
                ) !== -1 &&
                scriptnum % 2 === 0
              ) {
                await req.abort();
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "allcss") {
          try {
            page.on("request", async (req) => {
              if (["stylesheet"].indexOf(req.resourceType()) !== -1) {
                await req.abort();
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "somecss") {
          try {
            page.on("request", async (req) => {
              let scriptnum = Math.floor(Math.random() * 100 + 1);
              if (
                ["stylesheet"].indexOf(req.resourceType()) !== -1 &&
                scriptnum % 2 === 0
              ) {
                await req.abort();
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "alljs") {
          try {
            page.on("request", async (req) => {
              if (["script"].indexOf(req.resourceType()) !== -1) {
                await req.abort();
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else if (type === "somejs") {
          try {
            page.on("request", async (req) => {
              let scriptnum = Math.floor(Math.random() * 100 + 1);
              if (
                ["script"].indexOf(req.resourceType()) !== -1 &&
                scriptnum % 2 === 0
              ) {
                await req.abort();
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        }

        page.on("response", async (res) => {
          try {
            // res.request().resourceType()

            setTimeout(async () => {
              const pngpath = imgurl + nowpath + "/" + type + ".png";
              await page.screenshot(
                {
                  path: pngpath,
                  fullPage: true,
                },
                {
                  delay: 3000,
                }
              );
              await browser.close();
              await imgtransfertohttp(nowurl, id, type, pngpath);
              await delay(2000);
              num = num + 1;
              if (num > tmplen - 1) {
                deleteFolder("../../" + nowpath);
                num = 0;
                requestnum = 0;
                console.log("done");
                await noticeinfo(user, id);
              } else {
                (async () => {
                  runwebfuzz(
                    tmp[num],
                    cookieString,
                    newpath,
                    nowurl,
                    id,
                    iscookie,
                    tmplen,
                    user
                  );
                })();
              }
            }, 10000);
          } catch (err) {
            await browser.close();
          }
        });

        page.on("requestfailed", async (req) => {
          try {
            setTimeout(async () => {
              const pngpath = imgurl + nowpath + "/" + type + ".png";
              await page.screenshot(
                {
                  path: pngpath,
                  fullPage: true,
                },
                {
                  delay: 3000,
                }
              );
              await browser.close();
              await imgtransfertohttp(nowurl, id, type, pngpath);
              await delay(2000);

              num = num + 1;
              if (num > tmplen - 1) {
                deleteFolder("../../" + nowpath);
                num = 0;
                requestnum = 0;
                console.log("done");
                await noticeinfo(user, id);
              } else {
                (async () => {
                  runwebfuzz(
                    tmp[num],
                    cookieString,
                    newpath,
                    nowurl,
                    id,
                    iscookie,
                    tmplen,
                    user
                  );
                })();
              }
            }, 10000);
          } catch (err) {
            await browser.close();
          }
        });
        // add cookie
        if (iscookie) {
          let urlsarr = nowurl.split("/");
          let domian;
          urlsarr.forEach((item) => {
            if (
              item.includes(".com") ||
              item.includes(".co") ||
              item.includes(".cn")
            ) {
              domian = item;
            }
          });
          if (domian.includes("www")) {
            domian = domian.slice(3, domian.length);
          } else {
            domian = "." + domian;
          }
          await addCookies(cookieString, page, domian);
        }
        // go to page
        await page.goto(nowurl, openoptions);

        await page.evaluate(`window.scrollTo({ 
            top: 1000, 
            behavior: "smooth" 
        });`);

        // close dialog
        page.on("dialog", async (dialog) => {
          await dialog.dismiss();
        });
      } catch (err) {
        console.log("err: " + err);
        await browser.close();
      }
    });
  } catch (e) {
    console.log("error: ", e);
  }
};

const runwebfuzzauto = async (
  auto,
  newcookie,
  nowpath,
  nowurl,
  id,
  iscookie,
  splitnum,
  user
) => {
  try {
    puppeteer.launch(lunchobj).then(async (browser) => {
      try {
        const page = await browser.newPage();
        ps = await browser.pages();
        await ps[0].close();
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

        let cookieString = newcookie;
        const addCookies = async (cookies_str, page, domain) => {
          let cookies = cookies_str.split(";").map((pair) => {
            let name = pair.trim().slice(0, pair.trim().indexOf("="));
            let value = pair.trim().slice(pair.trim().indexOf("=") + 1);
            return { name, value, domain };
          });
          await Promise.all(
            cookies.map((pair) => {
              return page.setCookie(pair);
            })
          );
        };

        // test onload m4s requests fail
        await page.setRequestInterception(true);
        console.log(`now type is : ${auto.type}`);
        console.log(`run = ${autonum} 's test`);
        // change change req header
        if (auto.type === "req") {
          try {
            // clear all xhr's req header data
            page.on("request", async (req) => {
              if (req.url().includes(auto.name)) {
                let newurl;
                let nowheaders = await req.headers();
                let url = await req.url();
                let reqdata = await req.postData();
                let nowpostdata;
                if (auto.header && auto.header.length > 0) {
                  auto.header.forEach((item) => {
                    nowheaders[item.key] = item.value;
                  });
                } else {
                  nowheaders = nowheaders;
                }
                if (auto.postData && auto.postData.length > 0) {
                  if (req.method() == "GET") {
                    const arr = url.split("?");
                    newurl = arr[0] + "?" + auto.postData;
                    nowpostdata = reqdata;
                  } else if (req.method() == "POST") {
                    newurl = url;
                    nowpostdata = auto.postData;
                  }
                } else {
                  newurl = url;
                  nowpostdata = reqdata;
                }
                await req.continue({
                  url: newurl,
                  headers: nowheaders,
                  postData: nowpostdata,
                });
              } else {
                await req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        } else {
          try {
            // // change xhr response data
            page.on("request", async (req) => {
              if (req.url().includes(auto.name)) {
                await req.respond({
                  status: 200,
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                  },
                  contentType: "application/json; charset=utf-8",
                  body: auto.response,
                });
              } else {
                req.continue();
              }
            });
          } catch (err) {
            await browser.close();
          }
        }

        page.on("response", async (res) => {
          try {
            if (res.url().includes(auto.name)) {
              // res.request().resourceType()
              await delay(5000);
              const pngpath =
                imgurl + nowpath + "/" + auto.type + autonum + ".png";
              await page.screenshot(
                {
                  path: pngpath,
                  fullPage: true,
                },
                {
                  delay: 3000,
                }
              );
              await browser.close();
              let auototype = auto.name + auto.type + autonum;
              await imgtransfertohttp(nowurl, id, auototype, pngpath);
              await delay(2000);
              autonum = autonum + 1;
              if (autonum > splitnum - 1) {
                deleteFolder("../../" + nowpath);
                autonum = 0;
                requestnum = 0;
                console.log("done");
                await noticeinfo(user, id);
              } else {
                (async () => {
                  runwebfuzzauto(
                    newrun[autonum],
                    cookieString,
                    newpath,
                    nowurl,
                    id,
                    iscookie,
                    nowlen,
                    user
                  );
                })();
              }
            }
          } catch (err) {
            await browser.close();
          }
        });

        // add cookie
        if (iscookie) {
          let urlsarr = nowurl.split("/");
          let domian;
          urlsarr.forEach((item) => {
            if (
              item.includes(".com") ||
              item.includes(".co") ||
              item.includes(".cn")
            ) {
              domian = item;
            }
          });
          if (domian.includes("www")) {
            domian = domian.slice(3, domian.length);
          } else {
            domian = "." + domian;
          }
          await addCookies(cookieString, page, domian);
        }
        // go to page
        await page.goto(nowurl, openoptions);

        await page.evaluate(`window.scrollTo({ 
              top: 1000, 
              behavior: "smooth" 
          });`);

        // close dialog
        page.on("dialog", async (dialog) => {
          await dialog.dismiss();
        });
      } catch (err) {
        console.log("err: " + err);
        await browser.close();
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

const imgtransfertohttp = async (nowurl, id, type, imgpath) => {
  try {
    var imgoptions = {
      method: "POST",
      url: "http://uat-activity-template.IMT.co/x/upload/files",
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
            var whereStr = {
              $and: [{ url: nowurl }, { id: id }, { type: type }],
            };
            var dbo = db.db("newproject");
            dbo
              .collection("webfuzzeach")
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
                      var whereStr = {
                        $and: [{ url: nowurl }, { id: id }, { type: type }],
                      };
                      var updateStr = {
                        $set: {
                          imgurl: pngurlresult,
                          date: formate(new Date()),
                        },
                      };
                      dbo
                        .collection("webfuzzeach")
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
                  let nowdesc;
                  //   console.log("typedescs: ", typedescs);
                  typedescs.forEach((item) => {
                    if (item.type === type) {
                      nowdesc = item.desc;
                    }
                  });
                  if (type.includes("req")) {
                    nowdesc =
                      "自定义了请求的 request ，更改了header，以及 传参。";
                  }
                  if (type.includes("res")) {
                    nowdesc = "自定义了请求的 response ，更改了responseData。";
                  }
                  // insert data urlfiles
                  MongoClient.connect(
                    mongourl,
                    { useNewUrlParser: true, useUnifiedTopology: true },
                    function (err, db) {
                      if (err) throw err;
                      var dbo = db.db("newproject");
                      var myobj = {
                        id: id,
                        url: nowurl,
                        type: type,
                        desc: nowdesc,
                        imgurl: pngurlresult,
                        date: formate(new Date()),
                      };
                      dbo
                        .collection("webfuzzeach")
                        .insertOne(myobj, function (err, res) {
                          if (err) throw err;
                          console.log("new webfuzzeach case insert done");
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
  } catch (error) {
    console.log("request: ", error);
  }
};

const noticeinfo = async (name, id) => {
  try {
    var request = require("request");
    let gotourl = "http://qa-mng.IMT.co/#/fuzzinfo?id=" + id;
    var diffimgerror = {
      method: "POST",
      url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=0e5bd910-920f-4eee-a7e2-61da2c4846a1",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msgtype: "text",
        text: {
          content:
            `客官你好，您的 fuzz 报告已经生成啦～ 请前往\n` +
            gotourl +
            `\n查看吧～\n有任何问题请联系IMT～`,
          //   mentioned_list: ["009409"],
          mentioned_mobile_list: [name],
        },
      }),
    };
    request(diffimgerror, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
    });
  } catch (error) {
    console.log("request: ", error);
  }
};

// 去除多余文件
function deleteFolder(delPath) {
  delPath = path.join(__dirname, delPath);
  try {
    if (fs.existsSync(delPath)) {
      const delFn = function (address) {
        const files = fs.readdirSync(address);
        for (let i = 0; i < files.length; i++) {
          const dirPath = path.join(address, files[i]);
          if (fs.statSync(dirPath).isDirectory()) {
            delFn(dirPath);
          } else {
            deleteFile(dirPath, true);
          }
        }
        /**
         * @des 只能删空文件夹
         */
        fs.rmdirSync(address);
      };
      delFn(delPath);
    } else {
      console.log("do not exist: ", delPath);
    }
  } catch (error) {
    console.log("del folder error", error);
  }
}
function deleteFile(delPath, direct) {
  delPath = direct ? delPath : path.join(__dirname, delPath);
  try {
    /**
     * @des 判断文件或文件夹是否存在
     */
    if (fs.existsSync(delPath)) {
      fs.unlinkSync(delPath);
    } else {
      console.log("inexistence path：", delPath);
    }
  } catch (error) {
    console.log("del error", error);
  }
}

const insertdata = async (req) => {
  // insert data urlfiles
  return new Promise((res, rej) => {
    try {
      console.log("start get");
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var mysort = { date: -1 };
          var whereStr = { id: req.id };
          var dbo = db.db("newproject");
          dbo
            .collection("webfuzzmain")
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
                    var whereStr = { id: req.id };
                    var updateStr = {
                      $set: {
                        url: req.url,
                        iscookie: req.iscookie,
                        isauto: req.isauto,
                        tooglechange: req.tooglechange,
                        editor: req.user,
                        cookie: req.cookie,
                        checkedchocie: req.checkchoose,
                        getways: req.getways,
                        tel: req.tel,
                        date: formate(new Date()),
                      },
                    };
                    dbo
                      .collection("webfuzzmain")
                      .updateOne(whereStr, updateStr, function (err, result) {
                        if (err) {
                          return err;
                        } else {
                          db.close();
                          res(result);
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
                      id: req.id,
                      url: req.url,
                      iscookie: req.iscookie,
                      isauto: req.isauto,
                      tooglechange: false,
                      creater: req.user,
                      editor: req.user,
                      cookie: req.cookie,
                      checkedchocie: req.checkchoose,
                      getways: req.getways,
                      tel: req.tel,
                      date: formate(new Date()),
                    };
                    dbo
                      .collection("webfuzzmain")
                      .insertOne(myobj, function (err, result) {
                        if (err) throw err;
                        console.log("new webfuzz insert done");
                        res(result);
                        db.close();
                      });
                  }
                );
              }
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

const updatemiandata = async (req) => {
  // insert data urlfiles
  return new Promise((res, rej) => {
    try {
      console.log("start get");
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var dbo = db.db("newproject");
          var whereStr = { id: req.id };
          var updateStr = {
            $set: {
              editor: req.user,
              date: formate(new Date()),
            },
          };
          dbo
            .collection("webfuzzmain")
            .updateOne(whereStr, updateStr, function (err, result) {
              if (err) {
                return err;
              } else {
                db.close();
                res(result);
                console.log("update ok");
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
const getfuzzdatafromdb = (req) => {
  if (req.searchtype === 1) {
    var whereStr,
      createrstr,
      editorstr,
      cookievaluestr,
      autovaluestr,
      tooglevaluestr;
    console.log("start get");
    if (req.creater && req.creater.length > 0) {
      createrstr = { creater: req.creater };
    } else {
      createrstr = {};
    }
    if (req.editor && req.editor.length > 0) {
      editorstr = { editor: req.editor };
    } else {
      editorstr = {};
    }
    if (req.cookievalue.length === 0) {
      cookievaluestr = {};
    } else {
      cookievaluestr = { iscookie: req.cookievalue };
    }

    if (req.autovalue.length === 0) {
      autovaluestr = {};
    } else {
      autovaluestr = { isauto: req.autovalue };
    }

    if (req.tooglevalue.length === 0) {
      tooglevaluestr = {};
    } else {
      tooglevaluestr = { tooglechange: req.tooglevalue };
    }

    whereStr = {
      $and: [
        createrstr,
        editorstr,
        cookievaluestr,
        autovaluestr,
        tooglevaluestr,
      ],
    };
    // console.log("whereStr: ", whereStr);
    return new Promise((res, rej) => {
      try {
        console.log("start get");
        MongoClient.connect(
          mongourl,
          { useNewUrlParser: true, useUnifiedTopology: true },
          function (err, db) {
            if (err) throw err;
            var dbo = db.db("newproject");
            var mysort = { id: -1 };
            dbo
              .collection("webfuzzmain")
              .find(whereStr)
              .sort(mysort)
              .toArray(function (err, result) {
                if (err) {
                  return err;
                } else {
                  db.close();
                  // console.log(result[0].url);
                  //   console.log(result);
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
  } else {
    return new Promise((res, rej) => {
      try {
        console.log("start get");
        MongoClient.connect(
          mongourl,
          { useNewUrlParser: true, useUnifiedTopology: true },
          function (err, db) {
            if (err) throw err;
            var dbo = db.db("newproject");
            var mysort = { id: -1 };
            dbo
              .collection("webfuzzmain")
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
  }
};

const getfuzzinfodatafromdb = (req) => {
  return new Promise((res, rej) => {
    try {
      console.log("start get");
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var mysort = { date: -1 };
          var whereStr = {
            id: req.id,
          };
          var dbo = db.db("newproject");
          dbo
            .collection("webfuzzeach")
            .find(whereStr)
            .sort(mysort)
            .toArray(function (err, result) {
              if (err) throw err;
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

const getallfuzzdatafromdb = () => {
  return new Promise((res, rej) => {
    try {
      console.log("start get");
      MongoClient.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var dbo = db.db("newproject");
          var mysort = { id: -1 };
          dbo
            .collection("webfuzzmain")
            .find()
            .sort(mysort)
            .toArray(function (err, result) {
              if (err) {
                return err;
              } else {
                if (result.length > 0) {
                  db.close();
                  // console.log(result[0].url);
                  // console.log(result.length);
                  res(result[0].id + 1); // 返回的对象是个 Array
                  console.log("End search");
                } else {
                  res(1);
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

const getwebfuzz = async (ctx, next) => {
  try {
    console.log("start edit");
    const req = ctx.request.body;

    const nowid = await getallfuzzdatafromdb().then((data) => {
      return data;
    });

    const nowfuzzresultdata = await getfuzzdatafromdb(req).then((data) => {
      return data;
    });
    if (nowfuzzresultdata) {
      var finalobj = {
        code: "200",
        msg: "success",
        data: nowfuzzresultdata,
        nextid: nowid,
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

const insertwebfuzz = async (ctx, next) => {
  try {
    console.log("start edit");
    const req = ctx.request.body;
    const webfuzzresultdata = await insertdata(req).then((data) => {
      return data;
    });

    if (webfuzzresultdata) {
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

let num = 0;
let autonum = 0;
let requestnum = 0;
let tmp = [];
let nowurl;
let id;
let isauto;
let iscookie;
let cookieString;
let tmplen;
let newpath;
let newrun = [];
let getways = [];
let nowlen;
let user;
const webfuzzrun = async (ctx, next) => {
  try {
    console.log("requestnum: ", requestnum);
    if (requestnum > 0) {
      var finalobj = {
        code: "400",
        msg: "webfuzz请求不可频繁发送",
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
      const req = ctx.request.body;
      tmp = req.checkedchocie;
      nowurl = req.url;
      id = req.id;
      isauto = req.isauto;
      iscookie = req.iscookie;
      cookieString = req.cookie;
      getways = req.getways;
      tmplen = tmp.length;
      user = req.tel;
      if (num === 0 || autonum === 0) {
        newpath = formatymd(new Date());
        fs.mkdir(imgurl + newpath, function (err) {
          if (err) {
            return console.error(err);
          }
          console.log("目录创建成功。");
        });
      }
      if (isauto) {
        getways.forEach((item) => {
          let newreqobj = {},
            newewsobj = {};
          newreqobj.name = item.name;
          newreqobj.header = item.header;
          newreqobj.postData = item.postData;
          newreqobj["type"] = "req";
          newewsobj.name = item.name;
          newewsobj.response = item.response;
          newewsobj["type"] = "res";
          newrun.push(newreqobj);
          newrun.push(newewsobj);
        });
        nowlen = newrun.length;
        requestnum = 1;
        console.log("start run");

        (async () => {
          runwebfuzzauto(
            newrun[autonum],
            cookieString,
            newpath,
            nowurl,
            id,
            iscookie,
            nowlen,
            user
          );
        })();
        await updatemiandata(req).then((data) => {
          return data;
        });
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
      } else {
        requestnum = 1;
        console.log("start run");
        (async () => {
          runwebfuzz(
            tmp[num],
            cookieString,
            newpath,
            nowurl,
            id,
            iscookie,
            tmplen,
            user
          );
        })();
        await updatemiandata(req).then((data) => {
          return data;
        });
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
    }
  } catch (e) {
    console.log(e + "//////////");
    ctx.body = {
      code: 404,
      msg: "服务解析失败，请联系IMT检查服务且稍后再试",
    };
  }
};

const getfuzzinfo = async (ctx, next) => {
  try {
    console.log("start edit");
    const req = ctx.request.body;

    const nowfuzzinfodata = await getfuzzinfodatafromdb(req).then((data) => {
      return data;
    });
    if (nowfuzzinfodata) {
      var finalobj = {
        code: "200",
        msg: "success",
        data: nowfuzzinfodata,
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
  insertwebfuzz, // insert webfuzz
  getwebfuzz, // get data
  webfuzzrun, // run webfuzz
  getfuzzinfo,
};
