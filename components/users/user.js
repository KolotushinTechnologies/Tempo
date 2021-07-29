const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, sparse: true },
    password: { type: String, required: true },
    emailVerifyCode: { type: String },
    roles: [{ type: String, ref: "Role" }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", UserSchema);
