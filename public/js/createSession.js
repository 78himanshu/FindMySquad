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
    const gymName = form.gymlocation.value.trim();
    const description = form.description.value.trim();
    const date = form.querySelector("input[name='sessionDate']")?.value || form.date?.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    const gymLocation = form.gymlocation.value.trim();
    const experience = form.experience.value;
    const workoutType = form.workoutType.value;
    const maxMembers = form.maxMembers.value;

    // console.log("form data", {
    //   gym_title,
    //   gymName,
    //   description,
    //   date,
    //   startTime,
    //   endTime,
    //   gymLocation,
    //   experience,
    //   workoutType,
    //   maxMembers,
    // });


    // 🛡️ Validations
    if (!gym_title) return showToastError("Workout title is required.");
    if (!gymName) return showToastError("gym  is required.");
    if (!description) return showToastError("Description is required.");
    if (!date) return showToastError("Please select a date.");
    if (!startTime || !endTime) return showToastError("Start and end times are required.");

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (start >= end) return showToastError("End time must be after start time.");
    if (start < new Date()) return showToastError("Start time cannot be in the past.");

    if (!gymLocation) return showToastError("Gym location is required.");
    if (!experience) return showToastError("Please select your experience level.");
    if (!workoutType) return showToastError("Please select a workout type.");
    if (!maxMembers) return showToastError("Please select number of members.");

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

    const endpoint = isEditMode ? `/gymBuddy/update/${sessionId}` : "/gymBuddy/create";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      // console.log(">>>>>", data);

      if (!response.ok) throw new Error(data.error || "Failed to save gym session.");

      showToast(`Gym session successfully ${isEditMode ? "updated" : "created"}!`, true);

      setTimeout(() => {
        window.location.href = data.redirectUrl || `/gymBuddy/view/${data.sessionId || sessionId}`;
      }, 1500);
    } catch (err) {
      console.error("AJAX error:", err);
      showToastError(err.message);
    }
  });
});
