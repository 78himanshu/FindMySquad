document.addEventListener("DOMContentLoaded", () => {
  const profilePics = document.querySelectorAll('input[name="profilePic"]');
  const profileImages = document.querySelectorAll(".profile-option");

  profilePics.forEach((radio, index) => {
    radio.addEventListener("change", () => {
      profileImages.forEach((img) => img.classList.remove("selected"));
      profileImages[index].classList.add("selected");
    });
  });

  const selectedRadio = document.querySelector(
    'input[name="profilePic"]:checked'
  );
  if (selectedRadio) {
    selectedRadio.nextElementSibling.classList.add("selected");
  }

  const LOCATION_COOKIE_NAME = "user_location";

  function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function setCookie(name, value, days = 1) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }

  if (!getCookie(LOCATION_COOKIE_NAME)) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCookie(LOCATION_COOKIE_NAME, JSON.stringify(coords));
        },
        (err) => {
          console.warn("Geolocation denied or failed. Using NYC default.");
          const defaultCoords = { lat: 40.7128, lng: -74.006 };
          setCookie(LOCATION_COOKIE_NAME, JSON.stringify(defaultCoords));
        }
      );
    } else {
      console.warn("Geolocation not supported. Using default.");
      const defaultCoords = { lat: 40.7128, lng: -74.006 };
      setCookie(LOCATION_COOKIE_NAME, JSON.stringify(defaultCoords));
    }
  }
});
