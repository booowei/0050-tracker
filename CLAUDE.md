# CLAUDE.md — 0050 成分股追蹤站

## 專案目的
追蹤元大台灣50(0050)成分股的財報與籌碼資料,以靜態網站呈現,部署於 GitHub Pages。
僅供學習與資料整理,不構成投資建議,每個頁面頁尾必須有此免責聲明。

## 技術限制
- 純靜態:HTML + CSS + 原生 JavaScript,不使用後端、不使用建置工具。
- 圖表使用 Chart.js(CDN 引入)。
- 資料更新由 `scripts/` 的 Python 腳本產生 JSON,網頁只負責讀取 `data/*.json` 並顯示。
- 網頁中不可寫死任何財務數字,一律從 JSON 讀取。

## 目錄結構
```
index.html            首頁:0050 成分股總覽表(可排序)
stock.html            個股頁,以 ?code=2330 讀取對應資料
css/style.css         全站共用樣式
js/                   app.js(總覽)、stock.js(個股)、utils.js
data/
  constituents.json   成分股清單(代號、名稱、權重、產業)
  financials/<代號>.json   個股財報(季度)
  chips/<代號>.json        個股籌碼(三大法人、融資融券)
  meta.json           資料更新時間與來源
scripts/              fetch_*.py 資料抓取腳本
CLAUDE.md             本文件
```

## 設計風格
- 簡潔深色或淺色擇一,全站一致;主色一種、強調色一種。
- 台股慣例:**紅色代表上漲/買超,綠色代表下跌/賣超**,不可反過來。
- 手機優先的響應式排版,表格過寬時可橫向捲動。
- 繁體中文介面,數字加千分位,金額單位明確標示(億元/千股)。

## 資料格式規範
個股財報 `data/financials/<代號>.json`:
```json
{ "code": "2330", "name": "台積電", "quarters": [
  { "period": "2025Q2", "revenue": 0, "gross_margin": 0, "net_income": 0, "eps": 0 }
] }
```
個股籌碼 `data/chips/<代號>.json`:
```json
{ "code": "2330", "daily": [
  { "date": "2026-11-14", "foreign": 0, "investment_trust": 0, "dealer": 0 }
] }
```
- 日期一律 `YYYY-MM-DD`,季度一律 `YYYYQn`。
- 缺資料用 `null`,不可填 0 或自行估算。
- 每次更新資料都要同步更新 `data/meta.json` 的 `updated_at` 與 `source`。

## 命名與放置規則
- 檔名一律小寫英文與連字號,個股資料以股票代號命名。
- 新增 JS 功能放 `js/`,不得把大段 script 寫在 HTML 內。
- 樣式只改 `css/style.css`,不使用 inline style。

## 新增內容的流程
**新增一個指標(如本益比):**
1. 在 `scripts/` 對應腳本加入欄位並重新產生 JSON。
2. 在 `stock.js` 新增顯示區塊,沿用現有卡片/圖表元件。
3. 更新本文件的資料格式規範。

**新增一個頁面(如產業分類頁):**
1. 複製 `index.html` 作為骨架,保留共用導覽列與頁尾免責聲明。
2. 在所有頁面導覽列加入連結。
3. 在本文件的目錄結構補上該頁。

**成分股調整:** 只修改 `data/constituents.json` 並補對應的財報與籌碼 JSON,不需改程式。

## AI 修改時須遵守
- 不得捏造或估算財務數據;資料不確定時標示 `null` 並說明。
- 修改前先閱讀本文件與相關檔案,改動後確認頁面可正常開啟。
- 不更動既有風格與命名慣例;若必須更動,先更新本文件。
- 資料來源以公開資訊為準(臺灣證券交易所、公開資訊觀測站、FinMind 等),並在 `meta.json` 註明。
