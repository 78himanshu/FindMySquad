let autocomplete;

function initAutocomplete() {
  const input = document.getElementById("autocomplete");
  if (!input) return;

  autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["(cities)"],
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;

    // You can store these in hidden fields later if needed
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    // Optional: show them in console (debugging)
    console.log("Selected location:", place.formatted_address);
    console.log("Latitude:", lat);
    console.log("Longitude:", lng);
  });
}

window.initAutocomplete = initAutocomplete;
