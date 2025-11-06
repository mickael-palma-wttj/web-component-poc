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
            <strong>Model</strong>
            <span style="font-size: 1.2rem; font-weight: bold; color: #007bff;">${d.model || 'N/A'}</span>
          </div>
          <div class="info-item" style="grid-column: 1 / -1;">
            <strong>Summary</strong>
            <span>${d.summary || 'N/A'}</span>
          </div>
        </div>
      </div>

      ${d.workLocation ? `
        <div class="section">
          <h3>📍 Work Location</h3>
          <div class="array-item">
            <strong>Policy</strong>
            <p class="text-content">${d.workLocation.policy || ''}</p>
          </div>
          <div class="array-item">
            <strong>Office Expectation</strong>
            <p class="text-content">${d.workLocation.officeExpectation || ''}</p>
          </div>
          <div class="array-item">
            <strong>Work From Anywhere</strong>
            <p class="text-content">${d.workLocation.workFromAnywhere || ''}</p>
          </div>
        </div>
      ` : ''}

      ${d.equipment ? `
        <div class="section">
          <h3>💻 Equipment</h3>
          <div class="array-item">
            <strong>Budget</strong>
            <p class="text-content">${d.equipment.budget || ''}</p>
          </div>
          <div class="array-item">
            <strong>Provided</strong>
            <p class="text-content">${d.equipment.provided || ''}</p>
          </div>
          <div class="array-item">
            <strong>Support</strong>
            <p class="text-content">${d.equipment.support || ''}</p>
          </div>
        </div>
      ` : ''}

      ${d.schedule ? `
        <div class="section">
          <h3>⏰ Schedule</h3>
          <div class="array-item">
            <strong>Flexibility</strong>
            <p class="text-content">${d.schedule.flexibility || ''}</p>
          </div>
          <div class="array-item">
            <strong>Core Hours</strong>
            <p class="text-content">${d.schedule.coreHours || ''}</p>
          </div>
          <div class="array-item">
            <strong>Asynchronous Work</strong>
            <p class="text-content">${d.schedule.asynchronous || ''}</p>
          </div>
        </div>
      ` : ''}

      ${d.tools ? `
        <div class="section">
          <h3>🛠️ Tools</h3>
          <div class="array-item">
            <strong>Communication</strong>
            <p class="text-content">${d.tools.communication || ''}</p>
          </div>
          <div class="array-item">
            <strong>Collaboration</strong>
            <p class="text-content">${d.tools.collaboration || ''}</p>
          </div>
          <div class="array-item">
            <strong>Socializing</strong>
            <p class="text-content">${d.tools.socializing || ''}</p>
          </div>
        </div>
      ` : ''}

      ${d.culture ? `
        <div class="section">
          <h3>🤝 Culture</h3>
          <div class="array-item">
            <strong>In-Person Events</strong>
            <p class="text-content">${d.culture.inPerson || ''}</p>
          </div>
          <div class="array-item">
            <strong>Remote Culture</strong>
            <p class="text-content">${d.culture.remoteCulture || ''}</p>
          </div>
          <div class="array-item">
            <strong>Inclusion</strong>
            <p class="text-content">${d.culture.inclusion || ''}</p>
          </div>
        </div>
      ` : ''}
    `;
  }

  renderEdit() {
    const d = this.data;
    const workLoc = d.workLocation || {};
    const equip = d.equipment || {};
    const sched = d.schedule || {};
    const tools = d.tools || {};
    const cult = d.culture || {};

    return `
      <form class="edit-form">
        <div class="form-row">
          <div class="form-group">
            <label>Model</label>
            <input type="text" data-path="model" value="${this.escapeHtml(d.model || '')}" />
            <div class="form-hint">e.g., "Hybrid", "Remote-First", "Flexible"</div>
          </div>
        </div>

        <div class="form-group">
          <label>Summary</label>
          <textarea data-path="summary" rows="3">${this.escapeHtml(d.summary || '')}</textarea>
          <div class="form-hint">Brief overview of the remote work policy</div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>📍 Work Location</label>
          </div>
          <div class="array-items">
            <div class="array-item-edit">
              <div class="form-group">
                <label>Policy</label>
                <textarea data-path="workLocation.policy" rows="3">${this.escapeHtml(workLoc.policy || '')}</textarea>
                <div class="form-hint">Overall location policy</div>
              </div>
              <div class="form-group">
                <label>Office Expectation</label>
                <textarea data-path="workLocation.officeExpectation" rows="2">${this.escapeHtml(workLoc.officeExpectation || '')}</textarea>
                <div class="form-hint">How often employees are expected in office</div>
              </div>
              <div class="form-group">
                <label>Work From Anywhere</label>
                <textarea data-path="workLocation.workFromAnywhere" rows="2">${this.escapeHtml(workLoc.workFromAnywhere || '')}</textarea>
                <div class="form-hint">Policy on working from different locations</div>
              </div>
            </div>
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>💻 Equipment</label>
          </div>
          <div class="array-items">
            <div class="array-item-edit">
              <div class="form-group">
                <label>Budget</label>
                <textarea data-path="equipment.budget" rows="2">${this.escapeHtml(equip.budget || '')}</textarea>
                <div class="form-hint">Budget provided for equipment</div>
              </div>
              <div class="form-group">
                <label>Provided</label>
                <textarea data-path="equipment.provided" rows="2">${this.escapeHtml(equip.provided || '')}</textarea>
                <div class="form-hint">What equipment is provided</div>
              </div>
              <div class="form-group">
                <label>Support</label>
                <textarea data-path="equipment.support" rows="2">${this.escapeHtml(equip.support || '')}</textarea>
                <div class="form-hint">Technical support available</div>
              </div>
            </div>
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>⏰ Schedule</label>
          </div>
          <div class="array-items">
            <div class="array-item-edit">
              <div class="form-group">
                <label>Flexibility</label>
                <textarea data-path="schedule.flexibility" rows="2">${this.escapeHtml(sched.flexibility || '')}</textarea>
                <div class="form-hint">How flexible are working hours</div>
              </div>
              <div class="form-group">
                <label>Core Hours</label>
                <textarea data-path="schedule.coreHours" rows="2">${this.escapeHtml(sched.coreHours || '')}</textarea>
                <div class="form-hint">Required overlap hours if any</div>
              </div>
              <div class="form-group">
                <label>Asynchronous Work</label>
                <textarea data-path="schedule.asynchronous" rows="2">${this.escapeHtml(sched.asynchronous || '')}</textarea>
                <div class="form-hint">Policy on async communication</div>
              </div>
            </div>
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>🛠️ Tools</label>
          </div>
          <div class="array-items">
            <div class="array-item-edit">
              <div class="form-group">
                <label>Communication</label>
                <textarea data-path="tools.communication" rows="2">${this.escapeHtml(tools.communication || '')}</textarea>
                <div class="form-hint">Communication tools used</div>
              </div>
              <div class="form-group">
                <label>Collaboration</label>
                <textarea data-path="tools.collaboration" rows="2">${this.escapeHtml(tools.collaboration || '')}</textarea>
                <div class="form-hint">Collaboration platforms</div>
              </div>
              <div class="form-group">
                <label>Socializing</label>
                <textarea data-path="tools.socializing" rows="2">${this.escapeHtml(tools.socializing || '')}</textarea>
                <div class="form-hint">Tools for team bonding</div>
              </div>
            </div>
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>🤝 Culture</label>
          </div>
          <div class="array-items">
            <div class="array-item-edit">
              <div class="form-group">
                <label>In-Person Events</label>
                <textarea data-path="culture.inPerson" rows="2">${this.escapeHtml(cult.inPerson || '')}</textarea>
                <div class="form-hint">Team meetups and events</div>
              </div>
              <div class="form-group">
                <label>Remote Culture</label>
                <textarea data-path="culture.remoteCulture" rows="2">${this.escapeHtml(cult.remoteCulture || '')}</textarea>
                <div class="form-hint">How remote culture is maintained</div>
              </div>
              <div class="form-group">
                <label>Inclusion</label>
                <textarea data-path="culture.inclusion" rows="2">${this.escapeHtml(cult.inclusion || '')}</textarea>
                <div class="form-hint">Ensuring remote workers feel included</div>
              </div>
            </div>
          </div>
        </div>
      </form>
    `;
  }

  collectFormData(form) {
    const inputs = form.querySelectorAll('input, textarea, select');

    // Initialize nested objects
    if (!this.data.workLocation) this.data.workLocation = {};
    if (!this.data.equipment) this.data.equipment = {};
    if (!this.data.schedule) this.data.schedule = {};
    if (!this.data.tools) this.data.tools = {};
    if (!this.data.culture) this.data.culture = {};

    inputs.forEach(input => {
      const path = input.dataset.path;
      if (path) {
        this.setNestedValue(this.data, path, input.value);
      }
    });
  }
}

customElements.define('remote-policy', RemotePolicyComponent);

export { RemotePolicyComponent };
