/**
 * TemplateBuilder - Centralized template generation for asset components
 * Handles HTML template creation for different component states
 */
class TemplateBuilder {
  /**
   * Generate loading template
   * @param {string} title - Component title
   * @returns {string} Loading state HTML
   */
  static getLoadingTemplate(title = 'component') {
    return `
      <style>
        .loading {
          background-color: white;
          padding: 2rem;
          text-align: center;
          color: #4b5563;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
        }
      </style>
      <div class="loading">Loading data for ${title}...</div>
    `;
  }

  /**
   * Generate component header with action buttons
   * @param {string} title - Component title
   * @param {boolean} isEditing - Whether component is in edit mode
   * @returns {string} Header HTML
   */
  static getHeaderTemplate(title = 'Asset', isEditing = false) {
    return `
      <div class="component-header">
        <h2>${title || 'Asset'}</h2>
        <div class="button-group">
          ${isEditing ? `
            <button class="btn-save" data-action="save">Save</button>
            <button class="btn-cancel" data-action="cancel">Cancel</button>
          ` : `
            <button class="btn-download" data-action="download-image">📥 Download Image</button>
            <button class="btn-edit" data-action="edit">Edit</button>
          `}
        </div>
      </div>
    `;
  }

  /**
   * Generate view mode template
   * @param {string} content - Main content HTML
   * @returns {string} View mode wrapper HTML
   */
  static getViewModeTemplate(content) {
    return `
      <div class="view-container">
        <div class="view-content">
          ${content}
        </div>
      </div>
    `;
  }

  /**
   * Generate edit mode template with live preview
   * @param {string} content - Edit form content
   * @param {string} preview - Live preview content
   * @returns {string} Edit mode wrapper HTML
   */
  static getEditModeTemplate(content, preview) {
    return `
      <div class="edit-overlay"></div>
      <div class="preview-panel">
        <div class="preview-scroll-container">
          <div class="preview-content">
            ${preview}
          </div>
        </div>
      </div>
      <div class="edit-drawer">
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
      </div>
    `;
  }

  /**
   * Generate component styles wrapper
   * @returns {string} Component-specific CSS
   */
  static getComponentStyles() {
    return `
      /* ========== Container & Wrapper Styles ========== */
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }

      .component-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background-color: white;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
      }

      .component-wrapper.editing {
        display: flex;
        flex-direction: column;
        border: none;
        border-radius: 0;
        position: relative;
      }

      .component-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 2px solid #e5e7eb;
        background-color: #fafbfc;
        flex-shrink: 0;
        z-index: 10;
      }

      .component-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1f2937;
      }

      .button-group {
        display: flex;
        gap: 0.75rem;
      }

      .btn-edit, .btn-save, .btn-cancel {
        padding: 0.5rem 1.5rem;
        border: none;
        border-radius: 0.25rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.875rem;
      }

      .btn-download {
        padding: 0.5rem 1.5rem;
        border: none;
        border-radius: 0.25rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.875rem;
        background-color: #8b5cf6;
        color: white;
      }

      .btn-download:hover {
        background-color: #7c3aed;
        transform: translateY(-1px);
      }

      .btn-edit {
        background-color: #2563eb;
        color: white;
      }

      .btn-edit:hover {
        background-color: #1d4ed8;
        transform: translateY(-1px);
      }

      .btn-save {
        background-color: #10b981;
        color: white;
      }

      .btn-save:hover {
        background-color: #059669;
        transform: translateY(-1px);
      }

      .btn-cancel {
        background-color: #6b7280;
        color: white;
      }

      .btn-cancel:hover {
        background-color: #4b5563;
        transform: translateY(-1px);
      }

      /* ========== View Mode ========== */
      .view-container {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        background-color: white;
      }

      .component-wrapper.editing .view-container {
        margin-right: 500px;
      }

      .view-content {
        width: 100%;
        margin: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      /* ========== Edit Mode - Drawer ========== */
      .edit-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;
        z-index: 40;
      }

      .edit-drawer {
        position: fixed;
        top: 0;
        right: 0;
        width: 500px;
        height: 100vh;
        background-color: white;
        border-left: 1px solid #e5e7eb;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
        z-index: 50;
        display: flex;
        flex-direction: column;
      }

      .edit-drawer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        background-color: white;
        flex-shrink: 0;
      }

      .edit-drawer-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
      }

      .edit-scroll-container {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        background-color: white;
      }

      .preview-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        background-color: white;
        overflow: hidden;
      }

      .preview-scroll-container {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }

      .preview-content {
        padding: 2rem;
      }

      .error {
        background-color: #fee2e2;
        color: #991b1b;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
      }

      @media (max-width: 1024px) {
        .edit-drawer {
          width: 400px;
        }

        .component-wrapper.editing .view-container {
          margin-right: 400px;
        }
      }

      @media (max-width: 768px) {
        .edit-drawer {
          width: 100%;
          height: auto;
          position: static;
          border-left: none;
          border-top: 1px solid #e5e7eb;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
        }

        .edit-overlay {
          display: none;
        }

        .component-wrapper.editing .view-container {
          margin-right: 0;
        }
      }
    `;
  }
}

export { TemplateBuilder };
