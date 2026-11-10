const ActivityLog = require("../models/activityLog.model");

/**
 * Mencatat aktivitas user ke collection ActivityLog.
 * Kegagalan pencatatan log tidak boleh membatalkan request utama,
 * jadi error hanya ditulis ke console.
 */
async function logActivity({ action, resource, userId, resourceId = null, details = "" }) {
  try {
    await ActivityLog.create({
      action,
      resource,
      user_id: userId,
      resource_id: resourceId,
      details,
    });
  } catch (error) {
    console.error("Failed to write activity log:", error.message);
  }
}

module.exports = logActivity;
