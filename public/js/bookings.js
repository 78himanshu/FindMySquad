// // public/js/bookings.js
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
      const players = JSON.parse(btn.dataset.players); // array of { _id, username }

      fieldsWrap.innerHTML = ''; // reset fields
      players.forEach(player => {
        const group = document.createElement('div');
        group.className = 'mb-2';
      
        group.innerHTML = `
          <input type="hidden" name="userId_${player._id}" value="${player._id}">
          <label class="form-label fw-bold">${player.username || 'Player'}:</label>
          <select name="rating_${player._id}" class="form-select">
            <option value="">Rate...</option>
            ${[5,4,3,2,1].map(n => `<option value="${n}">${n} ★</option>`).join('')}
          </select>
        `;
        fieldsWrap.appendChild(group);
      });
      
      form.dataset.bookingId = bookingId;
      modal.style.display = 'block';
    });
  });

  // Cancel Rating
  document.getElementById('rateCancel').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Submit Ratings
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookingId = form.dataset.bookingId;
    const ratings = [];
  
    const formData = new FormData(form);
    
    const userIds = [];
    
    formData.forEach((value, key) => {
      if (key.startsWith('userId_')) {
        userIds.push(value);
      }
    });
  
    userIds.forEach(userId => {
      const ratingValue = formData.get(`rating_${userId}`);
      if (ratingValue) {
        ratings.push({
          userId,
          score: parseInt(ratingValue)
        });
      }
    });
  
    if (!ratings.length) {
      return showToast('Please select at least one rating.', 'error');
    }
  
    console.log('Submitting:', ratings);
  
    try {
      const res = await fetch('/profile/bookings/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId, ratings })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit rating');
  
      showToast('Ratings submitted successfully!', 'success');
      setTimeout(() => window.location.reload(), 1500);
  
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  });
  
  // Toast function
  function showToast(msg, type = 'info', delay = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type} show`;
    toast.innerHTML = `${msg} <button class="btn-close ms-2" onclick="this.parentNode.remove()">×</button>`;
    toastWrap.appendChild(toast);
    setTimeout(() => toast.remove(), delay);
  }
});





















// public/js/bookings.js

// Run when the page is fully loaded

// document.addEventListener('DOMContentLoaded', () => {
//   const rateModal = document.getElementById('rateModal');
//   const rateForm = document.getElementById('rateForm');
//   const rateFields = document.getElementById('rateFields');
//   const rateCancel = document.getElementById('rateCancel');
//   const toastContainer = document.getElementById('toast-container');

//   // Open Rate Players Modal
//   document.querySelectorAll('.btn-rate').forEach(button => {
//     button.addEventListener('click', () => {
//       const bookingId = button.dataset.bookingId;
//       const players = JSON.parse(button.dataset.players); // [{ userId, username }, ...]

//       buildRateModal(bookingId, players);
//     });
//   });

//   // Cancel rating
//   rateCancel.addEventListener('click', hideRateModal);

//   // Submit rating
//   rateForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const bookingId = rateForm.dataset.bookingId;
//     const ratings = [];
  
//     const players = rateForm.querySelectorAll('.rating-player');
//     players.forEach(player => {
//       const userId = player.dataset.userid;  
//       const selected = player.querySelector('input[type="radio"]:checked');
//       if (userId && selected) {
//         ratings.push({
//           userId: userId,
//           score: parseInt(selected.value)
//         });
//       }
//     });
  
    
  
//     if (ratings.length === 0) {
//       return showToast('Please select at least one rating.', false);
//     }
  
//     console.log('Sending ratings:', ratings);
//     console.log('Sending bookingId:', bookingId);
  
//     try {
//       const res = await fetch('/profile/bookings/rate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({ bookingId, ratings })
//       });
  
//       const result = await res.json();
//       if (!res.ok) throw new Error(result.error || 'Failed to submit rating');
  
//       showToast('Ratings submitted successfully! 🎉', true);
//       hideRateModal();
//       setTimeout(() => window.location.reload(), 1500);
  
//     } catch (err) {
//       console.error(err);
//       showToast(err.message, false);
//     }
//   });
  
  
  
//   // Helpers

//   function buildRateModal(bookingId, players) {
//     rateFields.innerHTML = '';
//     rateForm.dataset.bookingId = bookingId;
  
//     players.forEach(player => {
//       const div = document.createElement('div');
//       div.className = 'rating-player mb-3';
  
//       div.dataset.userid = player._id;
  
//       div.innerHTML = `
//         <label class="form-label fw-bold">${player.username || 'Player'}</label>
//         <div class="rating-stars d-flex gap-2 justify-content-center">
//           <input type="radio" id="rating_${player._id}_5" name="rating_${player._id}" value="5">
//           <label for="rating_${player._id}_5">5⭐</label>
//           <input type="radio" id="rating_${player._id}_4" name="rating_${player._id}" value="4">
//           <label for="rating_${player._id}_4">4⭐</label>
//           <input type="radio" id="rating_${player._id}_3" name="rating_${player._id}" value="3">
//           <label for="rating_${player._id}_3">3⭐</label>
//           <input type="radio" id="rating_${player._id}_2" name="rating_${player._id}" value="2">
//           <label for="rating_${player._id}_2">2⭐</label>
//           <input type="radio" id="rating_${player._id}_1" name="rating_${player._id}" value="1">
//           <label for="rating_${player._id}_1">1⭐</label>
//         </div>
//       `;
//       rateFields.appendChild(div);
//     });
  
//     rateModal.style.display = 'block';
//     rateModal.classList.add('show');
//   }
  
  
  

//   function hideRateModal() {
//     rateModal.classList.remove('show');
//     rateModal.style.display = 'none';
//   }

//   function showToast(message, isSuccess = true) {
//     const toast = document.createElement('div');
//     toast.className = `toast align-items-center text-white ${isSuccess ? 'bg-success' : 'bg-danger'} border-0 show`;
//     toast.role = 'alert';
//     toast.innerHTML = `
//       <div class="d-flex">
//         <div class="toast-body">${message}</div>
//         <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
//       </div>
//     `;

//     toastContainer.appendChild(toast);

//     setTimeout(() => {
//       toast.remove();
//     }, 3000);
//   }
// });
