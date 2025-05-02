import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Booking",
  },
  ratedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Userlist",
  },
  ratingValue: { type: Number, required: true, min: 1, max: 5 },
});

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
