
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".host-game-form");
  //const customSportInput = document.getElementById("customSport");
  const sportSelect = document.getElementById("sportSelect");
  const costInput = document.querySelector("input[name='costPerHead']");
  const hostId = document.querySelector("input[name='host']").value;

  const showToastError = (msg) => {
    if (typeof showToast === "function") {
      showToast(msg, "error");
    } else {
      alert(msg); // fallback
    }
  };

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

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = form.title.value.trim();
    if (!title) {
      showToastError("Title is required.");
      return;
    }
    const sport = form.sport.value;
    if (!sport || sport === "Select") {
      showToastError("Please select a sport.");
      return;
    }

    const allowedSports = ["Soccer", "Basketball", "Baseball", "Tennis", "Swimming", "Running", "Cycling", "Hiking", "Golf", "Volleyball"];
    const allowedSkills = ["Beginner", "Intermediate", "Advanced"];
    if (!allowedSports.includes(sport)) {
      showToastError("Invalid sport selected");
      return;
    }

    const playersRequired = Number(form.playersRequired.value);
    if (
      form.playersRequired.value.trim() === "" ||
      isNaN(playersRequired) ||
      playersRequired <= 0
    ) {
      showToastError("Players Required must be a number greater than 0.");
      return;
    }

    const costPerHead = Number(form.costPerHead.value);
    if (
      form.costPerHead.value.trim() === "" ||
      isNaN(costPerHead) ||
      costPerHead < 0
    ) {
      showToastError("Cost per Head must be a valid number (0 or more).");
      return;
    }

    const gameDate = form.gameDate.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;

    if (!gameDate || !startTime || !endTime) {
      showToastError("Game date, start time, and end time are all required.");
      return;
    }

    const start = new Date(`${gameDate}T${startTime}`);
    let end = new Date(`${gameDate}T${endTime}`);


    if (startTime >= endTime) {
      end.setDate(end.getDate() + 1);
    }

    if (start >= end) {
      showToastError("End time must be after start time.");
      return;
    }

    if (!title || !sport || !location || !skillLevel || !form.gameDate.value || !form.startTime.value || !form.endTime.value) {
      showToastError("Please fill in all required fields.");
      return
    }
    if (start < new Date()) {
      showToastError("You cannot host a game in the past.");
      return;
    }

    const skillLevel = form.skillLevel.value;
    if (!skillLevel) {
      showToastError("Please select a skill level.");
      return;
    }

    if (!allowedSkills.includes(skillLevel)) {
      showToastError("Invalid skill level.");
      return;
    }
    const location = form.location.value.trim();
    if (!location) {
      showToastError("Location is required.");
      return;
    }
    const description = form.description.value.trim();
    const wordCount = description.split(/\s+/).filter(word => word).length;
    if (!description) {
      showToastError("Description is required.");
      return;
    }

    if (wordCount > 200) {
      showToastError("Description cannot exceed 200 words.");
      return;
    }



    if (description.split(/\s+/).length > 250) {
      showToastError("Description must not exceed 250 words.");
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
        showToastError("Description contains inappropriate language");
        return;
      }
    }


    const formData = {
      title,
      sport,
      gameDate,
      startTime,
      endTime,
      playersRequired,
      costPerHead,
      skillLevel,
      description,
      location,
      host: hostId,
      userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    fetch("/host", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
      .then(async (response) => {
        const data = await response.json();

        console.log("data>>>>", data)
        if (!response.ok) {
          showToastError(data.error || "Failed to host the game.");
          return;
        }
        // On success: redirect or show confirmation
        window.location.href = "/host/success";
      })
      .catch((error) => {
        console.error("AJAX error:", error);
        showToastError("Something went wrong while hosting the game.");
      });

  });
});
