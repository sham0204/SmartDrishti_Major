// Validation utility functions

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
};

export const validateMinLength = (value, minLength, fieldName) => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateEnum = (value, enumValues, fieldName) => {
  if (!enumValues.includes(value)) {
    return `${fieldName} must be one of: ${enumValues.join(', ')}`;
  }
  return null;
};

export const validateNumberRange = (value, min, max, fieldName) => {
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }
  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
};

// Main validation function
export const validateFields = (data, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of fieldRules) {
      let error = null;
      
      switch (rule.type) {
        case 'required':
          error = validateRequired(value, rule.fieldName || field);
          break;
        case 'email':
          error = validateEmail(value);
          break;
        case 'minLength':
          error = validateMinLength(value, rule.minLength, rule.fieldName || field);
          break;
        case 'enum':
          error = validateEnum(value, rule.enumValues, rule.fieldName || field);
          break;
        case 'numberRange':
          error = validateNumberRange(value, rule.min, rule.max, rule.fieldName || field);
          break;
        default:
          break;
      }
      
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Helper function to create validation rules
export const validationRules = {
  required: (fieldName) => ({ type: 'required', fieldName }),
  email: () => ({ type: 'email' }),
  minLength: (minLength, fieldName) => ({ type: 'minLength', minLength, fieldName }),
  enum: (enumValues, fieldName) => ({ type: 'enum', enumValues, fieldName }),
  numberRange: (min, max, fieldName) => ({ type: 'numberRange', min, max, fieldName })
};