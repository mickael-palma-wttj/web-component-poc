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
        <h3>Key Statistics</h3>
        <div class="info-grid">
          ${(d.basic_stats || []).map(stat => `
            <div class="info-item">
              <div style="font-size: 1.25rem; margin-bottom: 0.5rem; font-weight: bold; color: #007bff;">${stat.value}</div>
              <strong>${stat.label}</strong>
            </div>
          `).join('')}
        </div>
      </div>
      ${(d.breakdowns || []).length > 0 ? `
        <div class="section">
          <h3>Breakdowns</h3>
          <div class="breakdowns-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
            ${(d.breakdowns || []).map(breakdown => `
              <div class="breakdown-card">
                <h4>${breakdown.label}</h4>
                <svg class="pie-chart" viewBox="0 0 100 100" style="width: 200px; height: 200px; margin: 0 auto; display: block;">
                  ${this._generatePieChartPaths(breakdown.items)}
                </svg>
                <div class="breakdown-legend" style="margin-top: 1rem;">
                  ${breakdown.items.map(item => `
                    <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                      <span class="legend-color" style="display: inline-block; width: 12px; height: 12px; background-color: ${this._getColorForIndex(breakdown.items.indexOf(item))}; margin-right: 0.5rem; border-radius: 2px;"></span>
                      <span><strong>${item.category}</strong> ${item.percentage}%</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
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

  /**
   * Generate SVG paths for pie chart
   * @private
   */
  _generatePieChartPaths(items) {
    let currentAngle = -90; // Start at top
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

    return items.map((item, index) => {
      const sliceAngle = (item.percentage / 100) * 360;
      const startAngle = currentAngle * (Math.PI / 180);
      const endAngle = (currentAngle + sliceAngle) * (Math.PI / 180);

      const x1 = 50 + 40 * Math.cos(startAngle);
      const y1 = 50 + 40 * Math.sin(startAngle);
      const x2 = 50 + 40 * Math.cos(endAngle);
      const y2 = 50 + 40 * Math.sin(endAngle);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

      currentAngle += sliceAngle;

      return `<path d="${path}" fill="${colors[index % colors.length]}" stroke="white" stroke-width="2" />`;
    }).join('');
  }

  /**
   * Get color for pie chart item by index
   * @private
   */
  _getColorForIndex(index) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[index % colors.length];
  }

  renderEdit() {
    const d = this.data;
    return `
      <form class="edit-form">
        <div class="array-editor">
          <div class="array-editor-header">
            <label>Basic Statistics</label>
            <button type="button" class="btn-add-item" data-action="add-basic-stat">+ Add Statistic</button>
          </div>
          <div class="array-items" id="basic_stats-container">
            ${(d.basic_stats || []).map((stat, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">Statistic #${index + 1}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-basic-stat" data-index="${index}">Remove</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Value</label>
                    <input type="text" data-path="basic_stats.${index}.value" value="${this.escapeHtml(stat.value || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Label</label>
                    <input type="text" data-path="basic_stats.${index}.label" value="${this.escapeHtml(stat.label || '')}" />
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>Breakdowns</label>
            <button type="button" class="btn-add-item" data-action="add-breakdown">+ Add Breakdown</button>
          </div>
          <div class="array-items" id="breakdowns-container">
            ${(d.breakdowns || []).map((breakdown, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">Breakdown #${index + 1}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-breakdown" data-index="${index}">Remove</button>
                </div>
                <div class="form-group">
                  <label>Label</label>
                  <input type="text" data-path="breakdowns.${index}.label" value="${this.escapeHtml(breakdown.label || '')}" />
                </div>
                <div class="form-group">
                  <label>Type</label>
                  <input type="text" data-path="breakdowns.${index}.type" value="${this.escapeHtml(breakdown.type || '')}" />
                </div>
                <div class="form-group">
                  <label>Items</label>
                  <button type="button" class="btn-add-item" data-action="add-breakdown-item" data-breakdown-index="${index}">+ Add Item</button>
                </div>
                <div class="breakdown-items-container">
                  ${(breakdown.items || []).map((item, itemIndex) => `
                    <div class="form-row" style="margin-left: 1rem; border-left: 2px solid #ccc; padding-left: 1rem;">
                      <div class="form-group">
                        <label>Category</label>
                        <input type="text" data-path="breakdowns.${index}.items.${itemIndex}.category" value="${this.escapeHtml(item.category || '')}" />
                      </div>
                      <div class="form-group">
                        <label>Percentage</label>
                        <input type="number" data-path="breakdowns.${index}.items.${itemIndex}.percentage" value="${item.percentage || 0}" min="0" max="100" />
                      </div>
                      <button type="button" class="btn-remove-item" data-action="remove-breakdown-item" data-breakdown-index="${index}" data-item-index="${itemIndex}">Remove Item</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
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

  handleCustomAction(action, index, breakdownIndex, itemIndex) {
    const parsedIndex = parseInt(index, 10);
    const parsedBreakdownIndex = parseInt(breakdownIndex, 10);
    const parsedItemIndex = parseInt(itemIndex, 10);

    switch (action) {
      case 'add-basic-stat':
        if (!this.data.basic_stats) this.data.basic_stats = [];
        this.data.basic_stats.push({ value: '', label: '' });
        this.render();
        break;
      case 'remove-basic-stat':
        if (this.data.basic_stats && !isNaN(parsedIndex)) {
          this.data.basic_stats.splice(parsedIndex, 1);
          this.render();
        }
        break;
      case 'add-breakdown':
        if (!this.data.breakdowns) this.data.breakdowns = [];
        this.data.breakdowns.push({ label: '', type: '', items: [] });
        this.render();
        break;
      case 'remove-breakdown':
        if (this.data.breakdowns && !isNaN(parsedIndex)) {
          this.data.breakdowns.splice(parsedIndex, 1);
          this.render();
        }
        break;
      case 'add-breakdown-item':
        if (this.data.breakdowns && !isNaN(parsedBreakdownIndex)) {
          if (!this.data.breakdowns[parsedBreakdownIndex].items) {
            this.data.breakdowns[parsedBreakdownIndex].items = [];
          }
          this.data.breakdowns[parsedBreakdownIndex].items.push({ category: '', percentage: 0 });
          this.render();
        }
        break;
      case 'remove-breakdown-item':
        if (this.data.breakdowns && !isNaN(parsedBreakdownIndex) && !isNaN(parsedItemIndex)) {
          if (this.data.breakdowns[parsedBreakdownIndex].items) {
            this.data.breakdowns[parsedBreakdownIndex].items.splice(parsedItemIndex, 1);
            this.render();
          }
        }
        break;
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
      if (path) {
        this.setNestedValue(this.data, path, input.value);
      }
    });
  }
}

customElements.define('key-numbers', KeyNumbersComponent);

export { KeyNumbersComponent };
