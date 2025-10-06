<?php

namespace BryBry\LaravelVisualSchema;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use BryBry\LaravelVisualSchema\Services\SchemaStorageService;
use BryBry\LaravelVisualSchema\Services\SchemaExportService;
use BryBry\LaravelVisualSchema\Services\SchemaValidationService;
use BryBry\LaravelVisualSchema\Services\SchemaImportService;
use BryBry\LaravelVisualSchema\Support\LaravelVersionChecker;

class LaravelVisualSchemaServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->mergeConfigFrom(__DIR__.'/../config/schema-designer.php', 'schema-designer');
        
        // Check Laravel version compatibility
        LaravelVersionChecker::checkCompatibility();
        
        // Register services
        $this->app->singleton(SchemaStorageService::class);
        $this->app->singleton(SchemaExportService::class);
        $this->app->singleton(SchemaValidationService::class);
        $this->app->singleton(SchemaImportService::class);
    }

    public function boot()
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'schema-designer');
        
        $this->publishes([
            __DIR__.'/../config/schema-designer.php' => config_path('schema-designer.php'),
        ], 'config');

        // Publish static assets (CDN-compatible, no build process required)
        $this->publishes([
            __DIR__ . '/../resources/assets' => public_path('vendor/laravel-visual-schema'),
        ], 'assets');

        $this->publishes([
            __DIR__ . '/../resources/views' => resource_path('views/vendor/laravel-visual-schema'),
        ], 'views');

        $this->registerRoutes();
    }

    protected function registerRoutes()
    {
        if (config('schema-designer.enabled', false)) {
            Route::group([
                'prefix' => config('schema-designer.route_prefix', 'schema-designer'),
                'middleware' => config('schema-designer.middleware', ['web']),
                'namespace' => 'BryBry\LaravelVisualSchema\Http\Controllers',
            ], function () {
                $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
            });
        }
    }
}