document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#gym-session-form");

  const hostId = form.hostedBy?.value;
  const isEditMode = form.dataset.edit === "true";
  const sessionId = form.dataset.sessionId;

  const showToastError = (msg) => {
    if (typeof showToast === "function") {
      showToast(msg, false); // Assuming false = error
    } else {
      alert(msg);
    }
  };

  if (!hostId) {
    window.location.href = "/login?redirect=/gymBuddy/create";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();



    const gym_title = form.gym_title.value.trim();
    const gymName = form.gym.value.trim();
    const description = form.description.value.trim();
    const date = form.date.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    const gymLocation = form.gymlocation.value.trim();
    const experience = form.experience.value;
    const workoutType = form.workoutType.value;
    const maxMembers = form.maxMembers.value;

    // Validations
    if (!gym_title) {
      showToastError("Workout title is required.");
      return false;
    }
    if (!gymName) {
      showToastError("Gym name is required.");
      return false;
    }
    if (!description) {
      showToastError("Description is required.");
      return false;
    }
    if (!date) {
      showToastError("Please select a date.");
      return false;
    }
    if (!startTime || !endTime) {
      showToastError("Please select start and end time.");
      return false;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (start >= end) {
      showToastError("End time must be after start time.");
      return false;
    }

    if (start < new Date()) {
      showToastError("Start time cannot be in the past.");
      return false;
    }


    if (!gymLocation) {
      showToastError("Gym location is required.");
      return false;
    }
    if (!experience) {
      showToastError("Please select your experience level.");
      return false;
    }

    if (!workoutType) {
      showToastError("Please select a workout type.");
      return false;
    }
    if (!maxMembers) {
      showToastError("Please select number of members.");
      return false;
    }

    const formData = {
      title: gym_title,
      gymName,
      description,
      date,
      startTime,
      endTime,
      gymlocation: gymLocation,
      experience,
      workoutType,
      maxMembers,
      hostedBy: hostId,
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = isEditMode ? "Updating…" : "Creating…";

    const endpoint = isEditMode
      ? `/gymBuddy/update/${sessionId}`
      : "/gymBuddy/create";



    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });



      const data = await response.json();

      console.log("data", data)

      if (!response.ok)
        // showToastError(data.error || "Failed to save gym session.");
        throw new Error(data.error || "Failed to save gym session.");

      showToast(
        `Gym session successfully ${isEditMode ? "updated" : "created"}!`,
        "success"
      );

      setTimeout(() => {
        window.location.href =
          data.redirectUrl || `/gymBuddy/view/${data.sessionId || sessionId}`;
      }, 1500);
    } catch (err) {
      console.error("AJAX error:", err);
      showToastError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
