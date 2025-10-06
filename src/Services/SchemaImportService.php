<?php

namespace BryBry\LaravelVisualSchema\Services;

use Illuminate\Http\Request;

class SchemaImportService
{
    protected $validationService;
    protected $storageService;

    public function __construct(
        SchemaValidationService $validationService,
        SchemaStorageService $storageService
    ) {
        $this->validationService = $validationService;
        $this->storageService = $storageService;
    }

    /**
     * Import schema from various formats
     */
    public function import(Request $request): array
    {
        $file = $request->file('file');
        $format = $this->detectFormat($file);

        switch ($format) {
            case 'json':
                return $this->importFromJson($file, $request->input('name'));
            case 'sql':
                return $this->importFromSql($file, $request->input('name'));
            case 'xml':
                return $this->importFromXml($file, $request->input('name'));
            default:
                throw new \Exception("Unsupported file format: {$format}");
        }
    }

    /**
     * Detect file format based on extension and content
     */
    protected function detectFormat($file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        
        switch ($extension) {
            case 'json':
                return 'json';
            case 'sql':
                return 'sql';
            case 'xml':
                return 'xml';
            default:
                // Try to detect from content
                $content = file_get_contents($file->getPathname());
                if (json_decode($content)) {
                    return 'json';
                }
                if (stripos($content, 'CREATE TABLE') !== false) {
                    return 'sql';
                }
                if (stripos($content, '<?xml') !== false) {
                    return 'xml';
                }
                throw new \Exception('Cannot detect file format');
        }
    }

    /**
     * Import from JSON format
     */
    protected function importFromJson($file, ?string $name): array
    {
        $content = json_decode(file_get_contents($file->getPathname()), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid JSON file: ' . json_last_error_msg());
        }

        // Validate schema structure
        $this->validationService->validate($content);

        $schema = [
            'name' => $name ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'data' => $content,
            'created_at' => now(),
            'updated_at' => now()
        ];

        $id = $this->storageService->store($schema);

        return array_merge($schema, ['id' => $id]);
    }

    /**
     * Import from SQL format
     */
    protected function importFromSql($file, ?string $name): array
    {
        $content = file_get_contents($file->getPathname());
        $schema = $this->parseSqlSchema($content);

        $schemaData = [
            'name' => $name ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'data' => $schema,
            'created_at' => now(),
            'updated_at' => now()
        ];

        // Validate parsed schema
        $this->validationService->validate($schema);

        $id = $this->storageService->store($schemaData);

        return array_merge($schemaData, ['id' => $id]);
    }

    /**
     * Parse SQL CREATE TABLE statements
     */
    protected function parseSqlSchema(string $sql): array
    {
        $tables = [];
        $relationships = [];
        $layout = [];

        // Remove comments
        $sql = preg_replace('/--.*$/m', '', $sql);
        $sql = preg_replace('/\/\*[\s\S]*?\*\//', '', $sql);

        // Extract CREATE TABLE statements
        preg_match_all('/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\((.*?)\);/is', $sql, $matches, PREG_SET_ORDER);

        $x = 100;
        $y = 100;

        foreach ($matches as $match) {
            $tableName = $match[1];
            $tableDefinition = $match[2];

            $columns = $this->parseTableColumns($tableDefinition);
            $foreignKeys = $this->parseForeignKeys($tableDefinition);

            $tables[$tableName] = [
                'name' => $tableName,
                'columns' => $columns
            ];

            $layout[$tableName] = ['x' => $x, 'y' => $y];
            $x += 250;
            if ($x > 1000) {
                $x = 100;
                $y += 200;
            }

            // Add foreign key relationships
            foreach ($foreignKeys as $fk) {
                $relationshipId = "rel_" . time() . "_" . rand(1000, 9999);
                $relationships[$relationshipId] = [
                    'type' => 'one-to-many',
                    'from_table' => $fk['referenced_table'],
                    'from_column' => $fk['referenced_column'],
                    'to_table' => $tableName,
                    'to_column' => $fk['column']
                ];
            }
        }

        return [
            'tables' => $tables,
            'relationships' => $relationships,
            'layout' => $layout
        ];
    }

    /**
     * Parse table columns from CREATE TABLE definition
     */
    protected function parseTableColumns(string $definition): array
    {
        $columns = [];
        $lines = explode(',', $definition);

        foreach ($lines as $line) {
            $line = trim($line);
            
            // Skip constraint definitions
            if (preg_match('/^\s*(PRIMARY KEY|FOREIGN KEY|KEY|INDEX|UNIQUE|CONSTRAINT)/i', $line)) {
                continue;
            }

            // Parse column definition
            if (preg_match('/^\s*`?(\w+)`?\s+(\w+)(\([^)]+\))?\s*(.*)?$/i', $line, $matches)) {
                $columnName = $matches[1];
                $columnType = strtolower($matches[2]);
                $typeParams = isset($matches[3]) ? $matches[3] : '';
                $modifiers = isset($matches[4]) ? strtoupper($matches[4]) : '';

                $column = [
                    'name' => $columnName,
                    'type' => $columnType,
                    'nullable' => !str_contains($modifiers, 'NOT NULL'),
                    'primary' => str_contains($modifiers, 'PRIMARY KEY') || str_contains($modifiers, 'AUTO_INCREMENT'),
                    'unique' => str_contains($modifiers, 'UNIQUE'),
                ];

                // Extract length from type params
                if ($typeParams && preg_match('/\((\d+)\)/', $typeParams, $lengthMatch)) {
                    $column['length'] = (int)$lengthMatch[1];
                }

                // Extract default value
                if (preg_match('/DEFAULT\s+([\'"]?)([^\'"\s,]+)\1/i', $modifiers, $defaultMatch)) {
                    $column['default'] = $defaultMatch[2];
                }

                $columns["col_" . $columnName] = $column;
            }
        }

        return $columns;
    }

    /**
     * Parse foreign key constraints
     */
    protected function parseForeignKeys(string $definition): array
    {
        $foreignKeys = [];
        
        // Match FOREIGN KEY constraints
        if (preg_match_all('/FOREIGN\s+KEY\s*\(\s*`?(\w+)`?\s*\)\s*REFERENCES\s+`?(\w+)`?\s*\(\s*`?(\w+)`?\s*\)/i', $definition, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $foreignKeys[] = [
                    'column' => $match[1],
                    'referenced_table' => $match[2],
                    'referenced_column' => $match[3]
                ];
            }
        }

        return $foreignKeys;
    }

    /**
     * Import from XML format (basic implementation)
     */
    protected function importFromXml($file, ?string $name): array
    {
        $content = file_get_contents($file->getPathname());
        
        try {
            $xml = simplexml_load_string($content);
        } catch (\Exception $e) {
            throw new \Exception('Invalid XML file: ' . $e->getMessage());
        }

        // This is a basic implementation - you would need to adapt based on your XML schema format
        $schema = $this->parseXmlSchema($xml);

        $schemaData = [
            'name' => $name ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'data' => $schema,
            'created_at' => now(),
            'updated_at' => now()
        ];

        $this->validationService->validate($schema);

        $id = $this->storageService->store($schemaData);

        return array_merge($schemaData, ['id' => $id]);
    }

    /**
     * Parse XML schema (placeholder implementation)
     */
    protected function parseXmlSchema($xml): array
    {
        // This would need to be implemented based on your specific XML format
        // For now, return empty schema
        return [
            'tables' => [],
            'relationships' => [],
            'layout' => []
        ];
    }
}