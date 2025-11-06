import { AssetComponent } from './base-component.js';

class LeadershipComponent extends AssetComponent {
  constructor() {
    super();
    this.type = 'leadership';
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

      <div class="section">
        <h3>Leadership Team</h3>
        <div class="array-list">
          ${(d.leaders || []).map(leader => `
            <div class="array-item">
              <strong style="font-size: 1.1rem;">${leader.name} - ${leader.title}</strong>
              <p><em>${leader.tenure}</em></p>
              <p class="text-content">${leader.background || ''}</p>
              ${leader.quote ? `<blockquote style="border-left: 3px solid #007bff; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #666;">"${leader.quote}"</blockquote>` : ''}
              ${leader.achievements ? `
                <div style="margin-top: 1rem;">
                  <strong>Key Achievements:</strong>
                  <ul style="margin-top: 0.5rem;">
                    ${leader.achievements.map(ach => `<li>${ach}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      ${d.boardMembers && d.boardMembers.length > 0 ? `
        <div class="section">
          <h3>Board Members</h3>
          <div class="info-grid">
            ${d.boardMembers.map(member => `
              <div class="info-item">
                <strong>${member.name}</strong>
                <span>${member.role}</span>
                <p class="text-content" style="font-size: 0.85rem;">${member.affiliation || ''}</p>
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
          <label>Introduction</label>
          <textarea data-path="introduction" rows="4">${this.escapeHtml(d.introduction || '')}</textarea>
          <div class="form-hint">Brief introduction to the leadership team</div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>Leadership Team</label>
            <button type="button" class="btn-add-item" data-action="add-leader">+ Add Leader</button>
          </div>
          <div class="array-items" id="leaders-container">
            ${(d.leaders || []).map((leader, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">${this.escapeHtml(leader.name || `Leader #${index + 1}`)}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-leader" data-index="${index}">Remove</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Name</label>
                    <input type="text" data-path="leaders.${index}.name" value="${this.escapeHtml(leader.name || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Title</label>
                    <input type="text" data-path="leaders.${index}.title" value="${this.escapeHtml(leader.title || '')}" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Tenure</label>
                  <input type="text" data-path="leaders.${index}.tenure" value="${this.escapeHtml(leader.tenure || '')}" />
                  <div class="form-hint">e.g., "2018 - Present"</div>
                </div>
                <div class="form-group">
                  <label>Background</label>
                  <textarea data-path="leaders.${index}.background" rows="3">${this.escapeHtml(leader.background || '')}</textarea>
                </div>
                <div class="form-group">
                  <label>Quote (Optional)</label>
                  <textarea data-path="leaders.${index}.quote" rows="2">${this.escapeHtml(leader.quote || '')}</textarea>
                </div>
                <div class="form-group">
                  <label>Achievements (one per line)</label>
                  <textarea data-path="leaders.${index}.achievements" rows="4" data-type="array-lines">${(leader.achievements || []).map(a => this.escapeHtml(a)).join('\n')}</textarea>
                  <div class="form-hint">Enter each achievement on a new line</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>Board Members</label>
            <button type="button" class="btn-add-item" data-action="add-board">+ Add Board Member</button>
          </div>
          <div class="array-items" id="board-container">
            ${(d.boardMembers || []).map((member, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">${this.escapeHtml(member.name || `Board Member #${index + 1}`)}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-board" data-index="${index}">Remove</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Name</label>
                    <input type="text" data-path="boardMembers.${index}.name" value="${this.escapeHtml(member.name || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Role</label>
                    <input type="text" data-path="boardMembers.${index}.role" value="${this.escapeHtml(member.role || '')}" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Affiliation</label>
                  <input type="text" data-path="boardMembers.${index}.affiliation" value="${this.escapeHtml(member.affiliation || '')}" />
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
      case 'add-leader':
        if (!this.data.leaders) this.data.leaders = [];
        this.data.leaders.push({
          name: '',
          title: '',
          tenure: '',
          background: '',
          quote: '',
          achievements: []
        });
        this.render();
        break;
      case 'remove-leader':
        if (this.data.leaders && index !== undefined) {
          this.data.leaders.splice(parseInt(index), 1);
          this.render();
        }
        break;
      case 'add-board':
        if (!this.data.boardMembers) this.data.boardMembers = [];
        this.data.boardMembers.push({ name: '', role: '', affiliation: '' });
        this.render();
        break;
      case 'remove-board':
        if (this.data.boardMembers && index !== undefined) {
          this.data.boardMembers.splice(parseInt(index), 1);
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
        // Handle array-lines type (one item per line)
        if (input.dataset.type === 'array-lines') {
          const value = input.value.split('\n').map(line => line.trim()).filter(line => line);
          this.setNestedValue(this.data, path, value);
        } else {
          this.setNestedValue(this.data, path, input.value);
        }
      }
    });
  }
}

customElements.define('leadership-component', LeadershipComponent);

export { LeadershipComponent };
