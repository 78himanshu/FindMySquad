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

  async function setFallbackFromProfile() {
    try {
      const res = await fetch("/join/fallback-location");
      if (!res.ok) throw new Error("Failed to fetch fallback location");
      const data = await res.json();
      if (data.lat && data.lng) {
        setCookie(LOCATION_COOKIE_NAME, JSON.stringify(data));
      }
    } catch (err) {
      console.warn("Could not fetch fallback from profile. Using NYC default.");
      const defaultCoords = { lat: 40.7128, lng: -74.006 }; // NYC fallback
      setCookie(LOCATION_COOKIE_NAME, JSON.stringify(defaultCoords));
    }
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
        async (err) => {
          console.warn("Geolocation denied or failed. Trying fallback.");
  
          if (window.isLoggedIn) {
            try {
              const response = await fetch("/join/fallback-location");
              const data = await response.json();
              setCookie(LOCATION_COOKIE_NAME, JSON.stringify(data));
            } catch (e) {
              console.error("Failed to fetch fallback location", e);
              const defaultCoords = { lat: 40.7128, lng: -74.006 };
              setCookie(LOCATION_COOKIE_NAME, JSON.stringify(defaultCoords));
            }
          } else {
            const defaultCoords = { lat: 40.7128, lng: -74.006 };
            setCookie(LOCATION_COOKIE_NAME, JSON.stringify(defaultCoords));
          }
        }
      );
    } else {
      console.warn("Geolocation not supported. Using default.");
      const defaultCoords = { lat: 40.7128, lng: -74.006 };
      setCookie(LOCATION_COOKIE_NAME, JSON.stringify(defaultCoords));
    }
  }
  if (window.isLoggedIn && getCookie(LOCATION_COOKIE_NAME)) {
    const current = JSON.parse(getCookie(LOCATION_COOKIE_NAME));
    const isDefault = current.lat === 40.7128 && current.lng === -74.006;
  
    if (isDefault) {
      fetch("/join/fallback-location")
        .then(res => res.json())
        .then(data => {
          if (data?.lat && data?.lng) {
            setCookie(LOCATION_COOKIE_NAME, JSON.stringify(data));
            console.log("🍪 Updated cookie from user profile:", data);
          }
        })
        .catch(err => console.warn("Failed to update cookie from profile", err));
    }
  }
});
