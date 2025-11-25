import { AssetComponent } from './base-component.js';

class RemotePolicyComponent extends AssetComponent {
  constructor() {
    super();
    this.type = 'remote_policy';
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
          <div class="info-item">
            <strong>Work Models</strong>
            <span style="font-size: 1rem; color: #007bff;">${(d.models || []).join(', ') || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Summary</h3>
        <p class="text-content">${d.summary || ''}</p>
      </div>

      <div class="section">
        <h3>Policy Details</h3>
        <p class="text-content">${d.policy_details || ''}</p>
      </div>

      ${d.sources && d.sources.length > 0 ? `
        <div class="section">
          <h3>Sources</h3>
          <div class="sources-list">
            ${d.sources.map(source => `
              <div class="source-item">
                <div class="source-header">
                  <strong>${source.title}</strong>
                  <span class="source-type">${source.type}</span>
                </div>
                <div class="source-url"><a href="${source.url}" target="_blank">${source.url}</a></div>
                <div class="source-date">${source.date}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  renderEdit() {
    const d = this.data;
    return `
      <form class="edit-form">
        <div class="form-group">
          <label>Work Models</label>
          <input type="text" data-path="models" value="${this.escapeHtml((d.models || []).join(', '))}" />
          <div class="form-hint">Comma-separated list of work models (e.g., "Hybrid-Flexible", "Remote-First")</div>
        </div>

        <div class="form-group">
          <label>Summary</label>
          <textarea data-path="summary" rows="4">${this.escapeHtml(d.summary || '')}</textarea>
          <div class="form-hint">Brief overview of the remote work policy and company approach</div>
        </div>

        <div class="form-group">
          <label>Policy Details</label>
          <textarea data-path="policy_details" rows="4">${this.escapeHtml(d.policy_details || '')}</textarea>
          <div class="form-hint">Detailed policy information</div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>Sources</label>
            <button type="button" class="btn-add-item" data-action="add-source">+ Add Source</button>
          </div>
          <div class="array-items" id="sources-container">
            ${(d.sources || []).map((source, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">Source #${index + 1}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-source" data-index="${index}">Remove</button>
                </div>
                <div class="form-group">
                  <label>Title</label>
                  <input type="text" data-path="sources.${index}.title" value="${this.escapeHtml(source.title || '')}" />
                </div>
                <div class="form-group">
                  <label>URL</label>
                  <input type="url" data-path="sources.${index}.url" value="${this.escapeHtml(source.url || '')}" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Date</label>
                    <input type="text" data-path="sources.${index}.date" value="${this.escapeHtml(source.date || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Type</label>
                    <input type="text" data-path="sources.${index}.type" value="${this.escapeHtml(source.type || '')}" />
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </form>
    `;
  }

  handleCustomAction(action, index) {
    const parsedIndex = parseInt(index, 10);

    switch (action) {
      case 'add-source':
        if (!this.data.sources) this.data.sources = [];
        this.data.sources.push({ title: '', url: '', date: '', type: '' });
        this.render();
        break;
      case 'remove-source':
        if (this.data.sources && !isNaN(parsedIndex)) {
          this.data.sources.splice(parsedIndex, 1);
          this.render();
        }
        break;
    }
  }

  collectFormData(form) {
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      const path = input.dataset.path;
      if (path === 'models') {
        // Parse comma-separated string into array
        this.data.models = input.value.split(',').map(item => item.trim()).filter(item => item);
      } else if (path) {
        this.setNestedValue(this.data, path, input.value);
      }
    });
  }
}

customElements.define('remote-policy', RemotePolicyComponent);

export { RemotePolicyComponent };
