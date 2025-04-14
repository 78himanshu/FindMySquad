export const checkString = (input, name, minLength = 1) => {
  if (!input || typeof input !== "string") throw `${name} must be a string`;
  const trimmed = input.trim();
  if (trimmed.length < minLength)
    throw `${name} must be at least ${minLength} characters`;
  return trimmed;
};

export function checkNumber(y, input, z) {
  if (typeof y !== "number" || isNaN(y) || y < z) {
    throw new Error(`${input} must be a Number`);
  }
}
