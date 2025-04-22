import exphbs from "express-handlebars";

const hbsInstance = exphbs.create({});

hbsInstance.handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context, null, 2);
});

export default hbsInstance;
