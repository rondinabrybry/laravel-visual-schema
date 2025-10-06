# Laravel Visual Schema Designer

A comprehensive drag-and-drop visual database designer for Laravel applications. Create beautiful ERD diagrams with tables, relationships, and export them as PDF or images.

## 🎯 Overview

This package provides a complete visual database design solution that integrates seamlessly into your Laravel application. It offers:

- **Visual Interface**: Drag-and-drop tables on a dotted grid canvas
- **Real-time Editing**: Double-click to edit table and column properties
- **Relationship Management**: Draw visual connections between tables
- **Multiple Export Formats**: PNG, SVG, and PDF export capabilities
- **Persistent Storage**: Save layouts exactly as arranged
- **Security First**: Environment-based access control and middleware protection

## 🚀 Quick Start

### Installation

```bash
composer require brybry/laravel-visual-schema
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="config"
```

### Basic Usage

1. Visit `/schema-designer` in your Laravel application
2. Create a new schema or load an existing one
3. Add tables and define columns
4. Arrange tables on the canvas
5. Export your design as PNG, SVG, or PDF

### Configuration

```php
// config/schema-designer.php
return [
    'enabled' => env('SCHEMA_DESIGNER_ENABLED', app()->environment('local')),
    'middleware' => ['web'], // Add authentication as needed
    'storage' => [
        'driver' => 'file', // or 'database'
        'path' => 'schema-designs',
    ],
];
```

### Laravel 12 Compatibility

This package is fully compatible with Laravel 12 and takes advantage of:

- **Enhanced Service Container**: Optimized service registration with singleton bindings
- **Modern PHP Features**: Support for PHP 8.2+ features including readonly properties and enums
- **Improved Asset Handling**: Compatible with Laravel 12's updated Vite integration
- **Performance Improvements**: Leverages Laravel 12's performance enhancements

## 🎨 Features

### Canvas & Interface
- **Dotted Grid Background**: Perfect alignment with 20px grid
- **Drag & Drop**: Move tables around the canvas
- **Zoom & Pan**: Navigate large schemas easily
- **Responsive Design**: Works on desktop and tablet
- **Dark/Light Mode**: Theme switching support

### Table Management
- **Visual Table Editor**: Create, rename, and delete tables
- **Column Management**: Add, edit, and remove columns with full property support
- **Data Types**: Support for all common MySQL data types
- **Constraints**: Primary keys, unique constraints, nullable fields
- **Visual Indicators**: Icons for primary keys, unique fields, etc.

### Relationships
- **Visual Connections**: Draw lines between related tables
- **Relationship Types**: One-to-one, one-to-many, many-to-many
- **Auto-detection**: Smart relationship suggestions
- **Visual Styles**: Different colors and styles for different relationship types

### Export & Import
- **Multiple Formats**: PNG (raster), SVG (vector), PDF (document)
- **High Quality**: Configurable resolution and quality settings
- **Import Support**: JSON, SQL, and XML import formats
- **Batch Operations**: Export multiple schemas at once

### Security & Access Control
- **Environment Restrictions**: Local/staging only by default
- **Middleware Support**: Integrate with authentication systems
- **CSRF Protection**: Built-in security measures
- **Rate Limiting**: Prevent abuse
- **Signed URLs**: Secure sharing capabilities

## 📖 Detailed Documentation

### Canvas Operations

The canvas supports various mouse and keyboard interactions:

**Mouse Operations:**
- **Click & Drag**: Pan around the canvas
- **Scroll**: Zoom in/out (with Ctrl key)
- **Click Table**: Select table
- **Double-click**: Edit table/column names
- **Drag Table**: Move table position

**Keyboard Shortcuts:**
- `Ctrl+S`: Save current schema
- `Ctrl+Z`: Undo last action
- `Ctrl+Shift+Z`: Redo action
- `Ctrl+N`: Create new schema
- `Delete`: Delete selected table

### Table Structure

Tables are represented as JSON objects with the following structure:

```json
{
  "name": "users",
  "columns": {
    "id": {
      "name": "id",
      "type": "bigint",
      "primary": true,
      "nullable": false
    },
    "email": {
      "name": "email",
      "type": "varchar",
      "length": 255,
      "unique": true,
      "nullable": false
    }
  }
}
```

### Column Properties

Each column supports the following properties:

- `name`: Column name (required)
- `type`: Data type (required)
- `nullable`: Whether the column can be null
- `primary`: Primary key flag
- `unique`: Unique constraint flag
- `default`: Default value
- `length`: Length for varchar/char types
- `precision`: Precision for decimal types
- `unsigned`: Unsigned flag for numeric types

### Relationship Structure

Relationships are defined as:

```json
{
  "type": "one-to-many",
  "from_table": "users",
  "from_column": "id",
  "to_table": "posts",
  "to_column": "user_id"
}
```

### Storage Options

#### File Storage (Default)
Schemas are stored as JSON files in `storage/app/schema-designs/`.

```php
'storage' => [
    'driver' => 'file',
    'path' => 'schema-designs',
],
```

#### Database Storage
Store schemas in a database table for better performance with large numbers of schemas.

```php
'storage' => [
    'driver' => 'database',
    'table' => 'schema_designs',
],
```

Run the migration:
```bash
php artisan migrate
```

### API Endpoints

The package provides RESTful API endpoints:

- `GET /schema-designer/api/schemas` - List all schemas
- `POST /schema-designer/api/schemas` - Create new schema
- `GET /schema-designer/api/schemas/{id}` - Get specific schema
- `PUT /schema-designer/api/schemas/{id}` - Update schema
- `DELETE /schema-designer/api/schemas/{id}` - Delete schema
- `POST /schema-designer/api/schemas/{id}/export` - Export schema
- `POST /schema-designer/api/schemas/import` - Import schema

### Export Configuration

Configure export settings:

```php
'export' => [
    'formats' => ['png', 'svg', 'pdf'],
    'max_width' => 4000,
    'max_height' => 4000,
    'quality' => 0.92,
],
```

### Security Configuration

Secure your installation:

```php
'security' => [
    'csrf_protection' => true,
    'rate_limiting' => true,
    'max_requests_per_minute' => 60,
    'signed_urls' => false,
],
```

## 🔧 Customization

### Custom Middleware

Create custom access control:

```php
// In config/schema-designer.php
'middleware' => ['web', 'auth', CustomSchemaMiddleware::class],
```

### Custom Themes

Override default styles by publishing assets:

```bash
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="assets"
```

Then modify `resources/css/vendor/schema-designer/schema-designer.css`.

### Extending Services

Bind custom implementations:

```php
// In a service provider
$this->app->bind(SchemaExportService::class, CustomExportService::class);
```

## 🧪 Testing

Run the test suite:

```bash
composer test
```

The package includes comprehensive tests for:
- Schema validation
- Storage operations
- Export functionality
- API endpoints
- Security features

## 🚀 Production Deployment

### Security Checklist

1. **Disable in production** (or restrict access):
   ```php
   'enabled' => env('SCHEMA_DESIGNER_ENABLED', false),
   ```

2. **Add authentication**:
   ```php
   'middleware' => ['web', 'auth', 'role:admin'],
   ```

3. **Use HTTPS** for secure data transmission

4. **Enable rate limiting**:
   ```php
   'security' => ['rate_limiting' => true],
   ```

### Performance Optimization

1. **Use database storage** for large numbers of schemas
2. **Enable caching** for better performance
3. **Optimize assets** with build tools
4. **Use CDN** for static assets

## 📝 Examples

See the `examples/` directory for sample schemas:
- E-commerce database schema
- Blog system schema
- User management schema
- Multi-tenant application schema

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Install dependencies: `composer install && npm install`
3. Run tests: `composer test`
4. Build assets: `npm run build`

## 📄 License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## 🆘 Support

- **Documentation**: [Full documentation](https://github.com/rondinabrybry/laravel-visual-schema/wiki)
- **Issues**: [GitHub Issues](https://github.com/rondinabrybry/laravel-visual-schema/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rondinabrybry/laravel-visual-schema/discussions)

## 🎉 Credits

- Built with [React](https://reactjs.org/) and [TailwindCSS](https://tailwindcss.com/)
- Export functionality powered by [html2canvas](https://html2canvas.hertzen.com/) and [jsPDF](https://github.com/MrRio/jsPDF)
- Icons from [Heroicons](https://heroicons.com/)

---

**Laravel Visual Schema Designer** - Making database design visual and intuitive! 🎨✨