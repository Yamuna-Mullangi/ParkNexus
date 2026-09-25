const crypto = require('crypto');
const VisitorPass = require('../models/VisitorPass');
const Visitor = require('../models/Visitor');
const User = require('../models/User');

const generateToken = () => {
  return `PARKNEXUS-VISITOR-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
};

const createVisitorPass = async (visitorId, userId) => {
  const visitor = await Visitor.findOne({ _id: visitorId, resident: userId });
  if (!visitor) throw new Error('Visitor not found or unauthorized');

  if (['cancelled', 'completed', 'expired'].includes(visitor.status)) {
    throw new Error('Cannot issue pass for cancelled or completed visit');
  }

  // Disable existing active passes for this visitor
  await VisitorPass.updateMany(
    { visitor: visitorId, status: 'active' },
    { $set: { status: 'cancelled' } }
  );

  const token = generateToken();
  const pass = new VisitorPass({
    visitor: visitorId,
    passToken: token,
    qrPayload: token, // Not putting personal info here
    issuedBy: userId,
    validFrom: visitor.expectedArrival,
    validUntil: visitor.expectedDeparture,
    status: 'active'
  });

  await pass.save();
  return pass;
};

const getPassById = async (passId, userId) => {
  const pass = await VisitorPass.findById(passId)
    .populate({
      path: 'visitor',
      populate: { path: 'vehicle' }
    });
    
  if (!pass) throw new Error('Pass not found');

  if (pass.issuedBy.toString() !== userId.toString()) {
    throw new Error('Unauthorized');
  }

  return pass;
};

const cancelPass = async (passId, userId) => {
  const pass = await VisitorPass.findById(passId);
  if (!pass) throw new Error('Pass not found');
  
  if (pass.issuedBy.toString() !== userId.toString()) {
    throw new Error('Unauthorized');
  }

  if (pass.status !== 'active') {
    throw new Error('Pass is not active');
  }

  pass.status = 'cancelled';
  await pass.save();
  return pass;
};

const validatePass = async (token) => {
  const pass = await VisitorPass.findOne({ passToken: token })
    .populate({
      path: 'visitor',
      populate: { path: 'vehicle' }
    })
    .populate('issuedBy', 'name room block');

  if (!pass) {
    return { valid: false, reason: 'Invalid Pass' };
  }

  const now = new Date();

  if (pass.status === 'cancelled') {
    return { valid: false, reason: 'Cancelled', passDetails: pass };
  }

  if (pass.status === 'used') {
    return { valid: false, reason: 'Already Used', passDetails: pass };
  }

  if (pass.status === 'expired' || now > pass.validUntil) {
    if (pass.status !== 'expired') {
      pass.status = 'expired';
      await pass.save();
    }
    return { valid: false, reason: 'Expired', passDetails: pass };
  }

  if (now < pass.validFrom) {
    return { valid: false, reason: 'Not Yet Valid', passDetails: pass };
  }

  return { valid: true, passDetails: pass };
};

module.exports = {
  createVisitorPass,
  getPassById,
  cancelPass,
  validatePass
};
