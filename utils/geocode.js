import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function geocodeCity(city) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const encodedCity = encodeURIComponent(city);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedCity}&key=${apiKey}`;

  try {
    const res = await axios.get(url);
    const result = res.data.results?.[0];

    if (!result) throw new Error("Invalid city");

    const { lat, lng } = result.geometry.location;
    return {
      type: "Point",
      coordinates: [lng, lat],
    };
  } catch (err) {
    throw new Error("Geocoding failed");
  }
}
