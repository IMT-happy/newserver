var request = require("request");
let gotourl = "http://qa-mng.bilibili.co/#/fuzzinfo?id=";
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
        `这位客官，您的 fuzz 报告已经生成，\n请前往` + gotourl + `进行查看`,
      //   mentioned_list: ["009409"],
      mentioned_mobile_list: ["18327863706"],
    },
  }),
};
request(diffimgerror, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
