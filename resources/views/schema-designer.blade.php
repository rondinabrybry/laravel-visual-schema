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
            
            <!-- Quick Actions -->
            <div class="toolbar-section">
                <button @click="addQuickTable()" class="btn btn-primary btn-sm" title="Add Table">
                    ➕ Table
                </button>
                <button @click="toggleRelationshipMode()" 
                        :class="{ 'active': isDrawingRelationship }" 
                        class="btn btn-success btn-sm" 
                        title="Draw Relationship">
                    <span x-show="!isDrawingRelationship">🔗 Relate</span>
                    <span x-show="isDrawingRelationship">✕ Stop</span>
                </button>
                <div class="dropdown" x-data="{ open: false }">
                    <button @click="open = !open" class="btn btn-secondary btn-sm">
                        📋 Templates ▼
                    </button>
                    <div x-show="open" @click.away="open = false" class="dropdown-menu">
                        <button @click="addTableTemplate('users'); open = false" class="dropdown-item">👤 Users</button>
                        <button @click="addTableTemplate('posts'); open = false" class="dropdown-item">📝 Posts</button>
                        <button @click="addTableTemplate('categories'); open = false" class="dropdown-item">📁 Categories</button>
                        <div class="dropdown-divider"></div>
                        <button @click="autoCreateRelationships(); open = false" class="dropdown-item">⚡ Auto-Detect Relations</button>
                    </div>
                </div>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <!-- File Operations -->
            <div class="toolbar-section">
                <button @click="saveSchema()" :disabled="isLoading" class="btn btn-success btn-sm">
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
            
            <!-- Alignment Tools -->
            <div class="toolbar-section">
                <div class="dropdown" x-data="{ open: false }">
                    <button @click="open = !open" class="btn btn-secondary btn-sm" title="Alignment Tools">
                        📐 Align ▼
                    </button>
                    <div x-show="open" @click.away="open = false" class="dropdown-menu">
                        <button @click="alignObjects('left'); open = false" class="dropdown-item">⬅️ Align Left</button>
                        <button @click="alignObjects('center-horizontal'); open = false" class="dropdown-item">↔️ Center Horizontal</button>
                        <button @click="alignObjects('right'); open = false" class="dropdown-item">➡️ Align Right</button>
                        <div class="dropdown-divider"></div>
                        <button @click="alignObjects('top'); open = false" class="dropdown-item">⬆️ Align Top</button>
                        <button @click="alignObjects('center-vertical'); open = false" class="dropdown-item">↕️ Center Vertical</button>
                        <button @click="alignObjects('bottom'); open = false" class="dropdown-item">⬇️ Align Bottom</button>
                        <div class="dropdown-divider"></div>
                        <button @click="distributeObjects('horizontal'); open = false" class="dropdown-item">↔️ Distribute Horizontal</button>
                        <button @click="distributeObjects('vertical'); open = false" class="dropdown-item">↕️ Distribute Vertical</button>
                    </div>
                </div>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <!-- Object Tools -->
            <div class="toolbar-section">
                <button @click="duplicateObject()" class="btn btn-secondary btn-icon" title="Duplicate (Ctrl+D)">
                    📋
                </button>
                <button @click="sendToBack()" class="btn btn-secondary btn-icon" title="Send to Back">
                    ⬇️
                </button>
                <button @click="sendToFront()" class="btn btn-secondary btn-icon" title="Bring to Front">
                    ⬆️
                </button>
                <button @click="groupObjects()" class="btn btn-secondary btn-icon" title="Group (Ctrl+G)">
                    📦
                </button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <!-- View Controls -->
            <div class="toolbar-section">
                <button @click="toggleGrid()" class="btn btn-secondary btn-icon" title="Toggle Grid" :class="{ 'active': showGrid }">
                    ⊞
                </button>
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
                <button @click="undo()" :disabled="historyIndex <= 0" class="btn btn-secondary btn-icon" title="Undo (Ctrl+Z)">
                    ↶
                </button>
                <button @click="redo()" :disabled="historyIndex >= history.length - 1" class="btn btn-secondary btn-icon" title="Redo (Ctrl+Y)">
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
            
            <!-- Panel Toggles -->
            <div class="toolbar-section">
                <button @click="showToolbox = !showToolbox" class="btn btn-secondary btn-icon" title="Toggle Toolbox">
                    🧰
                </button>
                <button @click="showPropertyPanel = !showPropertyPanel" class="btn btn-secondary btn-icon" title="Toggle Properties">
                    ⚙️
                </button>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="schema-content">
            <!-- Toolbox Sidebar -->
            <div class="toolbox-sidebar" x-show="showToolbox" :class="{ 'open': showToolbox }">
                <div class="toolbox-header">
                    <h3>🧰 Toolbox</h3>
                    <button @click="showToolbox = false" class="btn btn-secondary btn-sm">✕</button>
                </div>
                
                <div class="toolbox-content">
                    <!-- Quick Add Section -->
                    <div class="toolbox-section">
                        <h4>Quick Add</h4>
                        <div class="tool-grid">
                            <button @click="addQuickTable()" class="tool-button" title="Add Table">
                                <div class="tool-icon">📊</div>
                                <div class="tool-label">Table</div>
                            </button>
                            <button @click="$refs.tableNameInput.focus(); $refs.tableNameInput.select()" class="tool-button" title="Custom Table">
                                <div class="tool-icon">➕</div>
                                <div class="tool-label">Custom</div>
                            </button>
                        </div>
                        
                        <!-- Quick table name input -->
                        <div class="form-group">
                            <input x-ref="tableNameInput" type="text" 
                                   placeholder="Table name..." 
                                   class="form-input" 
                                   @keydown.enter="addQuickTable($event.target.value); $event.target.value = ''">
                        </div>
                    </div>
                    
                    <!-- Templates Section -->
                    <div class="toolbox-section">
                        <h4>Templates</h4>
                        <div class="template-list">
                            <button @click="addTableTemplate('users')" class="template-button">
                                <span class="template-icon">👤</span>
                                <span class="template-name">Users</span>
                                <span class="template-desc">8 columns</span>
                            </button>
                            <button @click="addTableTemplate('posts')" class="template-button">
                                <span class="template-icon">📝</span>
                                <span class="template-name">Posts</span>
                                <span class="template-desc">8 columns</span>
                            </button>
                            <button @click="addTableTemplate('categories')" class="template-button">
                                <span class="template-icon">📁</span>
                                <span class="template-name">Categories</span>
                                <span class="template-desc">7 columns</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- ERD Relationships -->
                    <div class="toolbox-section">
                        <h4>ERD Relationships</h4>
                        <div class="erd-tools">
                            <button @click="toggleRelationshipMode()" 
                                    :class="{ 'active': isDrawingRelationship }" 
                                    class="btn btn-primary btn-sm w-full">
                                <span x-show="!isDrawingRelationship">🔗 Draw Relationship</span>
                                <span x-show="isDrawingRelationship">✕ Stop Drawing</span>
                            </button>
                            
                            <button @click="autoCreateRelationships()" class="btn btn-success btn-sm w-full">
                                ⚡ Auto-Detect Relations
                            </button>
                            
                            <div class="relationship-info">
                                <div class="info-text">
                                    <strong>How to draw:</strong><br>
                                    1. Click "Draw Relationship"<br>
                                    2. Click source table<br>
                                    3. Click target table<br>
                                    4. Relationship created!
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Canvas Tools -->
                    <div class="toolbox-section">
                        <h4>Canvas</h4>
                        <div class="canvas-tools">
                            <div class="form-group">
                                <label class="form-label">Grid Size</label>
                                <input type="range" x-model="gridSize" min="10" max="50" step="5" 
                                       @input="setupGrid()" class="range-input">
                                <span class="range-value" x-text="gridSize + 'px'"></span>
                            </div>
                            
                            <div class="checkbox-group">
                                <input type="checkbox" x-model="showGrid" @change="toggleGrid()" class="checkbox" id="showGrid">
                                <label for="showGrid" class="checkbox-label">Show Grid</label>
                            </div>
                            
                            <button @click="fitToWindow()" class="btn btn-secondary btn-sm w-full">
                                📏 Fit to Window
                            </button>
                        </div>
                    </div>
                    
                    <!-- Selection Tools -->
                    <div class="toolbox-section">
                        <h4>Selection</h4>
                        <div class="selection-tools">
                            <button @click="duplicateObject()" class="btn btn-secondary btn-sm w-full">
                                📋 Duplicate
                            </button>
                            <button @click="deleteSelected()" class="btn btn-danger btn-sm w-full">
                                🗑️ Delete
                            </button>
                            
                            <div class="tool-row">
                                <button @click="sendToBack()" class="btn btn-secondary btn-sm">⬇️ Back</button>
                                <button @click="sendToFront()" class="btn btn-secondary btn-sm">⬆️ Front</button>
                            </div>
                            
                            <div class="tool-row">
                                <button @click="groupObjects()" class="btn btn-secondary btn-sm">📦 Group</button>
                                <button @click="ungroupObjects()" class="btn btn-secondary btn-sm">📦⊟ Ungroup</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Canvas Area -->
            <div class="canvas-container">
                <canvas x-ref="canvas" id="schema-canvas"></canvas>
                
                <!-- Canvas Info Overlay -->
                <div class="canvas-info">
                    <div class="info-item">
                        <span>Tables: </span>
                        <strong x-text="currentSchema.tables.length"></strong>
                    </div>
                    <div class="info-item">
                        <span>Relations: </span>
                        <strong x-text="currentSchema.relationships.length"></strong>
                    </div>
                    <div class="info-item" x-show="showGrid">
                        <span>Grid: </span>
                        <strong x-text="gridSize + 'px'"></strong>
                    </div>
                </div>
                
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
                        <!-- ERD Drawing Mode -->
                        <div class="property-section">
                            <h3>ERD Drawing</h3>
                            <div class="erd-controls">
                                <button @click="toggleRelationshipMode()" 
                                        :class="{ 'active': isDrawingRelationship }" 
                                        class="btn w-full"
                                        :class="isDrawingRelationship ? 'btn-danger' : 'btn-primary'">
                                    <span x-show="!isDrawingRelationship">🔗 Start Drawing Relationships</span>
                                    <span x-show="isDrawingRelationship">✕ Stop Drawing Mode</span>
                                </button>
                                
                                <button @click="autoCreateRelationships()" class="btn btn-success btn-sm w-full">
                                    ⚡ Auto-Detect Foreign Keys
                                </button>
                                
                                <div x-show="isDrawingRelationship" class="drawing-instructions">
                                    <div class="alert alert-info">
                                        <strong>Drawing Mode Active:</strong><br>
                                        • Click on a source table<br>
                                        • Then click on target table<br>
                                        • Relationship will be created<br>
                                        • Press Escape to cancel
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="property-section">
                            <h3>Manual Relationship</h3>
                            
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
                            
                            <!-- From Column -->
                            <div class="form-group" x-show="newRelationship.fromTable">
                                <label class="form-label">From Column</label>
                                <select x-model="newRelationship.fromColumn" class="form-select">
                                    <template x-for="table in currentSchema.tables.filter(t => t.id === newRelationship.fromTable)" :key="table.id">
                                        <template x-for="column in table.columns" :key="column.name">
                                            <option :value="column.name" x-text="column.name + ' (' + column.type + ')'"></option>
                                        </template>
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
                            
                            <!-- To Column -->
                            <div class="form-group" x-show="newRelationship.toTable">
                                <label class="form-label">To Column</label>
                                <select x-model="newRelationship.toColumn" class="form-select">
                                    <template x-for="table in currentSchema.tables.filter(t => t.id === newRelationship.toTable)" :key="table.id">
                                        <template x-for="column in table.columns" :key="column.name">
                                            <option :value="column.name" x-text="column.name + ' (' + column.type + ')'"></option>
                                        </template>
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
                                <button @click="addRelationship()" :disabled="!newRelationship.fromTable || !newRelationship.toTable" class="btn btn-primary btn-sm w-full">
                                    Create Relationship
                                </button>
                            </div>
                        </div>
                        
                        <!-- Existing Relationships -->
                        <div class="property-section" x-show="currentSchema.relationships.length > 0">
                            <h3>Existing Relationships (<span x-text="currentSchema.relationships.length"></span>)</h3>
                            <template x-for="relationship in currentSchema.relationships" :key="relationship.id">
                                <div class="relationship-item">
                                    <div class="relationship-header">
                                        <span class="relationship-type" x-text="getRelationshipSymbol(relationship.type)"></span>
                                        <span class="relationship-name" x-text="getTableNameById(relationship.from) + ' → ' + getTableNameById(relationship.to)"></span>
                                    </div>
                                    <div class="relationship-details" x-show="relationship.fromColumn && relationship.toColumn">
                                        <span x-text="relationship.fromColumn + ' → ' + relationship.toColumn"></span>
                                    </div>
                                    <button @click="removeRelationship(relationship.id)" class="btn btn-danger btn-sm">
                                        🗑️
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