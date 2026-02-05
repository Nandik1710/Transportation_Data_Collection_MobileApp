const rateLimit = require('express-rate-limit');

const flightLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Only 2 requests per hour
  message: { error: 'Too many flight search requests - please try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  delayAfter: 1,
  delayMs: 1000, // 1 second delay
});

module.exports = flightLimiter;
