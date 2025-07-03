async function fetchTableData() {
    try {
     const res = await fetch('/api/tables');
const text = await res.text();
console.log(text); // See what the response is
const tables = JSON.parse(text);


      const activeContainer = document.querySelector(".table-grid.active");
      const emptyContainer = document.querySelector(".table-grid.empty");

      activeContainer.innerHTML = '';
      emptyContainer.innerHTML = '';

      tables.forEach(table => {
        const card = document.createElement('div');
        card.className = `table-card ${table.status}`;
        card.onclick = () => showOrder(table._id);

        const imgSrc = table.serverImage ? `/images/staff/${table.serverImage}` : '/images/staff/profile_icon.png';
        const timerId = `timer-${table._id}`;
        const serverName = table.serverName || 'Not Assigned';

        let html = `
          <img src="${imgSrc}" class="table-img" />
          <div class="timer" id="${timerId}">${table.orderStartTime ? '--:--' : '--:--'}</div>
          <p class="label"><strong>Table:</strong> ${table.tableNo}</p>
          <p class="label"><strong>Server:</strong> ${serverName}</p>
          <p class="label"><strong>Status:</strong> ${table.status}</p>
        `;

        card.innerHTML = html;

        if (table.status === 'empty') {
          emptyContainer.appendChild(card);
        } else {
          activeContainer.appendChild(card);
          if (table.orderStartTime) {
            startTimer(timerId, table.orderStartTime);
          }
        }
      });

    } catch (err) {
      console.error("Failed to fetch table data:", err);
    }
  }



    setInterval(fetchTableData, 5000);
  function toggleDropdown() {
  const dropdown = document.getElementById('dropdownMenu');
  dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}


window.addEventListener('click', function (e) {
  const dropdown = document.getElementById('dropdownMenu');
  const icon = document.querySelector('.menu-icon-block');
  if (!dropdown.contains(e.target) && !icon.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});
  







  const activeTimers = {};

function startTimer(id, startTime) {
  const timerElem = document.getElementById(id);
  if (!timerElem) return;

  if (activeTimers[id]) clearInterval(activeTimers[id]);

  function update() {
    const diff = Date.now() - new Date(startTime);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    timerElem.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  update();
  activeTimers[id] = setInterval(update, 1000);
}