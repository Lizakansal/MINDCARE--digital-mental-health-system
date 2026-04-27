document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

const API_BASE_URL = 'http://127.0.0.1:5000';

function getAuthHeaders() {
    const token = localStorage.getItem('mindcare_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function loadDashboardData() {
    const token = localStorage.getItem('mindcare_token');
    if (!token) {
        loadDashboardDataFromLocal();
        renderMoodChart([]);
        renderInsights({ streak: 0, total: 0, average: 0, trend: 0 });
        return;
    }

    try {
        const headers = getAuthHeaders();
        const days = document.getElementById('chartFilter')?.value || 30;

        // Fetch all data in parallel
        const [quizRes, quizHistRes, moodRes, summaryRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/quiz/latest`, { headers }),
            fetch(`${API_BASE_URL}/api/quiz/history?days=${days}`, { headers }),
            fetch(`${API_BASE_URL}/api/mood?days=${days}`, { headers }),
            fetch(`${API_BASE_URL}/api/dashboard/summary`, { headers })
        ]);

        const latestQuiz  = quizRes.ok     ? await quizRes.json()     : null;
        const quizHistory = quizHistRes.ok  ? await quizHistRes.json() : [];
        const moodHistory = moodRes.ok      ? await moodRes.json()     : [];
        const summary     = summaryRes.ok   ? await summaryRes.json()  : { total_checkins: 0, streak: 0 };

        // ── Wellness Score (from latest quiz, max is 20 for 5-question quiz, but display shows /40 in HTML) ──
        const score = latestQuiz?.score ?? 0;
        animateCounter('dashScore', score);
        updateScoreStatus(score);

        // ── Check-ins count: quiz submissions + mood logs ──
        const totalCheckins = summary.total_checkins || 0;
        animateCounter('dashSessions', totalCheckins);

        // ── Build chart data: prefer mood logs if available, fall back to quiz history ──
        let chartHistory = [];

        if (moodHistory.length > 0) {
            // User has manual mood logs — use those
            chartHistory = moodHistory.map(m => ({
                session: formatDate(m.date),
                val: m.score,
                tooltip: `Mood: ${m.score}/5`
            }));
        } else if (quizHistory.length > 0) {
            // User only has quiz data — map quiz wellness scores to chart
            chartHistory = quizHistory.map((q, idx) => ({
                session: formatDate(q.date),
                val: q.wellness,
                tooltip: `Quiz #${idx + 1}: ${q.level} (score ${q.quiz_score})`
            }));
        }

        // ── Sort data by date ──
        chartHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

        renderMoodChart(chartHistory);

        // ── Compute trend from whatever data we have ──
        const trendData = moodHistory.length > 0 ? moodHistory : quizHistory.map(q => ({ score: q.wellness, date: q.date }));
        const trend = computeTrend(trendData);

        // ── Average wellness ──
        const allVals = chartHistory.map(h => h.val);
        const average = allVals.length ? allVals.reduce((a, b) => a + b, 0) / allVals.length : 0;

        // ── Dynamic Insights ──
        renderInsights({
            streak: summary.streak || 0,
            total: totalCheckins,
            average: average,
            trend: trend,
            quizCount: summary.quiz_count || 0,
            moodCount: summary.mood_count || 0
        });

    } catch (err) {
        console.error('Error loading dashboard data:', err);
        loadDashboardDataFromLocal();
        renderMoodChart([]);
        renderInsights({ streak: 0, total: 0, average: 0, trend: 0 });
    }
}

/* ── Format date like "Apr 25" ── */
function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

/* ── Animate number counting up ── */
function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const duration = 900;
    const start = performance.now();
    target = parseInt(target, 10) || 0;

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

/* ── Update wellness score status text ── */
function updateScoreStatus(score) {
    const statusEl = document.getElementById('scoreStatus');
    if (!statusEl) return;
    const s = parseInt(score, 10) || 0;
    if (s === 0) {
        statusEl.textContent = window.t('Take a quiz to see your score');
        statusEl.style.color = 'var(--text-muted, #999)';
    } else if (s >= 15) {
        statusEl.textContent = window.t('Needs attention. Reach out for support.');
        statusEl.style.color = '#e57373';
    } else if (s >= 10) {
        statusEl.textContent = window.t('Doing okay. Take it easy.');
        statusEl.style.color = 'var(--warning, #facc15)';
    } else if (s >= 5) {
        statusEl.textContent = window.t('Looking good!');
        statusEl.style.color = 'var(--primary, #6C63FF)';
    } else {
        statusEl.textContent = window.t('Thriving & Excellent!');
        statusEl.style.color = 'var(--success, #4ade80)';
    }
}

/* ── Compute mood trend % comparing last 7 days vs previous 7 days ── */
function computeTrend(data) {
    if (!Array.isArray(data) || data.length < 2) return 0;

    const now = new Date();
    const last7 = [], prev7 = [];

    data.forEach(m => {
        const d = new Date(m.date);
        const daysAgo = (now - d) / (1000 * 60 * 60 * 24);
        if (daysAgo <= 7)        last7.push(m.score || m.wellness || 0);
        else if (daysAgo <= 14)  prev7.push(m.score || m.wellness || 0);
    });

    if (last7.length === 0 || prev7.length === 0) return 0;

    const avgLast = last7.reduce((a, b) => a + b, 0) / last7.length;
    const avgPrev = prev7.reduce((a, b) => a + b, 0) / prev7.length;

    if (avgPrev === 0) return 0;
    return Math.round(((avgLast - avgPrev) / avgPrev) * 100);
}

/* ── Render dynamic insights based on real data ── */
function renderInsights({ streak, total, average, trend, quizCount, moodCount }) {
    const list = document.querySelector('.insights-list');
    if (!list) return;

    const insights = [];

    // 1. Streak / quiz count insight
    if (quizCount >= 3) {
        insights.push({
            icon: 'fa-fire',
            color: '#ff6b6b',
            title: window.t(`${quizCount} Quizzes Completed!`),
            text: window.t(`You've checked in ${quizCount} times with wellness quizzes. Great self-awareness habit!`)
        });
    } else if (quizCount > 0) {
        insights.push({
            icon: 'fa-seedling',
            color: '#4ade80',
            title: window.t('Building a Habit'),
            text: window.t(`You've completed ${quizCount} wellness quiz${quizCount > 1 ? 'zes' : ''}. Keep checking in regularly!`)
        });
    } else {
        insights.push({
            icon: 'fa-circle-plus',
            color: '#94a3b8',
            title: window.t('Get Started'),
            text: window.t('Take a wellness quiz to track your mental health and unlock personalized insights.')
        });
    }

    // 2. Trend insight
    if (trend > 0) {
        insights.push({
            icon: 'fa-arrow-trend-up',
            color: '#4ade80',
            title: window.t('Upward Trend'),
            text: window.t(`Your wellness has improved by ${trend}% compared to last week. Great progress!`)
        });
    } else if (trend < 0) {
        insights.push({
            icon: 'fa-arrow-trend-down',
            color: '#fb923c',
            title: window.t('Dipping Slightly'),
            text: window.t(`Your wellness dipped ${Math.abs(trend)}% vs last week. Consider self-care activities.`)
        });
    } else if (total > 0) {
        insights.push({
            icon: 'fa-equals',
            color: '#6C63FF',
            title: window.t('Steady State'),
            text: window.t('Your wellness has been consistent lately. Stability is a great sign!')
        });
    }

    // 3. Average wellness insight
    if (average > 0) {
        const avg = parseFloat(average.toFixed(1));
        const moodLabel = avg >= 4 ? 'Good' : avg >= 3 ? 'Okay' : avg >= 2 ? 'Low' : 'Struggling';
        const moodEmoji = avg >= 4 ? '😄' : avg >= 3 ? '😐' : avg >= 2 ? '😔' : '😟';
        const moodAdvice = avg >= 4
            ? 'Keep doing what works for you!'
            : avg >= 3
                ? 'A 5-minute breathing exercise could give you a boost.'
                : 'Reach out to someone you trust. You don\'t have to face this alone.';

        insights.push({
            icon: 'fa-chart-simple',
            color: avg >= 4 ? '#4ade80' : avg >= 3 ? '#facc15' : '#fb923c',
            title: `${window.t('Avg Wellness:')} ${moodEmoji} ${window.t(moodLabel)}`,
            text: window.t(`Across ${total} check-ins, your average wellness is ${avg}/5. ${moodAdvice}`)
        });
    }

    // 4. Fallback
    if (insights.length === 0) {
        insights.push({
            icon: 'fa-hand-holding-heart',
            color: '#6C63FF',
            title: window.t('Welcome!'),
            text: window.t('Start by taking a wellness quiz. Your journey begins here.')
        });
    }

    // Render
    list.innerHTML = insights.map(i => `
        <li>
            <i class="fa-solid ${i.icon}" style="color: ${i.color}"></i>
            <div class="insight-text">
                <strong>${i.title}</strong> ${i.text}
            </div>
        </li>
    `).join('');
}

/* ── Local storage fallback (no token) ── */
function loadDashboardDataFromLocal() {
    let score = 0;
    try {
        const quizData = JSON.parse(localStorage.getItem('mindcare_quiz'));
        if (quizData && quizData.score !== undefined) score = quizData.score;
    } catch (e) { }

    animateCounter('dashScore', score);
    animateCounter('dashSessions', 0);
    updateScoreStatus(score);
}

/* ── Mood / Wellness Chart ── */
function renderMoodChart(history) {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;

    // Clear old chart
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    // Remove any old empty state
    const oldEmpty = canvas.parentElement.querySelector('.chart-empty');
    if (oldEmpty) oldEmpty.remove();

    if (!history || history.length === 0) {
        canvas.style.display = 'none';
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'chart-empty';
        emptyMsg.innerHTML = `
            <i class="fa-solid fa-chart-line" style="font-size:2.5rem; color: rgba(108,99,255,0.3); margin-bottom: 0.5rem;"></i>
            <p style="color: var(--text-muted, #999); font-size: 0.95rem; margin:0;">No data yet. Take a quiz or log your mood to see trends here.</p>
        `;
        emptyMsg.style.cssText = 'display:flex; flex-direction:column; align-items:center; justify-content:center; height:200px; gap:0.5rem;';
        canvas.parentElement.appendChild(emptyMsg);
        return;
    }

    canvas.style.display = 'block';

    const recentHistory = history.slice(-10);
    const labels   = recentHistory.map(h => h.session);
    const dataVals  = recentHistory.map(h => h.val);

    const ctx = canvas.getContext('2d');
    
    // Better gradient for a more premium look
    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(108, 99, 255, 0.35)');
    gradient.addColorStop(0.5, 'rgba(108, 99, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(108, 99, 255, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: window.t('Wellness Level'),
                data: dataVals,
                fill: true,
                backgroundColor: gradient,
                borderColor: '#6C63FF',
                borderWidth: 4,
                tension: 0.45, // Smoother Bezier curve
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6C63FF',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 10,
                pointHoverBorderWidth: 4,
                pointHoverBackgroundColor: '#6C63FF',
                pointHoverBorderColor: '#fff',
                // Adding a subtle shadow to the line
                borderCapStyle: 'round',
                borderJoinStyle: 'round'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1a1a2e',
                    bodyColor: '#4a4a6a',
                    borderColor: 'rgba(108, 99, 255, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => {
                            const val = context.parsed.y;
                            const map = { 
                                1: window.t('Struggling'), 
                                2: window.t('Low'), 
                                3: window.t('Okay'), 
                                4: window.t('Good'), 
                                5: window.t('Thriving & Excellent!') 
                            };
                            return `${window.t('Status')}: ${map[Math.round(val)] || val}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0.8,
                    max: 5.2,
                    beginAtZero: false,
                    ticks: {
                        stepSize: 1,
                        callback: value => {
                            const map = { 
                                1: '😟', 
                                2: '😔', 
                                3: '😐', 
                                4: '🙂', 
                                5: '😄' 
                            };
                            return map[value] || '';
                        },
                        font: { size: 16 }
                    },
                    grid: { 
                        color: 'rgba(108, 99, 255, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: { 
                        font: { size: 11, weight: '500' }, 
                        color: '#8888aa',
                        maxRotation: 0 
                    },
                    grid: { display: false }
                }
            }
        },
        plugins: [{
            // Custom plugin to add shadow to the line
            id: 'lineShadow',
            beforeDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                ctx.shadowColor = 'rgba(108, 99, 255, 0.3)';
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 8;
            },
            afterDraw: (chart) => {
                chart.ctx.restore();
            }
        }]
    });
}

/* ── Chart filter dropdown: re-fetch with selected days ── */
document.addEventListener('DOMContentLoaded', () => {
    const filter = document.getElementById('chartFilter');
    if (filter) {
        filter.addEventListener('change', () => {
            loadDashboardData();
        });
    }
});
