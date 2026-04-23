document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    initMoodChart();
});

function loadDashboardData() {
    const user = JSON.parse(localStorage.getItem('mindcare_user'));
    if (!user || !user.email) return;

    fetch(`/api/dashboard?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) return;

            // Update DOM
            document.getElementById('dashScore').textContent = data.score || '0';
            document.getElementById('dashSessions').textContent = data.sessions || '0';

            // Update subjective text based on score
            const scoreVal = parseInt(data.score);
            const statusEl = document.getElementById('scoreStatus');
            if (scoreVal >= 32) {
                statusEl.textContent = 'Thriving & Excellent!';
                statusEl.style.color = 'var(--success)';
            } else if (scoreVal >= 24) {
                statusEl.textContent = 'Looking good!';
                statusEl.style.color = 'var(--primary)';
            } else if (scoreVal >= 16) {
                statusEl.textContent = 'Doing okay. Take it easy.';
                statusEl.style.color = 'var(--warning)';
            } else {
                statusEl.textContent = 'Needs attention. Reach out for support.';
                statusEl.style.color = '#e57373';
            }
            
            // Re-init chart with real data
            if (data.history) {
                renderMoodChart(data.history);
            }
        })
        .catch(err => {
            console.error('Error loading dashboard data:', err);
            // Fallback to localStorage if needed
            loadDashboardDataFromLocal();
        });
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
