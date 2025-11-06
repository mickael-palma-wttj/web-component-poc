/**
 * Main application module for Asset Management System
 * Handles component imports, asset loading, rendering, and persistence
 * @module main
 */

// ==========================================
// Module Initialization
// ==========================================

// Import all asset components
import './components/base-component.js';
import './components/company-description.js';
import './components/their-story.js';
import './components/key-numbers.js';
import './components/funding-parser.js';
import './components/leadership.js';
import './components/office-locations.js';
import './components/perks-benefits.js';
import './components/remote-policy.js';

// ==========================================
// Configuration
// ==========================================

/**
 * Maps internal asset type names to HTML custom element names
 * @type {Object<string, string>}
 */
const COMPONENT_MAP = {
    'company_description': 'company-description',
    'their_story': 'their-story',
    'key_numbers': 'key-numbers',
    'funding_parser': 'funding-parser',
    'leadership': 'leadership-component',
    'office_locations': 'office-locations',
    'perks_and_benefits': 'perks-benefits',
    'remote_policy': 'remote-policy'
};

/**
 * List of all registered custom element names
 * @type {string[]}
 */
const COMPONENT_NAMES = Object.values(COMPONENT_MAP);

/**
 * Notification display duration in milliseconds
 * @type {number}
 */
const NOTIFICATION_DURATION = 3000;

/**
 * Notification animation duration in milliseconds
 * @type {number}
 */
const NOTIFICATION_ANIMATION_DURATION = 300;

// ==========================================
// State Management
// ==========================================

/** @type {Array<Object>} Global assets state */
let assets = [];

// ==========================================
// Asset Data Management
// ==========================================

/**
 * Fetch all assets from the server
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If fetch fails or server returns error
 */
async function loadAssets() {
    try {
        const response = await fetch('/api/assets');
        const result = await response.json();

        if (result.success) {
            assets = result.assets;
            renderAssets();
        } else {
            showError(`Failed to load assets: ${result.error}`);
        }
    } catch (error) {
        showError(`Error loading assets: ${error.message}`);
    }
}

/**
 * Render all loaded assets to the DOM
 * Creates custom component elements for each asset
 * Attaches asset data to components and sets up event listeners
 * @returns {void}
 */
function renderAssets() {
    const container = document.getElementById('assets-container');

    if (!container) {
        return;
    }

    container.innerHTML = ''; // Clear existing content

    if (assets.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No assets found</p>';
        return;
    }

    assets.forEach((asset) => {
        try {
            const componentName = COMPONENT_MAP[asset.type];

            if (!componentName) {
                return;
            }

            // Verify component name is a valid string
            if (typeof componentName !== 'string' || !componentName || componentName.length === 0) {
                return;
            }

            // Check for any spaces or invalid characters
            if (componentName.includes(' ') || componentName.includes('=')) {
                return;
            }

            // Create element using innerHTML - most reliable method for custom elements
            let element;

            try {
                const tempContainer = document.createElement('div');
                // Use title if available, otherwise use name
                const titleValue = asset.title || asset.name || 'Asset';
                const escapedTitle = titleValue.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const escapedType = asset.type.replace(/"/g, '&quot;');
                // Create element with attributes in the HTML string
                tempContainer.innerHTML = `<${componentName} title="${escapedTitle}" type="${escapedType}"></${componentName}>`;
                element = tempContainer.firstChild;
            } catch (error) {
                throw error;
            }

            if (!element) {
                throw new Error(`Could not create element: ${componentName}`);
            }

            // Attach asset data to component
            element.assetData = asset.data;

            // Append to container
            container.appendChild(element);
        } catch (error) {
            // Silently fail for individual assets
        }
    });

    // Attach update listeners to all components
    attachAssetUpdateListeners();
}

/**
 * Attach listeners to handle asset-updated events from components
 * Updates global assets state when components emit changes
 * @private
 * @returns {void}
 */
function attachAssetUpdateListeners() {
    const components = document.querySelectorAll(COMPONENT_NAMES.join(', '));

    components.forEach((component) => {
        component.addEventListener('asset-updated', (event) => {
            const { type, data } = event.detail;

            // Find and update the asset in global state
            const assetIndex = assets.findIndex(a => a.type === type);
            if (assetIndex !== -1) {
                assets[assetIndex].data = data;
                showNotification(`${type} updated`, 'info');
            }
        });
    });
}

/**
 * Save all modified assets to the server
 * Updates UI state during save process
 * @async
 * @returns {Promise<void>}
 */
async function saveAllAssets() {
    const saveBtn = document.getElementById('save-all');
    const originalText = saveBtn.textContent;

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const response = await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assets })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('All changes saved successfully!', 'success');
        } else {
            showNotification(`Failed to save: ${result.error}`, 'error');
        }
    } catch (error) {
        showNotification(`Error saving: ${error.message}`, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

// ==========================================
// User Feedback (Notifications & Errors)
// ==========================================

/**
 * Notification type styles mapping
 * @type {Object<string, string>}
 * @private
 */
const NOTIFICATION_STYLES = {
    info: 'bg-blue-100 text-blue-800 border-blue-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300'
};

/**
 * Display a temporary notification message
 * Auto-dismisses after NOTIFICATION_DURATION
 * @param {string} message - Message to display
 * @param {string} [type='info'] - Notification type (info, success, error)
 * @returns {void}
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const styleClass = NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.info;

    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg border-2 shadow-lg z-[9999] animate-slide-in ${styleClass}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('animate-slide-out');
        setTimeout(() => {
            notification.remove();
        }, NOTIFICATION_ANIMATION_DURATION);
    }, NOTIFICATION_DURATION);
}

/**
 * Display error message in the assets container
 * @param {string} message - Error message to display
 * @returns {void}
 */
function showError(message) {
    const container = document.getElementById('assets-container');
    container.innerHTML = `<div class="bg-red-100 text-red-800 border-2 border-red-300 rounded-lg p-6 text-center">${message}</div>`;
}

// ==========================================
// Debugging & Utilities
// ==========================================

/**
 * Debug utility to inspect all rendered components in the DOM
 * Logs component information including data and shadow root state
 * Attached to window for console access: window.debugComponents()
 * @function
 * @returns {void}
 */
function debugComponents() {
    const components = document.querySelectorAll(COMPONENT_NAMES.join(', '));

    components.forEach((comp, i) => {
        console.log(`[Debug] Component ${i}:`, {
            tagName: comp.tagName,
            title: comp.getAttribute('title'),
            hasData: !!comp.data,
            hasShadowRoot: !!comp.shadowRoot,
            shadowRootPreview: comp.shadowRoot?.innerHTML?.substring(0, 100) || 'N/A'
        });
    });
}

/**
 * Attach debug utilities to window for console access
 * @returns {void}
 * @private
 */
function attachDebugTools() {
    window.debugComponents = debugComponents;
}

// ==========================================
// Event Listeners & Initialization
// ==========================================

/**
 * Attach event listeners to UI buttons and controls
 * @private
 * @returns {void}
 */
function attachEventListeners() {
    const saveBtn = document.getElementById('save-all');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAllAssets);
    }
}

/**
 * Wait for all custom elements to be defined
 * Initializes app after all components are ready
 * @async
 * @private
 * @returns {Promise<void>}
 */
async function initializeApp() {
    try {
        // Wait for all components to be registered
        await Promise.all(
            COMPONENT_NAMES.map(name => customElements.whenDefined(name))
        );

        // Attach event listeners
        attachEventListeners();

        // Load initial data
        await loadAssets();

        // Attach debug tools
        attachDebugTools();
    } catch (error) {
        showError('Application failed to initialize. Please refresh the page.');
    }
}

// ==========================================
// Application Startup
// ==========================================

// Initialize app when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // Document already loaded
    initializeApp();
}
