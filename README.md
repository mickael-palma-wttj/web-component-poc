# Web Component POC - Asset Editor

A powerful web-based asset editor for managing company profiles with interactive web components. Edit company descriptions, leadership teams, funding information, office locations, and more with an intuitive interface.

## ✨ Features

- 🎨 **Web Components**: Custom elements for each asset type with full Shadow DOM encapsulation
- ✏️ **Inline Editing**: Click "Edit" on any asset to modify content with live preview
- 💾 **Persistent Storage**: Changes are saved back to `data.md` file
- �️ **Download as Image**: Export any asset view as a high-quality PNG image
- 🗺️ **Interactive Maps**: Leaflet maps for office locations with address search
- 📱 **Responsive Design**: Fully responsive UI that works on all screen sizes
- 🚀 **Ruby Sinatra Server**: Lightweight server for serving and API requests
- 🎯 **Live Preview**: Real-time preview while editing content

## 📋 Project Structure

```
web-component-poc/
├── data.md                          # Source data file (parsed and saved)
├── server.rb                        # Ruby Sinatra server
├── Gemfile                          # Ruby dependencies
├── package.json                     # Node dependencies (optional)
├── lib/
│   ├── asset_fetcher.rb             # Asset retrieval service
│   ├── asset_parser.rb              # Markdown to JSON parser
│   ├── asset_persister.rb           # Asset saving service
│   ├── component_bundler.rb         # JS bundling service
│   └── markdown_generator.rb        # JSON to Markdown generator
├── public/
│   ├── index.html                   # Main HTML page
│   ├── styles.css                   # Global styles
│   ├── main.js                      # Application initialization
│   ├── utils/
│   │   └── spinner-styles.js        # Loading spinner styles
│   └── components/
│       ├── base-component.js        # Base class for all components
│       ├── template-builder.js      # Centralized template generation
│       ├── style-constants.js       # Design system tokens
│       ├── form-helper.js           # Form utilities and validation
│       ├── company-description.js   # Company description component
│       ├── their-story.js           # Company story component
│       ├── key-numbers.js           # Key metrics component
│       ├── funding-parser.js        # Funding history component
│       ├── leadership.js            # Leadership team component
│       ├── office-locations.js      # Office locations with maps
│       ├── perks-benefits.js        # Perks and benefits component
│       └── remote-policy.js         # Remote work policy component
├── README.md                        # This file
└── CHANGELOG.md                     # Version history and updates
```

## 🛠️ Prerequisites

- Ruby 3.0 or higher
- Bundler gem
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd web-component-poc
```

2. Install Ruby dependencies:

```bash
bundle install
```

## 🚀 Usage

1. Start the server:

```bash
ruby server.rb
```

2. Open your browser:

```
http://localhost:4567
```

3. View all assets rendered as interactive web components

## ✏️ Editing Assets

### View Mode
- Click the **"Download Image"** button to export the content as PNG
- Click the **"Edit"** button to enter edit mode

### Edit Mode
- Fill in the form fields on the right drawer
- Watch the live preview update in real-time
- Click **"Save"** to apply changes
- Click **"Cancel"** to discard changes

### Save All Changes
- Click **"Save All Changes"** button at the top to persist all changes to `data.md`

## 🗺️ Special Features

### Office Locations
- Interactive Leaflet maps for each office
- Address search using OpenStreetMap Nominatim API
- Draggable markers to set exact coordinates
- Responsive map layout for all screen sizes

### Download as Image
- Export any component's view as a PNG image
- High quality 2x scaling for better resolution
- Automatic naming with asset title and timestamp
- Includes maps and all visual elements

### Live Preview
- See changes instantly while editing
- Live preview panel in edit mode
- Real-time form validation
- Support for complex nested data structures

## 🔌 API Endpoints

### GET `/api/assets`
Returns all assets from `data.md` as JSON. Supports optional filtering by asset types.

**Query Parameters:**
- `types` (optional): Comma-separated list of asset types to fetch

**Examples:**
```bash
# Get all assets
curl http://localhost:4567/api/assets

# Get only company_description and key_numbers
curl http://localhost:4567/api/assets?types=company_description,key_numbers
```

**Response:**
```json
{
  "success": true,
  "assets": [
    {
      "title": "Company Description",
      "type": "company_description",
      "data": { ... }
    }
  ],
  "total": 8,
  "filtered": 2
}
```

### GET `/api/assets/:type`
Returns a single asset by type from `data.md`.

**Path Parameters:**
- `type`: The asset type to fetch (e.g., `company_description`, `key_numbers`)

**Example:**
```bash
curl http://localhost:4567/api/assets/company_description
```

**Response:**
```json
{
  "success": true,
  "asset": {
    "title": "Company Description",
    "type": "company_description",
    "data": { ... }
  }
}
```

### POST `/api/assets`
Saves all assets back to `data.md`.

**Request Body:**
```json
{
  "assets": [ ... ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assets saved successfully"
}
```

### GET `/api/components`
Returns the component registry mapping asset types to their JS files and custom element names.

**Query Parameters:**
- `types` (optional): Comma-separated list of asset types to filter

**Examples:**
```bash
# Get all components
curl http://localhost:4567/api/components

# Get specific components
curl http://localhost:4567/api/components?types=key_numbers,remote_policy
```

**Response:**
```json
{
  "success": true,
  "components": {
    "company_description": {
      "file": "company-description.js",
      "element": "company-description"
    },
    "key_numbers": {
      "file": "key-numbers.js",
      "element": "key-numbers"
    }
  },
  "total": 8,
  "filtered": 2
}
```

### GET `/api/components/bundle`
Returns combined JavaScript code for requested components as a single file.

**Query Parameters:**
- `types` (required): Comma-separated list of asset types to bundle
- `include_base` (optional): Whether to include base dependencies (default: `true`)

**Examples:**
```bash
# Get bundle with base dependencies
curl "http://localhost:4567/api/components/bundle?types=key_numbers,remote_policy"

# Get bundle without base dependencies
curl "http://localhost:4567/api/components/bundle?types=key_numbers&include_base=false"
```

**Response:**
Returns JavaScript code (content-type: `application/javascript`) containing:
- Base dependencies (style-constants.js, form-helper.js, template-builder.js, base-component.js)
- Requested component files
- Import statements are commented out (bundled inline)

## 🧩 Web Components

### Available Components

- `<company-description>` - Company overview, tagline, quick facts, and products
- `<their-story>` - Founding story, founders, key milestones
- `<key-numbers>` - Key metrics and statistics
- `<funding-parser>` - Funding rounds, investors, and valuation
- `<leadership-component>` - Leadership team and board members
- `<office-locations>` - Office locations with interactive maps
- `<perks-benefits>` - Employee perks, benefits, and compensation
- `<remote-policy>` - Remote work policies and guidelines

### Component Architecture

All components extend `AssetComponent` base class providing:
- **Edit/View Mode Switching** - Seamless transitions between modes
- **Form Data Collection** - Automatic form field to object mapping
- **Event Handling** - Custom events for asset updates
- **Shadow DOM Encapsulation** - Isolated styles and DOM
- **Responsive Layout** - Mobile-friendly design
- **Image Export** - Download functionality

### Utility Classes

- **StyleConstants** - Centralized design tokens (colors, spacing, typography)
- **TemplateBuilder** - Reusable template generation and layout CSS
- **FormHelper** - Form utilities (data collection, validation, deep cloning)

## 🎨 Customization

### Adding a New Asset Type

1. Create `public/components/my-new-component.js`:

```javascript
import { AssetComponent } from './base-component.js';

class MyNewComponent extends AssetComponent {
  constructor() {
    super();
    this.type = 'my_new_asset';
  }

  renderView() {
    const d = this.data;
    return `<div class="section"><h3>${d.title}</h3>...</div>`;
  }

  renderEdit() {
    const d = this.data;
    return `
      <form class="edit-form">
        <div class="form-group">
          <label>Title</label>
          <input type="text" data-path="title" value="${d.title || ''}" />
        </div>
      </form>
    `;
  }

  renderPreview() {
    return this.renderView();
  }
}

customElements.define('my-new-asset', MyNewComponent);
export { MyNewComponent };
```

2. Import in `public/main.js`:

```javascript
import './components/my-new-component.js';
```

3. Update component mapping in `public/main.js`:

```javascript
const componentMap = {
  'my_new_asset': 'my-new-asset',
  // ... other mappings
};
```

## 🔧 Development

### Code Structure

- **base-component.js** - Core component logic, edit/view modes, form handling
- **template-builder.js** - Header, layout, and CSS generation
- **style-constants.js** - Design tokens for consistent theming
- **form-helper.js** - Form utilities and validation functions
- **main.js** - Application initialization and asset loading

### Hot Reload

The server doesn't include hot reload. After code changes, refresh the browser.

### Browser DevTools

- Open Developer Tools (F12) to inspect components
- View Shadow DOM elements in Elements tab
- Check Console for logs and errors

### Server Logs

The terminal running `ruby server.rb` shows all API requests and errors.

## 🐛 Troubleshooting

### Port Already in Use
Modify the port in `server.rb`:

```ruby
set :port, 4568  # Use a different port
```

### Assets Not Loading
- Verify `data.md` exists in project root
- Check file format matches expected structure
- Look for parsing errors in server logs

### Changes Not Saving
- Ensure write permissions to `data.md`
- Check browser console for API errors
- Verify Ruby server is running

### Maps Not Displaying
- Check internet connection (maps use Leaflet CDN)
- Verify latitude/longitude coordinates are valid
- Check browser console for Leaflet errors

### Image Download Issues
- For Office Locations, allow extra time for maps to render
- Check browser console for html2canvas errors
- Ensure sufficient browser memory for large components

## 📝 Best Practices

1. **Data Validation** - Always validate complex data before saving
2. **Backup** - Keep backups of `data.md` before major changes
3. **Testing** - Test components on different screen sizes
4. **Documentation** - Document custom component properties
5. **Performance** - Keep component render methods efficient

## 🔄 Recent Updates

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history and recent changes.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.
