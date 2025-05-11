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
});
