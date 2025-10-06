# Installation & Setup Guide

## Prerequisites

- PHP 8.1 or higher
- Laravel 10 or higher
- Node.js 16+ (for frontend asset compilation)
- Composer

## Installation Steps

### 1. Install via Composer

```bash
composer require brybry/laravel-visual-schema
```

### 2. Publish Configuration

```bash
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="config"
```

### 3. Publish Assets (Optional)

If you want to customize the frontend:

```bash
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="assets"
```

### 4. Run Migration (For Database Storage)

If you want to use database storage instead of file storage:

```bash
php artisan migrate
```

### 5. Configure Environment

Add to your `.env` file:

```env
# Enable the schema designer (default: local environments only)
SCHEMA_DESIGNER_ENABLED=true

# Storage driver: 'file' or 'database'
SCHEMA_DESIGNER_STORAGE=file
```

### 6. Build Frontend Assets (If Published)

If you published the assets and want to customize them:

```bash
cd vendor/brybry/laravel-visual-schema
npm install
npm run build
```

## Configuration

Edit `config/schema-designer.php` to customize:

```php
<?php

return [
    // Enable/disable the designer
    'enabled' => env('SCHEMA_DESIGNER_ENABLED', app()->environment('local')),
    
    // Route configuration
    'route_prefix' => 'schema-designer',
    'middleware' => ['web'], // Add 'auth' for authentication
    
    // Storage configuration
    'storage' => [
        'driver' => env('SCHEMA_DESIGNER_STORAGE', 'file'),
        'path' => 'schema-designs',
        'table' => 'schema_designs',
    ],
    
    // Security settings
    'security' => [
        'csrf_protection' => true,
        'rate_limiting' => true,
        'max_requests_per_minute' => 60,
    ],
    
    // Canvas settings
    'canvas' => [
        'grid_size' => 20,
        'default_zoom' => 1.0,
        'min_zoom' => 0.1,
        'max_zoom' => 3.0,
        'snap_to_grid' => true,
    ],
];
```

## Security Configuration

### Production Setup

For production environments, ensure proper security:

```php
// In config/schema-designer.php
'enabled' => env('SCHEMA_DESIGNER_ENABLED', false),
'middleware' => ['web', 'auth', 'role:admin'],
```

### Environment-based Access

```php
'enabled' => app()->environment(['local', 'staging']),
```

### Custom Middleware

Create custom middleware for access control:

```bash
php artisan make:middleware SchemaDesignerAccess
```

```php
public function handle($request, Closure $next)
{
    if (!auth()->check() || !auth()->user()->can('access-schema-designer')) {
        abort(403, 'Access denied');
    }
    
    return $next($request);
}
```

Then add to config:

```php
'middleware' => ['web', 'auth', SchemaDesignerAccess::class],
```

## Usage

### Basic Usage

1. Visit `/schema-designer` in your Laravel application
2. Click "New Schema" to create a new design
3. Use "Add Table" to add database tables
4. Double-click table names to edit them
5. Double-click column names to edit column properties
6. Use the export dropdown to save as PNG, SVG, or PDF

### Keyboard Shortcuts

- `Ctrl+S` - Save current schema
- `Ctrl+Z` - Undo last action
- `Ctrl+Shift+Z` - Redo last action
- `Ctrl+N` - Create new schema
- `Delete` - Delete selected table

### API Usage

The package provides a REST API for programmatic access:

```javascript
// Get all schemas
fetch('/schema-designer/api/schemas')

// Get specific schema
fetch('/schema-designer/api/schemas/{id}')

// Create new schema
fetch('/schema-designer/api/schemas', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrf_token
    },
    body: JSON.stringify({
        name: 'My Schema',
        data: {
            tables: {},
            relationships: {},
            layout: {}
        }
    })
})

// Export schema
fetch('/schema-designer/api/schemas/{id}/export', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrf_token
    },
    body: JSON.stringify({
        format: 'png', // or 'svg', 'pdf'
        options: {}
    })
})
```

## Troubleshooting

### Common Issues

1. **404 Error when accessing /schema-designer**
   - Check that `SCHEMA_DESIGNER_ENABLED=true` in your .env
   - Ensure you're in a local environment or have configured access properly

2. **Assets not loading**
   - Clear your application cache: `php artisan cache:clear`
   - Check that the CDN links are accessible

3. **Cannot save schemas**
   - Check file permissions for `storage/app/schema-designs/`
   - Ensure CSRF token is being sent with requests

4. **Export not working**
   - Check browser console for JavaScript errors
   - Ensure html2canvas library is loaded

### Debug Mode

Enable debug logging in `config/schema-designer.php`:

```php
'debug' => env('SCHEMA_DESIGNER_DEBUG', false),
```

Then check `storage/logs/laravel.log` for detailed error messages.

## Customization

### Custom Themes

Override the CSS by publishing assets and modifying:
- `resources/css/vendor/schema-designer/schema-designer.css`

### Custom Column Types

Extend the column types by modifying the React component:
- `resources/js/vendor/schema-designer/components/Table.jsx`

### Custom Export Formats

Extend the export service:

```php
class CustomExportService extends SchemaExportService
{
    public function exportToCustomFormat($schema, $options)
    {
        // Your custom export logic
    }
}
```

Then bind it in a service provider:

```php
$this->app->bind(SchemaExportService::class, CustomExportService::class);
```

## Performance Optimization

### Large Schemas

For schemas with many tables:

1. Enable database storage for better performance:
   ```env
   SCHEMA_DESIGNER_STORAGE=database
   ```

2. Implement caching:
   ```php
   'cache' => [
       'enabled' => true,
       'ttl' => 3600, // 1 hour
   ],
   ```

3. Use pagination for schema lists in the sidebar

### Production Deployment

1. Build and minify assets:
   ```bash
   npm run build
   ```

2. Enable gzip compression in your web server

3. Use a CDN for static assets

## Support

For issues and feature requests, please visit:
- GitHub: https://github.com/rondinabrybry/laravel-visual-schema
- Documentation: [Link to full documentation]