import xss from "xss";

function sanitizeValue(val) {
  if (typeof val === "string") {
    // escape HTML/JS and trim
    return xss(val).trim();
  }
  if (Array.isArray(val)) {
    // sanitize each element in the array
    return val.map(sanitizeValue);
  }
  if (val && typeof val === "object") {
    // recursively sanitize nested objects
    return sanitizeObject(val);
  }
  // non-string primitives (number, boolean, null, undefined)
  return val;
}

export function sanitizeObject(obj) {
  const clean = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clean[key] = sanitizeValue(obj[key]);
    }
  }
  return clean;
}

// Middleware to sanitize incoming data in body, query, and params
export default function sanitizeRequest(req, res, next) {
  // 1. sanitize req.body by replacing it wholesale
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  // 2. sanitize req.query in place (cannot reassign property)
  if (req.query && typeof req.query === "object") {
    Object.keys(req.query).forEach((key) => {
      req.query[key] = sanitizeValue(req.query[key]);
    });
  }

  // 3. sanitize req.params in place
  if (req.params && typeof req.params === "object") {
    Object.keys(req.params).forEach((key) => {
      req.params[key] = sanitizeValue(req.params[key]);
    });
  }

  next();
}
