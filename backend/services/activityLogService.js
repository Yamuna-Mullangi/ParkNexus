const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ actor, action, entityType, entityId, description, metadata, ipAddress }) => {
  try {
    const safeMetadata = metadata ? JSON.parse(JSON.stringify(metadata)) : undefined;
    if (safeMetadata) {
      delete safeMetadata.password;
      delete safeMetadata.token;
      delete safeMetadata.jwt;
    }

    await ActivityLog.create({
      actor,
      action,
      entityType,
      entityId,
      description,
      metadata: safeMetadata,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

const getLogs = async (filters = {}, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') => {
  const query = {};
  if (filters.action) query.action = { $regex: filters.action, $options: 'i' };
  if (filters.entityType && filters.entityType !== 'All Entities') query.entityType = filters.entityType;
  if (filters.actor) query.actor = filters.actor;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    
    if (filters.endDate) {
      // Add one day to include the whole end date
      const end = new Date(filters.endDate);
      end.setDate(end.getDate() + 1);
      query.createdAt.$lt = end;
    }
  }

  const safeLimit = Math.min(parseInt(limit, 10) || 20, 100);
  const safePage = parseInt(page, 10) || 1;
  const skip = (safePage - 1) * safeLimit;
  
  const sortDir = sortOrder === 'asc' ? 1 : -1;
  const sortField = ['createdAt', 'action', 'entityType'].includes(sortBy) ? sortBy : 'createdAt';

  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query)
    .populate('actor', 'name email role')
    .sort({ [sortField]: sortDir })
    .skip(skip)
    .limit(safeLimit);

  return {
    logs,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
};

module.exports = {
  logActivity,
  getLogs
};
