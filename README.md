## 启动

```
npm install

node app.js
```

## 源码目录介绍

```
├── app                        // 主项目目录
│   ├── controllerts            // 控制器目录
│   │   └── ...                // 各个表对应的控制器
│   ├── middleware             // 中间件目录
│   │   └── resFormat.js       // 格式化返回值（我目前没用）
│   └── utils                  // 工具库
│   │   ├── formatDate.js      // 时间格式化
│   │   └── passport.js        // 用户密码加密和验证工具
├── db                  // 数据库导出的 json 文件
├── routes                     // 路由目录
│   └── api                    // 接口目录
│   │   ├── course_router.js   // 相关接口
├── app.js                     // 项目入口
└── config.js                  // 基础配置信息
```
