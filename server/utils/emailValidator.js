const dns = require('dns').promises;

/**
 * Validates email format and domain existence
 * @param {string} email - Email address to validate
 * @returns {Promise<{valid: boolean, message: string}>}
 */
const validateEmail = async (email) => {
  // Step 1: Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: 'Invalid email format'
    };
  }

  // Step 2: Extract domain
  const domain = email.split('@')[1];

  // Step 3: Check for common typos in popular domains
  const commonTypos = {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'outlok.com': 'outlook.com',
    'hotmial.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
  };

  if (commonTypos[domain]) {
    return {
      valid: false,
      message: `Invalid email domain. Did you mean ${email.replace(domain, commonTypos[domain])}?`
    };
  }

  // Step 4: Verify domain has MX records (email servers)
  try {
    const mxRecords = await dns.resolveMx(domain);
    
    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        message: 'This email domain cannot receive emails. Please use a valid email address.'
      };
    }

    // Valid email with MX records
    return {
      valid: true,
      message: 'Email is valid'
    };

  } catch (error) {
    // DNS lookup failed - domain doesn't exist
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return {
        valid: false,
        message: 'This email domain does not exist. Please check your email address.'
      };
    }

    // Other DNS errors - be lenient and allow (could be temporary network issue)
    
    return {
      valid: true,
      message: 'Email validation skipped due to network issue'
    };
  }
};

/**
 * List of disposable/temporary email providers to block
 */
const disposableEmailDomains = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'throwaway.email',
  'trashmail.com',
  'fakeinbox.com',
  'temp-mail.org',
  'getnada.com',
  'mohmal.com',
  'mintemail.com',
  'maildrop.cc'
];

/**
 * Check if email is from a disposable email provider
 * @param {string} email 
 * @returns {boolean}
 */
const isDisposableEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
};

module.exports = {
  validateEmail,
  isDisposableEmail,
  disposableEmailDomains
};
