import exphbs from "express-handlebars";

const hbsInstance = exphbs.create({});

hbsInstance.handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context, null, 2);
});

export default hbsInstance;

import Handlebars from "handlebars";

Handlebars.registerHelper('isStartingSoon', function(date) {
  const eventTime = new Date(date).getTime();
  const now = Date.now();
  const diff = eventTime - now;
  return diff > 0 && diff < (24 * 60 * 60 * 1000); // within 24 hours
});

Handlebars.registerHelper('timeUntil', function(date) {
  const eventTime = new Date(date).getTime();
  const now = Date.now();
  let diff = eventTime - now;

  if (diff <= 0) return "Started";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(diff / (1000 * 60));

  if (hours > 0) {
    return `${hours}H ${minutes}M`;
  } else {
    return `${minutes}M`;
  }
});


Handlebars.registerHelper('lt', function (a, b) {
  return a < b;
});