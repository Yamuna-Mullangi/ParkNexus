const parkingShareService = require('../services/parkingShareService');
const ParkingSpot = require('../models/ParkingSpot');
const { createAndEmitNotification, emitToRoom, emitToAll } = require('../services/notificationService');

exports.createShare = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const spotId = req.params.id; 
    
    const spot = await ParkingSpot.findById(spotId);
    if (!spot || !spot.isActive) {
      return res.status(400).json({ success: false, error: 'Parking space is unavailable or inactive' });
    }
    
    if (spot.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the assigned resident can share this parking space.' });
    }
    
    const share = await parkingShareService.createShare({
      parkingSpot: spotId,
      owner: req.user._id,
      startTime,
      endTime
    });
    
    emitToAll('parking:updated', spot);
    
    res.status(201).json({ success: true, data: share });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAvailableSharedSpots = async (req, res) => {
  try {
    const spots = await parkingShareService.getAvailableSharedSpots();
    res.status(200).json({ success: true, data: spots });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getMyShares = async (req, res) => {
  try {
    const shares = await parkingShareService.getOwnerShares(req.user._id);
    res.status(200).json({ success: true, data: shares });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.cancelShare = async (req, res) => {
  try {
    const share = await parkingShareService.cancelShare(req.params.id, req.user._id);
    const spot = await ParkingSpot.findById(share.parkingSpot);
    emitToAll('parking:updated', spot);
    res.status(200).json({ success: true, data: share });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.requestShare = async (req, res) => {
  try {
    const { message } = req.body;
    const request = await parkingShareService.createShareRequest({
      parkingShareId: req.params.id,
      requester: req.user._id,
      message
    });
    
    await createAndEmitNotification({
      recipient: request.parkingShare.owner,
      type: 'SHARE_REQUESTED',
      title: 'New Share Request',
      message: `Someone requested to use your shared parking space.`,
      relatedEntity: request._id,
      relatedEntityType: 'Reservation' // Though it's a request, we map it closely
    });
    
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.approveShareRequest = async (req, res) => {
  try {
    const request = await parkingShareService.approveShareRequest(req.params.id, req.user._id);
    
    await createAndEmitNotification({
      recipient: request.requester,
      type: 'SHARE_REQUEST_APPROVED',
      title: 'Share Request Approved',
      message: `Your request for a shared parking space was approved.`,
      relatedEntity: request._id,
      relatedEntityType: 'Reservation'
    });
    
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.rejectShareRequest = async (req, res) => {
  try {
    const request = await parkingShareService.rejectShareRequest(req.params.id, req.user._id);
    
    await createAndEmitNotification({
      recipient: request.requester,
      type: 'SHARE_REQUEST_REJECTED',
      title: 'Share Request Rejected',
      message: `Your request for a shared parking space was rejected.`,
      relatedEntity: request._id,
      relatedEntityType: 'Reservation'
    });
    
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = await parkingShareService.getReceivedRequests(req.user._id);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const requests = await parkingShareService.getSentRequests(req.user._id);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
