// script.js
let startTime = null;
let timerInterval = null;
let elapsed = 0;
let onBreak = false;

function updateDisplay() {
  const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${hrs}:${mins}:${secs}`;
}

function clockIn() {
  if (!timerInterval) {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      elapsed++;
      updateDisplay();
    }, 1000);
  }
}

function toggleBreak() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    onBreak = true;
  } else if (onBreak) {
    timerInterval = setInterval(() => {
      elapsed++;
      updateDisplay();
    }, 1000);
    onBreak = false;
  }
}

function clockOut() {
  if (timerInterval) clearInterval(timerInterval);
  saveTodayTime(elapsed);
  timerInterval = null;
  startTime = null;
  elapsed = 0;
  updateDisplay();
  loadReport();
}

function saveTodayTime(seconds) {
  const today = new Date().toISOString().split('T')[0];
  const existing = parseInt(localStorage.getItem(today) || '0');
  localStorage.setItem(today, existing + seconds);
}

function loadReport() {
  const tbody = document.getElementById('reportBody');
  tbody.innerHTML = '';

  const labels = [];
  const data = [];

  Object.keys(localStorage).sort().forEach(date => {
    const sec = parseInt(localStorage.getItem(date));
    const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    const tr = `<tr><td>${date}</td><td>${hrs}:${mins}:${secs}</td></tr>`;
    tbody.innerHTML += tr;

    labels.push(date);
    data.push((sec / 3600).toFixed(2)); // Convert to hours with decimals
  });

  renderChart(labels, data);
}

function renderChart(labels, data) {
  const ctx = document.getElementById('reportChart').getContext('2d');
  if (window.studyChart) {
    window.studyChart.destroy();
  }
  window.studyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Hours Studied',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours'
          }
        }
      }
    }
  });
}

// Load previous data
loadReport();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch(err => console.error('SW registration failed:', err));
}
