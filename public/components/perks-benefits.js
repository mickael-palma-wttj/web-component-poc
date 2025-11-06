import { AssetComponent } from './base-component.js';

class PerksAndBenefitsComponent extends AssetComponent {
  constructor() {
    super();
    this.type = 'perks_and_benefits';
  }

  set assetData(data) {
    this.data = data;
    if (this.shadowRoot) this.render();
  }

  renderView() {
    const d = this.data;
    return `
      ${d.introduction ? `
        <div class="section">
          <p class="text-content">${d.introduction}</p>
        </div>
      ` : ''}

      ${d.standoutBenefits && d.standoutBenefits.length > 0 ? `
        <div class="section">
          <h3>⭐ Standout Benefits</h3>
          <div class="array-list">
            ${d.standoutBenefits.map(benefit => `
              <div class="array-item" style="border-left-color: #ffc107;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${benefit.icon || '🎁'}</div>
                <strong style="font-size: 1.1rem;">${benefit.name}</strong>
                <p class="text-content">${benefit.description || ''}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${d.categories && d.categories.length > 0 ? `
        <div class="section">
          <h3>All Benefits by Category</h3>
          ${d.categories.map(category => `
            <div class="section">
              <h4>${category.icon || '📦'} ${category.category}</h4>
              <div class="array-list">
                ${(category.benefits || []).map(benefit => `
                  <div class="array-item" ${benefit.highlight ? 'style="border-left-color: #28a745;"' : ''}>
                    <strong>${benefit.name}</strong>
                    ${benefit.highlight ? '<span style="display: inline-block; background: #28a745; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.7rem; margin-left: 0.5rem;">HIGHLIGHT</span>' : ''}
                    <p class="text-content">${benefit.description || ''}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  renderEdit() {
    const d = this.data;
    return `
      <form class="edit-form">
        <div class="form-group">
          <label>Introduction</label>
          <textarea data-path="introduction" rows="4">${this.escapeHtml(d.introduction || '')}</textarea>
          <div class="form-hint">Brief introduction to the perks and benefits</div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>⭐ Standout Benefits</label>
            <button type="button" class="btn-add-item" data-action="add-standout">+ Add Standout Benefit</button>
          </div>
          <div class="array-items">
            ${(d.standoutBenefits || []).map((benefit, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">${benefit.icon || '🎁'} ${this.escapeHtml(benefit.name || `Benefit #${index + 1}`)}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-standout" data-index="${index}">Remove</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Icon</label>
                    <select class="icon-select" data-path="standoutBenefits.${index}.icon">
                      ${this.getCommonIcons().map(icon => `<option value="${icon}" ${benefit.icon === icon ? 'selected' : ''}>${icon}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Name</label>
                    <input type="text" data-path="standoutBenefits.${index}.name" value="${this.escapeHtml(benefit.name || '')}" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea data-path="standoutBenefits.${index}.description" rows="3">${this.escapeHtml(benefit.description || '')}</textarea>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>📦 Benefit Categories</label>
            <button type="button" class="btn-add-item" data-action="add-category">+ Add Category</button>
          </div>
          <div class="array-items">
            ${(d.categories || []).map((category, catIndex) => `
              <div class="array-item-edit" data-index="${catIndex}" style="background: #f0f8ff; padding: 1.5rem;">
                <div class="array-item-header">
                  <span class="array-item-title">${category.icon || '📦'} ${this.escapeHtml(category.category || `Category #${catIndex + 1}`)}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-category" data-index="${catIndex}">Remove Category</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Icon</label>
                    <select class="icon-select" data-path="categories.${catIndex}.icon">
                      ${this.getCommonIcons().map(icon => `<option value="${icon}" ${category.icon === icon ? 'selected' : ''}>${icon}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Category Name</label>
                    <input type="text" data-path="categories.${catIndex}.category" value="${this.escapeHtml(category.category || '')}" />
                  </div>
                </div>
                
                <div style="margin-top: 1rem; background: white; padding: 1rem; border-radius: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <strong>Benefits in this category:</strong>
                    <button type="button" class="btn-add-item" data-action="add-benefit" data-category="${catIndex}">+ Add Benefit</button>
                  </div>
                  ${(category.benefits || []).map((benefit, benIndex) => `
                    <div class="array-item-edit" data-index="${benIndex}" style="margin-bottom: 0.75rem;">
                      <div class="array-item-header">
                        <span class="array-item-title">${this.escapeHtml(benefit.name || `Benefit #${benIndex + 1}`)}</span>
                        <button type="button" class="btn-remove-item" data-action="remove-benefit" data-category="${catIndex}" data-index="${benIndex}">Remove</button>
                      </div>
                      <div class="form-group">
                        <label>Benefit Name</label>
                        <input type="text" data-path="categories.${catIndex}.benefits.${benIndex}.name" value="${this.escapeHtml(benefit.name || '')}" />
                      </div>
                      <div class="form-group">
                        <label>Description</label>
                        <textarea data-path="categories.${catIndex}.benefits.${benIndex}.description" rows="2">${this.escapeHtml(benefit.description || '')}</textarea>
                      </div>
                      <div class="form-group">
                        <label>
                          <input type="checkbox" data-path="categories.${catIndex}.benefits.${benIndex}.highlight" ${benefit.highlight ? 'checked' : ''} />
                          Highlight this benefit
                        </label>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </form>
    `;
  }

  handleCustomAction(action, index) {
    const catIndex = parseInt(this.shadowRoot.querySelector(`[data-action="${action}"]`)?.dataset?.category);

    switch (action) {
      case 'add-standout':
        if (!this.data.standoutBenefits) this.data.standoutBenefits = [];
        this.data.standoutBenefits.push({ icon: '🎁', name: '', description: '' });
        this.render();
        break;
      case 'remove-standout':
        if (this.data.standoutBenefits && index !== undefined) {
          this.data.standoutBenefits.splice(parseInt(index), 1);
          this.render();
        }
        break;
      case 'add-category':
        if (!this.data.categories) this.data.categories = [];
        this.data.categories.push({ icon: '📦', category: '', benefits: [] });
        this.render();
        break;
      case 'remove-category':
        if (this.data.categories && index !== undefined) {
          this.data.categories.splice(parseInt(index), 1);
          this.render();
        }
        break;
      case 'add-benefit':
        if (!isNaN(catIndex) && this.data.categories && this.data.categories[catIndex]) {
          if (!this.data.categories[catIndex].benefits) {
            this.data.categories[catIndex].benefits = [];
          }
          this.data.categories[catIndex].benefits.push({ name: '', description: '', highlight: false });
          this.render();
        }
        break;
      case 'remove-benefit':
        if (!isNaN(catIndex) && index !== undefined && this.data.categories && this.data.categories[catIndex]) {
          this.data.categories[catIndex].benefits.splice(parseInt(index), 1);
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
        if (input.type === 'checkbox') {
          this.setNestedValue(this.data, path, input.checked);
        } else {
          this.setNestedValue(this.data, path, input.value);
        }
      }
    });
  }

  getCommonIcons() {
    return ['🎁', '📦', '🏥', '🚀', '💼', '🎓', '💰', '🏆', '⭐', '❤️', '💪', '🎯', '📱', '💻', '🎨', '🎬', '🎵', '🌟', '✨', '🔥', '🍕', '☕', '🏃', '🧘', '🎪', '🎭', '📚', '🔬', '🌍', '🚗', '✈️', '🏠', '👔', '👗', '👠', '💄', '💍', '🕐', '📅', '🎀', '🎈'];
  }
}

customElements.define('perks-benefits', PerksAndBenefitsComponent);

export { PerksAndBenefitsComponent };
