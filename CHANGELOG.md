# Changelog

All notable changes to `laravel-visual-schema` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-10-06

### Added
- 🚀 **Laravel 12 Support**: Full compatibility with Laravel 12.x
- ⚡ **PHP 8.4 Support**: Added support for PHP 8.4
- 🔧 **Enhanced Service Registration**: Improved service container bindings for better performance

### Changed
- 📦 **Minimum Requirements**: Updated minimum PHP version to 8.2
- 🧪 **Testing Matrix**: Updated CI/CD to test against Laravel 10, 11, and 12
- 📚 **Documentation**: Updated installation and requirements documentation

### Improved
- 🏗️ **Service Provider**: Enhanced service registration with singleton bindings
- 🔧 **Dependencies**: Updated Orchestra Testbench and PHPUnit versions for Laravel 12 compatibility

## [1.0.0] - 2024-10-06

### Added

#### Core Features
- 🎨 **Visual Database Designer**: Drag-and-drop interface for creating database schemas
- 📊 **Interactive Canvas**: Dotted grid background with zoom and pan support
- 📋 **Table Management**: Create, edit, and delete database tables with full column support
- 🔗 **Relationship Mapping**: Visual representation of table relationships (one-to-one, one-to-many, many-to-many)
- 💾 **Persistent Storage**: Save and load schema designs with exact layout preservation

#### User Interface
- 🖱️ **Intuitive Controls**: Click, drag, and double-click interactions
- ⌨️ **Keyboard Shortcuts**: Undo/redo, save, new schema, and delete actions
- 🌙 **Dark/Light Mode**: Theme switching with system preference detection
- 📱 **Responsive Design**: Mobile and tablet friendly interface
- 🎛️ **Control Panels**: Toolbar, zoom controls, and sidebar navigation

#### Data Management
- 📊 **Column Types**: Support for all common MySQL data types (varchar, int, text, datetime, etc.)
- 🔑 **Constraints**: Primary keys, unique constraints, nullable fields, and default values
- 📐 **Data Validation**: Comprehensive schema validation with error reporting
- 🔄 **Import/Export**: JSON, SQL, and XML import capabilities

#### Export Capabilities
- 🖼️ **PNG Export**: High-quality raster images with configurable resolution
- 🎨 **SVG Export**: Scalable vector graphics for infinite zoom
- 📄 **PDF Export**: Print-ready documents with proper formatting
- ⚙️ **Export Options**: Customizable quality, size, and format settings

#### Security & Access Control
- 🔒 **Environment Restrictions**: Local/staging only access by default
- 🛡️ **Middleware Integration**: Compatible with Laravel authentication systems
- 🔐 **CSRF Protection**: Built-in security against cross-site attacks
- 🚦 **Rate Limiting**: Configurable request throttling
- 🔗 **Signed URLs**: Secure sharing capabilities (optional)

#### Storage Options
- 📁 **File Storage**: JSON-based file storage in Laravel storage directory
- 🗄️ **Database Storage**: Optional database storage with migration included
- 💾 **Auto-save**: Automatic saving with configurable intervals
- 📤 **Backup & Restore**: Import/export entire schema collections

#### Developer Experience
- 🧪 **Comprehensive Testing**: Unit and feature tests included
- 📚 **Documentation**: Extensive documentation with examples
- 🔧 **Customizable**: Extensible services and configurable settings
- 🎯 **TypeScript Ready**: Full type definitions for frontend components
- 🔌 **Plugin Architecture**: Extensible design for custom functionality

#### Technical Implementation
- ⚛️ **React Frontend**: Modern React with hooks and functional components
- 🎨 **TailwindCSS**: Utility-first CSS framework for consistent styling
- 🏗️ **Laravel Integration**: Seamless integration with Laravel applications
- 📦 **Composer Package**: Easy installation via Composer
- 🛠️ **Build Tools**: Vite for fast development and optimized builds

#### Configuration
- ⚙️ **Flexible Config**: Comprehensive configuration file with environment variables
- 🔧 **Middleware Options**: Configurable middleware stack for access control
- 📊 **Canvas Settings**: Customizable grid size, zoom levels, and snap-to-grid
- 🎨 **Theme Options**: Default theme selection and customization options
- 🚀 **Performance Settings**: Cache configuration and optimization options

#### API
- 🌐 **RESTful API**: Complete REST API for programmatic access
- 📊 **CRUD Operations**: Full create, read, update, delete for schemas
- 🔄 **Import/Export API**: Programmatic import and export capabilities
- 📝 **Validation API**: Schema validation endpoints
- 🔍 **Search & Filter**: API endpoints for searching and filtering schemas

#### Examples & Documentation
- 📖 **Installation Guide**: Step-by-step installation instructions
- 🎯 **Usage Examples**: Real-world examples including e-commerce schema
- 🛠️ **Customization Guide**: How to extend and customize the package
- 🔒 **Security Guide**: Best practices for production deployment
- 🧪 **Testing Guide**: How to test and validate your schemas

#### Quality Assurance
- ✅ **Automated Testing**: GitHub Actions CI/CD pipeline
- 🔍 **Code Quality**: PHPStan and ESLint integration
- 📏 **Code Coverage**: Comprehensive test coverage
- 🐛 **Error Handling**: Robust error handling and user feedback
- 🔧 **Debugging Tools**: Development tools and debugging options

#### Browser Support
- ✅ **Chrome**: Full support for Chrome 80+
- ✅ **Firefox**: Full support for Firefox 75+
- ✅ **Safari**: Full support for Safari 13+
- ✅ **Edge**: Full support for Edge 80+
- 📱 **Mobile**: Touch-friendly interface for mobile browsers

#### Accessibility
- ♿ **WCAG Compliance**: Following web accessibility guidelines
- ⌨️ **Keyboard Navigation**: Full keyboard accessibility
- 🔍 **Screen Reader Support**: ARIA labels and semantic HTML
- 🎨 **High Contrast**: Support for high contrast mode
- 📝 **Alt Text**: Proper alternative text for images and icons

#### Performance
- ⚡ **Fast Loading**: Optimized asset loading and caching
- 🚀 **Smooth Interactions**: 60fps animations and interactions
- 💾 **Memory Efficient**: Optimized memory usage for large schemas
- 📦 **Code Splitting**: Lazy loading for optimal performance
- 🗜️ **Asset Optimization**: Minified and compressed assets

#### Internationalization
- 🌍 **i18n Ready**: Prepared for multiple language support
- 🔤 **UTF-8 Support**: Full Unicode support for international characters
- 📅 **Date Formatting**: Locale-aware date and time formatting
- 🔢 **Number Formatting**: Regional number formatting support

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- 🔒 **Default Security**: Secure by default with local environment restriction
- 🛡️ **Input Validation**: Comprehensive input sanitization and validation
- 🔐 **CSRF Protection**: Built-in CSRF token validation
- 🚦 **Rate Limiting**: Protection against abuse and DoS attacks

---

## Contributing

When contributing to this project, please:

1. **Follow the changelog format** outlined above
2. **Add entries to [Unreleased]** section first
3. **Use emoji prefixes** for visual categorization
4. **Include breaking changes** in a separate section if applicable
5. **Reference issue numbers** when applicable

### Changelog Categories

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Emoji Guide

- 🎨 Visual/UI improvements
- 📦 Package/dependency changes
- 🔒 Security improvements
- 🐛 Bug fixes
- ⚡ Performance improvements
- 🚀 New features
- 📚 Documentation
- 🧪 Testing
- 🔧 Configuration/tooling
- 🌍 Internationalization
- ♿ Accessibility
- 📱 Mobile/responsive
- 🔗 Integrations
- 💾 Data/storage
- 🎯 Developer experience

---

For detailed upgrade instructions between versions, see [UPGRADING.md](UPGRADING.md).