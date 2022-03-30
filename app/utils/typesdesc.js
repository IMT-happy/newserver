/*
 * IMT-project
 */
module.exports = [
  { type: "allheader", desc: "fuzz 破坏了全部请求的 header " },
  { type: "someheader", desc: "fuzz 随机破坏了部分请求的 header " },
  { type: "allquerydata", desc: "fuzz 破坏了全部请求的 postData " },
  { type: "somequerydata", desc: "fuzz 随机破坏了部分请求的 postData " },
  {
    type: "mainresponse",
    desc: "fuzz 破坏主进程请求的，篡改了response 返回体 ",
  },
  { type: "allresponse", desc: "fuzz 破坏了全部请求的 response " },
  { type: "someresponse", desc: "fuzz 随机破坏了部分请求的 response " },
  { type: "allxhr", desc: "fuzz 破坏了全部xhr请求 " },
  { type: "somexhr", desc: "fuzz 随机破坏了部分xhr请求的" },
  { type: "allimg", desc: "fuzz 破坏全部img，png，gif，svg，webp 资源文件 " },
  {
    type: "someimg",
    desc: "fuzz 随机破坏了部分img，png，gif，svg，webp 资源文件 ",
  },
  { type: "allcss", desc: "fuzz 破坏了全部css文件" },
  { type: "somecss", desc: "fuzz 随机破坏了部分css文件" },
  { type: "alljs", desc: "fuzz 破坏全部js请求" },
  { type: "somejs", desc: "fuzz 随机破坏了部分js 请求" },
];
