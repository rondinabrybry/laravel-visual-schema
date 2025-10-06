# Shared Hosting Installation Guide

This guide will walk you through installing Laravel Visual Schema Designer on shared hosting environments that don't support Node.js or build processes.

## Prerequisites

- ✅ **PHP 8.2+** on your shared hosting
- ✅ **Laravel 10.x, 11.x, or 12.x** application
- ✅ **Composer** access (local or hosting provider's)
- ✅ **FTP/SFTP** access to upload files
- ❌ **No Node.js required**
- ❌ **No npm/yarn required**
- ❌ **No build process required**

## Step-by-Step Installation

### 1. Install via Composer

On your local machine or through your hosting provider's Composer interface:

```bash
composer require brybry/laravel-visual-schema
```

### 2. Publish Package Assets

Run these commands to publish the package files:

```bash
# Publish static CSS/JS files (no compilation needed)
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="assets"

# Publish configuration file
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="config"

# Publish views (optional, for customization)
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="views"
```

### 3. Configure the Package

Edit `config/laravel-visual-schema.php`:

```php
<?php

return [
    // Enable/disable the package
    'enabled' => env('LARAVEL_VISUAL_SCHEMA_ENABLED', true),
    
    // Route configuration
    'route_prefix' => 'schema-designer',
    'middleware' => ['web', 'auth'], // Add authentication if needed
    
    // Storage configuration for shared hosting
    'storage' => [
        'driver' => 'file', // Use file storage for shared hosting
        'path' => storage_path('app/schemas'),
    ],
    
    // Security settings
    'security' => [
        'enabled_environments' => ['local', 'production'], // Enable for production
        'signed_urls' => true,
        'rate_limiting' => true,
    ],
];
```

### 4. Upload Files to Shared Hosting

Upload your entire Laravel application to your shared hosting using FTP/SFTP. The package files will be automatically available:

**Published Assets Location:**
- `public/vendor/laravel-visual-schema/css/schema-designer.css`
- `public/vendor/laravel-visual-schema/js/schema-designer.js`

**CDN Dependencies (Automatically loaded):**
- Alpine.js 3.13.3
- Fabric.js 5.3.0
- jsPDF 2.5.1
- html2canvas 1.4.1

### 5. Set Environment Variables

In your `.env` file on the server:

```env
# Enable the schema designer
LARAVEL_VISUAL_SCHEMA_ENABLED=true

# Set your app URL correctly
APP_URL=https://yourdomain.com
```

### 6. Access the Designer

Visit your Laravel application at:
```
https://yourdomain.com/schema-designer
```

## Shared Hosting Specific Configuration

### cPanel Configuration

1. **File Manager**: Upload files through cPanel File Manager
2. **Database**: Ensure your Laravel database is configured correctly
3. **PHP Version**: Set PHP 8.2+ in cPanel
4. **Permissions**: Ensure `storage/app/schemas` is writable (755)

### Plesk Configuration

1. **File Manager**: Use Plesk File Manager for uploads
2. **PHP Settings**: Configure PHP 8.2+ in domain settings
3. **Database**: Configure database connection in `.env`

### File Permissions

Ensure these directories are writable:
```bash
chmod 755 storage/app/schemas
chmod 755 public/vendor/laravel-visual-schema
```

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check PHP version (must be 8.2+)
   - Verify `.env` configuration
   - Check Laravel logs in `storage/logs`

2. **Assets Not Loading**
   - Verify `public/vendor/laravel-visual-schema` exists
   - Check file permissions
   - Ensure `APP_URL` is correct in `.env`

3. **CDN Libraries Not Loading**
   - Check if your hosting blocks external CDN requests
   - Verify internet connectivity from server
   - Check browser console for errors

4. **Storage Issues**
   - Ensure `storage/app/schemas` directory exists and is writable
   - Check file permissions: `chmod 755 storage/app/schemas`

### Alternative CDN Configuration

If your hosting blocks CDN requests, you can download and host the libraries locally:

1. Download the JavaScript libraries:
   - [Alpine.js](https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.3/cdn.min.js)
   - [Fabric.js](https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js)
   - [jsPDF](https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js)

2. Place them in `public/vendor/laravel-visual-schema/js/`

3. Update the view to use local files instead of CDN

## Performance Optimization

### For Shared Hosting

1. **Enable Gzip Compression** (if supported)
2. **Browser Caching** for static assets
3. **File Storage** instead of database storage for better performance

### Sample .htaccess for Asset Caching

Add to `public/.htaccess`:

```apache
# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## Support

For shared hosting specific issues:

1. Check your hosting provider's PHP version and extensions
2. Verify Laravel requirements are met
3. Contact your hosting provider for server configuration issues
4. Review the package documentation for configuration options

## Migration from Previous Versions

If upgrading from a React-based version:

1. Remove old assets: `rm -rf public/vendor/laravel-visual-schema`
2. Republish assets: `php artisan vendor:publish --tag="assets" --force`
3. Clear any cached views: `php artisan view:clear`
4. Update any custom views to use the new Alpine.js structure

## Success Verification

After installation, you should be able to:

- ✅ Access `/schema-designer` in your browser
- ✅ Create tables by dragging and dropping
- ✅ Draw relationships between tables
- ✅ Export diagrams as PNG, SVG, or PDF
- ✅ Save and load schema designs
- ✅ Use keyboard shortcuts (Ctrl+Z, Ctrl+S, etc.)
- ✅ Toggle between light and dark themes