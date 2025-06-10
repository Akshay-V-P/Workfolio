let startTime = null;
let timerInterval = null;
let totalElapsed = 0;
let onBreak = false;

const clockColor = {
  green: ['rgba(9, 133, 19, 0.088)', '1px solid #078900'],
  red: ['rgba(133, 11, 9, 0.088)', '1px solid #890000'],
  default: ['rgba(255, 255, 255, 0.05)', '1px solid #2c2c2c']
}

const clockBg = document.getElementById('clockBg')
function updateUi(colors) {
  clockBg.style.backgroundColor = colors[0];
  clockBg.style.border = colors[1];
}

function updateDisplay() {
  const elapsed = getElapsedSeconds();
  const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${hrs}:${mins}:${secs}`;
}

function getElapsedSeconds() {
  if (!startTime) return totalElapsed;
  return totalElapsed + Math.floor((Date.now() - startTime) / 1000);
}

function clockIn() {
  if (!timerInterval) {
    startTime = Date.now();
    timerInterval = setInterval(updateDisplay, 1000);
    updateUi(clockColor.green)
  }
}

function toggleBreak() {
  if (timerInterval) {
    totalElapsed += Math.floor((Date.now() - startTime) / 1000);
    clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;
    onBreak = true;
    updateUi(clockColor.red)
  } else if (onBreak) {
    startTime = Date.now();
    timerInterval = setInterval(updateDisplay, 1000);
    onBreak = false;
    updateUi(clockColor.green)
  }
}

function clockOut() {
  if (timerInterval) {
    totalElapsed += Math.floor((Date.now() - startTime) / 1000);
    clearInterval(timerInterval);
    updateUi(clockColor.default)
  }

  saveTodayTime(totalElapsed);
  timerInterval = null;
  startTime = null;
  totalElapsed = 0;
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
