# Migration Guide: React to Alpine.js (Shared Hosting Compatible)

This guide covers migrating from the previous React-based version to the new Alpine.js version that's compatible with shared hosting environments.

## What Changed?

### Frontend Technology Stack

**Before (v1.0.x):**
- ❌ React 18 + JSX compilation required
- ❌ Node.js 18+ required
- ❌ npm/yarn package management
- ❌ Vite/Webpack build process
- ❌ TailwindCSS compilation

**After (v1.1.x):**
- ✅ Alpine.js 3.13 (CDN)
- ✅ Fabric.js 5.3 (CDN)
- ✅ Pure CSS (no compilation)
- ✅ No Node.js required
- ✅ No build process
- ✅ Shared hosting compatible

### File Structure Changes

**Removed Files:**
```
resources/js/          # React components
resources/css/         # Tailwind source
vite.config.js         # Build configuration
package.json           # npm dependencies (now optional)
public/build/          # Compiled assets
```

**New Files:**
```
resources/assets/css/schema-designer.css    # Pure CSS styles
resources/assets/js/schema-designer.js      # Alpine component
resources/views/schema-designer.blade.php   # Main view
resources/views/layouts/app.blade.php       # Layout
SHARED_HOSTING.md                           # Installation guide
```

## Migration Steps

### 1. Backup Your Current Installation

Before migrating, backup your current schemas:

```php
// Export existing schemas
php artisan tinker
>>> $schemas = \BryBry\LaravelVisualSchema\Models\Schema::all();
>>> file_put_contents('schemas_backup.json', $schemas->toJson());
```

### 2. Update Package Version

```bash
composer update brybry/laravel-visual-schema
```

### 3. Remove Old Assets

```bash
# Remove old published assets
rm -rf public/vendor/laravel-visual-schema
rm -rf resources/views/vendor/laravel-visual-schema

# Clear compiled views
php artisan view:clear
php artisan cache:clear
```

### 4. Republish New Assets

```bash
# Publish new static assets
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="assets" --force

# Publish updated views
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="views" --force

# Update configuration
php artisan vendor:publish --provider="BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider" --tag="config" --force
```

### 5. Update Configuration

Edit `config/laravel-visual-schema.php`:

```php
<?php

return [
    // No longer need Node.js configuration
    'enabled' => env('LARAVEL_VISUAL_SCHEMA_ENABLED', true),
    
    // Works on all hosting types now
    'hosting_compatibility' => [
        'shared_hosting' => true,
        'cdn_fallback' => true,
    ],
    
    // CDN configuration
    'cdn' => [
        'alpine' => 'https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.3/cdn.min.js',
        'fabric' => 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js',
        'jspdf' => 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    ],
];
```

### 6. Update Layout File (If Customized)

If you customized the layout, update it to remove React dependencies:

```blade
<!-- OLD: Remove these -->
@vite(['resources/css/app.css', 'resources/js/app.js'])
<div id="react-root"></div>

<!-- NEW: Use these instead -->
@stack('styles')
@yield('content')
@stack('scripts')
```

### 7. Custom Component Migration

If you had custom React components, here's how to migrate them to Alpine.js:

**React Component (OLD):**
```jsx
function CustomTableComponent({ table, onUpdate }) {
    const [name, setName] = useState(table.name);
    
    return (
        <div className="table-component">
            <input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={() => onUpdate(name)}>
                Save
            </button>
        </div>
    );
}
```

**Alpine.js Component (NEW):**
```html
<div x-data="{ name: '{{ $table->name }}' }" class="table-component">
    <input x-model="name" class="form-input">
    <button @click="updateTable(name)" class="btn btn-primary">
        Save
    </button>
</div>
```

### 8. Testing the Migration

After migration, verify these features work:

- ✅ Canvas loads without errors
- ✅ Tables can be created and moved
- ✅ Relationships can be drawn
- ✅ Export functions (PNG, SVG, PDF) work
- ✅ Save/load functionality works
- ✅ Theme switching works
- ✅ Keyboard shortcuts work
- ✅ Undo/redo works

### 9. Performance Comparison

**Before (React):**
- Bundle size: ~2MB (React + dependencies)
- Build time: 30-60 seconds
- Node.js memory: 500MB+
- Hosting requirements: Node.js support

**After (Alpine.js):**
- Bundle size: ~200KB (Alpine + Fabric)
- Build time: 0 seconds (no build)
- Memory usage: Browser only
- Hosting requirements: Basic PHP hosting

## Troubleshooting Migration Issues

### Issue: "Alpine is not defined"

**Solution:** Check that Alpine.js is loading from CDN:
```html
<!-- Ensure this is in your view -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.3/cdn.min.js" defer></script>
```

### Issue: Canvas not rendering

**Solution:** Verify Fabric.js is loaded:
```html
<!-- Ensure this loads before your custom scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
```

### Issue: Styles not applying

**Solution:** Check CSS file is published and linked:
```bash
# Verify file exists
ls -la public/vendor/laravel-visual-schema/css/

# Republish if missing
php artisan vendor:publish --tag="assets" --force
```

### Issue: Export functions not working

**Solution:** Verify jsPDF is loaded:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

### Issue: Shared hosting compatibility

**Solution:** Ensure no build process is referenced:
```bash
# Remove any build references
rm -f vite.config.js webpack.mix.js
rm -rf node_modules
```

## Custom Theme Migration

If you had custom React themes, migrate them to CSS:

**React Styled Components (OLD):**
```jsx
const CustomTable = styled.div`
  background: ${props => props.theme.primary};
  border: 2px solid ${props => props.theme.border};
`;
```

**CSS Custom Properties (NEW):**
```css
.schema-designer {
  --primary-color: #3b82f6;
  --border-color: #d1d5db;
}

.custom-table {
  background: var(--primary-color);
  border: 2px solid var(--border-color);
}

.schema-designer.dark {
  --primary-color: #60a5fa;
  --border-color: #4b5563;
}
```

## Data Migration

Existing schema data is compatible. No database migration needed:

```php
// Your existing schemas will continue to work
$schemas = \BryBry\LaravelVisualSchema\Models\Schema::all();
// ✅ All data preserved
```

## Rollback Plan

If you need to rollback:

1. **Restore from backup**:
   ```bash
   composer require brybry/laravel-visual-schema:^1.0
   ```

2. **Republish old assets**:
   ```bash
   php artisan vendor:publish --tag="assets" --force
   npm install && npm run build
   ```

3. **Restore schemas from backup**:
   ```php
   // Import from backup if needed
   $backupData = json_decode(file_get_contents('schemas_backup.json'));
   ```

## Benefits After Migration

- ✅ **Hosting Flexibility**: Works on any PHP hosting
- ✅ **Faster Loading**: Smaller bundle size
- ✅ **No Build Process**: Deploy with simple FTP
- ✅ **Lower Costs**: No need for Node.js hosting
- ✅ **Easier Deployment**: No complex CI/CD required
- ✅ **Better Performance**: Less JavaScript overhead

## Support

For migration assistance:
1. Check the [SHARED_HOSTING.md](SHARED_HOSTING.md) guide
2. Review configuration in `config/laravel-visual-schema.php`
3. Test on a staging environment first
4. Create an issue on GitHub if you encounter problems

The migration maintains all existing functionality while making the package compatible with shared hosting environments.