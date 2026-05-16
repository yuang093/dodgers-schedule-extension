const DODGERS_TEAM_ID = 119;

// 將時間從 UTC 轉換為台灣時間
function convertToTaiwanTime(utcTimeStr) {
    try {
        const utcDate = new Date(utcTimeStr);
        const taiwanTimeStr = utcDate.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Taipei',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const taiwanDateStr = utcDate.toLocaleDateString('en-CA', {
            timeZone: 'Asia/Taipei'
        });
        return { date: taiwanDateStr, time: taiwanTimeStr };
    } catch (e) {
        console.error('Error converting time:', e);
        return { date: '待定', time: '待定' };
    }
}

// 獲取日期範圍 (前5天到後2天)
function getScheduleDates() {
    const today = new Date();
    const dates = [];
    for (let i = -5; i < 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

// 從 MLB API 獲取比賽資料
async function fetchDodgersSchedule() {
    const dates = getScheduleDates();
    const baseUrl = "https://statsapi.mlb.com/api/v1/schedule";

    // 並行抓取所有日期的資料
    const promises = dates.map(async (date) => {
        const params = new URLSearchParams({
            sportId: 1,
            teamId: DODGERS_TEAM_ID,
            date: date,
            hydrate: 'game(content(summary)),linescore'
        });
        try {
            const response = await fetch(`${baseUrl}?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (e) {
            console.error(`獲取 ${date} 資料時出錯：`, e);
            return { dates: [] };
        }
    });

    // 等待所有請求完成
    const allData = await Promise.all(promises);

    // 整理所有比賽資料
    let scheduleData = [];
    for (const data of allData) {
        for (const gameDate of data.dates || []) {
            for (const game of gameDate.games || []) {
                const { date: gameDateTw, time: gameTimeTw } = convertToTaiwanTime(game.gameDate);
                const gameInfo = {
                    date: gameDateTw,
                    home_team: game.teams.home.team.name,
                    away_team: game.teams.away.team.name,
                    time: gameTimeTw,
                    status: game.status.detailedState,
                    score: '0-0',
                    inning: '第1局',
                    raw_status: game.status.detailedState
                };

                if (game.status.detailedState === 'In Progress') {
                    const linescore = game.linescore || {};
                    const inning = linescore.currentInning || 'N/A';
                    const inningState = linescore.inningState || 'N/A';
                    if (inningState === 'Top') {
                        gameInfo.inning = `第${inning}局上`;
                    } else if (inningState === 'Bottom' || inningState === 'Middle') {
                        gameInfo.inning = `第${inning}局下`;
                    } else {
                        gameInfo.inning = `第${inning}局`;
                    }
                    gameInfo.score = `${linescore.teams?.away?.runs || 0}-${linescore.teams?.home?.runs || 0}`;
                } else if (['Final', 'Game Over', 'Completed Early'].includes(game.status.detailedState)) {
                    gameInfo.score = `${game.teams.away.score}-${game.teams.home.score}`;
                    gameInfo.inning = '結束';
                }
                scheduleData.push(gameInfo);
            }
        }
    }
    return scheduleData;
}

// 從 MLB API 獲取道奇隊戰績排名
async function fetchDodgersStandings() {
    try {
        const params = new URLSearchParams({
            sportId: 1,
            leagueId: 103,
            divisionId: 203,
            date: new Date().toISOString().split('T')[0]
        });
        const response = await fetch(`https://statsapi.mlb.com/api/v1/standings?${params}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const records = data.records;
        if (records && records.length > 0 && records[0].teamRecords && records[0].teamRecords.length > 0) {
            const teamRecords = records[0].teamRecords.find(r => r.team && r.team.id === DODGERS_TEAM_ID);
            if (teamRecords) {
                return {
                    rank: teamRecords.leagueRank || teamRecords.divisionRank || 'N/A',
                    wins: teamRecords.wins || 0,
                    losses: teamRecords.losses || 0,
                    pct: teamRecords.pct ? String(teamRecords.pct).slice(0, 4) : '.000'
                };
            }
        }
        return null;
    } catch (e) {
        console.error('獲取排名時出錯：', e);
        return null;
    }
}

// 更新資料並儲存
async function updateSchedule() {
    console.log("正在更新賽程...");
    try {
        const scheduleData = await fetchDodgersSchedule();
        const standingsData = await fetchDodgersStandings();
        const lastUpdated = new Date().toISOString();
        chrome.storage.local.set({ scheduleData, standingsData, lastUpdated });
        console.log("賽程更新完畢並已儲存。");
    } catch (error) {
        console.error("更新賽程失敗:", error);
    }
}

// 離線模式快取
const CACHE_NAME = 'dodgers-schedule-cache-v1';
const CACHE_KEY = 'offline-schedule-data';

async function cacheScheduleData() {
    try {
        const scheduleData = await fetchDodgersSchedule();
        const standingsData = await fetchDodgersStandings();
        const data = {
            scheduleData,
            standingsData,
            cachedAt: new Date().toISOString()
        };
        await chrome.storage.local.set({ cachedData: data });
        console.log("賽程資料已快取用於離線使用。");
    } catch (error) {
        console.error("快取賽程失敗:", error);
    }
}

// 監聽鬧鐘
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'scheduleUpdate') {
        updateSchedule();
        cacheScheduleData();
    }
});

// 擴充功能安裝或啟動時
chrome.runtime.onInstalled.addListener(() => {
    console.log("擴充功能已安裝/更新。");
    // 立即執行一次更新
    updateSchedule();
    cacheScheduleData();
    // 設定每 10 分鐘更新一次的鬧鐘
    chrome.alarms.create('scheduleUpdate', {
        delayInMinutes: 1,
        periodInMinutes: 10
    });
});

chrome.runtime.onStartup.addListener(() => {
    console.log("瀏覽器啟動。");
    updateSchedule();
    cacheScheduleData();
});