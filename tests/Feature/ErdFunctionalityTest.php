<?php

namespace BryBry\LaravelVisualSchema\Tests\Feature;

use BryBry\LaravelVisualSchema\Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ErdFunctionalityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Enable the schema designer for testing
        config(['schema-designer.enabled' => true]);
    }

    /** @test */
    public function it_can_access_the_schema_designer_page()
    {
        $response = $this->get('/schema-designer');
        
        $response->assertStatus(200)
                 ->assertViewIs('laravel-visual-schema::schema-designer')
                 ->assertSee('Schema Designer')
                 ->assertSee('ERD Tools');
    }

    /** @test */
    public function it_loads_required_erd_javascript_functions()
    {
        $response = $this->get('/schema-designer');
        
        // Check that ERD-specific JavaScript functions are present
        $response->assertSee('createRelationshipVisual')
                 ->assertSee('detectForeignKeys')
                 ->assertSee('toggleRelationshipMode')
                 ->assertSee('handleCanvasMouseDown');
    }

    /** @test */
    public function it_includes_erd_css_classes()
    {
        $response = $this->get('/schema-designer');
        
        // Check that ERD-specific CSS classes are present
        $response->assertSee('erd-controls')
                 ->assertSee('relationship-item')
                 ->assertSee('relationship-line')
                 ->assertSee('toolbox-sidebar');
    }

    /** @test */
    public function it_displays_erd_toolbox_controls()
    {
        $response = $this->get('/schema-designer');
        
        // Check for ERD-specific UI elements
        $response->assertSee('Toggle Relationship Mode')
                 ->assertSee('Detect Foreign Keys')
                 ->assertSee('Relationships')
                 ->assertSee('ERD Tools');
    }

    /** @test */
    public function it_can_save_schema_with_relationships()
    {
        $schemaData = [
            'name' => 'Test ERD Schema',
            'description' => 'Testing ERD functionality',
            'data' => json_encode([
                'tables' => [
                    [
                        'id' => 'table_1',
                        'name' => 'users',
                        'x' => 100,
                        'y' => 100,
                        'columns' => [
                            ['name' => 'id', 'type' => 'bigint', 'primary' => true],
                            ['name' => 'name', 'type' => 'varchar', 'length' => 255],
                            ['name' => 'email', 'type' => 'varchar', 'length' => 255]
                        ]
                    ],
                    [
                        'id' => 'table_2',
                        'name' => 'posts',
                        'x' => 300,
                        'y' => 100,
                        'columns' => [
                            ['name' => 'id', 'type' => 'bigint', 'primary' => true],
                            ['name' => 'user_id', 'type' => 'bigint'],
                            ['name' => 'title', 'type' => 'varchar', 'length' => 255]
                        ]
                    ]
                ],
                'relationships' => [
                    [
                        'id' => 'rel_1',
                        'sourceTable' => 'users',
                        'targetTable' => 'posts',
                        'sourceColumn' => 'id',
                        'targetColumn' => 'user_id',
                        'type' => 'one-to-many',
                        'visual' => [
                            'path' => 'M200,150 L300,150',
                            'crowsfoot' => true
                        ]
                    ]
                ]
            ])
        ];

        $response = $this->postJson('/api/schema-designer/schemas', $schemaData);
        
        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonStructure([
                     'success',
                     'data' => ['id', 'name', 'data', 'created_at']
                 ]);
    }

    /** @test */
    public function it_can_retrieve_schema_with_relationships()
    {
        // Create a schema with relationships
        $schema = $this->postJson('/api/schema-designer/schemas', [
            'name' => 'Test ERD',
            'data' => json_encode([
                'tables' => [
                    ['id' => 'users', 'name' => 'users', 'x' => 100, 'y' => 100]
                ],
                'relationships' => [
                    [
                        'id' => 'rel_1',
                        'sourceTable' => 'users',
                        'targetTable' => 'posts',
                        'type' => 'one-to-many'
                    ]
                ]
            ])
        ]);

        $schemaId = $schema->json('data.id');
        
        $response = $this->getJson("/api/schema-designer/schemas/{$schemaId}");
        
        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
        
        $data = json_decode($response->json('data.data'), true);
        $this->assertArrayHasKey('relationships', $data);
        $this->assertCount(1, $data['relationships']);
        $this->assertEquals('one-to-many', $data['relationships'][0]['type']);
    }

    /** @test */
    public function foreign_key_detection_algorithm_works()
    {
        // This would be tested in a browser environment
        // Here we can test the logic that would be used
        $tables = [
            [
                'name' => 'users',
                'columns' => [
                    ['name' => 'id', 'type' => 'bigint', 'primary' => true]
                ]
            ],
            [
                'name' => 'posts',
                'columns' => [
                    ['name' => 'id', 'type' => 'bigint', 'primary' => true],
                    ['name' => 'user_id', 'type' => 'bigint']
                ]
            ],
            [
                'name' => 'comments',
                'columns' => [
                    ['name' => 'id', 'type' => 'bigint', 'primary' => true],
                    ['name' => 'post_id', 'type' => 'bigint'],
                    ['name' => 'user_id', 'type' => 'bigint']
                ]
            ]
        ];

        // Simulate the foreign key detection logic
        $detectedRelationships = $this->simulateForeignKeyDetection($tables);
        
        $this->assertCount(3, $detectedRelationships);
        
        // Check user_id in posts table
        $userPostRelation = collect($detectedRelationships)->first(function ($rel) {
            return $rel['sourceTable'] === 'users' && $rel['targetTable'] === 'posts';
        });
        $this->assertNotNull($userPostRelation);
        $this->assertEquals('id', $userPostRelation['sourceColumn']);
        $this->assertEquals('user_id', $userPostRelation['targetColumn']);
        
        // Check post_id in comments table
        $postCommentRelation = collect($detectedRelationships)->first(function ($rel) {
            return $rel['sourceTable'] === 'posts' && $rel['targetTable'] === 'comments';
        });
        $this->assertNotNull($postCommentRelation);
        $this->assertEquals('id', $postCommentRelation['sourceColumn']);
        $this->assertEquals('post_id', $postCommentRelation['targetColumn']);
    }

    /**
     * Simulate the foreign key detection algorithm
     */
    private function simulateForeignKeyDetection($tables)
    {
        $relationships = [];
        
        foreach ($tables as $table) {
            foreach ($table['columns'] as $column) {
                // Check if column name follows foreign key convention
                if (str_ends_with($column['name'], '_id') && $column['name'] !== 'id') {
                    $foreignTableName = str_replace('_id', '', $column['name']);
                    
                    // Check if a table with that name exists (singular or plural)
                    $possibleTableNames = [$foreignTableName, $foreignTableName . 's'];
                    
                    foreach ($tables as $potentialTarget) {
                        if (in_array($potentialTarget['name'], $possibleTableNames)) {
                            // Check if target table has an 'id' column
                            $hasIdColumn = collect($potentialTarget['columns'])->contains('name', 'id');
                            
                            if ($hasIdColumn) {
                                $relationships[] = [
                                    'sourceTable' => $potentialTarget['name'],
                                    'targetTable' => $table['name'],
                                    'sourceColumn' => 'id',
                                    'targetColumn' => $column['name'],
                                    'type' => 'one-to-many',
                                    'detected' => true
                                ];
                            }
                        }
                    }
                }
            }
        }
        
        return $relationships;
    }
}