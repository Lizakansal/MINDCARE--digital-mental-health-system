document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    initMoodChart();
});

const API_BASE_URL = 'http://127.0.0.1:5000';

async function loadDashboardData() {
    const token = localStorage.getItem('mindcare_token');
    if (!token) return loadDashboardDataFromLocal();

    try {
        const [quizRes, moodRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/quiz/latest`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`${API_BASE_URL}/api/mood?days=30`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        const latestQuiz = quizRes.ok ? await quizRes.json() : null;
        const moodData = moodRes.ok ? await moodRes.json() : [];

        const score = latestQuiz?.score ?? 0;
        document.getElementById('dashScore').textContent = score;
        document.getElementById('dashSessions').textContent = Array.isArray(moodData) ? moodData.length : 0;

        const statusEl = document.getElementById('scoreStatus');
        const scoreVal = parseInt(score, 10) || 0;
        if (scoreVal >= 15) {
            statusEl.textContent = 'Needs attention. Reach out for support.';
            statusEl.style.color = '#e57373';
        } else if (scoreVal >= 10) {
            statusEl.textContent = 'Doing okay. Take it easy.';
            statusEl.style.color = 'var(--warning)';
        } else if (scoreVal >= 5) {
            statusEl.textContent = 'Looking good!';
            statusEl.style.color = 'var(--primary)';
        } else {
            statusEl.textContent = 'Thriving & Excellent!';
            statusEl.style.color = 'var(--success)';
        }

        const chartHistory = (moodData || []).map((m, idx) => ({
            session: `Check-in ${idx + 1}`,
            val: m.score
        }));
        renderMoodChart(chartHistory);
    } catch (err) {
        console.error('Error loading dashboard data:', err);
        loadDashboardDataFromLocal();
    }
}

function loadDashboardDataFromLocal() {
    let score = '0';
    try {
        const quizData = JSON.parse(localStorage.getItem('mindcare_quiz'));
        if (quizData && quizData.score !== undefined) score = quizData.score;
    } catch (e) { }

    const sessions = localStorage.getItem('mindcare_sessions') || '1';
    document.getElementById('dashScore').textContent = score;
    document.getElementById('dashSessions').textContent = sessions;
}

function initMoodChart() {
    // This will be called by loadDashboardData once fetch is complete
    // For now, let's show fallback or empty
    const user = JSON.parse(localStorage.getItem('mindcare_user'));
    if (!user) {
        renderMoodChart([]);
    }
}

function renderMoodChart(history) {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;
    
    // Clear old chart if exists
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const ctx = canvas.getContext('2d');

    if (history.length === 0) {
        history = [
            { session: 'Check-in 1', val: 3 },
            { session: 'Check-in 2', val: 3 },
            { session: 'Check-in 3', val: 4 }
        ];
    }

    const recentHistory = history.slice(-10);
    const labels = recentHistory.map(h => h.session);
    const moodData = recentHistory.map(h => h.val);

    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(108, 99, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(108, 99, 255, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Level',
                data: moodData,
                fill: true,
                backgroundColor: gradient,
                borderColor: '#6C63FF',
                borderWidth: 3,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    min: 0.5,
                    max: 5.5,
                    ticks: {
                        callback: value => {
                            const map = { 1: '😟', 2: '😔', 3: '😐', 4: '🙂', 5: '😄' };
                            return map[value] || '';
                        },
                        font: { size: 18 }
                    }
                }
            }
        }
    });
}
