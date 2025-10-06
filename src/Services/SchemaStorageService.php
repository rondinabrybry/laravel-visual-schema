<?php

namespace BryBry\LaravelVisualSchema\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SchemaStorageService
{
    protected $driver;
    protected $path;

    public function __construct()
    {
        $this->driver = config('schema-designer.storage.driver', 'file');
        $this->path = config('schema-designer.storage.path', 'schema-designs');
    }

    /**
     * List all schemas
     */
    public function list(): array
    {
        if ($this->driver === 'file') {
            return $this->listFromFiles();
        }
        
        // TODO: Implement database storage
        return [];
    }

    /**
     * Get a specific schema
     */
    public function get(string $id): array
    {
        if ($this->driver === 'file') {
            return $this->getFromFile($id);
        }
        
        throw new \Exception('Schema not found');
    }

    /**
     * Store a new schema
     */
    public function store(array $schema): string
    {
        $id = Str::uuid()->toString();
        
        if ($this->driver === 'file') {
            return $this->storeToFile($id, $schema);
        }
        
        throw new \Exception('Storage method not implemented');
    }

    /**
     * Update an existing schema
     */
    public function update(string $id, array $updates): void
    {
        if ($this->driver === 'file') {
            $this->updateFile($id, $updates);
            return;
        }
        
        throw new \Exception('Storage method not implemented');
    }

    /**
     * Delete a schema
     */
    public function delete(string $id): void
    {
        if ($this->driver === 'file') {
            $this->deleteFile($id);
            return;
        }
        
        throw new \Exception('Storage method not implemented');
    }

    /**
     * File storage methods
     */
    protected function listFromFiles(): array
    {
        $files = Storage::files($this->path);
        $schemas = [];
        
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
                try {
                    $content = json_decode(Storage::get($file), true);
                    $id = pathinfo($file, PATHINFO_FILENAME);
                    
                    $schemas[] = [
                        'id' => $id,
                        'name' => $content['name'] ?? 'Untitled',
                        'created_at' => $content['created_at'] ?? null,
                        'updated_at' => $content['updated_at'] ?? null,
                    ];
                } catch (\Exception $e) {
                    // Skip invalid files
                    continue;
                }
            }
        }
        
        return $schemas;
    }

    protected function getFromFile(string $id): array
    {
        $filePath = $this->path . '/' . $id . '.json';
        
        if (!Storage::exists($filePath)) {
            throw new \Exception('Schema not found');
        }
        
        $content = json_decode(Storage::get($filePath), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid schema file');
        }
        
        return array_merge($content, ['id' => $id]);
    }

    protected function storeToFile(string $id, array $schema): string
    {
        $filePath = $this->path . '/' . $id . '.json';
        $content = json_encode($schema, JSON_PRETTY_PRINT);
        
        Storage::put($filePath, $content);
        
        return $id;
    }

    protected function updateFile(string $id, array $updates): void
    {
        $existing = $this->getFromFile($id);
        $updated = array_merge($existing, $updates);
        
        $filePath = $this->path . '/' . $id . '.json';
        $content = json_encode($updated, JSON_PRETTY_PRINT);
        
        Storage::put($filePath, $content);
    }

    protected function deleteFile(string $id): void
    {
        $filePath = $this->path . '/' . $id . '.json';
        
        if (!Storage::exists($filePath)) {
            throw new \Exception('Schema not found');
        }
        
        Storage::delete($filePath);
    }
}