import { AssetComponent } from './base-component.js';

class OfficeLocationsComponent extends AssetComponent {
  constructor() {
    super();
    this.type = 'office_locations';
    this.previewUpdateTimeout = null;
    this.maps = {}; // Store map instances by mapId
    this.markers = {}; // Store marker instances by mapId
  }

  set assetData(data) {
    this.data = data;
    if (this.shadowRoot) this.render();
  }

  renderView() {
    const d = this.data;
    const hq = d.headquarters || {};

    return `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      ${d.headquarters ? `
        <div class="section">
          <h3>🏢 Headquarters</h3>
          <div class="location-display">
            ${hq.latitude && hq.longitude ? `<div id="map-view-hq" class="location-map"></div>` : ''}
            <div class="location-info">
              <strong>${hq.city}, ${hq.country}</strong>
              ${hq.address ? `<p>📍 ${hq.address}</p>` : ''}
              ${hq.latitude || hq.longitude ? `<p>🗺️ ${hq.latitude}, ${hq.longitude}</p>` : ''}
              ${hq.size ? `<p>📏 ${hq.size}</p>` : ''}
              <p class="text-content">${hq.description || ''}</p>
            </div>
          </div>
        </div>
      ` : ''}

      ${d.offices && d.offices.length > 0 ? `
        <div class="section">
          <h3>🌍 Other Offices</h3>
          <div class="array-list">
            ${d.offices.map((office, index) => `
              <div class="location-display">
                ${office.latitude && office.longitude ? `<div id="map-view-office-${index}" class="location-map"></div>` : ''}
                <div class="location-info">
                  <strong>${office.city}, ${office.country}</strong>
                  <span style="display: inline-block; background: #007bff; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.8rem; margin-left: 0.5rem;">${office.type || 'Office'}</span>
                  ${office.address ? `<p>📍 ${office.address}</p>` : ''}
                  ${office.latitude || office.longitude ? `<p>🗺️ ${office.latitude}, ${office.longitude}</p>` : ''}
                  ${office.size ? `<p>📏 ${office.size}</p>` : ''}
                  <p class="text-content">${office.description || ''}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${d.remotePresence ? `
        <div class="section">
          <h3>💻 Remote Work</h3>
          <p class="text-content">${d.remotePresence}</p>
        </div>
      ` : ''}
    `;
  }

  renderPreview() {
    const d = this.data;
    const hq = d.headquarters || {};

    return `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
      ${d.headquarters ? `
        <div class="section">
          <h3>🏢 Headquarters</h3>
          <div class="location-display">
            ${hq.latitude && hq.longitude ? `<div id="map-preview-hq" class="location-map"></div>` : ''}
            <div class="location-info">
              <strong>${hq.city}, ${hq.country}</strong>
              ${hq.address ? `<p>📍 ${hq.address}</p>` : ''}
              ${hq.latitude || hq.longitude ? `<p>🗺️ ${hq.latitude}, ${hq.longitude}</p>` : ''}
              ${hq.size ? `<p>📏 ${hq.size}</p>` : ''}
              <p class="text-content">${hq.description || ''}</p>
            </div>
          </div>
        </div>
      ` : ''}

      ${d.offices && d.offices.length > 0 ? `
        <div class="section">
          <h3>🌍 Other Offices</h3>
          <div class="array-list">
            ${d.offices.map((office, index) => `
              <div class="location-display">
                ${office.latitude && office.longitude ? `<div id="map-preview-office-${index}" class="location-map"></div>` : ''}
                <div class="location-info">
                  <strong>${office.city}, ${office.country}</strong>
                  <span style="display: inline-block; background: #007bff; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.8rem; margin-left: 0.5rem;">${office.type || 'Office'}</span>
                  ${office.address ? `<p>📍 ${office.address}</p>` : ''}
                  ${office.latitude || office.longitude ? `<p>🗺️ ${office.latitude}, ${office.longitude}</p>` : ''}
                  ${office.size ? `<p>📏 ${office.size}</p>` : ''}
                  <p class="text-content">${office.description || ''}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${d.remotePresence ? `
        <div class="section">
          <h3>💻 Remote Work</h3>
          <p class="text-content">${d.remotePresence}</p>
        </div>
      ` : ''}
    `;
  }

  renderEdit() {
    const d = this.data;
    const hq = d.headquarters || {};
    return `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <form class="edit-form">
        <div class="array-editor">
          <div class="array-editor-header">
            <label>🏢 Headquarters</label>
          </div>
          <div class="array-items">
            <div class="array-item-edit">
              <div class="form-row">
                <div class="form-group">
                  <label>City</label>
                  <input type="text" data-path="headquarters.city" value="${this.escapeHtml(hq.city || '')}" />
                </div>
                <div class="form-group">
                  <label>Country</label>
                  <input type="text" data-path="headquarters.country" value="${this.escapeHtml(hq.country || '')}" />
                </div>
              </div>
              <div class="form-group">
                <label>Address</label>
                <input type="text" data-path="headquarters.address" value="${this.escapeHtml(hq.address || '')}" />
                <button type="button" class="btn-search-map" data-location-type="hq">🗺️ Search on Map</button>
              </div>
              <div id="map-container-hq" style="display: none;">
                <div class="map-search-box">
                  <input type="text" id="map-search-hq" placeholder="Search for a location..." class="map-search-input" />
                  <button type="button" class="btn-map-search" data-search-for="hq">🔍 Search</button>
                </div>
                <div id="map-hq" class="location-map"></div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Latitude</label>
                  <input type="number" step="0.0001" data-path="headquarters.latitude" data-lat="hq" value="${hq.latitude || ''}" />
                </div>
                <div class="form-group">
                  <label>Longitude</label>
                  <input type="number" step="0.0001" data-path="headquarters.longitude" data-lng="hq" value="${hq.longitude || ''}" />
                </div>
              </div>
              <div class="form-group">
                <label>Size</label>
                <input type="text" data-path="headquarters.size" value="${this.escapeHtml(hq.size || '')}" />
                <div class="form-hint">e.g., "50,000 sq ft" or "3 floors"</div>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea data-path="headquarters.description" rows="3">${this.escapeHtml(hq.description || '')}</textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="array-editor">
          <div class="array-editor-header">
            <label>🌍 Other Offices</label>
            <button type="button" class="btn-add-item" data-action="add-office">+ Add Office</button>
          </div>
          <div class="array-items" id="offices-container">
            ${(d.offices || []).map((office, index) => `
              <div class="array-item-edit" data-index="${index}">
                <div class="array-item-header">
                  <span class="array-item-title">${this.escapeHtml(office.city || `Office #${index + 1}`)} ${office.country ? `, ${this.escapeHtml(office.country)}` : ''}</span>
                  <button type="button" class="btn-remove-item" data-action="remove-office" data-index="${index}">Remove</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>City</label>
                    <input type="text" data-path="offices.${index}.city" value="${this.escapeHtml(office.city || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Country</label>
                    <input type="text" data-path="offices.${index}.country" value="${this.escapeHtml(office.country || '')}" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Type</label>
                    <input type="text" data-path="offices.${index}.type" value="${this.escapeHtml(office.type || '')}" />
                    <div class="form-hint">e.g., "Engineering Hub", "Sales Office"</div>
                  </div>
                  <div class="form-group">
                    <label>Size</label>
                    <input type="text" data-path="offices.${index}.size" value="${this.escapeHtml(office.size || '')}" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <input type="text" data-path="offices.${index}.address" value="${this.escapeHtml(office.address || '')}" />
                  <button type="button" class="btn-search-map" data-location-type="office" data-office-index="${index}">🗺️ Search on Map</button>
                </div>
                <div id="map-container-office-${index}" style="display: none;">
                  <div class="map-search-box">
                    <input type="text" id="map-search-office-${index}" placeholder="Search for a location..." class="map-search-input" />
                    <button type="button" class="btn-map-search" data-search-for="office-${index}">🔍 Search</button>
                  </div>
                  <div id="map-office-${index}" class="location-map"></div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Latitude</label>
                    <input type="number" step="0.0001" data-path="offices.${index}.latitude" data-lat="office-${index}" value="${office.latitude || ''}" />
                  </div>
                  <div class="form-group">
                    <label>Longitude</label>
                    <input type="number" step="0.0001" data-path="offices.${index}.longitude" data-lng="office-${index}" value="${office.longitude || ''}" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea data-path="offices.${index}.description" rows="3">${this.escapeHtml(office.description || '')}</textarea>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label>💻 Remote Presence Description</label>
          <textarea data-path="remotePresence" rows="4">${this.escapeHtml(d.remotePresence || '')}</textarea>
          <div class="form-hint">Describe the company's remote work policy and presence</div>
        </div>
      </form>
    `;
  }

  handleCustomAction(action, index) {
    switch (action) {
      case 'add-office':
        if (!this.data.offices) this.data.offices = [];
        this.data.offices.push({
          city: '',
          country: '',
          type: '',
          address: '',
          latitude: null,
          longitude: null,
          size: '',
          description: ''
        });
        this.render();
        break;
      case 'remove-office':
        if (this.data.offices && index !== undefined) {
          this.data.offices.splice(parseInt(index), 1);
          this.render();
        }
        break;
    }
  }

  collectFormData(form) {
    const inputs = form.querySelectorAll('input, textarea, select');

    // Initialize headquarters if it doesn't exist
    if (!this.data.headquarters) {
      this.data.headquarters = {};
    }

    inputs.forEach(input => {
      const path = input.dataset.path;
      if (path) {
        this.setNestedValue(this.data, path, input.value);
      }
    });
  }

  async loadLeaflet() {
    if (window.L) return; // Already loaded

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async initMap(mapId, locationType, officeIndex = null) {
    await this.loadLeaflet();

    // Fix Leaflet default icon paths
    delete window.L.Icon.Default.prototype._getIconUrl;
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Show map container
    const containerId = locationType === 'hq' ? 'map-container-hq' : `map-container-office-${officeIndex}`;
    const mapContainerWrapper = this.shadowRoot.getElementById(containerId);
    if (mapContainerWrapper) {
      mapContainerWrapper.style.display = 'block';
    }

    const mapContainer = this.shadowRoot.getElementById(mapId);
    if (!mapContainer) return;

    mapContainer.style.height = '400px';
    mapContainer.style.borderRadius = '8px';
    mapContainer.style.border = '2px solid #007bff';

    // Get current coordinates or default to Paris
    let lat, lng;
    if (locationType === 'hq') {
      lat = this.data.headquarters?.latitude || 48.8566;
      lng = this.data.headquarters?.longitude || 2.3522;
    } else {
      const office = this.data.offices?.[officeIndex];
      lat = office?.latitude || 48.8566;
      lng = office?.longitude || 2.3522;
    }

    // Create map
    const map = window.L.map(mapContainer).setView([lat, lng], 13);

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add draggable marker
    const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);

    // Store location info on marker for later use
    marker._locationType = locationType;
    marker._officeIndex = officeIndex;

    // Update coordinates when marker is dragged
    marker.on('dragend', (e) => {
      const position = marker.getLatLng();
      this.updateCoordinates(locationType, officeIndex, position.lat, position.lng);
    });

    // Click on map to move marker
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      this.updateCoordinates(locationType, officeIndex, e.latlng.lat, e.latlng.lng);
    });

    // Store map and marker for later use
    const mapKey = locationType === 'hq' ? 'hq' : `office-${officeIndex}`;
    if (!this.maps) this.maps = {};
    this.maps[mapKey] = { map, marker };

    // Search address if provided
    const address = locationType === 'hq'
      ? this.shadowRoot.querySelector('[data-path="headquarters.address"]')?.value
      : this.shadowRoot.querySelector(`[data-path="offices.${officeIndex}.address"]`)?.value;

    if (address) {
      this.searchAddress(address, map, marker);
    }
  }

  updateCoordinates(locationType, officeIndex, lat, lng) {
    const latInput = this.shadowRoot.querySelector(`[data-lat="${locationType === 'hq' ? 'hq' : `office-${officeIndex}`}"]`);
    const lngInput = this.shadowRoot.querySelector(`[data-lng="${locationType === 'hq' ? 'hq' : `office-${officeIndex}`}"]`);

    if (latInput) latInput.value = lat.toFixed(4);
    if (lngInput) lngInput.value = lng.toFixed(4);

    // Update data
    if (locationType === 'hq') {
      if (!this.data.headquarters) this.data.headquarters = {};
      this.data.headquarters.latitude = parseFloat(lat.toFixed(4));
      this.data.headquarters.longitude = parseFloat(lng.toFixed(4));
    } else {
      if (this.data.offices && this.data.offices[officeIndex]) {
        this.data.offices[officeIndex].latitude = parseFloat(lat.toFixed(4));
        this.data.offices[officeIndex].longitude = parseFloat(lng.toFixed(4));
      }
    }
  }

  async searchAddress(address, map, marker, searchButton = null) {
    // Show spinner
    if (searchButton) {
      searchButton.disabled = true;
      searchButton.innerHTML = '<span class="spinner"></span> Searching...';
    }

    try {
      // Using Nominatim API for geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        map.setView([lat, lng], 15);
        marker.setLatLng([lat, lng]);

        // Update coordinates in the form
        const locationType = marker._locationType;
        const officeIndex = marker._officeIndex;
        this.updateCoordinates(locationType, officeIndex, lat, lng);
      } else {
        alert('Location not found. Please try a different search query.');
      }
    } catch (error) {
      alert('Error searching for location. Please try again.');
    } finally {
      // Hide spinner
      if (searchButton) {
        searchButton.disabled = false;
        searchButton.innerHTML = '🔍 Search';
      }
    }
  }

  updateLivePreview() {
    const form = this.shadowRoot.querySelector('.edit-form');
    if (!form) return;

    // Collect current form data
    this.collectFormData(form);

    // Debounce preview updates to avoid flickering
    clearTimeout(this.previewUpdateTimeout);
    this.previewUpdateTimeout = setTimeout(() => {
      this.doUpdateLivePreview();
    }, 300); // Wait 300ms after user stops typing
  }

  doUpdateLivePreview() {
    // For office locations, only update the info content, not the maps
    const previewPanel = this.shadowRoot.querySelector('.preview-panel');
    if (previewPanel) {
      // Update location info texts without reinitializing maps
      const hq = this.data.headquarters || {};

      // Update headquarters info if it exists
      const hqInfoDiv = previewPanel.querySelector('.location-info');
      if (hqInfoDiv && hq.city) {
        hqInfoDiv.innerHTML = `
          <strong>${hq.city}, ${hq.country}</strong>
          ${hq.address ? `<p>📍 ${hq.address}</p>` : ''}
          ${hq.latitude || hq.longitude ? `<p>🗺️ ${hq.latitude}, ${hq.longitude}</p>` : ''}
          ${hq.size ? `<p>📏 ${hq.size}</p>` : ''}
          <p class="text-content">${hq.description || ''}</p>
        `;
      }

      // Update office info texts
      const officeDisplays = previewPanel.querySelectorAll('.location-display');
      officeDisplays.forEach((display, index) => {
        if (this.data.offices && this.data.offices[index]) {
          const office = this.data.offices[index];
          const infoDiv = display.querySelector('.location-info');
          if (infoDiv) {
            infoDiv.innerHTML = `
              <strong>${office.city}, ${office.country}</strong>
              <span style="display: inline-block; background: #007bff; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.8rem; margin-left: 0.5rem;">${office.type || 'Office'}</span>
              ${office.address ? `<p>📍 ${office.address}</p>` : ''}
              ${office.latitude || office.longitude ? `<p>🗺️ ${office.latitude}, ${office.longitude}</p>` : ''}
              ${office.size ? `<p>📏 ${office.size}</p>` : ''}
              <p class="text-content">${office.description || ''}</p>
            `;
          }
        }
      });
    }
  }

  attachEventListeners() {
    super.attachEventListeners();

    // Initialize maps only if not already initialized
    setTimeout(() => {
      // Only initialize the maps that are currently visible
      if (this.isEditing) {
        // In edit mode: clear view maps and initialize preview maps
        this.clearViewMaps();
        this.initializePreviewMaps();
      } else {
        // In view mode: clear preview maps and initialize view maps
        this.clearPreviewMaps();
        this.initializeViewMaps();
      }
    }, 100);

    // Add map button listeners
    const mapButtons = this.shadowRoot.querySelectorAll('.btn-search-map');
    mapButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const locationType = e.target.dataset.locationType;
        const officeIndex = e.target.dataset.officeIndex;

        const mapId = locationType === 'hq' ? 'map-hq' : `map-office-${officeIndex}`;
        this.initMap(mapId, locationType, officeIndex ? parseInt(officeIndex) : null);
      });
    });

    // Add search button listeners
    const searchButtons = this.shadowRoot.querySelectorAll('.btn-map-search');
    searchButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const searchFor = e.target.dataset.searchFor;
        const searchInput = this.shadowRoot.getElementById(`map-search-${searchFor}`);
        const searchQuery = searchInput?.value;

        if (searchQuery && this.maps && this.maps[searchFor]) {
          const { map, marker } = this.maps[searchFor];
          this.searchAddress(searchQuery, map, marker, btn);
        }
      });
    });

    // Add Enter key support for search inputs
    const searchInputs = this.shadowRoot.querySelectorAll('.map-search-input');
    searchInputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const searchFor = input.id.replace('map-search-', '');
          if (this.maps && this.maps[searchFor]) {
            const { map, marker } = this.maps[searchFor];
            const searchButton = this.shadowRoot.querySelector(`[data-search-for="${searchFor}"]`);
            this.searchAddress(input.value, map, marker, searchButton);
          }
        }
      });
    });
  }

  clearViewMaps() {
    // Remove map instances that use 'map-view-' prefix
    Object.keys(this.maps).forEach(mapId => {
      if (mapId.includes('map-view-')) {
        const map = this.maps[mapId];
        if (map && map.remove) {
          map.remove();
        }
        delete this.maps[mapId];
        delete this.markers[mapId];
      }
    });
  }

  clearPreviewMaps() {
    // Remove map instances that use 'map-preview-' prefix
    Object.keys(this.maps).forEach(mapId => {
      if (mapId.includes('map-preview-')) {
        const map = this.maps[mapId];
        if (map && map.remove) {
          map.remove();
        }
        delete this.maps[mapId];
        delete this.markers[mapId];
      }
    });
  }

  initializeViewMaps() {
    // Initialize map for headquarters if coordinates exist
    const hq = this.data.headquarters || {};
    if (hq.latitude && hq.longitude) {
      const mapContainer = this.shadowRoot.getElementById('map-view-hq');
      if (mapContainer) {
        this.initViewMap('map-view-hq', hq.latitude, hq.longitude);
      }
    }

    // Initialize maps for other offices if coordinates exist
    if (this.data.offices && this.data.offices.length > 0) {
      this.data.offices.forEach((office, index) => {
        if (office.latitude && office.longitude) {
          const mapContainer = this.shadowRoot.getElementById(`map-view-office-${index}`);
          if (mapContainer) {
            this.initViewMap(`map-view-office-${index}`, office.latitude, office.longitude);
          }
        }
      });
    }
  }

  initializePreviewMaps() {
    // Initialize map for headquarters if coordinates exist
    const hq = this.data.headquarters || {};
    if (hq.latitude && hq.longitude) {
      const mapContainer = this.shadowRoot.getElementById('map-preview-hq');
      if (mapContainer) {
        this.initPreviewMap('map-preview-hq', hq.latitude, hq.longitude);
      }
    }

    // Initialize maps for other offices if coordinates exist
    if (this.data.offices && this.data.offices.length > 0) {
      this.data.offices.forEach((office, index) => {
        if (office.latitude && office.longitude) {
          const mapContainer = this.shadowRoot.getElementById(`map-preview-office-${index}`);
          if (mapContainer) {
            this.initPreviewMap(`map-preview-office-${index}`, office.latitude, office.longitude);
          }
        }
      });
    }
  }

  initViewMap(mapId, latitude, longitude) {
    const mapContainer = this.shadowRoot.getElementById(mapId);
    if (!mapContainer) {
      return;
    }

    // Check if map already exists
    if (this.maps[mapId]) {
      return;
    }

    // Mark map as initializing to prevent duplicate calls
    this.maps[mapId] = 'initializing';

    // Ensure Leaflet is loaded globally
    this.ensureLeafletLoaded().then(() => {
      try {
        const map = window.L.map(mapContainer).setView([latitude, longitude], 13);
        this.maps[mapId] = map; // Store actual map instance

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Create non-draggable marker for view mode
        const marker = window.L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(`📍 Location`)
          .openPopup();

        this.markers[mapId] = marker;
      } catch (error) {
        // Clear the initializing flag on error
        delete this.maps[mapId];
      }
    });
  }

  initPreviewMap(mapId, latitude, longitude) {
    const mapContainer = this.shadowRoot.getElementById(mapId);
    if (!mapContainer) {
      return;
    }

    // Check if map already exists
    if (this.maps[mapId]) {
      return;
    }

    // Mark map as initializing to prevent duplicate calls
    this.maps[mapId] = 'initializing';

    // Ensure Leaflet is loaded globally
    this.ensureLeafletLoaded().then(() => {
      try {
        const map = window.L.map(mapContainer).setView([latitude, longitude], 13);
        this.maps[mapId] = map; // Store actual map instance

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Create draggable marker for preview mode (edit)
        const marker = window.L.marker([latitude, longitude], { draggable: true })
          .addTo(map)
          .bindPopup(`📍 Drag to update location`)
          .openPopup();

        this.markers[mapId] = marker;

        // Handle marker drag events to update form fields
        marker.on('dragend', () => {
          const newLatLng = marker.getLatLng();
          const newLat = newLatLng.lat.toFixed(6);
          const newLng = newLatLng.lng.toFixed(6);

          // Update form fields based on mapId
          this.updateCoordinatesInForm(mapId, newLat, newLng);
        });
      } catch (error) {
        // Clear the initializing flag on error
        delete this.maps[mapId];
      }
    });
  }

  ensureLeafletLoaded() {
    return new Promise((resolve) => {
      if (window.L) {
        resolve();
        return;
      }

      // Load Leaflet CSS if not already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      script.onerror = () => {
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  updateCoordinatesInForm(mapId, latitude, longitude) {
    // Parse mapId to determine if it's HQ or office and get index
    const isHQ = mapId.includes('hq');
    const officeIndex = !isHQ ? parseInt(mapId.split('-').pop()) : null;

    if (isHQ) {
      // Update HQ latitude and longitude fields
      const latInput = this.shadowRoot.querySelector('[name="headquarters_latitude"]');
      const lngInput = this.shadowRoot.querySelector('[name="headquarters_longitude"]');

      if (latInput) {
        latInput.value = latitude;
        latInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (lngInput) {
        lngInput.value = longitude;
        lngInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (officeIndex !== null) {
      // Update office latitude and longitude fields
      const latInput = this.shadowRoot.querySelector(`[name="offices_${officeIndex}_latitude"]`);
      const lngInput = this.shadowRoot.querySelector(`[name="offices_${officeIndex}_longitude"]`);

      if (latInput) {
        latInput.value = latitude;
        latInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (lngInput) {
        lngInput.value = longitude;
        lngInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Update the preview to reflect new coordinates
    const coordDisplay = this.shadowRoot.querySelector(`#${mapId}`);
    if (coordDisplay && coordDisplay.nextElementSibling) {
      const infoDiv = coordDisplay.nextElementSibling;
      // Find and update the coordinate paragraph
      const coordParagraph = infoDiv.querySelector('p:has-text("🗺️")');
      if (coordParagraph) {
        coordParagraph.textContent = `🗺️ ${latitude}, ${longitude}`;
      } else {
        // If not found with :has, search manually
        const paragraphs = infoDiv.querySelectorAll('p');
        for (let p of paragraphs) {
          if (p.textContent.includes('🗺️')) {
            p.textContent = `🗺️ ${latitude}, ${longitude}`;
            break;
          }
        }
      }
    }
  }

  getStyles() {
    const baseStyles = super.getStyles();
    return baseStyles + `
      .location-display {
        display: flex;
        gap: 1.5rem;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 8px;
      }

      .location-info {
        flex: 1;
        min-width: 0;
      }

      .location-display .location-map {
        flex: 1;
        height: 400px;
        min-height: 400px;
      }

      @media (max-width: 768px) {
        .location-display {
          flex-direction: column;
        }
        .location-info {
          flex: 1;
        }
        .location-display .location-map {
          width: 100%;
          height: 300px;
        }
      }

      .btn-search-map {
        margin-top: 0.5rem;
        padding: 0.4rem 0.8rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s;
      }

      .btn-search-map:hover {
        background: #0056b3;
        transform: translateY(-1px);
      }

      .location-map {
        width: 100%;
        height: 400px;
        border-radius: 8px;
        border: 2px solid #007bff;
      }

      .map-search-box {
        display: flex;
        gap: 0.5rem;
        margin: 1rem 0;
        align-items: center;
      }

      .map-search-input {
        flex: 1;
        padding: 0.6rem;
        border: 2px solid #007bff;
        border-radius: 4px;
        font-size: 0.9rem;
        font-family: inherit;
      }

      .map-search-input:focus {
        outline: none;
        border-color: #0056b3;
        box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
      }

      .btn-map-search {
        padding: 0.6rem 1rem;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .btn-map-search:hover {
        background: #218838;
        transform: translateY(-1px);
      }

      .btn-map-search:disabled {
        background: #6c757d;
        cursor: not-allowed;
        transform: none;
      }

      .spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid #ffffff;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
  }
}

customElements.define('office-locations', OfficeLocationsComponent);

export { OfficeLocationsComponent };
