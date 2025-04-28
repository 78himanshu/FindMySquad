// public/js/bookings.js
document.addEventListener('DOMContentLoaded', () => {
    const modal      = document.getElementById('rateModal');
    const form       = document.getElementById('rateForm');
    const fieldsWrap = document.getElementById('rateFields');
    const toastWrap  = document.getElementById('toast-container');
  
    // Open modal and build rating fields
    document.querySelectorAll('.btn-rate').forEach(btn => {
      btn.addEventListener('click', () => {
        const bookingId = btn.dataset.bookingId;
        const players   = JSON.parse(btn.dataset.players); // array of userIds
  
        fieldsWrap.innerHTML = ''; // reset
        players.forEach(uid => {
          const group = document.createElement('div');
          group.className = 'mb-2';
          group.innerHTML = `
            <label>User ${uid}:</label>
            <select name="rating_${uid}" class="form-select">
              <option value="">Rate…</option>
              ${[1,2,3,4,5].map(n =>
                `<option value="${n}">${n} ★</option>`
              ).join('')}
            </select>
          `;
          fieldsWrap.appendChild(group);
        });
  
        form.dataset.bookingId = bookingId;
        modal.style.display = 'block';
      });
    });
  
    // Submit ratings
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const bookingId = form.dataset.bookingId;
      const data      = [];
  
      // collect
      new FormData(form).forEach((value, key) => {
        if (key.startsWith('rating_') && value) {
          data.push({ userId: key.replace('rating_', ''), score: +value });
        }
      });
  
      if (!data.length) {
        return showToast('Please select at least one rating', 'error');
      }
  
      try {
        const res = await fetch('/profile/bookings/rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ bookingId, ratings: data })
        });
        const json = await res.json();
        if (res.ok) {
          showToast('Thanks for rating!', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast(json.error || 'Rating failed', 'error');
        }
      } catch {
        showToast('Network error', 'error');
      }
    });
  
    // Cancel
    document.getElementById('rateCancel').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    // Toast helper
    function showToast(msg, type='info', delay=4000) {
      const t = document.createElement('div');
      t.className = `toast toast--${type} show`;
      t.innerHTML = `${msg}<button class="btn-close ms-2" onclick="this.parentNode.remove()">×</button>`;
      toastWrap.appendChild(t);
      setTimeout(() => t.remove(), delay);
    }
  });
  