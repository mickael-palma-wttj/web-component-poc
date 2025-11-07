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
 * CSS selector for all component elements
 * @type {string}
 */
const COMPONENT_SELECTOR = COMPONENT_NAMES.join(', ');

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

/** @type {boolean} Track if user has scrolled */
let hasUserScrolled = false;

// ==========================================
// Utility Functions
// ==========================================

/**
 * Get all rendered asset components from the DOM
 * @returns {NodeListOf<Element>}
 */
function getAllComponents() {
    return document.querySelectorAll(COMPONENT_SELECTOR);
}

/**
 * Get the wrapper element for a component
 * @param {Element} component - The asset component
 * @returns {Element|null}
 */
function getComponentWrapper(component) {
    return component.parentElement;
}

/**
 * Check if a component is collapsed
 * @param {Element} component - The asset component
 * @returns {boolean}
 */
function isComponentCollapsed(component) {
    return component.classList.contains('collapsed');
}

/**
 * Set component collapsed state
 * @param {Element} component - The asset component
 * @param {boolean} collapsed - Whether to collapse
 * @returns {void}
 */
function setComponentCollapsed(component, collapsed) {
    const wrapper = getComponentWrapper(component);
    if (collapsed) {
        component.classList.add('collapsed');
        wrapper?.classList.add('collapsed');
    } else {
        component.classList.remove('collapsed');
        wrapper?.classList.remove('collapsed');
    }
}

/**
 * Get the height of the sticky header
 * Used for scroll offset calculations
 * @returns {number} Header height in pixels
 */
function getHeaderHeight() {
    const header = document.querySelector('header');
    return header ? header.offsetHeight : 0;
}

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
            const element = createAssetElement(asset);
            if (!element) return;

            // Attach asset data to component
            element.assetData = asset.data;

            // Wrap component in asset-wrapper div for collapse button functionality
            const wrapper = document.createElement('div');
            wrapper.className = 'asset-wrapper';
            wrapper.appendChild(element);

            // Append wrapped component to container
            container.appendChild(wrapper);
        } catch (error) {
            // Silently fail for individual assets
        }
    });

    // Attach update listeners to all components
    attachAssetUpdateListeners();

    // Add asset attributes for animation targeting
    addAssetAttributes();

    // Initialize enhancements (navigation, search, scroll listeners)
    initializeEnhancements();
}

/**
 * Create a custom element for an asset
 * @private
 * @param {Object} asset - Asset data object
 * @returns {Element|null} Created element or null if invalid
 */
function createAssetElement(asset) {
    const componentName = COMPONENT_MAP[asset.type];

    if (!componentName || typeof componentName !== 'string' || componentName.length === 0) {
        return null;
    }

    // Check for any spaces or invalid characters
    if (componentName.includes(' ') || componentName.includes('=')) {
        return null;
    }

    const tempContainer = document.createElement('div');
    const titleValue = asset.title || asset.name || 'Asset';
    const escapedTitle = escapeHtmlAttribute(titleValue);
    const escapedType = escapeHtmlAttribute(asset.type);

    tempContainer.innerHTML = `<${componentName} title="${escapedTitle}" type="${escapedType}"></${componentName}>`;
    return tempContainer.firstChild;
}

/**
 * Escape HTML attribute values to prevent XSS
 * @private
 * @param {string} value - Value to escape
 * @returns {string}
 */
function escapeHtmlAttribute(value) {
    return value
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Build and populate the navigation sidebar
 * Creates quick-link navigation for all loaded assets
 * @private
 * @returns {void}
 */
function buildNavigation() {
    const navList = document.getElementById('nav-list');
    if (!navList) return;

    navList.innerHTML = '';

    assets.forEach((asset, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');

        a.textContent = asset.title || asset.type;
        a.href = `#asset-${index}`;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToAsset(index);
        });

        li.appendChild(a);
        navList.appendChild(li);
    });
}

/**
 * Scroll to a specific asset and highlight it
 * @private
 * @param {number} index - Index of asset to scroll to
 * @returns {void}
 */
function scrollToAsset(index) {
    const components = document.querySelectorAll(COMPONENT_NAMES.join(', '));
    const navLinks = document.querySelectorAll('.nav-sidebar a');

    if (components[index]) {
        const headerHeight = getHeaderHeight();
        const elementRect = components[index].getBoundingClientRect();
        const targetPosition = window.scrollY + elementRect.top - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });

        // Set active link after scroll completes
        setTimeout(() => {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLinks[index]) {
                navLinks[index].classList.add('active');
            }
        }, 800);
    }
}

/**
 * Update active navigation link
 * @private
 * @param {HTMLElement} activeLink - The link to set as active
 * @returns {void}
 */
function updateActiveNav(activeLink) {
    document.querySelectorAll('.nav-sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

/**
 * Set up scroll event listener for progress bar and navigation
 * Updates visual indicators as user scrolls through content
 * @private
 * @returns {void}
 */
function setupScrollListeners() {
    // Listen for first user scroll to set the flag
    const onFirstScroll = () => {
        hasUserScrolled = true;
        window.removeEventListener('scroll', onFirstScroll, true);
    };
    window.addEventListener('scroll', onFirstScroll, true);

    window.addEventListener('scroll', () => {
        updateProgressBar();
        updateActiveNavOnScroll();
    }, { passive: true });
}

/**
 * Update progress bar position based on scroll
 * @private
 * @returns {void}
 */
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const scrollPercent = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;

    progressBar.style.width = scrollPercent + '%';
}

/**
 * Update active navigation link based on scroll position
 * Finds the component closest to the top of the viewport
 * and highlights its corresponding navigation link
 * @private
 * @returns {void}
 */
function updateActiveNavOnScroll() {
    const components = getAllComponents();
    const navLinks = document.querySelectorAll('.nav-sidebar a');

    if (components.length === 0 || navLinks.length === 0 || !hasUserScrolled) {
        return;
    }

    // Get dynamic header height for scroll offset
    const headerHeight = getHeaderHeight();
    const scrollOffset = headerHeight + 50; // Add 50px padding (sticky header + component header)
    const triggerPoint = window.scrollY + scrollOffset;

    let currentActiveIndex = -1;

    // Find the last component that has passed the trigger point
    for (let i = 0; i < components.length; i++) {
        const componentTop = components[i].offsetTop;
        if (componentTop <= triggerPoint) {
            currentActiveIndex = i;
        }
    }

    // Update active link styling
    navLinks.forEach((link) => {
        link.classList.remove('active');
    });

    if (currentActiveIndex !== -1 && navLinks[currentActiveIndex]) {
        navLinks[currentActiveIndex].classList.add('active');
    }
}

/**
 * Search and filter assets
 * Searches through asset titles and content
 * @private
 * @param {string} query - Search query string
 * @returns {void}
 */
/**
 * Search and filter assets by query string
 * Matches against component title and type attributes
 * @private
 * @param {string} query - Search query string
 * @returns {void}
 */
function searchAssets(query) {
    const components = getAllComponents();
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
        // Show all assets if query is empty
        components.forEach((comp) => {
            comp.classList.remove('hidden');
        });
        return;
    }

    // Filter components by matching title or type
    components.forEach((component) => {
        const title = (component.getAttribute('title') || '').toLowerCase();
        const type = (component.getAttribute('type') || '').toLowerCase();
        const matches = title.includes(normalizedQuery) || type.includes(normalizedQuery);

        if (matches) {
            component.classList.remove('hidden');
        } else {
            component.classList.add('hidden');
        }
    });
}

/**
 * Set up search functionality
 * @private
 * @returns {void}
 */
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchAssets(e.target.value);
        }, 300);
    });
}

/**
 * Toggle collapse state of all assets
 * When all collapsed: expand all
 * When any expanded: collapse all
 * @private
 * @returns {void}
 */
function toggleAllAssets() {
    const components = getAllComponents();
    const toggleBtn = document.getElementById('toggle-all-btn');

    if (components.length === 0) {
        return;
    }

    // Check if all components are currently collapsed
    const allCollapsed = Array.from(components).every((comp) => isComponentCollapsed(comp));
    const newState = !allCollapsed;

    // Toggle all components to the opposite state
    components.forEach((component) => {
        // Update both component and wrapper classList
        setComponentCollapsed(component, newState);

        // Find toggle button in shadow DOM and update text
        const shadowRoot = component.shadowRoot;
        if (shadowRoot) {
            const toggleButton = shadowRoot.querySelector('.btn-collapse');
            if (toggleButton) {
                toggleButton.textContent = newState ? '⬆️ Expand' : '⬇️ Collapse';
            }
        }
    });

    // Update main toggle button text
    if (toggleBtn) {
        toggleBtn.textContent = newState ? '📦 Expand All' : '📦 Collapse All';
    }
}

// ==========================================
// Enhancement Setup
// ==========================================

/**
 * Initialize all UI enhancements
 * Called after assets are rendered
 * @private
 * @returns {void}
 */
function initializeEnhancements() {
    buildNavigation();
    setupScrollListeners();
    setupSearch();

    // Set up global collapse toggle
    const toggleAllBtn = document.getElementById('toggle-all-btn');
    if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', toggleAllAssets);
    }
}

// Apply data-asset-name attributes to components after rendering
/**
 * Add data attributes to all asset components
 * Used for animation targeting and asset identification
 * @private
 * @returns {void}
 */
function addAssetAttributes() {
    const components = getAllComponents();
    components.forEach((component, index) => {
        const assetName = component.getAttribute('title') || `asset-${index}`;
        component.setAttribute('data-asset-name', assetName);
    });
}

/**
 * Attach listeners to handle asset-updated events from components
 * Updates global assets state when components emit changes
 * @private
 * @returns {void}
 */
/**
 * Attach asset-updated event listeners to all components
 * Updates global assets array when component data changes
 * @private
 * @returns {void}
 */
function attachAssetUpdateListeners() {
    const components = getAllComponents();

    components.forEach((component) => {
        component.addEventListener('asset-updated', (event) => {
            const { type, data } = event.detail;

            // Find and update the asset in global state
            const assetIndex = assets.findIndex((a) => a.type === type);
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
