/**
 * StyleConstants - Centralized CSS constants and theme values
 * Provides reusable color, spacing, and animation values for components
 */
class StyleConstants {
    // ==========================================
    // Color Palette
    // ==========================================
    static COLORS = {
        // Neutral colors
        white: '#ffffff',
        gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
        },

        // Primary - Blue
        primary: {
            light: '#3b82f6',
            default: '#2563eb',
            dark: '#1d4ed8',
            lighter: 'rgba(59, 130, 246, 0.1)',
        },

        // Success - Green
        success: {
            light: '#10b981',
            default: '#059669',
            dark: '#047857',
        },

        // Error - Red
        error: {
            light: '#dc2626',
            default: '#b91c1c',
            dark: '#991b1b',
        },

        // Info - Blue (same as primary)
        info: '#3b82f6',
    };

    // ==========================================
    // Spacing Scale
    // ==========================================
    static SPACING = {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '2.5rem', // 40px
    };

    // ==========================================
    // Border Radius
    // ==========================================
    static RADIUS = {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px',
    };

    // ==========================================
    // Font Sizes
    // ==========================================
    static FONT_SIZE = {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
    };

    // ==========================================
    // Font Weights
    // ==========================================
    static FONT_WEIGHT = {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    };

    // ==========================================
    // Box Shadows
    // ==========================================
    static SHADOWS = {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    };

    // ==========================================
    // Transitions
    // ==========================================
    static TRANSITIONS = {
        fast: 'all 0.15s ease-in-out',
        normal: 'all 0.2s ease-in-out',
        slow: 'all 0.3s ease-in-out',
    };

    // ==========================================
    // Breakpoints
    // ==========================================
    static BREAKPOINTS = {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
    };

    // ==========================================
    // Utility Methods
    // ==========================================

    /**
     * Get a CSS variable value
     * @param {string} name - Variable name
     * @param {*} value - Value
     * @returns {string} CSS variable format
     */
    static var(name, value) {
        return `var(--${name}, ${value})`;
    }

    /**
     * Generate responsive media query
     * @param {string} breakpoint - Breakpoint size (sm, md, lg, xl)
     * @returns {string} Media query string
     */
    static media(breakpoint) {
        return `@media (min-width: ${this.BREAKPOINTS[breakpoint]})`;
    }

    /**
     * Generate hover state
     * @param {string} color - Color to use for hover
     * @returns {string} CSS for hover effect
     */
    static hoverEffect(color) {
        return `
      background-color: ${color};
      transform: translateY(-1px);
      ${this.TRANSITIONS.normal}
    `;
    }

    /**
     * Generate focus state
     * @param {string} color - Color for focus ring
     * @returns {string} CSS for focus effect
     */
    static focusRing(color = StyleConstants.COLORS.primary.light) {
        return `
      outline: none;
      border-color: ${color};
      box-shadow: 0 0 0 3px ${StyleConstants.COLORS.primary.lighter};
    `;
    }
}

export { StyleConstants };
