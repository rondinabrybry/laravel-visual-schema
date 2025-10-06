<?php

namespace BryBry\LaravelVisualSchema\Support;

use Illuminate\Support\Facades\App;
use InvalidArgumentException;

class LaravelVersionChecker
{
    /**
     * Supported Laravel versions
     */
    const SUPPORTED_VERSIONS = [
        '10.*' => '10.0.0',
        '11.*' => '11.0.0',
        '12.*' => '12.0.0'
    ];

    /**
     * Check if the current Laravel version is supported
     */
    public static function checkCompatibility(): void
    {
        $laravelVersion = App::version();
        
        if (!self::isSupported($laravelVersion)) {
            throw new InvalidArgumentException(
                "Laravel version {$laravelVersion} is not supported. " .
                "Supported versions: " . implode(', ', array_keys(self::SUPPORTED_VERSIONS))
            );
        }
    }

    /**
     * Check if a Laravel version is supported
     */
    public static function isSupported(string $version): bool
    {
        foreach (self::SUPPORTED_VERSIONS as $pattern => $minVersion) {
            if (version_compare($version, $minVersion, '>=') && 
                fnmatch($pattern, $version)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the current Laravel version
     */
    public static function getCurrentVersion(): string
    {
        return App::version();
    }

    /**
     * Check if Laravel 12 specific features are available
     */
    public static function hasLaravel12Features(): bool
    {
        return version_compare(App::version(), '12.0.0', '>=');
    }

    /**
     * Check if Laravel 11 specific features are available
     */
    public static function hasLaravel11Features(): bool
    {
        return version_compare(App::version(), '11.0.0', '>=');
    }

    /**
     * Get recommended configuration based on Laravel version
     */
    public static function getRecommendedConfig(): array
    {
        $version = App::version();
        
        $config = [
            'cache_driver' => 'file',
            'session_driver' => 'file',
            'queue_driver' => 'sync'
        ];

        if (self::hasLaravel11Features()) {
            $config['cache_driver'] = 'redis';
            $config['session_driver'] = 'redis';
        }

        if (self::hasLaravel12Features()) {
            $config['queue_driver'] = 'redis';
            $config['broadcast_driver'] = 'reverb';
        }

        return $config;
    }
}