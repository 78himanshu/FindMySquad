// Set min datetime to current time for session creation
const dateTimeInput = document.getElementById("dateTime");
if (dateTimeInput) {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Fix timezone offset
  const localDatetime = now.toISOString().slice(0, 16);
  dateTimeInput.min = localDatetime;
}
