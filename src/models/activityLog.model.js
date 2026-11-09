const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      // Aksi yang diperbolehkan
      enum: ["CREATE", "UPDATE", "ARCHIVE", "RESTORE", "LOGIN", "REGISTER", "HARD_DELETE"], 
    },
    resource: {
      type: String,
      required: true,
      // Pilihan modul yang diutak-atik
      enum: ["Todo", "Category", "User", "Auth"], 
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    details: {
      type: String,
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);