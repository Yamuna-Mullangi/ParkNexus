const paginateAndSort = async (Model, query, options = {}, populateArgs = []) => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', allowedSortFields = ['createdAt'] } = options;
  
  const safeLimit = Math.min(parseInt(limit, 10) || 20, 100);
  const safePage = parseInt(page, 10) || 1;
  const skip = (safePage - 1) * safeLimit;
  
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : allowedSortFields[0];
  const sortDir = sortOrder === 'asc' ? 1 : -1;

  const total = await Model.countDocuments(query);
  
  let dbQuery = Model.find(query)
    .sort({ [sortField]: sortDir })
    .skip(skip)
    .limit(safeLimit);
    
  for (const p of populateArgs) {
    dbQuery = dbQuery.populate(p);
  }
  
  const data = await dbQuery;
  
  return {
    data,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
};

module.exports = { paginateAndSort };
