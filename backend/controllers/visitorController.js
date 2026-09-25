const visitorService = require('../services/visitorService');
const visitorPassService = require('../services/visitorPassService');
const VisitorPass = require('../models/VisitorPass');
const { createAndEmitNotification, emitToRoom } = require('../services/notificationService');
const { logActivity } = require('../services/activityLogService');

const createVisitor = async (req, res) => {
  try {
    const visitor = await visitorService.createVisitor(req.user._id, req.body);
    
    await logActivity({
      actor: req.user._id,
      action: 'VISITOR_CREATED',
      entityType: 'Visitor',
      entityId: visitor._id,
      description: `Created visitor ${visitor.fullName}`,
      ipAddress: req.ip
    });
    
    res.status(201).json({ success: true, data: visitor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getMyVisitors = async (req, res) => {
  try {
    const result = await visitorService.getMyVisitors(req.user._id, req.query);
    // Include active passes for these visitors if they exist
    const passes = await VisitorPass.find({ issuedBy: req.user._id, status: 'active' });
    
    // Map pass data to visitor logic in frontend
    const visitorsWithPass = result.data.map(v => {
      const vObj = v.toObject ? v.toObject() : v;
      const activePass = passes.find(p => p.visitor.toString() === vObj._id.toString());
      if (activePass) vObj.activePass = activePass;
      return vObj;
    });
    
    res.status(200).json({ success: true, data: visitorsWithPass, pagination: result.pagination });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getUpcomingVisitors = async (req, res) => {
  try {
    const visitors = await visitorService.getUpcomingVisitors(req.user._id);
    res.status(200).json({ success: true, data: visitors });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getVisitorHistory = async (req, res) => {
  try {
    const visitors = await visitorService.getVisitorHistory(req.user._id);
    res.status(200).json({ success: true, data: visitors });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getVisitor = async (req, res) => {
  try {
    const visitor = await visitorService.getVisitorById(req.params.id, req.user._id);
    const pass = await VisitorPass.findOne({ visitor: visitor._id, status: 'active' });
    
    const vObj = visitor.toObject();
    if (pass) vObj.activePass = pass;
    
    res.status(200).json({ success: true, data: vObj });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const updateVisitor = async (req, res) => {
  try {
    const visitor = await visitorService.updateVisitor(req.params.id, req.user._id, req.body);
    emitToRoom(`user:${req.user._id}`, 'visitor:updated', visitor);
    res.status(200).json({ success: true, data: visitor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const cancelVisitor = async (req, res) => {
  try {
    const visitor = await visitorService.cancelVisitor(req.params.id, req.user._id);
    
    await createAndEmitNotification({
      recipient: req.user._id,
      type: 'VISITOR_STATUS_CHANGED',
      title: 'Visitor Cancelled',
      message: `Your visitor ${visitor.fullName} has been cancelled.`,
      relatedEntity: visitor._id,
      relatedEntityType: 'Visitor'
    });
    
    await logActivity({
      actor: req.user._id,
      action: 'VISITOR_CANCELLED',
      entityType: 'Visitor',
      entityId: visitor._id,
      description: `Cancelled visitor ${visitor.fullName}`,
      ipAddress: req.ip
    });
    
    res.status(200).json({ success: true, data: visitor, message: 'Visitor and associated passes cancelled' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// PASS ACTIONS
const createPass = async (req, res) => {
  try {
    const pass = await visitorPassService.createVisitorPass(req.params.id, req.user._id);
    
    await createAndEmitNotification({
      recipient: req.user._id,
      type: 'VISITOR_PASS_CREATED',
      title: 'Visitor Pass Created',
      message: `A visitor pass has been created.`,
      relatedEntity: pass._id,
      relatedEntityType: 'VisitorPass'
    });
    
    res.status(201).json({ success: true, data: pass });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getPass = async (req, res) => {
  try {
    const pass = await visitorPassService.getPassById(req.params.passId, req.user._id);
    res.status(200).json({ success: true, data: pass });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const cancelPass = async (req, res) => {
  try {
    const pass = await visitorPassService.cancelPass(req.params.passId, req.user._id);
    emitToRoom(`user:${req.user._id}`, 'visitor:updated', { passId: pass._id, status: 'cancelled' });
    res.status(200).json({ success: true, data: pass });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const validatePass = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) throw new Error('Token is required');
    
    const result = await visitorPassService.validatePass(token);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createVisitor,
  getMyVisitors,
  getUpcomingVisitors,
  getVisitorHistory,
  getVisitor,
  updateVisitor,
  cancelVisitor,
  createPass,
  getPass,
  cancelPass,
  validatePass
};
