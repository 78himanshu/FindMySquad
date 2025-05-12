document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".host-game-form");
  const hostId = document.querySelector("input[name='host']").value;
  const isEditMode = form.dataset.edit === "true";
  const gameId = form.dataset.gameId;

  const showToastError = (msg) => {
    if (typeof showToast === "function") {
      showToast(msg, "error");
    } else {
      alert(msg);
    }
  };

  if (!hostId) {
    window.location.href = "/login?redirect=/host";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Form field extraction and validation
    const title = form.title.value.trim();
    if (!title) {
      showToastError("Title is required.");
      return;
    }
    const sport = form.sport.value.trim();
    if (!sport || sport === "Select") {
      showToastError("Please select a sport.");
      return;
    }

    const allowedSports = [
      "Soccer",
      "Basketball",
      "Baseball",
      "Tennis",
      "Swimming",
      "Running",
      "Cycling",
      "Hiking",
      "Golf",
      "Volleyball",
    ];
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
    const skillLevel = form.skillLevel.value;
    const location = form.location.value.trim();
    const description = form.description.value.trim();
    const badWords = [
      "fuck",
      "shit",
      "bitch",
      "asshole",
      "dick",
      "pussy",
      "cunt",
      "sex",
      "nigger",
      "nigga",
      "fag",
      "faggot",
      "slut",
      "whore",
      "bastard",
      "damn",
      "bullshit",
      "crap",
      "motherfucker",
      "cock",
      "tit",
      "dildo",
      "rape",
      "suck",
      "kill yourself",
      "kys",
      "die",
      "retard",
      "moron",
      "@$$",
      "f*ck",
      "s3x",
      "sh!t",
      "b!tch",
      "d!ck",
      "w#ore",
      "r@pe",
    ];

    // Validation...
    if (!title) return showToastError("Title is required.");
    if (!sport || !allowedSports.includes(sport))
      return showToastError("Please select a valid sport.");
    if (!gameDate || !startTime || !endTime)
      return showToastError("Game date and times are required.");

    const start = new Date(`${gameDate}T${startTime}`);
    let end = new Date(`${gameDate}T${endTime}`);
    if (startTime >= endTime) end.setDate(end.getDate() + 1);
    if (start >= end)
      return showToastError("End time must be after start time.");
    if (start < new Date())
      return showToastError("You cannot host a game in the past.");

    if (isNaN(playersRequired) || playersRequired < 1)
      return showToastError(
        "Players Required must be a number greater than 0."
      );
    if (isNaN(costPerHead) || costPerHead < 0)
      return showToastError(
        "Cost per Head must be a valid number (0 or more)."
      );

    if (!skillLevel || !allowedSkills.includes(skillLevel))
      return showToastError("Invalid skill level.");
    if (!location) return showToastError("Location is required.");
    if (!description) return showToastError("Description is required.");
    if (description.split(/\s+/).length > 250)
      return showToastError("Description cannot exceed 250 words.");

    const lowered = description.toLowerCase();
    for (let word of badWords) {
      if (lowered.includes(word))
        return showToastError("Description contains inappropriate language.");
    }

    // Build the form payload
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
      userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      bringEquipment: form.bringEquipment?.checked || false,
      costShared: form.costShared?.checked || false,
      extraInfo: form.extraInfo?.value || "",
    };

    // Dynamic endpoint
    const endpoint = isEditMode ? `/host/edit/${gameId}` : "/host";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to save the game.");

      showToast(
        "Game successfully " + (isEditMode ? "updated!" : "hosted!"),
        "success"
      );
      setTimeout(() => {
        window.location.href = `/join/${data.gameId || gameId}`;
      }, 1500);
    } catch (err) {
      console.error("AJAX error:", err);
      showToastError(err.message);
    }
  });
});
