@extends('layouts.app')

@section('title', 'Laravel Visual Schema Designer')

@push('styles')
<link href="{{ asset('vendor/laravel-visual-schema/css/schema-designer.css') }}" rel="stylesheet">
@endpush

@section('content')
<div class="schema-designer" x-data="schemaDesigner()" x-init="init()" :class="{ 'dark': isDarkMode }">
    <div class="schema-designer-container">
        <!-- Toolbar -->
        <div class="schema-toolbar">
            <h1>{{ $schema->name ?? 'Visual Schema Designer' }}</h1>
            
            <!-- File Operations -->
            <div class="toolbar-section">
                <button @click="saveSchema()" :disabled="isLoading" class="btn btn-primary btn-sm">
                    <span x-show="!isLoading">💾 Save</span>
                    <span x-show="isLoading" class="loading">
                        <div class="spinner"></div>
                        Saving...
                    </span>
                </button>
                <button @click="loadSchema()" class="btn btn-secondary btn-sm">
                    📂 Load
                </button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <!-- View Controls -->
            <div class="toolbar-section">
                <button @click="zoomIn()" class="btn btn-secondary btn-icon" title="Zoom In">
                    🔍+
                </button>
                <button @click="zoomOut()" class="btn btn-secondary btn-icon" title="Zoom Out">
                    🔍-
                </button>
                <button @click="resetZoom()" class="btn btn-secondary btn-icon" title="Reset Zoom">
                    🎯
                </button>
                <button @click="fitToWindow()" class="btn btn-secondary btn-icon" title="Fit to Window">
                    ⛶
                </button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <!-- Export Options -->
            <div class="toolbar-section">
                <button @click="exportToPNG()" :disabled="isLoading" class="btn btn-secondary btn-sm">
                    🖼️ PNG
                </button>
                <button @click="exportToSVG()" :disabled="isLoading" class="btn btn-secondary btn-sm">
                    📐 SVG
                </button>
                <button @click="exportToPDF()" :disabled="isLoading" class="btn btn-secondary btn-sm">
                    📄 PDF
                </button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <!-- Utility Actions -->
            <div class="toolbar-section">
                <button @click="undo()" :disabled="historyIndex <= 0" class="btn btn-secondary btn-icon" title="Undo">
                    ↶
                </button>
                <button @click="redo()" :disabled="historyIndex >= history.length - 1" class="btn btn-secondary btn-icon" title="Redo">
                    ↷
                </button>
                <button @click="clearCanvas()" class="btn btn-danger btn-sm">
                    🗑️ Clear
                </button>
                <button @click="toggleTheme()" class="btn btn-secondary btn-icon" title="Toggle Theme">
                    <span x-show="!isDarkMode">🌙</span>
                    <span x-show="isDarkMode">☀️</span>
                </button>
            </div>
            
            <!-- Mobile Panel Toggle -->
            <div class="toolbar-section md:hidden">
                <button @click="showPropertyPanel = !showPropertyPanel" class="btn btn-secondary btn-icon">
                    ☰
                </button>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="schema-content">
            <!-- Canvas Area -->
            <div class="canvas-container">
                <canvas x-ref="canvas" id="schema-canvas"></canvas>
                
                <!-- Zoom Controls -->
                <div class="zoom-controls">
                    <button @click="zoomOut()" class="zoom-control">-</button>
                    <div class="zoom-level" x-text="zoom + '%'"></div>
                    <button @click="zoomIn()" class="zoom-control">+</button>
                </div>
            </div>
            
            <!-- Side Panel -->
            <div class="side-panel" x-show="showPropertyPanel" :class="{ 'open': showPropertyPanel }">
                <!-- Panel Tabs -->
                <div class="panel-tabs">
                    <button @click="activeTab = 'tables'" :class="{ 'active': activeTab === 'tables' }" class="panel-tab">
                        Tables
                    </button>
                    <button @click="activeTab = 'relationships'" :class="{ 'active': activeTab === 'relationships' }" class="panel-tab">
                        Relations
                    </button>
                    <button @click="activeTab = 'properties'" :class="{ 'active': activeTab === 'properties' }" class="panel-tab">
                        Properties
                    </button>
                </div>
                
                <!-- Panel Content -->
                <div class="panel-content">
                    <!-- Tables Tab -->
                    <div x-show="activeTab === 'tables'">
                        <div class="property-section">
                            <h3>Add New Table</h3>
                            
                            <!-- Table Name -->
                            <div class="form-group">
                                <label class="form-label">Table Name</label>
                                <input type="text" x-model="newTable.name" class="form-input" placeholder="users" @keydown.enter="addTable()">
                            </div>
                            
                            <!-- Columns -->
                            <div class="form-group">
                                <label class="form-label">Columns</label>
                                <template x-for="(column, index) in newTable.columns" :key="index">
                                    <div class="column-item">
                                        <input type="text" x-model="column.name" class="form-input" placeholder="Column name" style="flex: 2;">
                                        <select x-model="column.type" class="form-select" style="flex: 1;">
                                            <template x-for="type in getColumnTypes()" :key="type">
                                                <option :value="type" x-text="type"></option>
                                            </template>
                                        </select>
                                        
                                        <div class="checkbox-group">
                                            <input type="checkbox" x-model="column.primary" class="checkbox" :id="'primary_' + index">
                                            <label :for="'primary_' + index" class="checkbox-label">PK</label>
                                        </div>
                                        
                                        <div class="checkbox-group">
                                            <input type="checkbox" x-model="column.nullable" class="checkbox" :id="'nullable_' + index">
                                            <label :for="'nullable_' + index" class="checkbox-label">NULL</label>
                                        </div>
                                        
                                        <button @click="removeColumn(index)" class="btn btn-danger btn-sm" x-show="newTable.columns.length > 1">
                                            ×
                                        </button>
                                    </div>
                                </template>
                            </div>
                            
                            <!-- Actions -->
                            <div class="form-group" style="display: flex; gap: 0.5rem;">
                                <button @click="addColumn()" class="btn btn-secondary btn-sm">
                                    + Add Column
                                </button>
                                <button @click="addTable()" :disabled="!newTable.name.trim()" class="btn btn-primary btn-sm">
                                    Add Table
                                </button>
                            </div>
                        </div>
                        
                        <!-- Existing Tables -->
                        <div class="property-section" x-show="currentSchema.tables.length > 0">
                            <h3>Existing Tables</h3>
                            <template x-for="table in currentSchema.tables" :key="table.id">
                                <div class="column-item">
                                    <span x-text="table.name" style="flex: 1; font-weight: 500;"></span>
                                    <span x-text="table.columns.length + ' columns'" style="font-size: 0.75rem; color: var(--gray-500);"></span>
                                    <button @click="selectTableById(table.id)" class="btn btn-secondary btn-sm">
                                        Edit
                                    </button>
                                </div>
                            </template>
                        </div>
                    </div>
                    
                    <!-- Relationships Tab -->
                    <div x-show="activeTab === 'relationships'">
                        <div class="property-section">
                            <h3>Add Relationship</h3>
                            
                            <!-- From Table -->
                            <div class="form-group">
                                <label class="form-label">From Table</label>
                                <select x-model="newRelationship.fromTable" class="form-select">
                                    <option value="">Select table...</option>
                                    <template x-for="table in currentSchema.tables" :key="table.id">
                                        <option :value="table.id" x-text="table.name"></option>
                                    </template>
                                </select>
                            </div>
                            
                            <!-- To Table -->
                            <div class="form-group">
                                <label class="form-label">To Table</label>
                                <select x-model="newRelationship.toTable" class="form-select">
                                    <option value="">Select table...</option>
                                    <template x-for="table in currentSchema.tables" :key="table.id">
                                        <option :value="table.id" x-text="table.name"></option>
                                    </template>
                                </select>
                            </div>
                            
                            <!-- Relationship Type -->
                            <div class="form-group">
                                <label class="form-label">Relationship Type</label>
                                <select x-model="newRelationship.type" class="form-select">
                                    <template x-for="type in getRelationshipTypes()" :key="type.value">
                                        <option :value="type.value" x-text="type.label"></option>
                                    </template>
                                </select>
                            </div>
                            
                            <!-- Actions -->
                            <div class="form-group">
                                <button @click="addRelationship()" :disabled="!newRelationship.fromTable || !newRelationship.toTable" class="btn btn-primary btn-sm">
                                    Add Relationship
                                </button>
                            </div>
                        </div>
                        
                        <!-- Existing Relationships -->
                        <div class="property-section" x-show="currentSchema.relationships.length > 0">
                            <h3>Existing Relationships</h3>
                            <template x-for="relationship in currentSchema.relationships" :key="relationship.id">
                                <div class="column-item">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; font-size: 0.75rem;" x-text="getTableNameById(relationship.from) + ' → ' + getTableNameById(relationship.to)"></div>
                                        <div style="font-size: 0.625rem; color: var(--gray-500);" x-text="getRelationshipSymbol(relationship.type)"></div>
                                    </div>
                                    <button @click="removeRelationship(relationship.id)" class="btn btn-danger btn-sm">
                                        ×
                                    </button>
                                </div>
                            </template>
                        </div>
                    </div>
                    
                    <!-- Properties Tab -->
                    <div x-show="activeTab === 'properties'">
                        <div class="property-section" x-show="selectedObject">
                            <h3>Selected Object Properties</h3>
                            
                            <div x-show="selectedObject && selectedObject.type === 'table'">
                                <div class="form-group">
                                    <label class="form-label">Table Name</label>
                                    <input type="text" :value="selectedObject?.tableData?.name || ''" class="form-input" readonly>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Columns</label>
                                    <template x-for="column in selectedObject?.tableData?.columns || []" :key="column.name">
                                        <div class="column-item">
                                            <span x-text="column.name" style="flex: 1; font-weight: 500;"></span>
                                            <span x-text="column.type" style="font-size: 0.75rem; color: var(--gray-500);"></span>
                                            <div class="column-badges">
                                                <span x-show="column.primary" class="column-badge primary">PK</span>
                                                <span x-show="!column.nullable" class="column-badge success">NOT NULL</span>
                                                <span x-show="column.autoIncrement" class="column-badge">AI</span>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                            
                            <div x-show="selectedObject && selectedObject.type === 'relationship'">
                                <div class="form-group">
                                    <label class="form-label">Relationship Type</label>
                                    <input type="text" :value="selectedObject?.relationshipData?.type || ''" class="form-input" readonly>
                                </div>
                            </div>
                        </div>
                        
                        <div class="property-section" x-show="!selectedObject">
                            <h3>Canvas Properties</h3>
                            <div class="form-group">
                                <label class="form-label">Schema Name</label>
                                <input type="text" x-model="currentSchema.name" class="form-input" placeholder="My Database Schema">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Tables Count</label>
                                <input type="text" :value="currentSchema.tables.length" class="form-input" readonly>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Relationships Count</label>
                                <input type="text" :value="currentSchema.relationships.length" class="form-input" readonly>
                            </div>
                        </div>
                        
                        <!-- Statistics -->
                        <div class="property-section">
                            <h3>Statistics</h3>
                            <div style="font-size: 0.75rem; color: var(--gray-600);">
                                <div>Zoom: <span x-text="zoom + '%'"></span></div>
                                <div>History: <span x-text="(historyIndex + 1) + '/' + history.length"></span></div>
                                <div>Objects: <span x-text="fabricCanvas ? fabricCanvas.getObjects().length : 0"></span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<!-- CSRF Token -->
<meta name="csrf-token" content="{{ csrf_token() }}">

<!-- CDN Libraries (Shared Hosting Compatible) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.3/cdn.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- Package JavaScript -->
<script src="{{ asset('vendor/laravel-visual-schema/js/schema-designer.js') }}"></script>

<script>
    // Additional helper functions for the view
    document.addEventListener('alpine:init', () => {
        // Extend the schemaDesigner with view-specific methods
        window.schemaDesigner = function() {
            const base = schemaDesigner();
            
            return {
                ...base,
                
                // Helper to get table name by ID
                getTableNameById(tableId) {
                    const table = this.currentSchema.tables.find(t => t.id === tableId);
                    return table ? table.name : 'Unknown';
                },
                
                // Select table by ID for editing
                selectTableById(tableId) {
                    const tableObject = this.findTableById(tableId);
                    if (tableObject) {
                        this.fabricCanvas.setActiveObject(tableObject);
                        this.activeTab = 'properties';
                    }
                },
                
                // Remove relationship by ID
                removeRelationship(relationshipId) {
                    // Remove from visual canvas
                    const objects = this.fabricCanvas.getObjects();
                    const relationshipObject = objects.find(obj => obj.relationshipId === relationshipId);
                    if (relationshipObject) {
                        this.fabricCanvas.remove(relationshipObject);
                    }
                    
                    // Remove from data
                    this.currentSchema.relationships = this.currentSchema.relationships.filter(
                        rel => rel.id !== relationshipId
                    );
                    
                    this.addToHistory(`Removed relationship`);
                    this.saveCanvasState();
                }
            };
        };
    });
</script>
@endpush