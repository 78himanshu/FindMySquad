// for selecting custom sports for host game
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".host-game-form");
  //const customSportInput = document.getElementById("customSport");
  const sportSelect = document.getElementById("sportSelect");
  const costInput = document.querySelector("input[name='costPerHead']");
  const hostId = document.querySelector("input[name='host']").value;

  // Redirect to login if user not logged in
  if (!hostId) {
    window.location.href = "/login?redirect=/host";
  }

  // Show/hide custom sport input
  // sportSelect.addEventListener("change", () => {
  //   if (sportSelect.value === "Other") {
  //     customSportInput.style.display = "block";
  //     customSportInput.required = true;
  //   } else {
  //     customSportInput.style.display = "none";
  //     customSportInput.required = false;
  //   }
  // });

  // Form validation
  form.addEventListener("submit", (e) => {
    //Adding Validations
    const title = form.title.value.trim();
    const sport = form.sport.value.trim();
    //const venue = form.venue.value.trim();
    const location = form.location.value.trim();
    const description = form.description.value.trim();
    const skillLevel = form.skillLevel.value;
    let cost = form.costPerHead.value;
    if (cost === "") cost = "0";
    const players = form.playersRequired.value;
    // const gameDate = new Date(form.gameDate.value);
    // const [sh, sm] = form.startTime.value.split(":");
    // const [eh, em] = form.endTime.value.split(":");
    // const startTime = new Date(gameDate)
    // startTime.setHours(sh, sm);
    // const endTime = new Date(gameDate)
    // endTime.setHours(eh, em);
    const gameDateStr = form.gameDate.value;
    const [sh, sm] = form.startTime.value.split(":");
    const [eh, em] = form.endTime.value.split(":");

    const startDateTimeStr = `${gameDateStr}T${sh.padStart(2, "0")}:${sm.padStart(2, "0")}:00`;
    const endDateTimeStr = `${gameDateStr}T${eh.padStart(2, "0")}:${em.padStart(2, "0")}:00`;

    const startTime = new Date(startDateTimeStr);
    const endTime = new Date(endDateTimeStr);
    const now = new Date();

    if (startTime <= now) {
      alert("Game must be scheduled in the future.");
      e.preventDefault();
      return;
    }
    if (startTime >= endTime) {
      alert("End time must be after start time.");
      e.preventDefault();
      return;
    }

    if (!title || !sport || !location || !skillLevel || !form.gameDate.value || !form.startTime.value || !form.endTime.value) {
      alert("Please fill in all required fields.");
      e.preventDefault();
      return;
    }
    const allowedSports = ["Soccer", "Basketball", "Baseball", "Tennis", "Swimming", "Running", "Cycling", "Hiking", "Golf", "Volleyball"];
    const allowedSkills = ["Beginner", "Intermediate", "Advanced"];
    if (!allowedSports.includes(sport)) {
      alert("Invalid sport selected.");
      e.preventDefault();
      return;
    }
    if (!allowedSkills.includes(skillLevel)) {
      alert("Invalid skill level.");
      e.preventDefault();
      return;
    }
    if (description.split(/\s+/).length > 250) {
      alert("Description must not exceed 250 words.");
      e.preventDefault();
      return;
    }
    const badWords = [
      "fuck", "shit", "bitch", "asshole", "dick", "pussy", "cunt", "sex",
      "nigger", "nigga", "fag", "faggot", "slut", "whore", "bastard", "damn",
      "bullshit", "crap", "motherfucker", "cock", "tit", "dildo", "rape",
      "suck", "kill yourself", "kys", "die", "retard", "moron",
      "@$$", "f*ck", "s3x", "sh!t", "b!tch", "d!ck", "w#ore", "r@pe"
    ];
    const lowered = description.toLowerCase();
    for (let word of badWords) {
      if (lowered.includes(word)) {
        alert("Description contains inappropriate language.");
        e.preventDefault();
        return;
      }
    }
    // if (startTime >= endTime) {
    //   alert("End time must be after start time.");
    //   e.preventDefault();
    //   return;
    // }

    // if (form.costPerHead.value === "" || isNaN(form.costPerHead.value)) {
    //   alert("Cost per Head must be a number.");
    //   e.preventDefault();
    //   return;
    // }
    // const roundedStartTime = new Date(startTime);
    // roundedStartTime.setSeconds(0, 0);
    
    // if (roundedStartTime <= now) {
    //   alert("Game must be scheduled in the future.");
    //   e.preventDefault();
    //   return;
    // }
    // if (
    //   form.playersRequired.value === "" ||
    //   isNaN(form.playersRequired.value)
    // ) {
    //   alert("Players Required must be a number.");
    //   e.preventDefault();
    //   return;
    // }
    if (cost === "" || isNaN(cost) || Number(cost) < 0) {
      alert("Cost per Head must be a non-negative number.");
      e.preventDefault();
      return;
    }
  
    if (players === "" || isNaN(players) || Number(players) <= 0) {
      alert("Players Required must be a number greater than 0.");
      e.preventDefault();
      return;
    }
  });
});
