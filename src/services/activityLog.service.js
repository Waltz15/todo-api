const ActivityLog = require("../models/activityLog.model");

async function getActivityLogs(baseFilter, queryOptions) {
  const { page = 1, limit = 10, action, resource, order = "desc" } = queryOptions;

  const filter = { ...baseFilter };
  if (action) filter.action = action;
  if (resource) filter.resource = resource;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const [logs, totalItems] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: order === "asc" ? 1 : -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("user_id", "name email"),
    ActivityLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalItems / limitNumber),
      totalItems,
      itemsPerPage: limitNumber,
    },
  };
}

module.exports = { getActivityLogs };
