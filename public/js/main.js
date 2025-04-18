// document.addEventListener('DOMContentLoaded', () => {
//     const profilePics = document.querySelectorAll('input[name="profilePic"]');
//     const profileImages = document.querySelectorAll('.profile-option');

//     profilePics.forEach((radio, index) => {
//         radio.addEventListener('change', () => {
//             profileImages.forEach((img) => img.classList.remove('selected'));
//             profileImages[index].classList.add('selected');
//         });
//     });
// });


// const selectedRadio = document.querySelector('input[name="profilePic"]:checked');
// if (selectedRadio) {
//     selectedRadio.nextElementSibling.classList.add('selected');
// }


// document.addEventListener('DOMContentLoaded', () => {
//     if ('geolocation' in navigator) {
//         navigator.geolocation.getCurrentPosition(
//             async (position) => {
//                 const { latitude, longitude } = position.coords;

//                 // You can auto-fill hidden fields or display the coordinates
//                 document.getElementById('latitude').value = latitude;
//                 document.getElementById('longitude').value = longitude;

//                 console.log('Location:', latitude, longitude);

//                 // OPTIONAL: Use a reverse geocoding API to get the city/address
//                 // let locationResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
//                 // let locationData = await locationResponse.json();
//                 // console.log("City:", locationData.city);
//             },
//             (error) => {
//                 console.warn('Geolocation error:', error.message);
//             }
//         );
//     } else {
//         alert('Geolocation is not supported by your browser.');
//     }
// })

