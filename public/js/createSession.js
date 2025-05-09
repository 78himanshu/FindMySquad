// Set min datetime to current time for session creation
// const dateTimeInput = document.getElementById("dateTime");
// if (dateTimeInput) {
//   const now = new Date();
//   now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Fix timezone offset
//   const localDatetime = now.toISOString().slice(0, 16);
//   dateTimeInput.min = localDatetime;
// }


document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  const showToastError = (msg) => {
    if (typeof showToast === "function") {
      showToast(msg, "error");
    } else {
      alert(msg);
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const date = form.date.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    const gym = form.gym.value.trim();
    const gymLocation = form.gymlocation.value.trim();
    const experience = form.experience.value;
    const workoutType = form.workoutType.value;
    const maxMembers = form.maxMembers.value;

    if (!title) return showToastError("Workout title is required.");
    if (!description) return showToastError("Description is required.");
    if (!date) return showToastError("Please select a date.");
    if (!startTime || !endTime) return showToastError("Start and end times are required.");
    if (new Date(`${date}T${startTime}`) >= new Date(`${date}T${endTime}`)) {
      return showToastError("End time must be after start time.");
    }
    if (new Date(`${date}T${startTime}`) < new Date()) {
      return showToastError("Start time cannot be in the past.");
    }
    if (!gym) return showToastError("Gym name is required.");
    if (!gymLocation) return showToastError("Gym location is required.");
    if (!experience) return showToastError("Select your experience level.");
    if (!workoutType) return showToastError("Select a workout type.");
    if (!maxMembers) return showToastError("Select max number of members.");

    form.submit(); // Submit only if all validations pass
  });
});

