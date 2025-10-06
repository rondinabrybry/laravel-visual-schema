# Laravel Visual Schema Designer

A comprehensive drag-and-drop visual database designer for Laravel applications. Create beautiful ERD diagrams with tables, relationships, and export them as PDF or images.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/brybry/laravel-visual-schema.svg?style=flat-square)](https://packagist.org/packages/brybry/laravel-visual-schema)
[![Total Downloads](https://img.shields.io/packagist/dt/brybry/laravel-visual-schema.svg?style=flat-square)](https://packagist.org/packages/brybry/laravel-visual-schema)

## Features

- 🎨 **Drag & Drop Interface** - Built with React and TailwindCSS
- 🔗 **Visual Relationships** - Draw connections between tables
- 💾 **Persistent Layouts** - Save and reload your designs exactly as arranged
- 📤 **Multiple Export Formats** - PNG, SVG, and PDF export
- 🔐 **Secure Access Control** - Environment-based restrictions and middleware protection
- 📱 **Responsive Design** - Works on desktop and tablet devices
- 🌙 **Dark/Light Mode** - Theme support
- ↩️ **Undo/Redo** - Full action history
- 🔍 **Zoom & Pan** - Navigate large schemas easily

## Installation

Install via Composer:

```bash
composer require brybry/laravel-visual-schema
```

Publish the configuration file:

```bash
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="config"
```

Publish the assets:

```bash
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="assets"
```

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

- PHP 8.1+
- Laravel 10+
- Node.js (for asset compilation)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.