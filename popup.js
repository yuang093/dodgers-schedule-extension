document.addEventListener('DOMContentLoaded', function () {
    const TEAM_NAME_MAPPING = {
        'Los Angeles Dodgers': '洛杉磯道奇',
        'New York Yankees': '紐約洋基',
        'Boston Red Sox': '波士頓紅襪',
        'Chicago Cubs': '芝加哥小熊',
        'Chicago White Sox': '芝加哥白襪',
        'San Francisco Giants': '舊金山巨人',
        'New York Mets': '紐約大都會',
        'Houston Astros': '休士頓太空人',
        'Los Angeles Angels': '洛杉磯天使',
        'Philadelphia Phillies': '費城費城人',
        'Atlanta Braves': '亞特蘭大勇士',
        'St. Louis Cardinals': '聖路易紅雀',
        'Toronto Blue Jays': '多倫多藍鳥',
        'Minnesota Twins': '明尼蘇達雙城',
        'Cleveland Guardians': '克利夫蘭守護者',
        'Seattle Mariners': '西雅圖水手',
        'Tampa Bay Rays': '坦帕灣光芒',
        'Texas Rangers': '德州遊騎兵',
        'Detroit Tigers': '底特律老虎',
        'Baltimore Orioles': '巴爾的摩金鶯',
        'Milwaukee Brewers': '密爾沃基釀酒人',
        'San Diego Padres': '聖地牙哥教士',
        'Cincinnati Reds': '辛辛那提紅人',
        'Pittsburgh Pirates': '匹茲堡海盜',
        'Oakland Athletics': '奧克蘭運動家',
        'Kansas City Royals': '堪薩斯城皇家',
        'Washington Nationals': '華盛頓國民',
        'Miami Marlins': '邁阿密馬林魚',
        'Arizona Diamondbacks': '亞利桑那響尾蛇',
        'Colorado Rockies': '科羅拉多洛磯'
    };

    const TEAM_ID_MAPPING = {
        'Los Angeles Dodgers': 119, 'New York Yankees': 147, 'Boston Red Sox': 111, 'Chicago Cubs': 112,
        'Chicago White Sox': 145, 'San Francisco Giants': 137, 'New York Mets': 121, 'Houston Astros': 117,
        'Los Angeles Angels': 108, 'Philadelphia Phillies': 143, 'Atlanta Braves': 144, 'St. Louis Cardinals': 138,
        'Toronto Blue Jays': 141, 'Minnesota Twins': 142, 'Cleveland Guardians': 114, 'Seattle Mariners': 136,
        'Tampa Bay Rays': 139, 'Texas Rangers': 140, 'Detroit Tigers': 116, 'Baltimore Orioles': 110,
        'Milwaukee Brewers': 158, 'San Diego Padres': 135, 'Cincinnati Reds': 113, 'Pittsburgh Pirates': 134,
        'Oakland Athletics': 133, 'Kansas City Royals': 118, 'Washington Nationals': 120, 'Miami Marlins': 146,
        'Arizona Diamondbacks': 109, 'Colorado Rockies': 115
    };

    // 反向映射：teamId → teamName
    const TEAM_ID_TO_NAME = Object.fromEntries(
        Object.entries(TEAM_ID_MAPPING).map(([name, id]) => [id, name])
    );

    // 分區映射：teamId → { leagueId, divisionId, divisionName }
    const TEAM_DIVISION_MAPPING = {
        // 國聯西區 (203)
        119: { leagueId: 104, divisionId: 203, divisionName: '國聯西區' }, // Dodgers
        137: { leagueId: 104, divisionId: 203, divisionName: '國聯西區' }, // Giants
        135: { leagueId: 104, divisionId: 203, divisionName: '國聯西區' }, // Padres
        109: { leagueId: 104, divisionId: 203, divisionName: '國聯西區' }, // Diamondbacks
        115: { leagueId: 104, divisionId: 203, divisionName: '國聯西區' }, // Rockies
        // 國聯東區 (204)
        144: { leagueId: 104, divisionId: 204, divisionName: '國聯東區' }, // Braves
        143: { leagueId: 104, divisionId: 204, divisionName: '國聯東區' }, // Phillies
        121: { leagueId: 104, divisionId: 204, divisionName: '國聯東區' }, // Mets
        146: { leagueId: 104, divisionId: 204, divisionName: '國聯東區' }, // Marlins
        120: { leagueId: 104, divisionId: 204, divisionName: '國聯東區' }, // Nationals
        // 國聯中區 (205)
        138: { leagueId: 104, divisionId: 205, divisionName: '國聯中區' }, // Cardinals
        112: { leagueId: 104, divisionId: 205, divisionName: '國聯中區' }, // Cubs
        113: { leagueId: 104, divisionId: 205, divisionName: '國聯中區' }, // Reds
        134: { leagueId: 104, divisionId: 205, divisionName: '國聯中區' }, // Pirates
        158: { leagueId: 104, divisionId: 205, divisionName: '國聯中區' }, // Brewers
        // 美聯西區 (200)
        117: { leagueId: 103, divisionId: 200, divisionName: '美聯西區' }, // Astros
        136: { leagueId: 103, divisionId: 200, divisionName: '美聯西區' }, // Mariners
        108: { leagueId: 103, divisionId: 200, divisionName: '美聯西區' }, // Angels
        133: { leagueId: 103, divisionId: 200, divisionName: '美聯西區' }, // Athletics
        145: { leagueId: 103, divisionId: 200, divisionName: '美聯西區' }, // White Sox
        // 美聯東區 (201)
        147: { leagueId: 103, divisionId: 201, divisionName: '美聯東區' }, // Yankees
        111: { leagueId: 103, divisionId: 201, divisionName: '美聯東區' }, // Red Sox
        141: { leagueId: 103, divisionId: 201, divisionName: '美聯東區' }, // Blue Jays
        110: { leagueId: 103, divisionId: 201, divisionName: '美聯東區' }, // Orioles
        139: { leagueId: 103, divisionId: 201, divisionName: '美聯東區' }, // Rays
        // 美聯中區 (202)
        114: { leagueId: 103, divisionId: 202, divisionName: '美聯中區' }, // Guardians
        142: { leagueId: 103, divisionId: 202, divisionName: '美聯中區' }, // Twins
        116: { leagueId: 103, divisionId: 202, divisionName: '美聯中區' }, // Tigers
        118: { leagueId: 103, divisionId: 202, divisionName: '美聯中區' }, // Royals
        140: { leagueId: 103, divisionId: 202, divisionName: '美聯中區' }  // Rangers
    };

    const STATUS_MAPPING = {
        'Scheduled': '預定', 'In Progress': '比賽中', 'Final': '比賽結束', 'Game Over': '比賽結束',
        'Completed Early': '比賽結束', 'Postponed': '延期', 'Suspended': '暫停', 'Cancelled': '取消',
        'Warmup': '熱身中', 'Delayed': '延遲'
    };

    // 目前選定的球隊
    let currentSelectedTeamId = 119;
    let currentSelectedTeamName = 'Los Angeles Dodgers';

    // ========== 球隊選擇功能 ==========

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
            return { date: '待定', time: '待定' };
        }
    }

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

    async function fetchTeamSchedule(teamId, teamName) {
        const dates = getScheduleDates();
        const baseUrl = "https://statsapi.mlb.com/api/v1/schedule";

        const promises = dates.map(async (date) => {
            const params = new URLSearchParams({
                sportId: 1,
                teamId: teamId,
                date: date,
                hydrate: 'game(content(summary)),linescore'
            });
            try {
                const response = await fetch(`${baseUrl}?${params}`);
                if (!response.ok) return { dates: [] };
                return await response.json();
            } catch (e) {
                return { dates: [] };
            }
        });

        const allData = await Promise.all(promises);

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
                        raw_status: game.status.detailedState,
                        homeLeagueRecord: game.teams.home.leagueRecord,
                        awayLeagueRecord: game.teams.away.leagueRecord
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

    async function fetchTeamStandings(teamId) {
        const teamIdNum = parseInt(teamId);
        const divisionInfo = TEAM_DIVISION_MAPPING[teamIdNum];
        if (!divisionInfo) return null;

        try {
            const params = new URLSearchParams({
                sportId: 1,
                leagueId: divisionInfo.leagueId,
                divisionId: divisionInfo.divisionId,
                hydrate: 'team'
            });
            const response = await fetch(`https://statsapi.mlb.com/api/v1/standings?${params}`);

            if (!response.ok) return null;

            const data = await response.json();

            for (const record of data.records || []) {
                for (const teamRecord of record.teamRecords || []) {
                    if (teamRecord.team?.id === teamIdNum) {
                        return {
                            rank: teamRecord.divisionRank || 'N/A',
                            wins: teamRecord.wins || 0,
                            losses: teamRecord.losses || 0,
                            pct: teamRecord.leagueRecord?.pct
                                ? String(teamRecord.leagueRecord.pct).slice(0, 4)
                                : '.000'
                        };
                    }
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    async function loadTeamData(teamId, teamName) {
        currentSelectedTeamId = parseInt(teamId);
        currentSelectedTeamName = teamName;

        scheduleBody.innerHTML = '<tr><td colspan="6"><div class="loading"><div class="spinner"></div><span>正在載入賽程資料...</span></div></td></tr>';

        try {
            const [scheduleData, standingsData] = await Promise.all([
                fetchTeamSchedule(teamId, teamName),
                fetchTeamStandings(teamId)
            ]);

            const data = { scheduleData, standingsData, lastUpdated: new Date().toISOString() };
            updateUI(data);
            updateStatsBar(data);
        } catch (error) {
            scheduleBody.innerHTML = '<tr><td colspan="6">載入失敗，請稍後再試。</td></tr>';
        }
    }

    // 球隊選單事件
    const teamSelector = document.getElementById('team-selector');
    teamSelector.addEventListener('change', (e) => {
        const teamId = e.target.value;
        const teamName = TEAM_ID_TO_NAME[parseInt(teamId)];
        loadTeamData(teamId, teamName);
    });

    // 主題切換
    const themeToggle = document.getElementById('theme-toggle');

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        chrome.storage.local.set({ theme });
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    chrome.storage.local.get(['theme'], (result) => {
        const savedTheme = result.theme || 'dark';
        setTheme(savedTheme);
    });

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'light' ? 'dark' : 'light');
    });

    // 分享功能
    const shareBtn = document.getElementById('share-btn');

    function generateShareText(data) {
        if (!data.scheduleData || data.scheduleData.length === 0) return '暫無賽程資料';

        const record = calculateSeasonRecord(data, currentSelectedTeamName);
        const teamChineseName = TEAM_NAME_MAPPING[currentSelectedTeamName] || currentSelectedTeamName;
        let text = `⚾️ ${teamChineseName}賽程 ⚾️\n`;
        text += `📊 戰績: ${record.wins}勝 ${record.losses}負\n\n`;

        const nextGame = findNextGame(data);
        if (nextGame) {
            text += `📅 下一場: ${nextGame.date} ${nextGame.time}\n`;
            text += `🆚 對手: ${TEAM_NAME_MAPPING[nextGame.home_team === currentSelectedTeamName ? nextGame.away_team : nextGame.home_team] || '未知'}\n\n`;
        }

        text += `📋 近期賽程:\n`;
        data.scheduleData.slice(0, 5).forEach(game => {
            const opponent = TEAM_NAME_MAPPING[game.home_team === currentSelectedTeamName ? game.away_team : game.home_team] || game.home_team;
            const status = STATUS_MAPPING[game.status] || game.status;
            text += `${game.date} ${opponent} ${game.score} [${status}]\n`;
        });

        text += `\n🔗 由 MLB 球隊賽程 Chrome 擴充功能提供`;
        return text;
    }

    shareBtn.addEventListener('click', async () => {
        const result = await chrome.storage.local.get(['scheduleData']);
        const shareText = generateShareText(result);

        if (navigator.share) {
            try {
                await navigator.share({ text: shareText });
            } catch (e) {
                if (e.name !== 'AbortError') {
                    copyToClipboard(shareText);
                }
            }
        } else {
            copyToClipboard(shareText);
        }
    });

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = shareBtn.textContent;
            shareBtn.textContent = '已複製!';
            setTimeout(() => { shareBtn.textContent = originalText; }, 2000);
        }).catch(() => {
            alert('複製失敗，請手動複製:\n\n' + text);
        });
    }

    // 比賽提醒功能
    const reminderBtn = document.getElementById('reminder-btn');

    function updateReminderBtnState() {
        chrome.storage.local.get(['reminderEnabled'], (result) => {
            if (result.reminderEnabled) {
                reminderBtn.classList.add('active');
            } else {
                reminderBtn.classList.remove('active');
            }
        });
    }

    reminderBtn.addEventListener('click', async () => {
        const result = await chrome.storage.local.get(['reminderEnabled', 'scheduleData']);
        const isEnabled = result.reminderEnabled;

        if (!isEnabled) {
            const nextGame = findNextGame(result);
            if (nextGame) {
                const gameTime = new Date(`${nextGame.date}T${nextGame.time}:00`);
                const reminderTime = new Date(gameTime.getTime() - 30 * 60 * 1000);

                if (reminderTime > new Date()) {
                    chrome.alarms.create('gameReminder', {
                        when: reminderTime.getTime()
                    });
                    chrome.storage.local.set({ reminderEnabled: true, reminderGame: nextGame });
                    reminderBtn.classList.add('active');
                    alert(`已設定提醒！將在比賽前 30 分鐘通知你。\n${nextGame.date} ${nextGame.time}`);
                } else {
                    alert('這場比賽即將開始，無法設定提醒。');
                }
            } else {
                alert('目前沒有即將到來的比賽。');
            }
        } else {
            chrome.alarms.clear('gameReminder');
            chrome.storage.local.set({ reminderEnabled: false, reminderGame: null });
            reminderBtn.classList.remove('active');
            alert('已取消比賽提醒。');
        }
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'gameReminder') {
            chrome.notifications.create('gameReminder', {
                type: 'basic',
                iconUrl: 'img/119.png',
                title: '⚾️ 道奇比賽即將開始！',
                message: '洛杉磯道奇比賽將在 30 分鐘後開始！',
                priority: 2
            });
            chrome.storage.local.set({ reminderEnabled: false });
            updateReminderBtnState();
        }
    });

    updateReminderBtnState();

    // 斗內按鈕
    const donateBtn = document.getElementById('donate-btn');
    donateBtn.addEventListener('click', () => {
        window.open('https://service.jkopay.com/r/transfer?j=Transfer:901055756', '_blank');
    });

    const scheduleBody = document.getElementById('schedule-body');
    const logoContainer = document.getElementById('logo-container');
    const timeLabel = document.getElementById('current-time');
    const countdownLabel = document.getElementById('countdown');
    const statsRecord = document.getElementById('stats-record');
    const countdownLabelEl = document.getElementById('countdown-label');
    const standingsRank = document.getElementById('standings-rank');
    const standingsRecord = document.getElementById('standings-record');
    const standingsPct = document.getElementById('standings-pct');
    const offlineIndicator = document.getElementById('offline-indicator');
    const updateInfoEl = document.getElementById('update-info');

    function getTeamLogoPath(teamName) {
        const teamId = TEAM_ID_MAPPING[teamName] || 119;
        return `img/${teamId}.png`;
    }

    function isTeamWin(game, teamName) {
        if (!['Final', 'Game Over', 'Completed Early'].includes(game.raw_status)) {
            return null;
        }
        try {
            const [awayScore, homeScore] = game.score.split('-').map(Number);
            return (game.home_team === teamName) ? homeScore > awayScore : awayScore > homeScore;
        } catch (e) {
            return null;
        }
    }

    function calculateSeasonRecord(data, teamName) {
        if (!data.scheduleData) return { wins: 0, losses: 0 };
        let wins = 0, losses = 0;
        data.scheduleData.forEach(game => {
            const result = isTeamWin(game, teamName);
            if (result === true) wins++;
            else if (result === false) losses++;
        });
        return { wins, losses };
    }

    function findNextGame(data) {
        if (!data.scheduleData) return null;
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0];

        for (const game of data.scheduleData) {
            if (game.date > today) return game;
            if (game.date === today && game.time > currentTime && ['Scheduled', 'Warmup', 'Delayed'].includes(game.raw_status)) {
                return game;
            }
        }
        return null;
    }

    function updateStatsBar(data) {
        const record = calculateSeasonRecord(data, currentSelectedTeamName);
        statsRecord.innerHTML = `<span class="wins">${record.wins}勝</span> <span class="losses">${record.losses}負</span>`;

        const nextGame = findNextGame(data);
        if (nextGame) {
            countdownLabelEl.textContent = '下一場';
            startCountdown(nextGame);
        } else {
            countdownLabelEl.textContent = '賽季結束';
            countdownLabel.textContent = '--:--:--';
        }

        // 更新排名
        if (data.standingsData) {
            standingsRank.textContent = `第${data.standingsData.rank}名`;
            standingsRecord.textContent = `${data.standingsData.wins}勝 ${data.standingsData.losses}負`;
            standingsPct.textContent = data.standingsData.pct;
        }

        // 更新分區標籤
        const divisionInfo = TEAM_DIVISION_MAPPING[currentSelectedTeamId];
        if (divisionInfo) {
            document.getElementById('standings-label').textContent = divisionInfo.divisionName;
        }
    }

    function startCountdown(nextGame) {
        if (window.countdownIntervalId) {
            clearInterval(window.countdownIntervalId);
        }

        function updateCountdown() {
            const now = new Date();
            const gameDateTime = new Date(`${nextGame.date}T${nextGame.time}:00`);
            const diff = gameDateTime - now;

            if (diff <= 0) {
                countdownLabel.textContent = '比賽中';
                clearInterval(window.countdownIntervalId);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                countdownLabel.textContent = `${days}天 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
                countdownLabel.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }

        window.countdownIntervalId = setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    function updateUI(data) {
        if (!data.scheduleData || data.scheduleData.length === 0) {
            scheduleBody.innerHTML = '<tr><td colspan="6">暫無賽程資料，請稍後再試。</td></tr>';
            return;
        }

        scheduleBody.innerHTML = '';
        logoContainer.innerHTML = '';

        const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' })).toISOString().split('T')[0];

        // 顯示隊徽
        let currentGame = data.scheduleData.find(g => g.date === today && ['In Progress', 'Scheduled', 'Warmup', 'Delayed'].includes(g.raw_status));
        if (!currentGame && data.scheduleData.length > 0) {
            currentGame = data.scheduleData.find(g => new Date(g.date) >= new Date(today)) || data.scheduleData[0];
        }

        if (currentGame) {
            const teamLogo = document.createElement('img');
            teamLogo.src = getTeamLogoPath(currentSelectedTeamName);
            teamLogo.alt = currentSelectedTeamName;

            const opponentName = currentGame.home_team === currentSelectedTeamName ? currentGame.away_team : currentGame.home_team;
            const opponentLogo = document.createElement('img');
            opponentLogo.src = getTeamLogoPath(opponentName);
            opponentLogo.alt = opponentName;

            logoContainer.appendChild(teamLogo);

            const vsText = document.createElement('span');
            vsText.className = 'vs-text';
            vsText.textContent = 'VS';
            logoContainer.appendChild(vsText);

            logoContainer.appendChild(opponentLogo);
        }

        // 填入賽程表格
        data.scheduleData.forEach(game => {
            const row = document.createElement('tr');
            const opponent = game.home_team === currentSelectedTeamName ? game.away_team : game.home_team;
            const opponentChinese = TEAM_NAME_MAPPING[opponent] || opponent;

            let tagClass = '';
            if (game.date === today) tagClass = 'today';
            if (['Final', 'Game Over', 'Completed Early'].includes(game.raw_status)) {
                const win = isTeamWin(game, currentSelectedTeamName);
                if (win === true) tagClass += ' win';
                else if (win === false) tagClass += ' loss';
                else tagClass += ' final';
            }
            row.className = tagClass;

            // 使用安全的 DOM 方法建立內容，避免 XSS
            const cells = [
                game.date,
                opponentChinese,
                game.time,
                STATUS_MAPPING[game.status] || game.status,
                game.score,
                game.inning
            ];
            cells.forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                row.appendChild(td);
            });
            scheduleBody.appendChild(row);
        });

        // 離線指示器
        if (data.isOffline) {
            offlineIndicator.style.display = 'inline';
            updateInfoEl.textContent = '離線資料';
        } else if (data.lastUpdated) {
            const updateTime = new Date(data.lastUpdated);
            const twTime = new Date(updateTime.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
            updateInfoEl.textContent = twTime.toTimeString().split(' ')[0];
        }
    }

    function updateTime() {
        const now = new Date();
        const twTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
        timeLabel.innerHTML = `<span>🕐</span><span>${twTime.toTimeString().split(' ')[0]}</span>`;
    }

    // 啟動時間更新
    window.timeIntervalId = setInterval(updateTime, 1000);
    updateTime();

    // 清除 intervals 避免記憶體洩漏
    window.addEventListener('unload', () => {
        if (window.timeIntervalId) clearInterval(window.timeIntervalId);
        if (window.countdownIntervalId) clearInterval(window.countdownIntervalId);
    });

    // 從 storage 獲取資料並更新 UI（向後相容）
    chrome.storage.local.get(['scheduleData', 'lastUpdated', 'standingsData'], (result) => {
        if (result.scheduleData) {
            updateUI(result);
            updateStatsBar(result);
        } else {
            // 如果沒有快取資料，直接載入選定的球隊
            loadTeamData(currentSelectedTeamId, currentSelectedTeamName);
        }
    });

    // 監聽 storage 變化（向後相容，忽略不感興趣的變化）
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.scheduleData) {
            // 只有當改變的資料是我們目前的球隊時才更新
            chrome.storage.local.get(['scheduleData', 'lastUpdated', 'standingsData'], (result) => {
                if (result.scheduleData && result.scheduleData.length > 0) {
                    const firstGame = result.scheduleData[0];
                    const isOurTeam = firstGame.home_team === currentSelectedTeamName ||
                                     firstGame.away_team === currentSelectedTeamName;
                    if (isOurTeam) {
                        updateUI(result);
                        updateStatsBar(result);
                    }
                }
            });
        }
    });
});