const { Schema, model } = require("mongoose");

const AvatarSchema = new Schema(
  {
    filename: { type: String },
    ext: { type: String },
    url: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = model("Avatar", AvatarSchema);
