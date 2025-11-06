# Changelog

All notable changes to the Web Component POC - Asset Editor project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-19

### Added

- **Image Export Feature**: Download any asset view as a high-quality PNG image using html2canvas
  - 2x scaling for crisp output
  - Intelligent timing for complex components (1.5s for maps, 500ms for others)
  - Automatic download with asset title and timestamp
  - "📥 Download Image" button in view mode

- **Utility Classes**: Refactored shared logic into reusable utility modules
  - `StyleConstants.js`: Centralized design system tokens (colors, spacing, typography, shadows)
  - `TemplateBuilder.js`: Unified template generation and layout CSS
  - `FormHelper.js`: Form utilities including data collection, validation, and object manipulation

- **Fixed Drawer Layout**: Improved edit mode user experience
  - Changed from side-by-side layout to fixed right-side drawer (500px)
  - Transparent overlay for better content visibility
  - Drawer header with action buttons (Save/Cancel)
  - Full-width content preview on left
  - Responsive design: 400px at 1024px breakpoint, 100% stacked at 768px

- **Design System**: Comprehensive design tokens for consistency
  - Color palette with primary, success, error, and neutral colors
  - Spacing scale (xs through 2xl)
  - Typography system (sizes, weights, line heights)
  - Shadows and transitions for visual depth

### Changed

- **Code Refactoring**: Major architectural improvements
  - Reduced `base-component.js` by 58% through utility extraction
  - Centralized styling through `TemplateBuilder`
  - Improved separation of concerns

- **Form Handling**: Enhanced form data collection
  - Automatic form field to object mapping via `data-path` attributes
  - Support for nested object structures using dot notation
  - Improved validation and error handling

- **Edit Mode UX**: Streamlined editing experience
  - Moved form controls from left panel to fixed drawer
  - Added clear header identifying editing state
  - Save/Cancel buttons integrated into drawer header
  - Real-time preview in main content area

- **Console Cleanup**: Removed all debug console.log statements
  - Cleaner console output for development
  - Improved debugging experience

### Fixed

- **Asset Data Binding**: Corrected property mapping
  - Fixed asset.name → asset.title usage throughout components
  - Consistent property references across all components

- **Document Creation**: Resolved element creation issues
  - Fallback to innerHTML-only approach for robust element creation
  - Prevented cryptic createElement() errors

- **Layout Issues**: Fixed multiple rendering problems
  - Proper CSS cascade for layout + form styles
  - Correct z-index stacking for overlays
  - Responsive breakpoint adjustments

- **Office Locations Component**: Improved map rendering
  - Proper Leaflet map initialization
  - Fixed marker positioning and geocoding
  - Support for draggable markers with address search

### Performance

- Optimized component render cycles
- Improved Shadow DOM encapsulation
- Smart timing for image generation based on component complexity

### Documentation

- Updated README with new features and architecture
- Added detailed API documentation
- Included troubleshooting guide
- Added customization examples for new components

---

## [1.0.0] - 2024-12-10

### Added

- **Initial Release**: Full-featured asset editor for company profiles
  
- **Web Components Architecture**: Eight custom elements for different asset types
  - `<company-description>`: Company overview, tagline, quick facts, products
  - `<their-story>`: Founding story, founders, key milestones
  - `<key-numbers>`: Key metrics and statistics
  - `<funding-parser>`: Funding rounds, investors, valuation
  - `<leadership-component>`: Leadership team and board members
  - `<office-locations>`: Office locations with Leaflet maps
  - `<perks-benefits>`: Employee perks, benefits, compensation
  - `<remote-policy>`: Remote work policies and guidelines

- **Base Component Class**: Shared functionality for all asset components
  - Edit/View mode switching
  - Form data collection
  - Event handling and routing
  - Shadow DOM encapsulation
  - Responsive layout
  - Save/Cancel workflow

- **Edit Mode**:
  - Inline editing for all asset properties
  - Form fields for simple data (text, textarea)
  - JSON editors for complex nested structures
  - Live validation
  - Save and Cancel buttons

- **Ruby Sinatra Server**:
  - Lightweight backend for serving the application
  - GET `/api/assets`: Retrieve all assets from data.md
  - POST `/api/assets`: Save modified assets back to data.md
  - Static file serving for HTML, CSS, JavaScript

- **Data Persistence**:
  - Assets stored in markdown format in `data.md`
  - Automatic parsing of markdown frontmatter
  - YAML to JSON conversion for easy manipulation
  - Safe round-trip serialization

- **Responsive Design**:
  - Mobile-friendly layout
  - Tablet optimizations
  - Desktop enhancements
  - Flexible component sizing

- **Interactive Features**:
  - Leaflet maps integration for office locations
  - OpenStreetMap Nominatim geocoding
  - Draggable map markers
  - Address search functionality

- **UI Components**:
  - Asset cards with title and description
  - "Save All Changes" button for persistence
  - "Edit" button for inline editing
  - Form overlays with save/cancel actions
  - Loading states and error handling

### Architecture

- Custom Web Components (ES6 extending HTMLElement)
- Shadow DOM for style encapsulation
- Component-based rendering system
- Asset-based data model
- RESTful API design

### Development Workflow

- Ruby on Rails-style conventions
- Server-side data loading
- Client-side rendering and editing
- Browser-based development experience

---

## Notes

### Migration from 1.0.0 to 1.1.0

The 1.1.0 release includes significant architectural improvements:

1. **New Utility Classes**: The code has been refactored to use `StyleConstants`, `TemplateBuilder`, and `FormHelper`. These are used by the base component and should be imported when creating new components.

2. **Edit Mode Layout**: The edit form is now displayed in a fixed right-side drawer instead of a side panel. This provides better space utilization and improved UX.

3. **Image Export**: New download functionality is available through the "Download Image" button in view mode. For components with maps (Office Locations), allow extra render time.

4. **Console Output**: All debug logging has been removed. If you need to debug, use browser DevTools directly.

5. **Design System**: A comprehensive design system is now available in `StyleConstants.js` for consistent theming across components.

### Known Issues

- Maps in Office Locations may take up to 1.5 seconds to fully render before export
- Very large components (many images/complex data) may require additional memory for image export
- Nominatim geocoding has rate limits; rapid searches may fail

### Future Roadmap

- [ ] Component preview templates
- [ ] Bulk import/export functionality
- [ ] Version history and undo/redo
- [ ] Multi-user collaboration
- [ ] Custom component builder UI
- [ ] Advanced data validation rules
- [ ] Component performance monitoring
