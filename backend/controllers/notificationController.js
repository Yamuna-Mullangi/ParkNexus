const notificationService = require('../services/notificationService');

const getNotifications = async (req, res) => {
  try {
    const { paginateAndSort } = require('../utils/dbUtils');
    const Notification = require('../models/Notification');
    const { getDateRangeQuery } = require('../utils/dateUtils');
    
    const query = { recipient: req.user._id };
    
    if (req.query.status === 'unread') {
      query.isRead = false;
    } else if (req.query.status === 'read') {
      query.isRead = true;
    }

    if (req.query.dateRange && req.query.dateRange !== 'All Time') {
      Object.assign(query, getDateRangeQuery(req.query.dateRange, 'createdAt'));
    }
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const filters = {
      ...req.query,
      allowedSortFields: ['createdAt', 'isRead']
    };
    
    const result = await paginateAndSort(Notification, query, filters);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
