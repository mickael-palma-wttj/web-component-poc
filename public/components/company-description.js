import { AssetComponent } from './base-component.js';

class CompanyDescriptionComponent extends AssetComponent {
  // Configuration for array fields
  static ARRAY_CONFIGS = {
    quickFacts: {
      label: 'Quick Facts',
      singularLabel: 'Fact',
      fields: [
        { name: 'label', label: 'Label' },
        { name: 'value', label: 'Value' }
      ],
      template: (item) => `
        <div class="info-item">
          <strong>${item.label}</strong>
          <span>${item.value}</span>
        </div>
      `,
      containerClass: 'info-grid',
      defaultValue: { label: '', value: '' }
    },
    keyProducts: {
      label: 'Key Products',
      singularLabel: 'Product',
      fields: [
        { name: 'name', label: 'Product Name' },
        { name: 'description', label: 'Description', type: 'textarea', rows: 3 }
      ],
      template: (item) => `
        <div class="array-item">
          <strong>${item.name}</strong>
          <p class="text-content">${item.description}</p>
        </div>
      `,
      containerClass: 'array-list',
      defaultValue: { name: '', description: '' }
    }
  };

  constructor() {
    super();
    this.type = 'company_description';
  }

  set assetData(data) {
    this.data = data;
    if (this.shadowRoot) {
      this.render();
    }
  }

  renderView() {
    const d = this.data;
    if (!d) {
      return '<div class="error">No data available</div>';
    }

    return `
      ${this._renderSection('Tagline', `<p class="text-content">${d.tagline || ''}</p>`)}
      ${this._renderSection('Overview', `<p class="text-content">${d.overview || ''}</p>`)}
      ${this._renderArraySection('quickFacts', d.quickFacts)}
      ${this._renderArraySection('keyProducts', d.keyProducts)}
      ${this._renderSection('Target Market', `<p class="text-content">${d.targetMarket || ''}</p>`)}
    `;
  }

  /**
   * Render a simple section with heading and content
   * @private
   */
  _renderSection(title, content) {
    return `
      <div class="section">
        <h3>${title}</h3>
        ${content}
      </div>
    `;
  }

  /**
   * Render an array field in view mode
   * @private
   */
  _renderArraySection(fieldName, items) {
    const config = CompanyDescriptionComponent.ARRAY_CONFIGS[fieldName];
    if (!config || !items?.length) return '';

    const itemsHtml = items.map(config.template).join('');
    return this._renderSection(config.label, `<div class="${config.containerClass}">${itemsHtml}</div>`);
  }

  renderEdit() {
    const d = this.data;
    return `
      <form class="edit-form">
        ${this._renderTextField('Tagline', 'tagline', d.tagline, 'A catchy one-line description of the company')}
        ${this._renderTextAreaField('Overview', 'overview', d.overview, 'Comprehensive company description', 6)}
        ${this._renderTextAreaField('Target Market', 'targetMarket', d.targetMarket, 'Who are the primary customers?', 4)}
        ${this._renderArrayEditor('quickFacts', d.quickFacts || [])}
        ${this._renderArrayEditor('keyProducts', d.keyProducts || [])}
      </form>
    `;
  }

  /**
   * Render a simple text input field
   * @private
   */
  _renderTextField(label, dataPath, value, hint = '') {
    return `
      <div class="form-group">
        <label>${label}</label>
        <input type="text" data-path="${dataPath}" value="${this.escapeHtml(value || '')}" />
        ${hint ? `<div class="form-hint">${hint}</div>` : ''}
      </div>
    `;
  }

  /**
   * Render a textarea field
   * @private
   */
  _renderTextAreaField(label, dataPath, value, hint = '', rows = 4) {
    return `
      <div class="form-group">
        <label>${label}</label>
        <textarea data-path="${dataPath}" rows="${rows}">${this.escapeHtml(value || '')}</textarea>
        ${hint ? `<div class="form-hint">${hint}</div>` : ''}
      </div>
    `;
  }

  /**
   * Render an array editor section for a given field
   * @private
   */
  _renderArrayEditor(fieldName, items) {
    const config = CompanyDescriptionComponent.ARRAY_CONFIGS[fieldName];
    if (!config) return '';

    const itemsHtml = items
      .map((item, index) => this._renderArrayItem(fieldName, item, index, config))
      .join('');

    return `
      <div class="array-editor">
        <div class="array-editor-header">
          <label>${config.label}</label>
          <button type="button" class="btn-add-item" data-action="add-${this._getActionName(fieldName)}">+ Add ${config.singularLabel}</button>
        </div>
        <div class="array-items" id="${fieldName}-container">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  /**
   * Render a single array item in edit mode
   * @private
   */
  _renderArrayItem(fieldName, item, index, config) {
    const fieldsHtml = config.fields
      .map(field => this._renderArrayItemField(fieldName, index, field, item))
      .join('');

    return `
      <div class="array-item-edit" data-index="${index}">
        <div class="array-item-header">
          <span class="array-item-title">${config.singularLabel} #${index + 1}</span>
          <button type="button" class="btn-remove-item" data-action="remove-${this._getActionName(fieldName)}" data-index="${index}">Remove</button>
        </div>
        <div class="form-row">
          ${fieldsHtml}
        </div>
      </div>
    `;
  }

  /**
   * Render a single field within an array item
   * @private
   */
  _renderArrayItemField(fieldName, itemIndex, field, item) {
    const dataPath = `${fieldName}.${itemIndex}.${field.name}`;
    const value = item[field.name] || '';
    const isTextarea = field.type === 'textarea';

    const input = isTextarea
      ? `<textarea data-path="${dataPath}" rows="${field.rows || 3}">${this.escapeHtml(value)}</textarea>`
      : `<input type="text" data-path="${dataPath}" value="${this.escapeHtml(value)}" />`;

    return `
      <div class="form-group">
        <label>${field.label}</label>
        ${input}
      </div>
    `;
  }

  /**
   * Convert field name to action name (e.g., 'quickFacts' -> 'fact', 'keyProducts' -> 'product')
   * @private
   */
  _getActionName(fieldName) {
    const config = CompanyDescriptionComponent.ARRAY_CONFIGS[fieldName];
    return config.singularLabel.toLowerCase().replace(/\s+/g, '-');
  }

  handleCustomAction(action, index) {
    // Match action patterns: add-<field>, remove-<field>
    const addMatch = action.match(/^add-(.+)$/);
    const removeMatch = action.match(/^remove-(.+)$/);

    if (addMatch) {
      const fieldName = this._getFieldNameFromAction(addMatch[1]);
      this._addArrayItem(fieldName);
    } else if (removeMatch) {
      const fieldName = this._getFieldNameFromAction(removeMatch[1]);
      this._removeArrayItem(fieldName, index);
    }
  }

  /**
   * Convert action name back to field name (e.g., 'fact' -> 'quickFacts', 'product' -> 'keyProducts')
   * @private
   */
  _getFieldNameFromAction(actionName) {
    for (const [fieldName, config] of Object.entries(CompanyDescriptionComponent.ARRAY_CONFIGS)) {
      if (this._getActionName(fieldName) === actionName) {
        return fieldName;
      }
    }
    return null;
  }

  /**
   * Add a new item to an array field
   * @private
   */
  _addArrayItem(fieldName) {
    const config = CompanyDescriptionComponent.ARRAY_CONFIGS[fieldName];
    if (!config || !this.data) return;

    if (!this.data[fieldName]) {
      this.data[fieldName] = [];
    }
    this.data[fieldName].push(config.defaultValue);
    this.render();
  }

  /**
   * Remove an item from an array field
   * @private
   */
  _removeArrayItem(fieldName, index) {
    if (!this.data?.[fieldName] || index === undefined) return;

    const itemIndex = parseInt(index, 10);
    if (itemIndex >= 0 && itemIndex < this.data[fieldName].length) {
      this.data[fieldName].splice(itemIndex, 1);
      this.render();
    }
  }
}

customElements.define('company-description', CompanyDescriptionComponent);

export { CompanyDescriptionComponent };
