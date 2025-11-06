import { AssetComponent } from './base-component.js';

class FundingParserComponent extends AssetComponent {
  constructor() {
    super();
    this.type = 'funding_parser';
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
            <strong>Total Raised</strong>
            <span style="font-size: 1.5rem; font-weight: bold; color: #28a745;">${d.totalRaised || 'N/A'}</span>
          </div>
          <div class="info-item">
            <strong>Latest Round</strong>
            <span>${d.latestRound?.amount || 'N/A'} (${d.latestRound?.date || 'N/A'})</span>
          </div>
          <div class="info-item">
            <strong>Valuation</strong>
            <span style="font-size: 1.5rem; font-weight: bold; color: #007bff;">${d.valuation || 'N/A'}</span>
          </div>
          <div class="info-item">
            <strong>Status</strong>
            <span>${d.status || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Funding Rounds</h3>
        <div class="array-list">
          ${(d.rounds || []).map(round => `
            <div class="array-item">
              <strong>${round.series} - ${round.amount} (${round.date})</strong>
              ${round.valuation ? `<p><em>Valuation: ${round.valuation}</em></p>` : ''}
              <p class="text-content">${round.description || ''}</p>
              ${round.leadInvestors ? `<p><strong>Lead Investors:</strong> ${round.leadInvestors.join(', ')}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h3>Key Investors</h3>
        <div class="array-list">
          ${(d.keyInvestors || []).map(investor => `
            <div class="array-item">
              <strong>${investor.name} - ${investor.type}</strong>
              <p class="text-content">${investor.description || ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderEdit() {
    const d = this.data;
    const latest = d.latestRound || {};
    return `
      <form class="edit-form">
        <div class="form-row">
          <div class="form-group">
            <label>Total Raised</label>
            <input type="text" data-path="totalRaised" value="${this.escapeHtml(d.totalRaised || '')}" />
            <div class="form-hint">e.g., "$2.6B"</div>
          </div>
          <div class="form-group">
            <label>Valuation</label>
            <input type="text" data-path="valuation" value="${this.escapeHtml(d.valuation || '')}" />
            <div class="form-hint">e.g., "$5B"</div>
          </div>
        </div>

        <div class="form-group">
          <label>Status</label>
          <input type="text" data-path="status" value="${this.escapeHtml(d.status || '')}" />
          <div class="form-hint">e.g., "Private", "Series E"</div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>Latest Round</label>
          </div>
          <div class="array-items">
            <div class="array-item-edit">
              <div class="form-row">
                <div class="form-group">
                  <label>Series</label>
                  <input type="text" data-path="latestRound.series" value="${this.escapeHtml(latest.series || '')}" />
                </div>
                <div class="form-group">
                  <label>Amount</label>
                  <input type="text" data-path="latestRound.amount" value="${this.escapeHtml(latest.amount || '')}" />
                </div>
                <div class="form-group">
                  <label>Date</label>
                  <input type="text" data-path="latestRound.date" value="${this.escapeHtml(latest.date || '')}" />
                </div>
              </div>
              <div class="form-group">
                <label>Valuation</label>
                <input type="text" data-path="latestRound.valuation" value="${this.escapeHtml(latest.valuation || '')}" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea data-path="latestRound.description" rows="2">${this.escapeHtml(latest.description || '')}</textarea>
              </div>
              <div class="form-group">
                <label>Lead Investors (comma-separated)</label>
                <input type="text" data-path="latestRound.leadInvestors" value="${this.escapeHtml((latest.leadInvestors || []).join(', '))}" data-type="array" />
              </div>
            </div>
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>Funding Rounds</label>
            <button type="button" class="btn-add-item" data-action="add-round">+ Add Round</button>
          </div>
          <div class="array-items">
            ${(d.rounds || []).map((round, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">${this.escapeHtml(round.series || `Round #${index + 1}`)} - ${this.escapeHtml(round.amount || '')}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-round" data-index="${index}">Remove</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Series</label>
                    <input type="text" data-path="rounds.${index}.series" value="${this.escapeHtml(round.series || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Amount</label>
                    <input type="text" data-path="rounds.${index}.amount" value="${this.escapeHtml(round.amount || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Date</label>
                    <input type="text" data-path="rounds.${index}.date" value="${this.escapeHtml(round.date || '')}" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Valuation</label>
                  <input type="text" data-path="rounds.${index}.valuation" value="${this.escapeHtml(round.valuation || '')}" />
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea data-path="rounds.${index}.description" rows="2">${this.escapeHtml(round.description || '')}</textarea>
                </div>
                <div class="form-group">
                  <label>Lead Investors (comma-separated)</label>
                  <input type="text" data-path="rounds.${index}.leadInvestors" value="${this.escapeHtml((round.leadInvestors || []).join(', '))}" data-type="array" />
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>Key Investors</label>
            <button type="button" class="btn-add-item" data-action="add-investor">+ Add Investor</button>
          </div>
          <div class="array-items">
            ${(d.keyInvestors || []).map((investor, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">${this.escapeHtml(investor.name || `Investor #${index + 1}`)}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-investor" data-index="${index}">Remove</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Name</label>
                    <input type="text" data-path="keyInvestors.${index}.name" value="${this.escapeHtml(investor.name || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Type</label>
                    <input type="text" data-path="keyInvestors.${index}.type" value="${this.escapeHtml(investor.type || '')}" />
                    <div class="form-hint">e.g., "VC Firm", "Bank", "Strategic Investor"</div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea data-path="keyInvestors.${index}.description" rows="2">${this.escapeHtml(investor.description || '')}</textarea>
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
      case 'add-round':
        if (!this.data.rounds) this.data.rounds = [];
        this.data.rounds.push({
          series: '',
          amount: '',
          date: '',
          valuation: '',
          description: '',
          leadInvestors: []
        });
        this.render();
        break;
      case 'remove-round':
        if (this.data.rounds && index !== undefined) {
          this.data.rounds.splice(parseInt(index), 1);
          this.render();
        }
        break;
      case 'add-investor':
        if (!this.data.keyInvestors) this.data.keyInvestors = [];
        this.data.keyInvestors.push({ name: '', type: '', description: '' });
        this.render();
        break;
      case 'remove-investor':
        if (this.data.keyInvestors && index !== undefined) {
          this.data.keyInvestors.splice(parseInt(index), 1);
          this.render();
        }
        break;
    }
  }

  collectFormData(form) {
    const inputs = form.querySelectorAll('input, textarea, select');

    // Initialize structures
    if (!this.data.latestRound) {
      this.data.latestRound = {};
    }

    inputs.forEach(input => {
      const path = input.dataset.path;
      if (path) {
        // Handle array type inputs (comma-separated values)
        if (input.dataset.type === 'array') {
          const value = input.value.split(',').map(v => v.trim()).filter(v => v);
          this.setNestedValue(this.data, path, value);
        } else {
          this.setNestedValue(this.data, path, input.value);
        }
      }
    });
  }
}

customElements.define('funding-parser', FundingParserComponent);

export { FundingParserComponent };
