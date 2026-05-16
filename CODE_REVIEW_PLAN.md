# Dodgers Schedule Extension - 程式碼審查與修改藍圖

## 一、程式碼邏輯驗證

### 驗證結果

| 檔案 | 項目 | 狀態 | 說明 |
|------|------|------|------|
| background.js | 時區轉換 | ✅ | UTC 轉換邏輯正確 |
| background.js | 日期範圍計算 | ⚠️ | **Bug**: `date.setDate(today.getDate() + i)` 應改為 `date.setDate(date.getDate() + i)` |
| background.js | API 呼叫 | ⚠️ | **需優化**: 循序呼叫改為並行動作 (Promise.all) |
| background.js | 錯誤處理 | ⚠️ | catch 區塊過於簡單，無錯誤類型區分 |
| popup.js | 隊徽路徑 | ✅ | 邏輯正確 |
| popup.js | 勝負判斷 | ✅ | `isDodgersWin` 邏輯正確 |
| popup.js | currentGame 查找 | ⚠️ | **需優化**: 邏輯複雜，可簡化 |
| popup.js | XSS 風險 | ⚠️ | **安全問題**: innerHTML 未 escape |
| popup.js | 記憶體洩漏 | ⚠️ | setInterval 未在 close 時清除 |
| popup.js | 載入狀態 | ⚠️ | 無 spinner 視覺化 |
| manifest.json | HTTPS | ⚠️ | 建議使用 https://statsapi.mlb.com |
| popup.css | 響應式 | ⚠️ | 固定 780px，無響應式設計 |
| popup.css | 字體大小 | ⚠️ | 10px 過小 |
| popup.css | 深色模式 | ❌ | 無深色模式 |

---

## 二、發現的問題

### 1. background.js

#### Bug: 日期迴圈計算錯誤 (Line 29)
```javascript
// 錯誤
date.setDate(today.getDate() + i);
// 正確
date.setDate(date.getDate() + i);
```

#### 優化: API 並行抓取
```javascript
// 當前：循序呼叫（慢）
for (const date of dates) { await fetch(...) }

// 建議：並行呼叫（快）
const promises = dates.map(date => fetch(...));
const results = await Promise.all(promises);
```

### 2. popup.js

#### 問題: XSS 漏洞 (Line 123)
```javascript
// 當前（危險）
row.innerHTML = `<td>${game.date}</td><td>${opponentChinese}</td>...`;

// 建議（安全）
row.textContent = game.date;
// 或使用 DOM 方法
```

#### 問題: setInterval 未清除
```javascript
// 當前：建立後不清除
setInterval(updateTime, 1000);
setInterval(updateCountdown, 1000);

// 建議：在監聽 beforeunload 時清除
window.addEventListener('beforeunload', () => {
    clearInterval(timeInterval);
    clearInterval(countdownInterval);
});
```

### 3. popup.css

| 問題 | 當前 | 建議 |
|------|------|------|
| 寬度 | 780px 固定 | max-width: 100% |
| 字體 | 10px 太小 | 14px 基準 |
| 深色模式 | 無 | 新增深色主題 |
| 動畫 | 無 | 加入過渡動畫 |

---

## 三、修改計畫

### Phase 1: 邏輯修正（低風險）
1. 修正 `date.setDate()` Bug
2. 修正 XSS 漏洞（使用 textContent）
3. 修正 API 使用 HTTPS

### Phase 2: 效能優化（中風險）
1. API 並行抓取
2. setInterval 清除機制

### Phase 3: UI 美化（高風險）
1. 深色主題
2. 圓角卡片
3. 隊徽圓形裁切
4. 載入 spinner
5. 響應式設計

---

## 四、推薦新增功能

| 功能 | 優先級 | 說明 |
|------|--------|------|
| **下一場比賽倒數** | 高 | 顯示距離下一場比賽的時間 |
| **賽季戰績顯示** | 高 | 顯示目前戰績 (W-L) |
| **比賽提醒** | 中 | 比賽前 N 分鐘發送通知 |
| **深色/淺色切換** | 中 | 用戶可自行切換主題 |
| **球隊排名** | 低 | 顯示國聯西區排名 |
| **分享功能** | 低 | 分享比賽結果 |
| **離線模式** | 低 | 快取最近資料，無網路時仍可查看 |

### 功能詳細說明

#### 1. 下一場比賽倒數
- 計算距離下一場比賽的時間
- 顯示「距離下一場：2天 3小時 45分」
- 比賽當天顯示「比賽即將開始！」

#### 2. 賽季戰績顯示
- 從 API 取得或本地計算
- 顯示格式：「戰績: 65-45」
- 顯示勝率：「勝率: .591」

#### 3. 比賽提醒 (Notification)
- 用戶可開啟/關閉提醒
- 比赛前 15 分鐘發送
- 使用 Chrome Notification API

#### 4. 深色/淺色切換
- 檢測系統偏好 (prefers-color-scheme)
- 提供手動切換按鈕
- 記住用戶選擇 (storage.local)

#### 5. 球隊排名
- 顯示國聯西區排名
- 包含勝敗場和勝率

#### 6. 分享功能
- 點擊分享按鈕
- 複製比賽結果到剪貼簿
- 格式：「道奇 vs 巨人 5-3 獲勝！🏆」

#### 7. 離線模式
- 快取最近一次的比賽資料
- 無網路時顯示「離線模式」
- 標記資料時間

---

## 五、驗證清單

| 驗證項目 | 預期結果 |
|---------|---------|
| API 串列改並列 | 抓取速度提升 |
| XSS 修正 | 特殊字元正常顯示 |
| setInterval 清除 | 無記憶體洩漏 |
| 深色模式 | 切換正常 |
| 響應式 | 300px ~ 780px 都能正常顯示 |
| 載入 spinner | 等待時顯示動畫 |
| 隊徽顯示 | 對手隊徽正確顯示 |
| 倒數功能 | 正確計算距離下一場 |
| 提醒功能 | 比賽前通知 |
| 分享功能 | 正確複製到剪貼簿 |