# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個 Chrome 擴充功能，用於顯示 MLB 洛杉磯道奇隊的即時賽程與比分。

## 技術架構

```
dodgers-schedule-extension/
├── manifest.json      # 擴充功能設定檔 (Manifest V3)
├── background.js      # Service Worker - 負責資料更新與鬧鐘排程
├── popup.html         # 彈出視窗 HTML
├── popup.js           # 彈出視窗邏輯
├── popup.css          # 樣式
└── img/               # 球隊隊徽圖片 (MLB team IDs)
```

## 資料流程

1. **background.js** - Service Worker
   - 每 10 分鐘自動更新一次資料
   - 從 MLB API (`statsapi.mlb.com`) 抓取道奇隊賽程
   - 將資料存入 `chrome.storage.local`

2. **popup.js** - UI 層
   - 從 storage 讀取資料並顯示
   - 監聽 storage 變化即時更新 UI
   - 顯示隊徽、比賽時間、比分、狀態

## 重要常量

| 常量 | 值 | 說明 |
|------|-----|------|
| `DODGERS_TEAM_ID` | 119 | 道奇隊 MLB ID |
| `API_URL` | statsapi.mlb.com | MLB API 端點 |
| `UPDATE_INTERVAL` | 10 分鐘 | 自動更新頻率 |

## 開發指令

載入此擴充功能：
1. 開啟 Chrome → `chrome://extensions/`
2. 開啟「開發者模式」
3. 點擊「載入未封裝項目」
4. 選擇此資料夾

測試 API：
```bash
curl "https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&date=2025-07-03&hydrate=game(content(summary)),linescore"
```

## 球隊 ID 對照

球隊圖片使用 MLB 官方 team ID：
- 道奇：119
- 洋基：147
- 巨人：137
- 等等...

圖片檔案格式：`img/{teamId}.png