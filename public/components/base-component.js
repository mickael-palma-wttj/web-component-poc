/**
 * Base class for all asset components
 * Provides core functionality for rendering, editing, and previewing asset data
 * 
 * Refactored to use utility classes:
 * - StyleConstants: Centralized CSS constants
 * - TemplateBuilder: Template generation methods
 * - FormHelper: Form handling utilities
 * 
 * @extends HTMLElement
 */
import { StyleConstants } from './style-constants.js';
import { TemplateBuilder } from './template-builder.js';
import { FormHelper } from './form-helper.js';
import { injectSpinnerStyles } from '../utils/spinner-styles.js';

// Ensure spinner styles are injected on module load
injectSpinnerStyles();

class AssetComponent extends HTMLElement {
  // ==========================================
  // Configuration Constants
  // ==========================================

  static MIN_DRAWER_WIDTH = 300;
  static DEFAULT_DRAWER_WIDTH = 500;
  static RESIZE_HANDLE_WIDTH = 4;
  static DEBUG_MODE = false; // Set to true to enable console logs

  // ==========================================
  // Lifecycle Methods
  // ==========================================

  /**
   * Initialize the component with shadow DOM
   */
  constructor() {
    try {
      super();
      this._log('super() completed');
      this.attachShadow({ mode: 'open' });
      this._log('Shadow root attached');
      this.isEditing = false;
      this.originalData = null;
      this.data = null;
      this._log('Constructor completed successfully');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Called when element is inserted into DOM
   */
  connectedCallback() {
    this._log('connectedCallback called, has shadowRoot:', !!this.shadowRoot);

    // Initialize child-specific properties if not already set
    // (child constructors may have tried to set these before element was ready)
    if (!this.getAttribute('type') && this.type && this.type !== 'undefined') {
      this.setAttribute('type', this.type);
    }

    // Render immediately - data might already be set
    this.render();
  }

  // ==========================================
  // Property Getters and Setters
  // ==========================================

  /**
   * Get the title attribute from the element
   * @returns {string} The title or 'undefined' if not set
   */
  get title() {
    const titleValue = this.getAttribute('title');
    return titleValue || 'undefined';
  }

  /**
   * Set the title attribute on the element
   * @param {string} value - The title to set
   */
  set title(value) {
    try {
      this.setAttribute('title', value);
    } catch (e) {
      // Element might not be ready yet during construction
    }
  }

  /**
   * Get the type attribute from the element
   * @returns {string} The type or 'undefined' if not set
   */
  get type() {
    return this.getAttribute('type') || 'undefined';
  }

  /**
   * Set the type attribute on the element
   * @param {string} value - The type to set
   */
  set type(value) {
    try {
      this.setAttribute('type', value);
    } catch (e) {
      // Element might not be ready yet during construction
    }
  }

  // ==========================================
  // Abstract Methods (to be implemented by child classes)
  // ==========================================

  /**
   * Render the component in view mode
   * @returns {string} HTML content for view mode
   * @abstract
   */
  renderView() {
    return '<div>Asset component</div>';
  }

  /**
   * Render the component in edit mode
   * @returns {string} HTML content for edit mode
   * @abstract
   */
  renderEdit() {
    return '<div>Edit mode not implemented</div>';
  }

  /**
   * Render the component in preview mode (live preview during editing)
   * @returns {string} HTML content for preview
   * @abstract
   */
  renderPreview() {
    return this.renderView();
  }

  // ==========================================
  // Rendering Methods
  // ==========================================

  /**
   * Main render method - manages layout based on editing state
   * Calls appropriate template builders and applies styles
   */
  render() {
    this._log('render() called, has data:', !!this.data, 'title:', this.title);

    if (!this.data) {
      this.shadowRoot.innerHTML = TemplateBuilder.getLoadingTemplate(this.title);
      return;
    }

    this._log('Rendering with data');

    const layoutStyles = TemplateBuilder.getComponentStyles();
    const formStyles = this.getStyles();
    const content = this.isEditing ? this.renderEdit() : this.renderView();
    const preview = this.isEditing ? this.renderPreview() : '';

    // Combine styles with layout styles FIRST, then form styles LAST so form styles don't override layout
    const combinedStyles = `
        ${layoutStyles}
        ${formStyles}
      `;

    // When editing, render without the edit drawer (it will be in light DOM)
    const mainContent = this.isEditing
      ? TemplateBuilder.getEditModeTemplate(content, preview, true)
      : TemplateBuilder.getEditModeTemplate(content, preview, false);

    this.shadowRoot.innerHTML = `
      <style>
        ${combinedStyles}
      </style>
      <div class="component-wrapper ${this.isEditing ? 'editing' : ''}">
        ${TemplateBuilder.getHeaderTemplate(this.title, this.isEditing)}
        ${this.isEditing ? mainContent : TemplateBuilder.getViewModeTemplate(content)}
      </div>
    `;

    this.attachEventListeners();

    // If editing, create the drawer in light DOM (assets-container)
    if (this.isEditing) {
      this._createLightDOMDrawer(content, preview);
    } else {
      this._removeLightDOMDrawer();
    }

    // Re-inject collapse button after render (it gets lost when re-rendering)
    this._reinjectCollapseButton();
  }

  /**
   * Re-inject the collapse/expand button into the shadow DOM button-group
   * Called after each render to ensure the button persists across re-renders
   * Ensures event listener is reset when edit mode is activated
   * @private
   */
  _reinjectCollapseButton() {
    const buttonGroup = this.shadowRoot.querySelector('.button-group');
    if (!buttonGroup) return;

    this._removeExistingCollapseButton(buttonGroup);
    const toggleBtn = this._createCollapseButton();
    this._attachCollapseListener(toggleBtn);
    buttonGroup.insertBefore(toggleBtn, buttonGroup.firstChild);

    this._log('Collapse button re-injected, isEditing:', this.isEditing);
  }

  /**
   * Remove existing collapse button and its listeners
   * @private
   */
  _removeExistingCollapseButton(buttonGroup) {
    const existing = buttonGroup.querySelector('.btn-collapse');
    if (existing) {
      // Clone and replace to remove all event listeners
      const clone = existing.cloneNode(false);
      existing.replaceWith(clone);
    }
  }

  /**
   * Create collapse button element
   * @private
   */
  _createCollapseButton() {
    const btn = document.createElement('button');
    btn.className = 'btn-collapse';
    btn.setAttribute('type', 'button');
    // Text will be set in _attachCollapseListener based on actual current state
    return btn;
  }

  /**
   * Attach click listener to collapse button
   * @private
   */
  _attachCollapseListener(btn) {
    const handleClick = (e) => {
      e.stopPropagation();
      e.preventDefault();

      const wrapper = this.parentElement;
      if (!wrapper?.classList.contains('asset-wrapper')) {
        this._log('No asset-wrapper parent found');
        return;
      }

      // Toggle both the wrapper AND the component itself
      const isCollapsed = wrapper.classList.toggle('collapsed');
      this.classList.toggle('collapsed', isCollapsed);
      btn.textContent = isCollapsed ? '⬆️ Expand' : '⬇️ Collapse';
    };

    // Set initial button text based on current wrapper state
    const wrapper = this.parentElement;
    const isCurrentlyCollapsed = wrapper?.classList.contains('collapsed');
    btn.textContent = isCurrentlyCollapsed ? '⬆️ Expand' : '⬇️ Collapse';

    this._collapseClickHandler = handleClick;
    btn.addEventListener('click', handleClick);
  }

  /**
   * Create edit drawer in light DOM (assets-container) instead of shadow DOM
   * @private
   */
  _createLightDOMDrawer(content, preview) {
    this._removeLightDOMDrawer();

    const container = document.getElementById('assets-container');
    if (!container) return;

    const formStyles = this.getStyles();
    const drawer = this._buildDrawerElement(content, formStyles);

    container.appendChild(drawer);
    this._attachLightDOMDrawerListeners(drawer);
    this._setupDrawerResize(drawer);
  }

  /**
   * Build drawer HTML element
   * @private
   */
  _buildDrawerElement(content, formStyles) {
    const drawer = document.createElement('div');
    drawer.className = 'edit-drawer-light-dom';
    drawer.setAttribute('data-component-id', this.getAttribute('data-asset-name') || 'unknown');
    drawer.innerHTML = `
      <style>${formStyles}</style>
      <div class="drawer-resize-handle"></div>
      <div class="edit-drawer-header">
        <h3>Edit</h3>
        <div class="button-group">
          <button class="btn-save" data-action="save">Save</button>
          <button class="btn-cancel" data-action="cancel">Cancel</button>
        </div>
      </div>
      <div class="edit-scroll-container">
        ${content}
      </div>
    `;
    return drawer;
  }

  /**
   * Remove light DOM drawer
   * @private
   */
  _removeLightDOMDrawer() {
    const drawer = document.querySelector('.edit-drawer-light-dom');
    if (drawer) drawer.remove();
  }

  /**
   * Set up resize handler for drawer width
   * Allows dragging the left border to resize the drawer
   * @private
   */
  _setupDrawerResize(drawer) {
    const resizeHandle = drawer.querySelector('.drawer-resize-handle');
    if (!resizeHandle) return;

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    const handleMouseDown = (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = parseInt(window.getComputedStyle(drawer).width, 10);
      this._applyResizingState(true);
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = startWidth + (startX - e.clientX);
      this._resizeDrawerIfValid(drawer, newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        this._applyResizingState(false);
      }
    };

    resizeHandle.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  /**
   * Apply or remove resizing state to document
   * @private
   */
  _applyResizingState(isResizing) {
    document.body.style.cursor = isResizing ? 'col-resize' : 'default';
    document.body.style.userSelect = isResizing ? 'none' : 'auto';
  }

  /**
   * Resize drawer if within valid constraints
   * @private
   */
  _resizeDrawerIfValid(drawer, newWidth) {
    const MIN_WIDTH = 300;
    const MAX_WIDTH = window.innerWidth * 0.8;

    if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
      drawer.style.width = newWidth + 'px';
    }
  }

  /**
   * Attach listeners to light DOM drawer buttons
   * @private
   */
  _attachLightDOMDrawerListeners(drawer) {
    const saveBtn = drawer.querySelector('[data-action="save"]');
    const cancelBtn = drawer.querySelector('[data-action="cancel"]');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveChanges());
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.cancelEdit());
    }

    // Attach listeners to all data-action buttons (including custom ones like btn-add-item)
    drawer.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = e.target.dataset.action;
        const index = e.target.dataset.index;
        this.handleAction(action, index);
      });
    });

    // Attach form listeners for live preview
    const form = drawer.querySelector('.edit-form');
    if (form) {
      form.addEventListener('input', () => this.updateLivePreview());
      form.addEventListener('change', () => this.updateLivePreview());
    }
  }

  // ==========================================
  // Event Handling Methods
  // ==========================================

  /**
   * Attach event listeners to form, buttons, and interactive elements
   * Separates concerns for form, overlay, and drawer resize interactions
   */
  attachEventListeners() {
    this._attachActionButtons();

    if (this.isEditing) {
      this._attachFormListeners();
      this._attachOverlayListener();
      this._attachDrawerResizeListener();
    }
  }

  /**
   * Attach listeners to action buttons (Edit, Save, Cancel)
   * @private
   */
  _attachActionButtons() {
    this._attachDOMListeners(this.shadowRoot, '[data-action]', (e) => {
      e.preventDefault();
      const action = e.target.dataset.action;
      const index = e.target.dataset.index;
      this.handleAction(action, index);
    });
  }

  /**
   * Attach form listeners for live preview updates
   * @private
   */
  _attachFormListeners() {
    const form = this._findForm();
    if (form) {
      form.addEventListener('input', () => this.updateLivePreview());
      form.addEventListener('change', () => this.updateLivePreview());
    }
  }

  /**
   * Attach overlay close listener
   * @private
   */
  _attachOverlayListener() {
    const overlay = this.shadowRoot.querySelector('[data-close-overlay]');
    if (overlay) {
      overlay.addEventListener('click', () => this.cancelEdit());
    }
  }

  /**
   * Attach drawer resize functionality
   * @private
   */
  _attachDrawerResizeListener() {
    const drawer = this.shadowRoot.querySelector('.edit-drawer');
    if (drawer) {
      drawer.addEventListener('mousedown', (e) => {
        if (e.offsetX < AssetComponent.RESIZE_HANDLE_WIDTH) {
          this.startDrawerResize(e);
        }
      });
    }
  }

  /**
   * Helper to attach listeners to multiple DOM elements
   * @private
   */
  _attachDOMListeners(container, selector, handler) {
    container.querySelectorAll(selector).forEach(el => {
      el.addEventListener('click', handler);
    });
  }

  /**
   * Find form in shadow DOM or light DOM drawer
   * @private
   * @returns {HTMLFormElement|null}
   */
  _findForm() {
    let form = this.shadowRoot.querySelector('.edit-form');
    if (!form) {
      const drawer = document.querySelector('.edit-drawer-light-dom');
      if (drawer) form = drawer.querySelector('.edit-form');
    }
    return form;
  }

  /**
   * Handle action button clicks
   * Dispatcher for Edit, Save, Cancel actions
   * @param {string} action - The action to handle
   * @param {string|number} index - Optional index for array operations
   */
  handleAction(action, index) {
    switch (action) {
      case 'edit':
        this.startEdit();
        break;
      case 'save':
        this.saveChanges();
        break;
      case 'cancel':
        this.cancelEdit();
        break;
      case 'download-image':
        this.downloadAsImage();
        break;
      default:
        // Allow subclasses to handle custom actions
        if (this.handleCustomAction) {
          this.handleCustomAction(action, index);
        }
        break;
    }
  }

  // ==========================================
  // Edit Mode Methods
  // ==========================================

  /**
   * Enter edit mode
   * Saves a copy of current data for potential rollback
   * Resets collapse button listener when activating edit mode
   */
  startEdit() {
    this.originalData = FormHelper.deepClone(this.data);
    this.isEditing = true;

    // Clean up old collapse button listener before re-rendering
    if (this._collapseClickHandler) {
      const oldBtn = this.shadowRoot?.querySelector('.btn-collapse');
      if (oldBtn) {
        oldBtn.removeEventListener('click', this._collapseClickHandler);
      }
    }

    this.render();
  }

  /**
   * Update live preview while user is editing
   * Collects current form data and re-renders the preview panel
   * Can be overridden by subclasses for custom preview logic
   */
  updateLivePreview() {
    const form = this._findForm();
    if (!form) return;

    // Collect current form data
    const updatedData = FormHelper.collectFormData(form);
    this.data = { ...this.data, ...updatedData };

    // Re-render preview in shadow DOM
    const previewPanel = this.shadowRoot.querySelector('.preview-content');
    if (previewPanel) {
      previewPanel.innerHTML = this.renderPreview();
    }
  }

  /**
   * Handle drawer resize on mousedown event
   * Allows user to drag the resize handle to adjust drawer width
   * @param {MouseEvent} e - The mousedown event
   * @private
   */
  startDrawerResize(e) {
    e.preventDefault();
    const drawer = this.shadowRoot.querySelector('.edit-drawer');
    const startX = e.clientX;
    const startWidth = drawer.offsetWidth;

    const onMouseMove = (moveEvent) => {
      const diff = startX - moveEvent.clientX;
      const newWidth = Math.max(AssetComponent.MIN_DRAWER_WIDTH, startWidth + diff);
      drawer.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  /**
   * Cancel edit mode and restore original data
   */
  cancelEdit() {
    this.data = this.originalData;
    this.isEditing = false;
    this.render();
  }

  /**
   * Save changes and exit edit mode
   * Collects form data, dispatches update event, and re-renders in view mode
   */
  saveChanges() {
    const form = this._findForm();
    if (form) {
      const updatedData = FormHelper.collectFormData(form);
      this.data = { ...this.data, ...updatedData };
    }

    this.isEditing = false;
    this.render();

    // Dispatch event to notify parent
    this.dispatchEvent(new CustomEvent('asset-updated', {
      detail: { type: this.type, data: this.data },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Download the rendered content as an image
   * Captures the visible component content and saves it as PNG using SnapDOM
   * SnapDOM is a lightweight DOM-to-image library with excellent Shadow DOM support
   */
  async downloadAsImage() {
    let spinner = null;
    try {
      spinner = this._createSpinner();
      await this._loadSnapDOM();
      await this._captureAndDownloadImage();
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to load SnapDOM library: ${error.message}`);
    } finally {
      this._removeSpinner(spinner);
    }
  }

  /**
   * Create and display spinner overlay
   * @private
   */
  _createSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'snapdom-spinner-overlay';
    spinner.innerHTML = `
      <div class="snapdom-spinner-content">
        <div class="snapdom-spinner"></div>
        <p>Generating image...</p>
      </div>
    `;
    document.body.appendChild(spinner);
    return spinner;
  }

  /**
 * Remove spinner overlay
 * @private
 */
  _removeSpinner(spinner) {
    if (spinner?.parentNode) {
      spinner.parentNode.removeChild(spinner);
    }
  }

  /**
   * Load SnapDOM library if not already loaded
   * @private
   */
  async _loadSnapDOM() {
    if (window.snapdom) return;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@zumer/snapdom/dist/snapdom.min.js';
    script.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load SnapDOM'));
      document.head.appendChild(script);
    });
  }

  /**
   * Capture and download image with appropriate delay for maps
   * @private
   */
  async _captureAndDownloadImage() {
    const hasMap = this.shadowRoot.textContent.includes('map') || this.shadowRoot.querySelector('.location-map');
    const delay = hasMap ? 2000 : 500;

    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await window.snapdom.download(this, {
            scale: 2,
            backgroundColor: '#ffffff',
            quality: 0.95,
            filename: `${this.title || 'asset'}-${Date.now()}`
          });
          resolve();
        } catch (error) {
          console.error('Failed to capture image:', error);
          alert('Failed to download image. Try again in a moment.');
          resolve();
        }
      }, delay);
    });
  }

  /**
   * Collect form data from all input fields
   * Maps input values to nested data object using data-path attribute
   * Delegates to FormHelper for implementation
   * @param {HTMLFormElement} form - The form element to collect data from
  * Collect form data from all input fields
    * Maps input values to nested data object using data-path attribute
      * Delegates to FormHelper for implementation
        * @param { HTMLFormElement } form - The form element to collect data from
          */
  collectFormData(form) {
    return FormHelper.collectFormData(form);
  }

  /**
   * Set a value in nested object using dot notation path
   * Delegates to FormHelper for implementation
   * @param {Object} obj - The target object
   * @param {string} path - Dot notation path (e.g., "user.profile.name")
   * @param {*} value - The value to set
   */
  setNestedValue(obj, path, value) {
    FormHelper.setNestedValue(obj, path, value);
  }

  /**
   * Get a value from nested object using dot notation path
   * Delegates to FormHelper for implementation
   * @param {Object} obj - The source object
   * @param {string} path - Dot notation path (e.g., "user.profile.name")
   * @returns {*} The value at the path, or undefined if not found
   */
  getNestedValue(obj, path) {
    return FormHelper.getNestedValue(obj, path);
  }

  /**
   * Escape HTML special characters to prevent XSS attacks
   * Delegates to FormHelper for implementation
   * @param {string} unsafe - The unsafe HTML string
   * @returns {string} Escaped HTML safe string
   */
  escapeHtml(unsafe) {
    return FormHelper.escapeHtml(unsafe);
  }

  /**
   * Conditional debug logging
   * Only logs when DEBUG_MODE is enabled
   * @param {...*} args - Arguments to log
   * @private
   */
  _log(...args) {
    if (AssetComponent.DEBUG_MODE) {
      console.log('[AssetComponent]', ...args);
    }
  }

  // ==========================================
  // Style Methods
  // ==========================================

  /**
   * Get all form and content styles
   * Can be extended by child classes using super.getStyles()
   * 
   * @returns {string} CSS styles for forms and content
   */
  getStyles() {
    const c = StyleConstants.COLORS;
    const s = StyleConstants.SPACING;
    const r = StyleConstants.RADIUS;
    const f = StyleConstants.FONT_SIZE;
    const fw = StyleConstants.FONT_WEIGHT;

    return `
      /* ========== Form Styles ========== */
      .edit-form { 
        display: flex; 
        flex-direction: column; 
        gap: ${s.md}; 
      }
      
      .form-group { 
        display: flex; 
        flex-direction: column; 
        gap: ${s.sm}; 
      }
      
      .form-group label { 
        font-weight: ${fw.semibold}; 
        color: ${c.gray[700]}; 
        font-size: ${f.sm}; 
      }
      
      .form-group input,
      .form-group textarea,
      .form-group select { 
        padding: ${s.sm} ${s.xs};
        border: 1px solid ${c.gray[300]};
        border-radius: ${r.sm};
        font-size: ${f.sm};
      }
      
      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: ${c.primary.light};
        box-shadow: 0 0 0 3px ${c.primary.lighter};
      }
      
      .form-group textarea { 
        min-height: 100px; 
        resize: vertical; 
      }
      
      /* ========== Array Editor Styles ========== */
      .array-editor { 
        border: 2px dashed ${c.gray[300]};
        border-radius: ${r.lg};
        padding: ${s.md};
        margin-bottom: ${s.md};
        background-color: ${c.gray[50]};
      }
      
      .array-editor-header { 
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${s.md};
        padding-bottom: ${s.sm};
        border-bottom: 2px solid ${c.gray[300]};
      }
      
      .array-editor-header label { 
        font-weight: ${fw.bold};
        color: ${c.gray[900]};
        font-size: ${f.base};
      }
      
      .btn-add-item { 
        padding: ${s.sm} ${s.xs};
        background-color: ${c.primary.default};
        color: white;
        border: none;
        border-radius: ${r.sm};
        font-size: ${f.sm};
        font-weight: ${fw.medium};
        cursor: pointer;
        transition: ${StyleConstants.TRANSITIONS.normal};
      }
      
      .btn-add-item:hover {
        background-color: ${c.primary.dark};
        transform: translateY(-1px);
      }
      
      .array-items { 
        display: flex;
        flex-direction: column;
        gap: ${s.sm};
      }
      
      .array-item-edit { 
        background-color: white;
        border: 1px solid ${c.gray[300]};
        border-radius: ${r.md};
        padding: ${s.md};
      }
      
      .array-item-header { 
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${s.sm};
        padding-bottom: ${s.sm};
        border-bottom: 1px solid ${c.gray[200]};
      }
      
      .array-item-title { 
        font-weight: ${fw.semibold};
        color: ${c.gray[700]};
        font-size: ${f.sm};
      }
      
      .btn-remove-item { 
        padding: 0.25rem ${s.xs};
        background-color: ${c.error.light};
        color: white;
        border: none;
        border-radius: ${r.sm};
        font-size: 0.75rem;
        cursor: pointer;
        transition: ${StyleConstants.TRANSITIONS.normal};
      }
      
      .btn-remove-item:hover {
        background-color: ${c.error.default};
      }
      
      /* ========== Layout Styles ========== */
      .form-row { 
        display: grid;
        grid-template-columns: 1fr;
        gap: ${s.md};
      }
      
      @media (min-width: ${StyleConstants.BREAKPOINTS.md}) {
        .form-row {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      .form-hint { 
        font-size: ${f.xs};
        color: ${c.gray[600]};
        margin-top: 0.25rem;
        font-style: italic;
      }
      
      /* ========== Info Grid Styles ========== */
      .info-grid { 
        display: grid;
        grid-template-columns: 1fr;
        gap: ${s.md};
        margin-top: ${s.md};
      }
      
      @media (min-width: ${StyleConstants.BREAKPOINTS.md}) {
        .info-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @media (min-width: ${StyleConstants.BREAKPOINTS.lg}) {
        .info-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      
      .info-item { 
        padding: ${s.md};
        background-color: ${c.gray[50]};
        border-radius: ${r.sm};
        border-left: 4px solid ${c.primary.default};
      }
      
      .info-item strong { 
        display: block;
        color: ${c.gray[700]};
        font-size: ${f.sm};
        margin-bottom: 0.25rem;
      }
      
      .info-item span { 
        color: ${c.gray[900]};
        font-size: ${f.base};
      }
      
      .array-list { 
        display: flex;
        flex-direction: column;
        gap: ${s.sm};
      }
      
      .array-item { 
        padding: ${s.sm};
        background-color: ${c.gray[50]};
        border-radius: ${r.sm};
        border-left: 4px solid ${c.success.light};
      }
      
      .section { 
        margin-bottom: ${s.xl};
      }
      
      .section h3 { 
        color: ${c.gray[900]};
        margin-bottom: ${s.md};
        font-size: 1.25rem;
        font-weight: ${fw.semibold};
      }
      
      .text-content { 
        line-height: 1.625;
        color: ${c.gray[700]};
      }
    `;
  }
}

export { AssetComponent };
