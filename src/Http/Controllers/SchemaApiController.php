<?php

namespace BryBry\LaravelVisualSchema\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use BryBry\LaravelVisualSchema\Services\SchemaStorageService;
use BryBry\LaravelVisualSchema\Services\SchemaExportService;
use BryBry\LaravelVisualSchema\Services\SchemaValidationService;

class SchemaApiController extends Controller
{
    protected $storageService;
    protected $exportService;
    protected $validationService;

    public function __construct(
        SchemaStorageService $storageService,
        SchemaExportService $exportService,
        SchemaValidationService $validationService
    ) {
        $this->storageService = $storageService;
        $this->exportService = $exportService;
        $this->validationService = $validationService;
    }

    /**
     * List all schemas
     */
    public function index(): JsonResponse
    {
        try {
            $schemas = $this->storageService->list();
            return response()->json(['success' => true, 'data' => $schemas]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a new schema
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'data' => 'required|array',
            'data.tables' => 'required|array',
            'data.relationships' => 'array',
            'data.layout' => 'array'
        ]);

        try {
            // Validate schema structure
            $this->validationService->validate($request->input('data'));
            
            $schema = [
                'name' => $request->input('name'),
                'data' => $request->input('data'),
                'created_at' => now(),
                'updated_at' => now()
            ];

            $id = $this->storageService->store($schema);
            
            return response()->json([
                'success' => true, 
                'data' => array_merge($schema, ['id' => $id])
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Show a specific schema
     */
    public function show($id): JsonResponse
    {
        try {
            $schema = $this->storageService->get($id);
            return response()->json(['success' => true, 'data' => $schema]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Schema not found'], 404);
        }
    }

    /**
     * Update a schema
     */
    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'name' => 'string|max:255',
            'data' => 'array',
            'data.tables' => 'array',
            'data.relationships' => 'array',
            'data.layout' => 'array'
        ]);

        try {
            $existing = $this->storageService->get($id);
            
            $updates = array_filter([
                'name' => $request->input('name'),
                'data' => $request->input('data'),
            ]);

            if (isset($updates['data'])) {
                $this->validationService->validate($updates['data']);
            }

            $updates['updated_at'] = now();
            
            $this->storageService->update($id, $updates);
            
            $updated = $this->storageService->get($id);
            
            return response()->json(['success' => true, 'data' => $updated]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Delete a schema
     */
    public function destroy($id): JsonResponse
    {
        try {
            $this->storageService->delete($id);
            return response()->json(['success' => true, 'message' => 'Schema deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Schema not found'], 404);
        }
    }

    /**
     * Export a schema
     */
    public function export(Request $request, $id): JsonResponse
    {
        $request->validate([
            'format' => 'required|in:png,svg,pdf',
            'options' => 'array'
        ]);

        try {
            $schema = $this->storageService->get($id);
            $format = $request->input('format');
            $options = $request->input('options', []);

            $result = $this->exportService->export($schema, $format, $options);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $result['url'],
                    'filename' => $result['filename'],
                    'format' => $format
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Import a schema
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:json|max:2048',
            'name' => 'string|max:255'
        ]);

        try {
            $file = $request->file('file');
            $content = json_decode(file_get_contents($file->getPathname()), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON file');
            }

            // Validate imported schema structure
            $this->validationService->validate($content);
            
            $schema = [
                'name' => $request->input('name', $file->getClientOriginalName()),
                'data' => $content,
                'created_at' => now(),
                'updated_at' => now()
            ];

            $id = $this->storageService->store($schema);
            
            return response()->json([
                'success' => true,
                'data' => array_merge($schema, ['id' => $id])
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}