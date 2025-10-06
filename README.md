# Laravel Visual Schema Designer

A comprehensive drag-and-drop visual database designer for Laravel applications. Create beautiful ERD diagrams with tables, relationships, and export them as PDF or images.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/brybry/laravel-visual-schema.svg?style=flat-square)](https://packagist.org/packages/brybry/laravel-visual-schema)
[![Total Downloads](https://img.shields.io/packagist/dt/brybry/laravel-visual-schema.svg?style=flat-square)](https://packagist.org/packages/brybry/laravel-visual-schema)
[![Laravel 12 Ready](https://img.shields.io/badge/Laravel-12%20Ready-green.svg?style=flat-square)](https://laravel.com)
[![PHP 8.2+](https://img.shields.io/badge/PHP-8.2+-blue.svg?style=flat-square)](https://php.net)

## Features

- 🎨 **Drag & Drop Interface** - Built with Alpine.js and Fabric.js (No build process required)
- 🧰 **Professional Toolbox** - Quick table creation, templates, and design tools
- 🔗 **Visual Relationships** - Draw connections between tables with smart routing
- 💾 **Persistent Layouts** - Save and reload your designs exactly as arranged
- 📤 **Multiple Export Formats** - PNG, SVG, and PDF export (grid-free exports)
- 🔐 **Secure Access Control** - Environment-based restrictions and middleware protection
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🌙 **Dark/Light Mode** - Theme support with automatic grid adaptation
- ↩️ **Undo/Redo System** - Full action history with 50-step memory
- 🔍 **Advanced Canvas** - Zoom, pan, grid snapping, and alignment tools
- 📐 **Alignment Tools** - Professional layout with distribute and align functions
- ⚡ **Quick Actions** - Table templates (Users, Posts, Categories), keyboard shortcuts
- 🎯 **Smart Grid System** - Adjustable dot grid with snap-to-grid functionality
- 🚀 **Laravel 12 Ready** - Full compatibility with Laravel 10, 11, and 12
- 🏠 **Shared Hosting Compatible** - No Node.js, npm, or build processes required
- 📦 **CDN-Powered Frontend** - Uses Alpine.js and Fabric.js from CDN for zero compilation

## Installation

### Requirements

- **PHP**: 8.2 or higher
- **Laravel**: 10.x, 11.x, or 12.x
- **Web Server**: Apache, Nginx, or any server that supports Laravel
- **Hosting**: Compatible with shared hosting (cPanel, Plesk, etc.)
- **No Node.js Required**: Works without npm, webpack, or any JavaScript build tools

### Install via Composer

```bash
composer require brybry/laravel-visual-schema
```

### Publish Assets (Shared Hosting Compatible)

Publish the static CSS/JS files (no compilation needed):

```bash
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="assets"
```

Publish the configuration file:

```bash
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="config"
```

Publish views for customization (optional):

```bash
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="views"
```

### For Shared Hosting Users

After publishing assets, simply upload your Laravel application via FTP. The package uses CDN libraries and requires no build process:

- ✅ **Upload via FTP/SFTP**
- ✅ **No Node.js required**
- ✅ **No npm install needed**
- ✅ **No build commands**
- ✅ **Works on cPanel/Plesk**

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save schema |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + D` | Duplicate selected object |
| `Ctrl + G` | Group selected objects |
| `Ctrl + U` | Ungroup selected objects |
| `Ctrl + T` | Add new table |
| `Ctrl + 0` | Reset zoom to 100% |
| `Ctrl + +` | Zoom in |
| `Ctrl + -` | Zoom out |
| `Delete` | Delete selected object |
| `Enter` | Edit table name (when table selected) |
| `Space` | Fit canvas to window |
| `Escape` | Deselect all objects |

## 🔗 ERD Design Features

### Interactive Relationship Drawing
- **Point-and-Click Drawing**: Click source table → click target table to create relationships
- **Visual Feedback**: Live preview while drawing relationships with mouse tracking
- **Crow's Foot Notation**: Professional ERD symbols (one-to-one, one-to-many, many-to-many)
- **Smart Routing**: Automatic relationship line routing around tables

### Foreign Key Auto-Detection
- **Convention-Based Detection**: Automatically detects foreign key relationships from column names
- **Smart Suggestions**: Identifies `user_id` → `users.id` patterns and similar conventions
- **Bulk Relationship Creation**: Apply all detected relationships with one click
- **Visual Indicators**: Clearly shows detected vs. manually created relationships

### Relationship Management
- **Relationship Types**: One-to-One, One-to-Many, Many-to-Many with proper visual notation
- **Edit Relationships**: Modify relationship types and properties after creation
- **Delete Relationships**: Remove relationships individually or in bulk
- **Relationship List**: Sidebar panel showing all relationships with details

### Professional ERD Tools
- **Drawing Mode Toggle**: Switch between normal editing and relationship drawing modes  
- **Relationship Toolbox**: Dedicated tools for ERD-specific operations
- **Visual Relationship Lines**: Clean, professional lines with crow's foot endings
- **Auto-Layout**: Smart positioning to avoid overlapping relationship lines

## 🧰 Toolbox Features

### Quick Add Tools
- **One-Click Tables**: Add tables with default Laravel structure
- **Custom Tables**: Quick input for table names
- **Template Library**: Pre-built tables (Users, Posts, Categories)

### Alignment Tools
- **Align Objects**: Left, Right, Top, Bottom, Center
- **Distribute**: Even spacing horizontally or vertically  
- **Layer Control**: Send to back/front, grouping

### Canvas Tools
- **Smart Grid**: Adjustable dot grid (10-50px spacing)
- **Snap to Grid**: Automatic alignment assistance
- **Grid Toggle**: Show/hide grid overlay
- **Zoom Controls**: Precise zoom with percentage display

### Technology Stack

**Frontend (Zero Build Process):**
- **Alpine.js 3.13+** - Reactive JavaScript framework via CDN
- **Fabric.js 5.3+** - Canvas manipulation library via CDN
- **jsPDF 2.5+** - PDF export functionality via CDN
- **Pure CSS** - No preprocessing required

**Backend:**
- **Laravel 10|11|12** - Full framework compatibility
- **PHP 8.2+** - Modern PHP features

**Hosting Compatibility:**
- **Shared Hosting** - cPanel, Plesk, DirectAdmin
- **VPS/Dedicated** - Full server control
- **Cloud Platforms** - AWS, DigitalOcean, Linode
- **FTP Upload** - Traditional file upload supported

## Usage

After installation, visit `/schema-designer` in your Laravel application (local environment only by default).

### Creating ERD Relationships

1. **Auto-Detection Method** (Recommended):
   - Click "Detect Foreign Keys" in the ERD Tools panel
   - Review detected relationships in the sidebar
   - Click "Apply All" to create all detected relationships at once

2. **Manual Drawing Method**:
   - Click "Toggle Relationship Mode" to enter drawing mode
   - Click on the source table (where the foreign key column is)
   - Click on the target table (the referenced table)
   - The relationship will be created automatically with proper notation

3. **Managing Relationships**:
   - View all relationships in the right sidebar panel
   - Edit relationship types (1:1, 1:M, M:M) using the dropdown
   - Delete individual relationships using the "Remove" button
   - Export your ERD diagrams with relationships included

### Configuration

Edit `config/schema-designer.php` to customize:

- Access permissions
- Storage location
- Export settings
- Security middleware

### Security

By default, the schema designer is only accessible in local environments. Configure additional security in the config file:

```php
'enabled' => env('SCHEMA_DESIGNER_ENABLED', app()->environment('local')),
'middleware' => ['web', 'auth', 'role:admin'],
```

## Export Formats

- **PNG** - High-quality raster image
- **SVG** - Vector graphics for scalability  
- **PDF** - Print-ready document format

## Requirements

- PHP 8.2+
- Laravel 10+, 11+, or 12+
- Node.js (for asset compilation)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.