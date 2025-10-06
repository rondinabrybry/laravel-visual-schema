# Laravel Visual Schema Designer

A comprehensive drag-and-drop visual database designer for Laravel applications. Create beautiful ERD diagrams with tables, relationships, and export them as PDF or images.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/brybry/laravel-visual-schema.svg?style=flat-square)](https://packagist.org/packages/brybry/laravel-visual-schema)
[![Total Downloads](https://img.shields.io/packagist/dt/brybry/laravel-visual-schema.svg?style=flat-square)](https://packagist.org/packages/brybry/laravel-visual-schema)
[![Laravel 12 Ready](https://img.shields.io/badge/Laravel-12%20Ready-green.svg?style=flat-square)](https://laravel.com)
[![PHP 8.2+](https://img.shields.io/badge/PHP-8.2+-blue.svg?style=flat-square)](https://php.net)

## Features

- 🎨 **Drag & Drop Interface** - Built with Alpine.js and Fabric.js (No build process required)
- 🔗 **Visual Relationships** - Draw connections between tables
- 💾 **Persistent Layouts** - Save and reload your designs exactly as arranged
- 📤 **Multiple Export Formats** - PNG, SVG, and PDF export
- 🔐 **Secure Access Control** - Environment-based restrictions and middleware protection
- 📱 **Responsive Design** - Works on desktop and tablet devices
- 🌙 **Dark/Light Mode** - Theme support
- ↩️ **Undo/Redo** - Full action history
- 🔍 **Zoom & Pan** - Navigate large schemas easily
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