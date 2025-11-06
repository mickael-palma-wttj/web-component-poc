/**
 * FormHelper - Utility methods for form handling in asset components
 * Provides methods for collecting, setting, and managing form data
 */
class FormHelper {
    /**
     * Collect form data from all inputs
     * Maps form field values to nested data structure
     * @param {HTMLFormElement} form - The form element
     * @returns {Object} Collected form data
     */
    static collectFormData(form) {
        const data = {};
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            const path = input.dataset.path;
            if (path) {
                this.setNestedValue(data, path, input.value);
            }
        });

        return data;
    }

    /**
     * Set a value in a nested object using dot notation path
     * Supports array notation for nested arrays (e.g., "items.0.name")
     * @param {Object} obj - Target object
     * @param {string} path - Dot notation path (e.g., "user.address.city")
     * @param {*} value - Value to set
     * @returns {void}
     */
    static setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const nextKey = keys[i + 1];

            // Check if next key is a number (array index)
            if (!isNaN(nextKey)) {
                if (!current[key]) {
                    current[key] = [];
                }
                if (!Array.isArray(current[key])) {
                    current[key] = [];
                }
                current = current[key];
            } else {
                if (!current[key] || typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key];
            }
        }

        const lastKey = keys[keys.length - 1];
        current[lastKey] = value;
    }

    /**
     * Get a value from a nested object using dot notation path
     * @param {Object} obj - Source object
     * @param {string} path - Dot notation path (e.g., "user.address.city")
     * @param {*} defaultValue - Default value if path doesn't exist
     * @returns {*} The value at the path or defaultValue
     */
    static getNestedValue(obj, path, defaultValue = undefined) {
        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }

        return current;
    }

    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Unescape HTML entities
     * @param {string} text - HTML text to unescape
     * @returns {string} Unescaped text
     */
    static unescapeHtml(text) {
        if (!text) return '';
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }

    /**
     * Create a deep clone of an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }

        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    /**
     * Validate form field
     * @param {HTMLInputElement} field - Form field to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result { isValid, error }
     */
    static validateField(field, rules = {}) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');

        if (required && !value) {
            return { isValid: false, error: 'This field is required' };
        }

        if (rules.minLength && value.length < rules.minLength) {
            return {
                isValid: false,
                error: `Minimum length is ${rules.minLength} characters`
            };
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            return {
                isValid: false,
                error: `Maximum length is ${rules.maxLength} characters`
            };
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            return { isValid: false, error: rules.patternError || 'Invalid format' };
        }

        if (type === 'email' && value && !this.isValidEmail(value)) {
            return { isValid: false, error: 'Invalid email address' };
        }

        if (type === 'url' && value && !this.isValidUrl(value)) {
            return { isValid: false, error: 'Invalid URL' };
        }

        return { isValid: true };
    }

    /**
     * Check if string is valid email
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Check if string is valid URL
     * @param {string} url - URL to validate
     * @returns {boolean} Is valid URL
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Format form data for submission
     * Converts nested objects back to flat structure if needed
     * @param {Object} data - Data to format
     * @returns {Object} Formatted data
     */
    static formatForSubmission(data) {
        return { ...data };
    }

    /**
     * Compare two objects for equality
     * @param {Object} obj1 - First object
     * @param {Object} obj2 - Second object
     * @returns {boolean} Are objects equal
     */
    static isEqual(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
        if (obj1 === null || obj2 === null) return false;

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        return keys1.every(key => {
            if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
                return this.isEqual(obj1[key], obj2[key]);
            }
            if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                return this.isEqual(obj1[key], obj2[key]);
            }
            return obj1[key] === obj2[key];
        });
    }
}

export { FormHelper };
