import { AssetComponent } from './base-component.js';

class TheirStoryComponent extends AssetComponent {
  constructor() {
    super();
    this.type = 'their_story';
  }

  set assetData(data) {
    this.data = data;
    if (this.shadowRoot) this.render();
  }

  renderView() {
    const d = this.data;
    return `
      <div class="section">
        <h3>Founding Story</h3>
        <p class="text-content">${d.foundingStory || ''}</p>
      </div>

      <div class="section">
        <h3>Founders</h3>
        <div class="array-list">
          ${(d.founders || []).map(founder => `
            <div class="array-item">
              <strong>${founder.name} - ${founder.role}</strong>
              <p class="text-content">${founder.background}</p>
            </div>
          `).join('')}
        </div>
      </div>

      ${d.ahaMoment ? `
        <div class="section">
          <h3>${d.ahaMoment.icon || '💡'} ${d.ahaMoment.title}</h3>
          <p class="text-content">${d.ahaMoment.description}</p>
        </div>
      ` : ''}

      <div class="section">
        <h3>Milestones</h3>
        <div class="array-list">
          ${(d.milestones || []).map(milestone => `
            <div class="array-item">
              <strong>${milestone.year} - ${milestone.title}</strong>
              <p class="text-content">${milestone.description}</p>
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
        <div class="form-group">
          <label>Founding Story</label>
          <textarea data-path="foundingStory" rows="10">${this.escapeHtml(d.foundingStory || '')}</textarea>
          <div class="form-hint">Tell the story of how the company was founded</div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>Founders</label>
            <button type="button" class="btn-add-item" data-action="add-founder">+ Add Founder</button>
          </div>
          <div class="array-items" id="founders-container">
            ${(d.founders || []).map((founder, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">${this.escapeHtml(founder.name || `Founder #${index + 1}`)}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-founder" data-index="${index}">Remove</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Name</label>
                    <input type="text" data-path="founders.${index}.name" value="${this.escapeHtml(founder.name || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Role</label>
                    <input type="text" data-path="founders.${index}.role" value="${this.escapeHtml(founder.role || '')}" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Background</label>
                  <textarea data-path="founders.${index}.background" rows="3">${this.escapeHtml(founder.background || '')}</textarea>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>Aha Moment</label>
          </div>
          <div class="array-items">
            <div class="array-item-edit">
              <div class="form-row">
                <div class="form-group">
                  <label>Icon</label>
                  <input type="text" data-path="ahaMoment.icon" value="${this.escapeHtml(d.ahaMoment?.icon || '💡')}" />
                  <div class="form-hint">Emoji or icon character</div>
                </div>
                <div class="form-group">
                  <label>Title</label>
                  <input type="text" data-path="ahaMoment.title" value="${this.escapeHtml(d.ahaMoment?.title || '')}" />
                </div>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea data-path="ahaMoment.description" rows="4">${this.escapeHtml(d.ahaMoment?.description || '')}</textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>Milestones</label>
            <button type="button" class="btn-add-item" data-action="add-milestone">+ Add Milestone</button>
          </div>
          <div class="array-items" id="milestones-container">
            ${(d.milestones || []).map((milestone, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">${this.escapeHtml(milestone.year || '')} - ${this.escapeHtml(milestone.title || `Milestone #${index + 1}`)}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-milestone" data-index="${index}">Remove</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Year</label>
                    <input type="text" data-path="milestones.${index}.year" value="${this.escapeHtml(milestone.year || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Title</label>
                    <input type="text" data-path="milestones.${index}.title" value="${this.escapeHtml(milestone.title || '')}" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea data-path="milestones.${index}.description" rows="3">${this.escapeHtml(milestone.description || '')}</textarea>
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
      case 'add-founder':
        if (!this.data.founders) this.data.founders = [];
        this.data.founders.push({ name: '', role: '', background: '' });
        this.render();
        break;
      case 'remove-founder':
        if (this.data.founders && index !== undefined) {
          this.data.founders.splice(parseInt(index), 1);
          this.render();
        }
        break;
      case 'add-milestone':
        if (!this.data.milestones) this.data.milestones = [];
        this.data.milestones.push({ year: '', title: '', description: '' });
        this.render();
        break;
      case 'remove-milestone':
        if (this.data.milestones && index !== undefined) {
          this.data.milestones.splice(parseInt(index), 1);
          this.render();
        }
        break;
    }
  }

  collectFormData(form) {
    const inputs = form.querySelectorAll('input, textarea, select');

    // Initialize ahaMoment if it doesn't exist
    if (!this.data.ahaMoment) {
      this.data.ahaMoment = {};
    }

    inputs.forEach(input => {
      const path = input.dataset.path;
      if (path) {
        this.setNestedValue(this.data, path, input.value);
      }
    });
  }
}

customElements.define('their-story', TheirStoryComponent);

export { TheirStoryComponent };
