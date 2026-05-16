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

    const scheduleBody = document.getElementById('schedule-body');
    const logoContainer = document.getElementById('logo-container');
    const timeLabel = document.getElementById('current-time');
    const countdownLabel = document.getElementById('countdown');

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
    }

    function updateCountdown(lastUpdated) {
        if (!lastUpdated) return;
        const updateInterval = 10 * 60 * 1000;
        const lastUpdateTime = new Date(lastUpdated);

        if (window.countdownIntervalId) {
            clearInterval(window.countdownIntervalId);
        }

        window.countdownIntervalId = setInterval(() => {
            const now = new Date();
            const elapsed = now - lastUpdateTime;
            const remaining = Math.max(0, updateInterval - (elapsed % updateInterval));
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            countdownLabel.textContent = `下次更新: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
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
    chrome.storage.local.get(['scheduleData', 'lastUpdated'], (result) => {
        if (result.scheduleData) {
            updateUI(result);
            updateCountdown(result.lastUpdated);
        } else {
            scheduleBody.innerHTML = '<tr><td colspan="6">正在載入賽程資料...</td></tr>';
        }
    });

    // 監聽 storage 變化，即時更新 UI
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.scheduleData) {
            chrome.storage.local.get(['scheduleData', 'lastUpdated'], (result) => {
                updateUI(result);
                updateCountdown(result.lastUpdated);
            });
        }
    });
});