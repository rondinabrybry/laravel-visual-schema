<?php

namespace BryBry\LaravelVisualSchema\Tests\Unit;

use BryBry\LaravelVisualSchema\Tests\TestCase;
use BryBry\LaravelVisualSchema\Services\SchemaValidationService;

class SchemaValidationServiceTest extends TestCase
{
    protected $validationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validationService = new SchemaValidationService();
    }

    public function testValidatesBasicSchema()
    {
        $schema = [
            'tables' => [
                'users' => [
                    'name' => 'users',
                    'columns' => [
                        'id' => [
                            'name' => 'id',
                            'type' => 'bigint',
                            'primary' => true,
                            'nullable' => false
                        ],
                        'name' => [
                            'name' => 'name',
                            'type' => 'varchar',
                            'nullable' => false
                        ]
                    ]
                ]
            ],
            'relationships' => [],
            'layout' => [
                'users' => ['x' => 100, 'y' => 100]
            ]
        ];

        $this->assertNull($this->validationService->validate($schema));
    }

    public function testRejectsSchemaWithoutTables()
    {
        $schema = [
            'relationships' => [],
            'layout' => []
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Schema must contain a tables array');
        
        $this->validationService->validate($schema);
    }

    public function testRejectsTableWithoutName()
    {
        $schema = [
            'tables' => [
                'invalid_table' => [
                    'columns' => []
                ]
            ]
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Table invalid_table must have a name');
        
        $this->validationService->validate($schema);
    }

    public function testRejectsTableWithoutColumns()
    {
        $schema = [
            'tables' => [
                'invalid_table' => [
                    'name' => 'invalid_table'
                ]
            ]
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Table invalid_table must have a columns array');
        
        $this->validationService->validate($schema);
    }

    public function testValidatesRelationships()
    {
        $schema = [
            'tables' => [
                'users' => [
                    'name' => 'users',
                    'columns' => [
                        'id' => ['name' => 'id', 'type' => 'bigint']
                    ]
                ],
                'posts' => [
                    'name' => 'posts',
                    'columns' => [
                        'user_id' => ['name' => 'user_id', 'type' => 'bigint']
                    ]
                ]
            ],
            'relationships' => [
                'user_posts' => [
                    'type' => 'one-to-many',
                    'from_table' => 'users',
                    'from_column' => 'id',
                    'to_table' => 'posts',
                    'to_column' => 'user_id'
                ]
            ],
            'layout' => []
        ];

        $this->assertNull($this->validationService->validate($schema));
    }

    public function testRejectsInvalidRelationshipType()
    {
        $schema = [
            'tables' => [
                'users' => [
                    'name' => 'users',
                    'columns' => [
                        'id' => ['name' => 'id', 'type' => 'bigint']
                    ]
                ]
            ],
            'relationships' => [
                'invalid_rel' => [
                    'type' => 'invalid-type',
                    'from_table' => 'users',
                    'from_column' => 'id',
                    'to_table' => 'users',
                    'to_column' => 'id'
                ]
            ]
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Invalid relationship type');
        
        $this->validationService->validate($schema);
    }
}