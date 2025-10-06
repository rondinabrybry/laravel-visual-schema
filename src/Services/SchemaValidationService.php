<?php

namespace BryBry\LaravelVisualSchema\Services;

class SchemaValidationService
{
    /**
     * Validate schema structure
     */
    public function validate(array $data): void
    {
        if (!isset($data['tables']) || !is_array($data['tables'])) {
            throw new \Exception('Schema must contain a tables array');
        }

        foreach ($data['tables'] as $tableId => $table) {
            $this->validateTable($tableId, $table);
        }

        if (isset($data['relationships']) && is_array($data['relationships'])) {
            foreach ($data['relationships'] as $relationshipId => $relationship) {
                $this->validateRelationship($relationshipId, $relationship, $data['tables']);
            }
        }

        if (isset($data['layout']) && is_array($data['layout'])) {
            $this->validateLayout($data['layout'], $data['tables']);
        }
    }

    /**
     * Validate individual table structure
     */
    protected function validateTable(string $tableId, array $table): void
    {
        if (!isset($table['name']) || !is_string($table['name'])) {
            throw new \Exception("Table {$tableId} must have a name");
        }

        if (!isset($table['columns']) || !is_array($table['columns'])) {
            throw new \Exception("Table {$tableId} must have a columns array");
        }

        foreach ($table['columns'] as $columnId => $column) {
            $this->validateColumn($tableId, $columnId, $column);
        }
    }

    /**
     * Validate individual column structure
     */
    protected function validateColumn(string $tableId, string $columnId, array $column): void
    {
        if (!isset($column['name']) || !is_string($column['name'])) {
            throw new \Exception("Column {$columnId} in table {$tableId} must have a name");
        }

        if (!isset($column['type']) || !is_string($column['type'])) {
            throw new \Exception("Column {$columnId} in table {$tableId} must have a type");
        }

        // Validate common column properties
        $validProperties = ['name', 'type', 'nullable', 'default', 'primary', 'unique', 'index', 'length', 'precision', 'scale', 'unsigned'];
        
        foreach ($column as $property => $value) {
            if (!in_array($property, $validProperties)) {
                throw new \Exception("Invalid column property '{$property}' in column {$columnId} of table {$tableId}");
            }
        }
    }

    /**
     * Validate relationship structure
     */
    protected function validateRelationship(string $relationshipId, array $relationship, array $tables): void
    {
        $required = ['type', 'from_table', 'from_column', 'to_table', 'to_column'];
        
        foreach ($required as $field) {
            if (!isset($relationship[$field])) {
                throw new \Exception("Relationship {$relationshipId} is missing required field: {$field}");
            }
        }

        // Validate relationship type
        $validTypes = ['one-to-one', 'one-to-many', 'many-to-many'];
        if (!in_array($relationship['type'], $validTypes)) {
            throw new \Exception("Invalid relationship type '{$relationship['type']}' in relationship {$relationshipId}");
        }

        // Validate referenced tables exist
        if (!isset($tables[$relationship['from_table']])) {
            throw new \Exception("Relationship {$relationshipId} references non-existent table: {$relationship['from_table']}");
        }

        if (!isset($tables[$relationship['to_table']])) {
            throw new \Exception("Relationship {$relationshipId} references non-existent table: {$relationship['to_table']}");
        }

        // Validate referenced columns exist
        $fromTable = $tables[$relationship['from_table']];
        if (!isset($fromTable['columns'][$relationship['from_column']])) {
            throw new \Exception("Relationship {$relationshipId} references non-existent column: {$relationship['from_column']} in table {$relationship['from_table']}");
        }

        $toTable = $tables[$relationship['to_table']];
        if (!isset($toTable['columns'][$relationship['to_column']])) {
            throw new \Exception("Relationship {$relationshipId} references non-existent column: {$relationship['to_column']} in table {$relationship['to_table']}");
        }
    }

    /**
     * Validate layout structure
     */
    protected function validateLayout(array $layout, array $tables): void
    {
        foreach ($layout as $tableId => $position) {
            if (!isset($tables[$tableId])) {
                throw new \Exception("Layout references non-existent table: {$tableId}");
            }

            if (!isset($position['x']) || !is_numeric($position['x'])) {
                throw new \Exception("Layout for table {$tableId} must have a numeric x position");
            }

            if (!isset($position['y']) || !is_numeric($position['y'])) {
                throw new \Exception("Layout for table {$tableId} must have a numeric y position");
            }
        }
    }
}