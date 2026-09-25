const validateVisitor = (data) => {
  const { fullName, phone, expectedArrival, expectedDeparture } = data;
  const errors = [];

  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    errors.push('Full name is required');
  }

  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    errors.push('Phone number is required');
  } else if (!/^\+?[\d\s-]{7,15}$/.test(phone)) {
    errors.push('Invalid phone number format');
  }

  if (!expectedArrival) {
    errors.push('Expected arrival time is required');
  }
  
  if (!expectedDeparture) {
    errors.push('Expected departure time is required');
  }

  if (expectedArrival && expectedDeparture) {
    const arrival = new Date(expectedArrival);
    const departure = new Date(expectedDeparture);
    
    if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
      errors.push('Invalid date format');
    } else if (arrival >= departure) {
      errors.push('Expected arrival must be before expected departure');
    } else if (arrival < new Date()) {
      errors.push('Expected arrival cannot be in the past');
    }
  }

  return errors;
};

module.exports = { validateVisitor };
