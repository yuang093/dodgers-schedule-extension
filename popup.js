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

    const STATUS_MAPPING = {
        'Scheduled': '預定', 'In Progress': '比賽中', 'Final': '比賽結束', 'Game Over': '比賽結束',
        'Completed Early': '比賽結束', 'Postponed': '延期', 'Suspended': '暫停', 'Cancelled': '取消',
        'Warmup': '熱身中', 'Delayed': '延遲'
    };

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

        const record = calculateSeasonRecord(data);
        let text = `⚾️ 洛杉磯道奇賽程 ⚾️\n`;
        text += `📊 戰績: ${record.wins}勝 ${record.losses}負\n\n`;

        const nextGame = findNextGame(data);
        if (nextGame) {
            text += `📅 下一場: ${nextGame.date} ${nextGame.time}\n`;
            text += `🆚 對手: ${TEAM_NAME_MAPPING[nextGame.home_team === 'Los Angeles Dodgers' ? nextGame.away_team : nextGame.home_team] || '未知'}\n\n`;
        }

        text += `📋 近期賽程:\n`;
        data.scheduleData.slice(0, 5).forEach(game => {
            const opponent = TEAM_NAME_MAPPING[game.home_team === 'Los Angeles Dodgers' ? game.away_team : game.home_team] || game.home_team;
            const status = STATUS_MAPPING[game.status] || game.status;
            text += `${game.date} ${opponent} ${game.score} [${status}]\n`;
        });

        text += `\n🔗 由洛杉磯道奇賽程 Chrome 擴充功能提供`;
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

    function isDodgersWin(game) {
        if (!['Final', 'Game Over', 'Completed Early'].includes(game.raw_status)) {
            return null;
        }
        try {
            const [awayScore, homeScore] = game.score.split('-').map(Number);
            return (game.home_team === 'Los Angeles Dodgers') ? homeScore > awayScore : awayScore > homeScore;
        } catch (e) {
            return null;
        }
    }

    function calculateSeasonRecord(data) {
        if (!data.scheduleData) return { wins: 0, losses: 0 };
        let wins = 0, losses = 0;
        data.scheduleData.forEach(game => {
            const result = isDodgersWin(game);
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
        const record = calculateSeasonRecord(data);
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
            const dodgersLogo = document.createElement('img');
            dodgersLogo.src = getTeamLogoPath('Los Angeles Dodgers');
            dodgersLogo.alt = 'Los Angeles Dodgers';

            const opponentName = currentGame.home_team === 'Los Angeles Dodgers' ? currentGame.away_team : currentGame.home_team;
            const opponentLogo = document.createElement('img');
            opponentLogo.src = getTeamLogoPath(opponentName);
            opponentLogo.alt = opponentName;

            logoContainer.appendChild(dodgersLogo);

            const vsText = document.createElement('span');
            vsText.className = 'vs-text';
            vsText.textContent = 'VS';
            logoContainer.appendChild(vsText);

            logoContainer.appendChild(opponentLogo);
        }

        // 填入賽程表格
        data.scheduleData.forEach(game => {
            const row = document.createElement('tr');
            const opponent = game.home_team === 'Los Angeles Dodgers' ? game.away_team : game.home_team;
            const opponentChinese = TEAM_NAME_MAPPING[opponent] || opponent;

            let tagClass = '';
            if (game.date === today) tagClass = 'today';
            if (['Final', 'Game Over', 'Completed Early'].includes(game.raw_status)) {
                const win = isDodgersWin(game);
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

    // 從 storage 獲取資料並更新 UI
    chrome.storage.local.get(['scheduleData', 'lastUpdated', 'standingsData'], (result) => {
        if (result.scheduleData) {
            updateUI(result);
            updateStatsBar(result);
        } else {
            scheduleBody.innerHTML = '<tr><td colspan="6">正在載入賽程資料...</td></tr>';
        }
    });

    // 監聽 storage 變化，即時更新 UI
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.scheduleData) {
            chrome.storage.local.get(['scheduleData', 'lastUpdated', 'standingsData'], (result) => {
                updateUI(result);
                updateStatsBar(result);
            });
        }
    });
});