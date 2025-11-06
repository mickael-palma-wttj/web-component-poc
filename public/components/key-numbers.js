import { AssetComponent } from './base-component.js';

class KeyNumbersComponent extends AssetComponent {
  constructor() {
    super();
    this.type = 'key_numbers';
  }

  set assetData(data) {
    this.data = data;
    if (this.shadowRoot) this.render();
  }

  renderView() {
    const d = this.data;
    return `
      <div class="section">
        <div class="info-grid">
          ${(d.stats || []).map(stat => `
            <div class="info-item">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">${stat.icon || '📊'}</div>
              <strong>${stat.label}</strong>
              <span style="font-size: 1.5rem; font-weight: bold; color: #007bff;">${stat.value}</span>
              <p class="text-content" style="margin-top: 0.5rem; font-size: 0.85rem;">${stat.context || ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderEdit() {
    const d = this.data;
    return `
      <form class="edit-form">
        <div class="array-editor">
          <div class="array-editor-header">
            <label>Key Statistics</label>
            <button type="button" class="btn-add-item" data-action="add-stat">+ Add Stat</button>
          </div>
          <div class="array-items" id="stats-container">
            ${(d.stats || []).map((stat, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">${stat.icon || '📊'} ${this.escapeHtml(stat.label || `Stat #${index + 1}`)}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-stat" data-index="${index}">Remove</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Icon</label>
                    <select class="icon-select" data-path="stats.${index}.icon">
                      ${this.getCommonIcons().map(icon => `<option value="${icon}" ${stat.icon === icon ? 'selected' : ''}>${icon}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Label</label>
                    <input type="text" data-path="stats.${index}.label" value="${this.escapeHtml(stat.label || '')}" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Value</label>
                  <input type="text" data-path="stats.${index}.value" value="${this.escapeHtml(stat.value || '')}" />
                  <div class="form-hint">The main statistic number or value</div>
                </div>
                <div class="form-group">
                  <label>Context</label>
                  <textarea data-path="stats.${index}.context" rows="2">${this.escapeHtml(stat.context || '')}</textarea>
                  <div class="form-hint">Additional context or explanation</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </form>
    `;
  }

  handleCustomAction(action, index) {
    switch (action) {
      case 'add-stat':
        if (!this.data.stats) this.data.stats = [];
        this.data.stats.push({ icon: '📊', label: '', value: '', context: '' });
        this.render();
        break;
      case 'remove-stat':
        if (this.data.stats && index !== undefined) {
          this.data.stats.splice(parseInt(index), 1);
          this.render();
        }
        break;
    }
  }

  collectFormData(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const path = input.dataset.path;
      if (path) {
        this.setNestedValue(this.data, path, input.value);
      }
    });
  }

  getCommonIcons() {
    return ['🎁', '📦', '🏥', '🚀', '💼', '🎓', '💰', '🏆', '⭐', '❤️', '💪', '🎯', '📱', '💻', '🎨', '🎬', '🎵', '🌟', '✨', '🔥', '🍕', '☕', '🏃', '🧘', '🎪', '🎭', '📚', '🔬', '🌍', '🚗', '✈️', '🏠', '👔', '👗', '👠', '💄', '💍', '🕐', '📅', '🎀', '🎈'];
  }
}

customElements.define('key-numbers', KeyNumbersComponent);

export { KeyNumbersComponent };
