# 回归测试脚本

前提：仓库根目录起本地服务 `python -m http.server 8765 --bind 127.0.0.1`，
并在本目录 `npm install playwright --no-save`，浏览器用本机 Chrome：

```bash
CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" \
node runtime-check.js http://127.0.0.1:8765/ local
```

| 脚本 | 覆盖范围 |
|---|---|
| `runtime-check.js` | 首屏、答题、解析渲染、考试入口、控制台/网络错误、性能 |
| `full-test.js` | 科目筛选、知识点面板、错题本、错题重做、智能复习、考试与返回、主题、CSV 导出 |
| `multi-test.js` | 多选（逗号答案）判定是否正确 |
| `search-test.js` | 题目搜索与跳转 |
| `exam-test.js` | 模拟考试逐题作答、交卷、成绩页 |
| `exit-test.js` | 考试中途退出后题库与进度恢复 |

报告写入 `reports/<tag>/report.json` 与截图。
