<?php

namespace BryBry\LaravelVisualSchema\Tests;

use Orchestra\Testbench\TestCase as BaseTestCase;
use BryBry\LaravelVisualSchema\LaravelVisualSchemaServiceProvider;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        $this->setUpDatabase();
    }

    protected function getPackageProviders($app)
    {
        return [
            LaravelVisualSchemaServiceProvider::class,
        ];
    }

    protected function getEnvironmentSetUp($app)
    {
        // Set up in-memory SQLite database
        $app['config']->set('database.default', 'testbench');
        $app['config']->set('database.connections.testbench', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]);

        // Enable schema designer for testing
        $app['config']->set('schema-designer.enabled', true);
        $app['config']->set('schema-designer.storage.driver', 'file');
    }

    protected function setUpDatabase()
    {
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
    }
}