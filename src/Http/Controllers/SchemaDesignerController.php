<?php

namespace BryBry\LaravelVisualSchema\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use BryBry\LaravelVisualSchema\Services\SchemaStorageService;

class SchemaDesignerController extends Controller
{
    protected $storageService;

    public function __construct(SchemaStorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    /**
     * Display the schema designer interface
     */
    public function index()
    {
        $schemas = $this->storageService->list();
        $schema = (object) [
            'id' => null,
            'name' => 'Untitled Schema',
            'tables' => [],
            'relationships' => []
        ];
        
        return view('laravel-visual-schema::schema-designer', [
            'schemas' => $schemas,
            'schema' => $schema,
            'config' => [
                'canvas' => config('schema-designer.canvas'),
                'theme' => config('schema-designer.theme'),
                'export' => config('schema-designer.export'),
            ]
        ]);
    }

    /**
     * Share a schema via signed URL
     */
    public function share(Request $request, $signature)
    {
        if (!config('schema-designer.security.signed_urls')) {
            abort(404);
        }

        $schemaId = $request->query('schema');
        
        if (!$schemaId) {
            abort(400, 'Schema ID is required');
        }

        try {
            $schema = $this->storageService->get($schemaId);
            
            return view('schema-designer::share', [
                'schema' => $schema,
                'readonly' => true
            ]);
        } catch (\Exception $e) {
            abort(404, 'Schema not found');
        }
    }
}