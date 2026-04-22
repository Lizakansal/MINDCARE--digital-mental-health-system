document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    initMoodChart();
});

function loadDashboardData() {
    // Read stats from localStorage (matching what we set in home.js or onboarding.js)
    const score = localStorage.getItem('mindcare_quiz_score') || '0';
    const sessions = localStorage.getItem('mindcare_sessions') || '1';

    // Update DOM
    document.getElementById('dashScore').textContent = score;
    document.getElementById('dashSessions').textContent = sessions;

    // Update subjective text based on score
    const scoreVal = parseInt(score);
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
}

function initMoodChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');

    // Mock Data for the last 7 days.
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const moodData = [3, 4, 3, 5, 4, 2, 4]; // 1: Rough, 2: Low, 3: Okay, 4: Good, 5: Great

    // Create a gradient for the line graph
    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(108, 99, 255, 0.5)'); // primary color with opacity
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
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6C63FF',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4 // Smooth curves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide default legend
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleFont: { family: 'Poppins', size: 13 },
                    bodyFont: { family: 'Poppins', size: 14 },
                    padding: 10,
                    callbacks: {
                        label: function (context) {
                            const map = { 1: 'Rough 😟', 2: 'Low 😔', 3: 'Okay 😐', 4: 'Good 🙂', 5: 'Great 😄' };
                            return map[context.raw] || context.raw;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0.5,
                    max: 5.5,
                    ticks: {
                        stepSize: 1,
                        callback: function (value) {
                            // Map Y axis numbers to emojis
                            const map = { 1: '😟', 2: '😔', 3: '😐', 4: '🙂', 5: '😄' };
                            return map[value] || '';
                        },
                        font: { size: 18 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.04)',
                        drawBorder: false
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { family: 'Poppins', size: 12 },
                        color: '#8888aa'
                    }
                }
            }
        }
    });

    // Handle filter dropdown
    document.getElementById('chartFilter').addEventListener('change', function (e) {
        console.log('Fetching data for last ' + e.target.value + ' days...');
    });
}
