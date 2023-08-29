const { Schema, models, model } = require("mongoose");

const userSchema = new Schema({
  name: String,
  email: String,
  image: String,
  emailVerified: Date,
});

export const User = models?.User || model("User", userSchema);
