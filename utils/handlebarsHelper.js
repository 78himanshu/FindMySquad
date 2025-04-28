import exphbs from "express-handlebars";
import handlebars from "handlebars";

const hbsInstance = exphbs.create({});

hbsInstance.handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context, null, 2);
});

handlebars.registerHelper("length", function (array) {
  return array ? array.length : 0;
});

handlebars.registerHelper("gte", function (a, b) {
  return a >= b;
});

export default hbsInstance;
