const ParkingShare = require('../models/ParkingShare');
const ShareRequest = require('../models/ShareRequest');
const Reservation = require('../models/Reservation');

const checkShareConflict = async (parkingSpotId, startTime, endTime) => {
  const overlapping = await ParkingShare.findOne({
    parkingSpot: parkingSpotId,
    status: 'active',
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });
  return !!overlapping;
};

const createShare = async (data) => {
  const { parkingSpot, owner, startTime, endTime } = data;
  
  if (new Date(startTime) >= new Date(endTime)) {
    throw new Error('Start time must be before end time');
  }
  
  if (new Date(startTime) < new Date()) {
    throw new Error('Start time cannot be in the past');
  }

  const hasConflict = await checkShareConflict(parkingSpot, startTime, endTime);
  if (hasConflict) {
    throw new Error('This sharing period overlaps with an existing share.');
  }

  const share = new ParkingShare({
    parkingSpot,
    owner,
    startTime,
    endTime,
    status: 'active'
  });

  return await share.save();
};

const getAvailableSharedSpots = async () => {
  const now = new Date();
  
  const activeShares = await ParkingShare.find({
    status: 'active',
    endTime: { $gt: now }
  }).populate('parkingSpot').populate('owner', 'name');
  
  return activeShares;
};

const getOwnerShares = async (ownerId) => {
  return await ParkingShare.find({ owner: ownerId })
    .populate('parkingSpot')
    .sort({ startTime: -1 });
};

const cancelShare = async (id, ownerId) => {
  const share = await ParkingShare.findById(id);
  if (!share) {
    throw new Error('Parking share not found');
  }
  
  if (share.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized');
  }
  
  if (share.status !== 'active') {
    throw new Error('Cannot cancel inactive share');
  }
  
  await ShareRequest.updateMany(
    { parkingShare: id, status: 'pending' },
    { $set: { status: 'cancelled' } }
  );
  
  share.status = 'cancelled';
  return await share.save();
};

const createShareRequest = async (data) => {
  const { parkingShareId, requester, message } = data;
  
  const share = await ParkingShare.findById(parkingShareId);
  if (!share || share.status !== 'active') {
    throw new Error('Parking space is no longer available for the selected time.');
  }
  
  if (share.owner.toString() === requester.toString()) {
    throw new Error('Cannot request your own shared parking space');
  }
  
  if (new Date(share.endTime) < new Date()) {
    throw new Error('Cannot request an expired share');
  }
  
  const existingRequest = await ShareRequest.findOne({
    parkingShare: parkingShareId,
    requester: requester,
    status: { $in: ['pending', 'approved'] }
  });
  
  if (existingRequest) {
    throw new Error('You already have a pending or approved request for this share');
  }

  const request = new ShareRequest({
    parkingShare: share._id,
    requester,
    owner: share.owner,
    message,
    status: 'pending'
  });

  return await request.save();
};

const approveShareRequest = async (requestId, ownerId) => {
  const request = await ShareRequest.findById(requestId).populate('parkingShare');
  if (!request || request.status !== 'pending') {
    throw new Error('Invalid or already processed request');
  }
  
  if (request.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized');
  }
  
  const share = request.parkingShare;
  
  const conflictingRes = await Reservation.findOne({
    parkingSpot: share.parkingSpot,
    status: { $in: ['pending', 'approved', 'active'] },
    $or: [
      { startTime: { $lt: share.endTime }, endTime: { $gt: share.startTime } }
    ]
  });
  
  if (conflictingRes) {
    throw new Error('Parking space is no longer available for the selected time.');
  }

  await ShareRequest.updateMany(
    { parkingShare: share._id, _id: { $ne: request._id }, status: 'pending' },
    { $set: { status: 'rejected' } }
  );
  
  request.status = 'approved';
  await request.save();
  
  const reservation = new Reservation({
    parkingSpot: share.parkingSpot,
    user: request.requester,
    startTime: share.startTime,
    endTime: share.endTime,
    status: 'approved',
    purpose: 'Shared parking'
  });
  
  await reservation.save();
  
  return request;
};

const rejectShareRequest = async (requestId, ownerId) => {
  const request = await ShareRequest.findById(requestId);
  if (!request || request.status !== 'pending') {
    throw new Error('Invalid or already processed request');
  }
  
  if (request.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized');
  }
  
  request.status = 'rejected';
  return await request.save();
};

const getReceivedRequests = async (ownerId) => {
  return await ShareRequest.find({ owner: ownerId })
    .populate('requester', 'name email')
    .populate({
      path: 'parkingShare',
      populate: { path: 'parkingSpot' }
    })
    .sort({ createdAt: -1 });
};

const getSentRequests = async (requesterId) => {
  return await ShareRequest.find({ requester: requesterId })
    .populate({
      path: 'parkingShare',
      populate: { path: 'parkingSpot' }
    })
    .sort({ createdAt: -1 });
};

module.exports = {
  createShare,
  getAvailableSharedSpots,
  getOwnerShares,
  cancelShare,
  createShareRequest,
  approveShareRequest,
  rejectShareRequest,
  getReceivedRequests,
  getSentRequests
};
