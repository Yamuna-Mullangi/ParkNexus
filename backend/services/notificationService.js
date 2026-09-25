const Notification = require('../models/Notification');
const { getIO } = require('../socket/socketServer');

/**
 * Creates a notification in the database and emits a socket event to the recipient.
 */
const createAndEmitNotification = async (notificationData) => {
  try {
    // Check user preferences
    const UserPreference = require('../models/UserPreference');
    const prefs = await UserPreference.findOne({ user: notificationData.recipient });

    if (prefs && prefs.notificationPreferences) {
      const type = notificationData.type; // 'reservation', 'visitor', 'gate', 'system' etc.
      let shouldSend = true;

      switch(type) {
        case 'reservation':
          shouldSend = prefs.notificationPreferences.reservationUpdates;
          break;
        case 'visitor':
          shouldSend = prefs.notificationPreferences.visitorUpdates;
          break;
        case 'gate':
          shouldSend = prefs.notificationPreferences.gateUpdates;
          break;
        case 'system':
          shouldSend = prefs.notificationPreferences.systemNotifications;
          break;
        // fallback for other types or assume true
      }

      if (shouldSend === false) {
        return null; // Skip notification
      }
    }

    const notification = await Notification.create(notificationData);
    
    try {
      const { getSettings } = require('./systemSettingService');
      const settings = await getSettings();
      
      const isCritical = ['SECURITY', 'SYSTEM', 'EMERGENCY'].includes(notification.type?.toUpperCase() || '');
      
      // Emit socket notification if critical OR global notifications are enabled
      if (isCritical || settings.notificationSettings.notificationsEnabled !== false) {
        const io = getIO();
        // Emit to the specific user's room
        io.to(`user:${notification.recipient}`).emit('notification:new', notification);
      }
    } catch (socketError) {
      console.warn('Socket not initialized or failed to emit notification', socketError);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

/**
 * Emits a general event to a specific room without creating a database notification.
 */
const emitToRoom = (room, eventName, payload) => {
  try {
    const io = getIO();
    io.to(room).emit(eventName, payload);
  } catch (error) {
    console.warn(`Failed to emit ${eventName} to room ${room}`, error);
  }
};

/**
 * Emits an event to all connected clients.
 */
const emitToAll = (eventName, payload) => {
  try {
    const io = getIO();
    io.emit(eventName, payload);
  } catch (error) {
    console.warn(`Failed to emit ${eventName} to all`, error);
  }
};

const getUserNotifications = async (userId, limit = 50) => {
  return await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ recipient: userId, isRead: false });
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new Error('Notification not found or unauthorized');
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } }
  );
};

module.exports = {
  createAndEmitNotification,
  emitToRoom,
  emitToAll,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
