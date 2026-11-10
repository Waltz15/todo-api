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
    // ID data yang diubah (todo / category / user)
    resource_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
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
    timestamps: true,
  }
);

activityLogSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
