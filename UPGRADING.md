# Laravel 12 Upgrade Guide

This document outlines the steps needed to upgrade your Laravel Visual Schema Designer installation to work with Laravel 12.

## Requirements

Before upgrading, ensure your system meets the new requirements:

- **PHP**: 8.2 or higher (previously 8.1+)
- **Laravel**: 12.x (alongside continued support for 10.x and 11.x)
- **Node.js**: 18+ (previously 16+)
- **NPM**: 8+ or equivalent

## Upgrade Steps

### 1. Update Composer Dependencies

Update your `composer.json` to use the new version:

```bash
composer require brybry/laravel-visual-schema:^1.1
```

Or manually update your `composer.json`:

```json
{
    "require": {
        "brybry/laravel-visual-schema": "^1.1"
    }
}
```

### 2. Clear Application Cache

After updating, clear your application cache:

```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
```

### 3. Update Configuration (Optional)

If you've published the configuration file, you may want to compare your config with the new defaults:

```bash
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="config" --force
```

### 4. Update Assets (If Customized)

If you've published and customized the frontend assets, you may need to update them:

```bash
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="assets" --force
```

Then rebuild the assets:

```bash
npm install
npm run build
```

## New Features in Laravel 12 Support

### Enhanced Performance

- **Singleton Service Registration**: Services are now registered as singletons for better memory usage
- **Optimized Asset Loading**: Improved compatibility with Laravel 12's Vite integration
- **Better Caching**: Enhanced caching strategies for large schemas

### Improved Developer Experience

- **Version Compatibility Checking**: Automatic validation of Laravel version compatibility
- **Enhanced Error Messages**: Better error reporting and debugging information
- **Modern PHP Features**: Support for PHP 8.2+ features including readonly properties

### Updated Dependencies

- **React 18.3+**: Latest React version with improved performance
- **Vite 5.4+**: Modern build tooling with faster builds
- **TailwindCSS 3.4+**: Latest styling framework with new features

## Breaking Changes

### Minimum Requirements

- **PHP 8.2**: The minimum PHP version has been increased from 8.1 to 8.2
- **Node.js 18**: The minimum Node.js version has been increased from 16 to 18

### Service Registration

Services are now registered as singletons by default. If you were manually binding services in your application, you may need to update your service provider:

```php
// Before (in your AppServiceProvider)
$this->app->bind(SchemaStorageService::class, function ($app) {
    return new CustomSchemaStorageService();
});

// After
$this->app->singleton(SchemaStorageService::class, function ($app) {
    return new CustomSchemaStorageService();
});
```

## Testing

After upgrading, run your tests to ensure everything works correctly:

```bash
composer test
```

If you have custom tests that interact with the package, make sure they still pass.

## Troubleshooting

### Common Issues

#### 1. PHP Version Error

If you see an error about PHP version compatibility:

```
Laravel version X.X.X is not supported. Supported versions: 10.*, 11.*, 12.*
```

Make sure you're running PHP 8.2+ and Laravel 10+.

#### 2. Asset Build Failures

If asset building fails after upgrade:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 3. Configuration Issues

If you encounter configuration-related errors:

```bash
php artisan config:clear
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="config" --force
```

### Debug Mode

Enable debug mode to get more detailed error information:

```php
// In config/schema-designer.php
'debug' => env('SCHEMA_DESIGNER_DEBUG', true),
```

## Getting Help

If you encounter issues during the upgrade:

1. Check the [CHANGELOG.md](CHANGELOG.md) for all changes
2. Review the [GitHub Issues](https://github.com/rondinabrybry/laravel-visual-schema/issues)
3. Create a new issue with detailed information about your setup

## Rollback

If you need to rollback to the previous version:

```bash
composer require brybry/laravel-visual-schema:^1.0
```

Note that this will revert to the version that doesn't support Laravel 12.

## Next Steps

After successfully upgrading:

1. Test all functionality in a development environment
2. Update your deployment scripts to use the new requirements
3. Consider leveraging new Laravel 12 features in your application
4. Update your documentation to reflect the new requirements

## Benefits of Laravel 12 Support

- **Future-proof**: Stay current with the latest Laravel features
- **Performance**: Better performance through modern PHP features
- **Security**: Latest security improvements from Laravel 12
- **Developer Experience**: Enhanced tooling and debugging capabilities