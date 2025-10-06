<?php

namespace BryBry\LaravelVisualSchema\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SchemaExportService
{
    /**
     * Export schema to specified format
     */
    public function export(array $schema, string $format, array $options = []): array
    {
        $exportId = Str::uuid()->toString();
        $filename = $this->generateFilename($schema['name'] ?? 'schema', $format);
        
        switch ($format) {
            case 'png':
                return $this->exportToPng($schema, $exportId, $filename, $options);
            case 'svg':
                return $this->exportToSvg($schema, $exportId, $filename, $options);
            case 'pdf':
                return $this->exportToPdf($schema, $exportId, $filename, $options);
            default:
                throw new \Exception("Unsupported export format: {$format}");
        }
    }

    /**
     * Export to PNG format
     */
    protected function exportToPng(array $schema, string $exportId, string $filename, array $options): array
    {
        // This would typically be handled by the frontend using html2canvas
        // Here we'll create a placeholder response that the frontend can use
        
        $exportData = [
            'schema' => $schema,
            'format' => 'png',
            'options' => array_merge([
                'width' => config('schema-designer.export.max_width', 4000),
                'height' => config('schema-designer.export.max_height', 4000),
                'quality' => config('schema-designer.export.quality', 0.92),
                'background' => '#ffffff'
            ], $options),
            'export_id' => $exportId
        ];

        // Store export request for frontend processing
        $this->storeExportRequest($exportId, $exportData);

        return [
            'url' => route('schema-designer.api.export-download', ['id' => $exportId]),
            'filename' => $filename,
            'export_id' => $exportId
        ];
    }

    /**
     * Export to SVG format
     */
    protected function exportToSvg(array $schema, string $exportId, string $filename, array $options): array
    {
        $svg = $this->generateSvg($schema, $options);
        
        $filePath = "exports/{$exportId}/{$filename}";
        Storage::put($filePath, $svg);

        return [
            'url' => Storage::url($filePath),
            'filename' => $filename,
            'export_id' => $exportId
        ];
    }

    /**
     * Export to PDF format
     */
    protected function exportToPdf(array $schema, string $exportId, string $filename, array $options): array
    {
        // This would typically use a library like dompdf or wkhtmltopdf
        // For now, we'll create a placeholder that generates HTML for PDF conversion
        
        $html = $this->generateHtmlForPdf($schema, $options);
        
        $exportData = [
            'schema' => $schema,
            'format' => 'pdf',
            'html' => $html,
            'options' => array_merge([
                'page_size' => 'A4',
                'orientation' => 'landscape',
                'margin' => '10mm'
            ], $options),
            'export_id' => $exportId
        ];

        $this->storeExportRequest($exportId, $exportData);

        return [
            'url' => route('schema-designer.api.export-download', ['id' => $exportId]),
            'filename' => $filename,
            'export_id' => $exportId
        ];
    }

    /**
     * Generate SVG representation of schema
     */
    protected function generateSvg(array $schema, array $options): string
    {
        $width = $options['width'] ?? 1200;
        $height = $options['height'] ?? 800;
        $gridSize = config('schema-designer.canvas.grid_size', 20);
        
        $svg = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $svg .= "<svg width=\"{$width}\" height=\"{$height}\" xmlns=\"http://www.w3.org/2000/svg\">\n";
        
        // Add grid pattern
        $svg .= $this->generateSvgGrid($width, $height, $gridSize);
        
        // Add tables
        if (isset($schema['data']['tables'])) {
            foreach ($schema['data']['tables'] as $tableId => $table) {
                $position = $schema['data']['layout'][$tableId] ?? ['x' => 100, 'y' => 100];
                $svg .= $this->generateSvgTable($table, $position);
            }
        }
        
        // Add relationships
        if (isset($schema['data']['relationships'])) {
            foreach ($schema['data']['relationships'] as $relationship) {
                $svg .= $this->generateSvgRelationship($relationship, $schema['data']['tables'], $schema['data']['layout']);
            }
        }
        
        $svg .= "</svg>";
        
        return $svg;
    }

    /**
     * Generate HTML for PDF conversion
     */
    protected function generateHtmlForPdf(array $schema, array $options): string
    {
        $html = "<!DOCTYPE html>\n<html>\n<head>\n";
        $html .= "<meta charset=\"UTF-8\">\n";
        $html .= "<title>" . htmlspecialchars($schema['name'] ?? 'Schema Diagram') . "</title>\n";
        $html .= "<style>\n";
        $html .= $this->getPdfStyles();
        $html .= "</style>\n</head>\n<body>\n";
        
        $html .= "<h1>" . htmlspecialchars($schema['name'] ?? 'Schema Diagram') . "</h1>\n";
        
        // Add canvas container
        $html .= "<div class=\"canvas-container\">\n";
        
        // Add tables
        if (isset($schema['data']['tables'])) {
            foreach ($schema['data']['tables'] as $tableId => $table) {
                $position = $schema['data']['layout'][$tableId] ?? ['x' => 100, 'y' => 100];
                $html .= $this->generateHtmlTable($table, $position);
            }
        }
        
        $html .= "</div>\n</body>\n</html>";
        
        return $html;
    }

    /**
     * Helper methods for SVG generation
     */
    protected function generateSvgGrid(int $width, int $height, int $gridSize): string
    {
        $svg = "<defs>\n";
        $svg .= "<pattern id=\"grid\" width=\"{$gridSize}\" height=\"{$gridSize}\" patternUnits=\"userSpaceOnUse\">\n";
        $svg .= "<circle cx=\"1\" cy=\"1\" r=\"0.5\" fill=\"rgba(0,0,0,0.15)\"/>\n";
        $svg .= "</pattern>\n</defs>\n";
        $svg .= "<rect width=\"100%\" height=\"100%\" fill=\"url(#grid)\"/>\n";
        
        return $svg;
    }

    protected function generateSvgTable(array $table, array $position): string
    {
        $x = $position['x'];
        $y = $position['y'];
        $width = 200;
        $headerHeight = 30;
        $rowHeight = 25;
        $totalHeight = $headerHeight + (count($table['columns']) * $rowHeight);
        
        $svg = "<g class=\"table\" transform=\"translate({$x},{$y})\">\n";
        
        // Table container
        $svg .= "<rect width=\"{$width}\" height=\"{$totalHeight}\" fill=\"white\" stroke=\"#d1d5db\" stroke-width=\"1\" rx=\"4\"/>\n";
        
        // Table header
        $svg .= "<rect width=\"{$width}\" height=\"{$headerHeight}\" fill=\"#f3f4f6\" stroke=\"#d1d5db\" stroke-width=\"1\" rx=\"4\"/>\n";
        $svg .= "<text x=\"10\" y=\"20\" font-family=\"Arial, sans-serif\" font-size=\"14\" font-weight=\"bold\" fill=\"#374151\">" . htmlspecialchars($table['name']) . "</text>\n";
        
        // Table columns
        $yOffset = $headerHeight;
        foreach ($table['columns'] as $column) {
            $svg .= "<text x=\"10\" y=\"" . ($yOffset + 16) . "\" font-family=\"Arial, sans-serif\" font-size=\"12\" fill=\"#6b7280\">";
            $svg .= htmlspecialchars($column['name']) . " : " . htmlspecialchars($column['type']);
            $svg .= "</text>\n";
            $yOffset += $rowHeight;
        }
        
        $svg .= "</g>\n";
        
        return $svg;
    }

    protected function generateSvgRelationship(array $relationship, array $tables, array $layout): string
    {
        // This would generate SVG lines/paths for relationships
        // Simplified implementation
        return "<!-- Relationship: {$relationship['type']} -->\n";
    }

    protected function generateHtmlTable(array $table, array $position): string
    {
        $html = "<div class=\"table\" style=\"left: {$position['x']}px; top: {$position['y']}px;\">\n";
        $html .= "<div class=\"table-header\">" . htmlspecialchars($table['name']) . "</div>\n";
        $html .= "<div class=\"table-body\">\n";
        
        foreach ($table['columns'] as $column) {
            $html .= "<div class=\"table-row\">";
            $html .= htmlspecialchars($column['name']) . " : " . htmlspecialchars($column['type']);
            $html .= "</div>\n";
        }
        
        $html .= "</div>\n</div>\n";
        
        return $html;
    }

    protected function getPdfStyles(): string
    {
        return "
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .canvas-container { position: relative; width: 100%; height: 800px; }
            .table { position: absolute; background: white; border: 1px solid #d1d5db; border-radius: 4px; }
            .table-header { background: #f3f4f6; padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #d1d5db; }
            .table-body { padding: 0; }
            .table-row { padding: 6px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        ";
    }

    protected function generateFilename(string $baseName, string $format): string
    {
        $cleanName = preg_replace('/[^a-zA-Z0-9\-_]/', '_', $baseName);
        $timestamp = date('Y-m-d_H-i-s');
        
        return "{$cleanName}_{$timestamp}.{$format}";
    }

    protected function storeExportRequest(string $exportId, array $data): void
    {
        $filePath = "exports/{$exportId}/request.json";
        Storage::put($filePath, json_encode($data, JSON_PRETTY_PRINT));
    }
}