<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Schema Designer Enabled
    |--------------------------------------------------------------------------
    |
    | This option controls whether the schema designer is enabled. By default,
    | it's only enabled in local environments for security reasons.
    |
    */
    'enabled' => env('SCHEMA_DESIGNER_ENABLED', app()->environment('local')),

    /*
    |--------------------------------------------------------------------------
    | Route Prefix
    |--------------------------------------------------------------------------
    |
    | The route prefix for accessing the schema designer interface.
    |
    */
    'route_prefix' => 'schema-designer',

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    |
    | The middleware that should be applied to the schema designer routes.
    | You can add authentication, authorization, etc.
    |
    */
    'middleware' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Storage Configuration
    |--------------------------------------------------------------------------
    |
    | Configure where schema designs should be stored.
    |
    */
    'storage' => [
        'driver' => env('SCHEMA_DESIGNER_STORAGE', 'file'), // 'file' or 'database'
        'path' => 'schema-designs', // For file storage
        'table' => 'schema_designs', // For database storage
    ],

    /*
    |--------------------------------------------------------------------------
    | Export Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for schema export functionality.
    |
    */
    'export' => [
        'formats' => ['png', 'svg', 'pdf'],
        'max_width' => 4000,
        'max_height' => 4000,
        'quality' => 0.92,
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | Additional security settings for the schema designer.
    |
    */
    'security' => [
        'csrf_protection' => true,
        'rate_limiting' => true,
        'max_requests_per_minute' => 60,
        'signed_urls' => false, // Enable signed URLs for sharing designs
        'signed_url_expiration' => 24, // Hours
    ],

    /*
    |--------------------------------------------------------------------------
    | Canvas Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the visual canvas.
    |
    */
    'canvas' => [
        'grid_size' => 20,
        'default_zoom' => 1.0,
        'min_zoom' => 0.1,
        'max_zoom' => 3.0,
        'snap_to_grid' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Theme Configuration
    |--------------------------------------------------------------------------
    |
    | Theme and appearance settings.
    |
    */
    'theme' => [
        'default_theme' => 'light', // 'light' or 'dark'
        'allow_theme_switching' => true,
    ],
];