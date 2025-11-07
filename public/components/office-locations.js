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

  render() {
    super.render();
    this._attachDrawerListeners();
  }

  _attachDrawerListeners() {
    const attachListeners = () => {
      this._attachDrawerMapButtons();
      this._attachDrawerSearchButtons();
      this._attachDrawerSearchInputs();
    };

    // Try attaching immediately
    attachListeners();

    // Watch for changes in drawer
    const drawer = document.querySelector('.edit-drawer-light-dom');
    if (drawer && !drawer._hasObserver) {
      drawer._hasObserver = true;
      const observer = new MutationObserver(() => attachListeners());
      observer.observe(drawer, { childList: true, subtree: true });
    }
  }

  _attachDrawerMapButtons() {
    const buttons = document.querySelectorAll('.btn-search-map[data-location-type]:not([data-listener-attached])');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => this._handleMapButtonClick(e));
      btn.setAttribute('data-listener-attached', 'true');
    });
  }

  _attachDrawerSearchButtons() {
    const buttons = document.querySelectorAll('.btn-map-search[data-search-for]:not([data-search-listener-attached])');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => this._handleSearchButtonClick(e));
      btn.setAttribute('data-search-listener-attached', 'true');
    });
  }

  _attachDrawerSearchInputs() {
    const inputs = document.querySelectorAll('.map-search-input:not([data-search-input-listener-attached])');
    inputs.forEach(input => {
      input.addEventListener('keypress', (e) => this._handleSearchInputKeypress(e, input));
      input.setAttribute('data-search-input-listener-attached', 'true');
    });
  }

  _handleMapButtonClick(e) {
    e.preventDefault();
    const { locationType, officeIndex } = e.target.dataset;
    const mapId = locationType === 'hq' ? 'map-hq' : `map-office-${officeIndex}`;
    this.initMap(mapId, locationType, officeIndex ? parseInt(officeIndex) : null);
  }

  _handleSearchButtonClick(e) {
    e.preventDefault();
    const searchFor = e.target.dataset.searchFor;
    const searchInput = this._findElement(`map-search-${searchFor}`);
    const searchQuery = searchInput?.value;

    if (searchQuery && this.maps?.[searchFor]) {
      const { map, marker } = this.maps[searchFor];
      this.searchAddress(searchQuery, map, marker, e.target);
    }
  }

  _handleSearchInputKeypress(e, input) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const searchFor = input.id.replace('map-search-', '');
    if (this.maps?.[searchFor]) {
      const { map, marker } = this.maps[searchFor];
      const searchButton = this._findElement(`[data-search-for="${searchFor}"]`, true);
      this.searchAddress(input.value, map, marker, searchButton);
    }
  }

  _findElement(query, isSelector = false) {
    const finder = isSelector
      ? (loc) => loc.querySelector(query)
      : (loc) => loc.getElementById(query);

    return finder(document) || (this.shadowRoot && finder(this.shadowRoot));
  }

  renderView() {
    return this._renderLocationTemplate('view');
  }

  renderPreview() {
    return this._renderLocationTemplate('preview');
  }

  _renderLocationTemplate(mode) {
    const d = this.data;
    const hq = d.headquarters || {};
    const leafletScript = mode === 'preview'
      ? `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>`
      : '';
    const mapPrefix = mode === 'preview' ? 'map-preview-' : 'map-view-';

    return `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      ${leafletScript}
      ${this._renderLocation(hq, 'hq', mapPrefix)}
      ${d.offices?.length ? `
        <div class="section">
          <h3>🌍 Other Offices</h3>
          <div class="array-list">
            ${d.offices.map((office, index) => this._renderLocation(office, `office-${index}`, mapPrefix, true)).join('')}
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

  _renderLocation(location, id, mapPrefix, isOffice = false) {
    if (!location || !Object.keys(location).length) return '';

    const mapId = `${mapPrefix}${id}`;
    const officeType = isOffice ? `
      <span style="display: inline-block; background: #007bff; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.8rem; margin-left: 0.5rem;">${location.type || 'Office'}</span>
    ` : '';

    return `
      <div class="section">
        <h3>${isOffice ? '🌍' : '🏢'} ${isOffice ? 'Other Offices' : 'Headquarters'}</h3>
        <div class="location-display">
          ${location.latitude && location.longitude ? `<div id="${mapId}" class="location-map"></div>` : ''}
          <div class="location-info">
            <strong>${location.city}, ${location.country}</strong>
            ${officeType}
            ${location.address ? `<p>📍 ${location.address}</p>` : ''}
            ${location.latitude || location.longitude ? `<p>🗺️ ${location.latitude}, ${location.longitude}</p>` : ''}
            ${location.size ? `<p>📏 ${location.size}</p>` : ''}
            <p class="text-content">${location.description || ''}</p>
          </div>
        </div>
      </div>
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

    // Show map container - always look in light DOM first (drawer), then shadowRoot
    const containerId = locationType === 'hq' ? 'map-container-hq' : `map-container-office-${officeIndex}`;
    let mapContainerWrapper = document.getElementById(containerId);
    console.log('[initMap] Looking for containerId:', containerId, 'Found in light DOM:', !!mapContainerWrapper);
    if (!mapContainerWrapper && this.shadowRoot) {
      mapContainerWrapper = this.shadowRoot.getElementById(containerId);
      console.log('[initMap] Found in shadowRoot:', !!mapContainerWrapper);
    }
    if (mapContainerWrapper) {
      console.log('[initMap] Showing map container');
      mapContainerWrapper.style.display = 'block';
    } else {
      console.log('[initMap] Map container not found!');
    }

    // Look for map container in light DOM first (drawer), then shadowRoot
    let mapContainer = document.getElementById(mapId);
    console.log('[initMap] Looking for mapId:', mapId, 'Found in light DOM:', !!mapContainer);
    if (!mapContainer && this.shadowRoot) {
      mapContainer = this.shadowRoot.getElementById(mapId);
      console.log('[initMap] Found in shadowRoot:', !!mapContainer);
    }
    if (!mapContainer) {
      console.log('[initMap] Map container element not found!');
      return;
    }

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
    let address;
    if (locationType === 'hq') {
      address = this.shadowRoot.querySelector('[data-path="headquarters.address"]')?.value ||
        document.querySelector('[data-path="headquarters.address"]')?.value;
    } else {
      address = this.shadowRoot.querySelector(`[data-path="offices.${officeIndex}.address"]`)?.value ||
        document.querySelector(`[data-path="offices.${officeIndex}.address"]`)?.value;
    }

    if (address) {
      this.searchAddress(address, map, marker);
    }
  }

  updateCoordinates(locationType, officeIndex, lat, lng) {
    const dataLat = locationType === 'hq' ? 'hq' : `office-${officeIndex}`;
    // Look in light DOM first (drawer), then shadowRoot
    let latInput = document.querySelector(`[data-lat="${dataLat}"]`);
    let lngInput = document.querySelector(`[data-lng="${dataLat}"]`);

    // Look in shadow DOM if not found in light DOM
    if (!latInput && this.shadowRoot) latInput = this.shadowRoot.querySelector(`[data-lat="${dataLat}"]`);
    if (!lngInput && this.shadowRoot) lngInput = this.shadowRoot.querySelector(`[data-lng="${dataLat}"]`);

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
    // Try to find form in shadow DOM first (fallback)
    let form = this.shadowRoot.querySelector('.edit-form');

    // If not found and we're using light DOM drawer, look there
    if (!form) {
      const drawer = document.querySelector('.edit-drawer-light-dom');
      if (drawer) {
        form = drawer.querySelector('.edit-form');
      }
    }

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
    const previewPanel = this.shadowRoot.querySelector('.preview-panel');
    if (!previewPanel) return;

    const hq = this.data.headquarters || {};
    const renderLocationInfo = (location) => {
      if (!location || !Object.keys(location).length) return '';
      return `
        <strong>${location.city || ''}, ${location.country || ''}</strong>
        ${location.type ? `<span style="display: inline-block; background: #007bff; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.8rem; margin-left: 0.5rem;">${location.type}</span>` : ''}
        ${location.address ? `<p>📍 ${location.address}</p>` : ''}
        ${location.latitude || location.longitude ? `<p>🗺️ ${location.latitude || ''}, ${location.longitude || ''}</p>` : ''}
        ${location.size ? `<p>📏 ${location.size}</p>` : ''}
        <p class="text-content">${location.description || ''}</p>
      `;
    };

    // Update HQ
    if (Object.keys(hq).length > 0) {
      const hqSection = this._findSectionByHeading(previewPanel, 'Headquarters');
      if (hqSection) {
        const infoDiv = hqSection.querySelector('.location-info');
        if (infoDiv) infoDiv.innerHTML = renderLocationInfo(hq);
      }
    }

    // Update offices
    if (this.data.offices?.length) {
      const officesSection = this._findSectionByHeading(previewPanel, 'Other Offices');
      if (officesSection) {
        const arrayList = officesSection.querySelector('.array-list');
        if (arrayList) {
          arrayList.querySelectorAll('.location-display').forEach((display, index) => {
            if (this.data.offices[index]) {
              const infoDiv = display.querySelector('.location-info');
              if (infoDiv) infoDiv.innerHTML = renderLocationInfo(this.data.offices[index]);
            }
          });
        }
      }
    }
  }

  _findSectionByHeading(container, text) {
    for (let heading of container.querySelectorAll('h3')) {
      if (heading.textContent.includes(text)) {
        return heading.closest('.section');
      }
    }
    return null;
  }

  attachEventListeners() {
    super.attachEventListeners();

    setTimeout(() => {
      if (this.isEditing) {
        this.clearViewMaps();
        this.initializePreviewMaps();
      } else {
        this.clearPreviewMaps();
        this.initializeViewMaps();
      }
    }, 100);

    // Attach map button listeners from shadowRoot
    this._attachShadowMapButtons();
    this._attachShadowSearchListeners();
  }

  _attachShadowMapButtons() {
    const buttons = this.shadowRoot.querySelectorAll('.btn-search-map');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => this._handleMapButtonClick(e));
    });
  }

  _attachShadowSearchListeners() {
    // Search buttons
    const searchButtons = this.shadowRoot.querySelectorAll('.btn-map-search');
    searchButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this._handleSearchButtonClick(e));
    });

    // Search inputs
    const searchInputs = this.shadowRoot.querySelectorAll('.map-search-input');
    searchInputs.forEach(input => {
      input.addEventListener('keypress', (e) => this._handleSearchInputKeypress(e, input));
    });
  }

  clearViewMaps() {
    // Remove map instances that use 'map-view-' prefix
    Object.keys(this.maps).forEach(mapId => {
      if (mapId.includes('map-view-') || mapId.includes('map-preview-')) {
        const mapEntry = this.maps[mapId];
        if (mapEntry && typeof mapEntry === 'object' && mapEntry.map && mapEntry.map.remove) {
          mapEntry.map.remove();
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
        const mapEntry = this.maps[mapId];
        if (mapEntry && typeof mapEntry === 'object' && mapEntry.map && mapEntry.map.remove) {
          mapEntry.map.remove();
        }
        delete this.maps[mapId];
        delete this.markers[mapId];
      }
    });
  }

  initializeViewMaps() {
    this._initializeLocationMaps('view');
  }

  initializePreviewMaps() {
    this._initializeLocationMaps('preview');
  }

  _initializeLocationMaps(mode) {
    const mapPrefix = mode === 'preview' ? 'map-preview-' : 'map-view-';
    const hq = this.data.headquarters || {};

    if (hq.latitude && hq.longitude) {
      const mapContainer = this.shadowRoot.getElementById(`${mapPrefix}hq`);
      if (mapContainer) {
        this._initializeReadOnlyMap(`${mapPrefix}hq`, hq.latitude, hq.longitude, mode);
      }
    }

    if (this.data.offices?.length) {
      this.data.offices.forEach((office, index) => {
        if (office.latitude && office.longitude) {
          const mapContainer = this.shadowRoot.getElementById(`${mapPrefix}office-${index}`);
          if (mapContainer) {
            this._initializeReadOnlyMap(`${mapPrefix}office-${index}`, office.latitude, office.longitude, mode);
          }
        }
      });
    }
  }

  _initializeReadOnlyMap(mapId, latitude, longitude, mode) {
    const mapContainer = this.shadowRoot.getElementById(mapId);
    if (!mapContainer || this.maps[mapId]) return;

    this.maps[mapId] = 'initializing';

    this.ensureLeafletLoaded().then(() => {
      try {
        const map = window.L.map(mapContainer).setView([latitude, longitude], 13);
        const isDraggable = mode === 'preview';

        const marker = window.L.marker([latitude, longitude], { draggable: isDraggable })
          .addTo(map)
          .bindPopup(`📍 ${isDraggable ? 'Drag to update' : 'Location'}`)
          .openPopup();

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        this.maps[mapId] = { map, marker };
        this.markers[mapId] = marker;

        if (isDraggable) {
          marker.on('dragend', () => this._handleMarkerDragEnd(mapId));
        }
      } catch (error) {
        delete this.maps[mapId];
      }
    });
  }

  _handleMarkerDragEnd(mapId) {
    const marker = this.maps[mapId]?.marker;
    if (!marker) return;

    const { lat, lng } = marker.getLatLng();
    this._updateCoordinatesFromMap(mapId, lat.toFixed(6), lng.toFixed(6));
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
    const isHQ = mapId.includes('hq');
    const officeIndex = !isHQ ? parseInt(mapId.split('-').pop()) : null;

    this._updateCoordinatesFromMap(mapId, latitude, longitude);
  }

  _updateCoordinatesFromMap(mapId, latitude, longitude) {
    const isHQ = mapId.includes('hq');
    const officeIndex = !isHQ ? parseInt(mapId.split('-').pop()) : null;

    // Update data object
    if (isHQ) {
      if (!this.data.headquarters) this.data.headquarters = {};
      this.data.headquarters.latitude = parseFloat(latitude);
      this.data.headquarters.longitude = parseFloat(longitude);
    } else if (this.data.offices?.[officeIndex]) {
      this.data.offices[officeIndex].latitude = parseFloat(latitude);
      this.data.offices[officeIndex].longitude = parseFloat(longitude);
    }

    // Update form inputs
    this._updateFormInputs(isHQ, officeIndex, latitude, longitude);
  }

  _updateFormInputs(isHQ, officeIndex, latitude, longitude) {
    if (isHQ) {
      this._updateInput('[name="headquarters_latitude"]', latitude);
      this._updateInput('[name="headquarters_longitude"]', longitude);
    } else {
      this._updateInput(`[name="offices_${officeIndex}_latitude"]`, latitude);
      this._updateInput(`[name="offices_${officeIndex}_longitude"]`, longitude);
    }
  }

  _updateInput(selector, value) {
    const input = this.shadowRoot?.querySelector(selector);
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
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
