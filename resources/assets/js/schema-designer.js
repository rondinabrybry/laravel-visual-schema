/**
 * Laravel Visual Schema Designer
 * Pure JavaScript implementation for shared hosting compatibility
 * No build process required - works with CDN libraries only
 */

// Global namespace to avoid conflicts
window.LaravelVisualSchema = {
    version: '1.1.0',
    instances: new Map()
};

/**
 * Main Schema Designer Alpine.js Component
 */
function schemaDesigner() {
    return {
        // Core properties
        canvas: null,
        fabricCanvas: null,
        currentSchema: {
            id: null,
            name: 'Untitled Schema',
            tables: [],
            relationships: [],
            canvasData: null
        },
        selectedObject: null,
        isDarkMode: false,
        isLoading: false,
        
        // UI State
        showPropertyPanel: true,
        activeTab: 'tables',
        zoom: 100,
        
        // History for undo/redo
        history: [],
        historyIndex: -1,
        maxHistorySize: 50,
        
        // Table creation state
        newTable: {
            name: '',
            columns: [
                { name: 'id', type: 'integer', primary: true, nullable: false, autoIncrement: true }
            ]
        },
        
        // Relationship state
        newRelationship: {
            fromTable: '',
            toTable: '',
            type: 'one-to-many',
            fromColumn: '',
            toColumn: ''
        },

        /**
         * Initialize the schema designer
         */
        init() {
            this.setupCanvas();
            this.loadTheme();
            this.bindKeyboardShortcuts();
            this.loadExistingSchema();
            this.addToHistory('Initial state');
            
            // Register this instance globally
            const instanceId = 'schema_' + Date.now();
            window.LaravelVisualSchema.instances.set(instanceId, this);
            
            console.log('Laravel Visual Schema Designer initialized');
        },

        /**
         * Setup Fabric.js canvas
         */
        setupCanvas() {
            if (!this.$refs.canvas) {
                console.error('Canvas element not found');
                return;
            }

            this.canvas = this.$refs.canvas;
            
            // Set canvas size
            this.resizeCanvas();
            
            // Initialize Fabric.js canvas
            this.fabricCanvas = new fabric.Canvas(this.canvas, {
                backgroundColor: this.isDarkMode ? '#1f2937' : '#ffffff',
                selection: true,
                preserveObjectStacking: true,
                enableRetinaScaling: true,
                allowTouchScrolling: true
            });

            // Bind canvas events
            this.fabricCanvas.on('selection:created', (e) => {
                this.selectedObject = e.selected[0];
                this.showPropertyPanel = true;
            });

            this.fabricCanvas.on('selection:cleared', () => {
                this.selectedObject = null;
            });

            this.fabricCanvas.on('object:modified', () => {
                this.addToHistory('Object modified');
                this.saveCanvasState();
            });

            this.fabricCanvas.on('path:created', () => {
                this.addToHistory('Path created');
            });

            // Handle window resize
            window.addEventListener('resize', () => {
                this.resizeCanvas();
            });
        },

        /**
         * Resize canvas to fit container
         */
        resizeCanvas() {
            if (!this.canvas || !this.fabricCanvas) return;
            
            const container = this.canvas.parentElement;
            const rect = container.getBoundingClientRect();
            
            this.fabricCanvas.setDimensions({
                width: rect.width,
                height: rect.height
            });
            
            this.fabricCanvas.renderAll();
        },

        /**
         * Add a new table to the canvas
         */
        addTable(x = 100, y = 100) {
            if (!this.newTable.name.trim()) {
                alert('Please enter a table name');
                return;
            }

            const tableData = {
                id: 'table_' + Date.now(),
                name: this.newTable.name,
                columns: [...this.newTable.columns],
                position: { x, y }
            };

            // Create visual representation
            const tableGroup = this.createTableVisual(tableData);
            this.fabricCanvas.add(tableGroup);
            
            // Add to schema data
            this.currentSchema.tables.push(tableData);
            
            // Reset form
            this.resetNewTableForm();
            
            // Update history
            this.addToHistory(`Added table: ${tableData.name}`);
            this.saveCanvasState();
            
            this.fabricCanvas.renderAll();
        },

        /**
         * Create visual representation of a table
         */
        createTableVisual(tableData) {
            const headerHeight = 40;
            const rowHeight = 25;
            const width = 200;
            const height = headerHeight + (tableData.columns.length * rowHeight);
            
            // Create table container
            const rect = new fabric.Rect({
                left: tableData.position.x,
                top: tableData.position.y,
                width: width,
                height: height,
                fill: this.isDarkMode ? '#374151' : '#ffffff',
                stroke: this.isDarkMode ? '#6b7280' : '#d1d5db',
                strokeWidth: 1,
                rx: 4,
                ry: 4,
                shadow: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    blur: 5,
                    offsetX: 2,
                    offsetY: 2
                }
            });

            // Table header
            const header = new fabric.Rect({
                left: tableData.position.x,
                top: tableData.position.y,
                width: width,
                height: headerHeight,
                fill: this.isDarkMode ? '#4f46e5' : '#3b82f6',
                rx: 4,
                ry: 4
            });

            // Table name text
            const nameText = new fabric.Text(tableData.name, {
                left: tableData.position.x + 10,
                top: tableData.position.y + 12,
                fontSize: 14,
                fontWeight: 'bold',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif'
            });

            // Column texts
            const columnTexts = tableData.columns.map((column, index) => {
                const columnText = this.formatColumnText(column);
                return new fabric.Text(columnText, {
                    left: tableData.position.x + 10,
                    top: tableData.position.y + headerHeight + (index * rowHeight) + 5,
                    fontSize: 12,
                    fill: this.isDarkMode ? '#e5e7eb' : '#374151',
                    fontFamily: 'Monaco, monospace'
                });
            });

            // Create group
            const tableGroup = new fabric.Group([rect, header, nameText, ...columnTexts], {
                left: tableData.position.x,
                top: tableData.position.y,
                selectable: true,
                hasControls: true,
                hasBorders: true,
                lockUniScaling: true
            });

            // Add custom properties
            tableGroup.set({
                tableId: tableData.id,
                type: 'table',
                tableData: tableData
            });

            return tableGroup;
        },

        /**
         * Format column text for display
         */
        formatColumnText(column) {
            let text = column.name + ': ' + column.type;
            
            const badges = [];
            if (column.primary) badges.push('PK');
            if (column.nullable === false) badges.push('NOT NULL');
            if (column.autoIncrement) badges.push('AI');
            
            if (badges.length > 0) {
                text += ' [' + badges.join(', ') + ']';
            }
            
            return text;
        },

        /**
         * Add a new column to the current table
         */
        addColumn() {
            this.newTable.columns.push({
                name: 'new_column',
                type: 'varchar',
                nullable: true,
                primary: false,
                autoIncrement: false
            });
        },

        /**
         * Remove a column from the current table
         */
        removeColumn(index) {
            if (this.newTable.columns.length > 1) {
                this.newTable.columns.splice(index, 1);
            }
        },

        /**
         * Reset the new table form
         */
        resetNewTableForm() {
            this.newTable = {
                name: '',
                columns: [
                    { name: 'id', type: 'integer', primary: true, nullable: false, autoIncrement: true }
                ]
            };
        },

        /**
         * Create a relationship between tables
         */
        addRelationship() {
            if (!this.newRelationship.fromTable || !this.newRelationship.toTable) {
                alert('Please select both tables for the relationship');
                return;
            }

            const relationship = {
                id: 'rel_' + Date.now(),
                from: this.newRelationship.fromTable,
                to: this.newRelationship.toTable,
                type: this.newRelationship.type,
                fromColumn: this.newRelationship.fromColumn,
                toColumn: this.newRelationship.toColumn
            };

            // Create visual relationship line
            this.createRelationshipVisual(relationship);
            
            // Add to schema data
            this.currentSchema.relationships.push(relationship);
            
            // Reset form
            this.resetRelationshipForm();
            
            // Update history
            this.addToHistory(`Added relationship: ${relationship.from} -> ${relationship.to}`);
            this.saveCanvasState();
        },

        /**
         * Create visual representation of a relationship
         */
        createRelationshipVisual(relationship) {
            // Find table positions
            const fromTable = this.findTableById(relationship.from);
            const toTable = this.findTableById(relationship.to);
            
            if (!fromTable || !toTable) return;

            // Calculate connection points
            const fromPoint = this.getTableConnectionPoint(fromTable);
            const toPoint = this.getTableConnectionPoint(toTable);

            // Create relationship line
            const line = new fabric.Line([fromPoint.x, fromPoint.y, toPoint.x, toPoint.y], {
                stroke: this.isDarkMode ? '#60a5fa' : '#3b82f6',
                strokeWidth: 2,
                selectable: true,
                evented: true
            });

            // Add relationship type indicator
            const midX = (fromPoint.x + toPoint.x) / 2;
            const midY = (fromPoint.y + toPoint.y) / 2;
            
            const typeText = new fabric.Text(this.getRelationshipSymbol(relationship.type), {
                left: midX,
                top: midY,
                fontSize: 12,
                fill: this.isDarkMode ? '#60a5fa' : '#3b82f6',
                fontFamily: 'Arial, sans-serif',
                originX: 'center',
                originY: 'center',
                backgroundColor: this.isDarkMode ? '#1f2937' : '#ffffff'
            });

            // Group line and text
            const relationshipGroup = new fabric.Group([line, typeText], {
                selectable: true,
                evented: true
            });

            relationshipGroup.set({
                relationshipId: relationship.id,
                type: 'relationship',
                relationshipData: relationship
            });

            this.fabricCanvas.add(relationshipGroup);
        },

        /**
         * Get relationship symbol for display
         */
        getRelationshipSymbol(type) {
            const symbols = {
                'one-to-one': '1:1',
                'one-to-many': '1:N',
                'many-to-many': 'N:M',
                'many-to-one': 'N:1'
            };
            return symbols[type] || '1:N';
        },

        /**
         * Find table by ID in canvas objects
         */
        findTableById(tableId) {
            const objects = this.fabricCanvas.getObjects();
            return objects.find(obj => obj.tableId === tableId);
        },

        /**
         * Get connection point for a table
         */
        getTableConnectionPoint(tableObject) {
            const bounds = tableObject.getBoundingRect();
            return {
                x: bounds.left + bounds.width / 2,
                y: bounds.top + bounds.height / 2
            };
        },

        /**
         * Reset relationship form
         */
        resetRelationshipForm() {
            this.newRelationship = {
                fromTable: '',
                toTable: '',
                type: 'one-to-many',
                fromColumn: '',
                toColumn: ''
            };
        },

        /**
         * Export schema to PNG
         */
        exportToPNG() {
            this.isLoading = true;
            
            try {
                const dataURL = this.fabricCanvas.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: 2
                });
                
                this.downloadFile(dataURL, `${this.currentSchema.name}.png`);
            } catch (error) {
                console.error('Export to PDF failed:', error);
                alert('Export failed. Please try again.');
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Export schema to SVG
         */
        exportToSVG() {
            this.isLoading = true;
            
            try {
                const svgString = this.fabricCanvas.toSVG();
                const dataURL = 'data:image/svg+xml;base64,' + btoa(svgString);
                this.downloadFile(dataURL, `${this.currentSchema.name}.svg`);
            } catch (error) {
                console.error('Export to SVG failed:', error);
                alert('Export failed. Please try again.');
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Export schema to PDF
         */
        exportToPDF() {
            this.isLoading = true;
            
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('landscape', 'mm', 'a4');
                
                const imgData = this.fabricCanvas.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: 2
                });
                
                // Calculate dimensions to fit A4
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const margin = 10;
                
                pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth - (margin * 2), pdfHeight - (margin * 2));
                pdf.save(`${this.currentSchema.name}.pdf`);
            } catch (error) {
                console.error('Export to PDF failed:', error);
                alert('Export failed. Please try again.');
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Download file helper
         */
        downloadFile(dataURL, filename) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        /**
         * Save current schema
         */
        async saveSchema() {
            this.isLoading = true;
            
            try {
                const schemaData = {
                    id: this.currentSchema.id,
                    name: this.currentSchema.name,
                    tables: this.currentSchema.tables,
                    relationships: this.currentSchema.relationships,
                    canvas: this.fabricCanvas.toJSON()
                };

                const response = await fetch('/api/schema-designer/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify(schemaData)
                });

                const result = await response.json();
                
                if (result.success) {
                    this.currentSchema.id = result.id;
                    alert('Schema saved successfully!');
                } else {
                    throw new Error(result.message || 'Save failed');
                }
            } catch (error) {
                console.error('Save failed:', error);
                alert('Failed to save schema. Please try again.');
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Load existing schema
         */
        async loadSchema(schemaId) {
            if (!schemaId) return;
            
            this.isLoading = true;
            
            try {
                const response = await fetch(`/api/schema-designer/load/${schemaId}`);
                const schemaData = await response.json();
                
                if (schemaData.success) {
                    this.currentSchema = schemaData.data;
                    
                    // Clear canvas
                    this.fabricCanvas.clear();
                    
                    // Load canvas data
                    if (schemaData.data.canvas) {
                        this.fabricCanvas.loadFromJSON(schemaData.data.canvas, () => {
                            this.fabricCanvas.renderAll();
                        });
                    }
                    
                    // Rebuild visual elements
                    this.rebuildVisualElements();
                    
                    this.addToHistory('Schema loaded');
                } else {
                    throw new Error(schemaData.message || 'Load failed');
                }
            } catch (error) {
                console.error('Load failed:', error);
                alert('Failed to load schema. Please try again.');
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Load existing schema on initialization
         */
        loadExistingSchema() {
            // Try to load from URL parameter or localStorage
            const urlParams = new URLSearchParams(window.location.search);
            const schemaId = urlParams.get('schema') || localStorage.getItem('lastSchemaId');
            
            if (schemaId) {
                this.loadSchema(schemaId);
            }
        },

        /**
         * Rebuild visual elements from schema data
         */
        rebuildVisualElements() {
            // Recreate tables
            this.currentSchema.tables.forEach(tableData => {
                const tableGroup = this.createTableVisual(tableData);
                this.fabricCanvas.add(tableGroup);
            });
            
            // Recreate relationships
            this.currentSchema.relationships.forEach(relationship => {
                this.createRelationshipVisual(relationship);
            });
            
            this.fabricCanvas.renderAll();
        },

        /**
         * Toggle dark/light theme
         */
        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            
            // Save preference
            localStorage.setItem('schemaDesignerTheme', this.isDarkMode ? 'dark' : 'light');
            
            // Update canvas background
            this.fabricCanvas.setBackgroundColor(
                this.isDarkMode ? '#1f2937' : '#ffffff',
                this.fabricCanvas.renderAll.bind(this.fabricCanvas)
            );
            
            // Rebuild elements with new theme
            this.rebuildVisualElements();
        },

        /**
         * Load theme preference
         */
        loadTheme() {
            const savedTheme = localStorage.getItem('schemaDesignerTheme');
            this.isDarkMode = savedTheme === 'dark';
        },

        /**
         * Zoom in
         */
        zoomIn() {
            const zoom = this.fabricCanvas.getZoom();
            const newZoom = Math.min(zoom * 1.1, 3);
            this.fabricCanvas.setZoom(newZoom);
            this.zoom = Math.round(newZoom * 100);
        },

        /**
         * Zoom out
         */
        zoomOut() {
            const zoom = this.fabricCanvas.getZoom();
            const newZoom = Math.max(zoom * 0.9, 0.1);
            this.fabricCanvas.setZoom(newZoom);
            this.zoom = Math.round(newZoom * 100);
        },

        /**
         * Reset zoom to 100%
         */
        resetZoom() {
            this.fabricCanvas.setZoom(1);
            this.zoom = 100;
        },

        /**
         * Fit canvas to window
         */
        fitToWindow() {
            this.fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            const objects = this.fabricCanvas.getObjects();
            
            if (objects.length > 0) {
                const group = new fabric.Group(objects, { left: 0, top: 0 });
                const bounds = group.getBoundingRect();
                group.destroy();
                
                const canvasWidth = this.fabricCanvas.getWidth();
                const canvasHeight = this.fabricCanvas.getHeight();
                
                const scaleX = (canvasWidth - 40) / bounds.width;
                const scaleY = (canvasHeight - 40) / bounds.height;
                const zoom = Math.min(scaleX, scaleY, 1);
                
                this.fabricCanvas.setZoom(zoom);
                this.zoom = Math.round(zoom * 100);
                
                const centerX = (canvasWidth - bounds.width * zoom) / 2;
                const centerY = (canvasHeight - bounds.height * zoom) / 2;
                
                this.fabricCanvas.absolutePan({
                    x: centerX - bounds.left * zoom,
                    y: centerY - bounds.top * zoom
                });
            }
        },

        /**
         * Clear the entire canvas
         */
        clearCanvas() {
            if (confirm('Are you sure you want to clear the entire schema? This action cannot be undone.')) {
                this.fabricCanvas.clear();
                this.currentSchema.tables = [];
                this.currentSchema.relationships = [];
                this.addToHistory('Canvas cleared');
                this.saveCanvasState();
            }
        },

        /**
         * Delete selected object
         */
        deleteSelected() {
            const activeObject = this.fabricCanvas.getActiveObject();
            if (activeObject) {
                // Remove from schema data if it's a table or relationship
                if (activeObject.tableId) {
                    this.currentSchema.tables = this.currentSchema.tables.filter(
                        table => table.id !== activeObject.tableId
                    );
                } else if (activeObject.relationshipId) {
                    this.currentSchema.relationships = this.currentSchema.relationships.filter(
                        rel => rel.id !== activeObject.relationshipId
                    );
                }
                
                this.fabricCanvas.remove(activeObject);
                this.addToHistory('Object deleted');
                this.saveCanvasState();
            }
        },

        /**
         * Add state to history for undo/redo
         */
        addToHistory(action) {
            // Remove any history after current index
            this.history = this.history.slice(0, this.historyIndex + 1);
            
            // Add new state
            const state = {
                action: action,
                timestamp: Date.now(),
                canvas: this.fabricCanvas.toJSON(),
                schema: JSON.parse(JSON.stringify(this.currentSchema))
            };
            
            this.history.push(state);
            this.historyIndex = this.history.length - 1;
            
            // Limit history size
            if (this.history.length > this.maxHistorySize) {
                this.history.shift();
                this.historyIndex--;
            }
        },

        /**
         * Undo last action
         */
        undo() {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.restoreFromHistory();
            }
        },

        /**
         * Redo last undone action
         */
        redo() {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.restoreFromHistory();
            }
        },

        /**
         * Restore state from history
         */
        restoreFromHistory() {
            const state = this.history[this.historyIndex];
            if (state) {
                this.currentSchema = JSON.parse(JSON.stringify(state.schema));
                this.fabricCanvas.loadFromJSON(state.canvas, () => {
                    this.fabricCanvas.renderAll();
                });
            }
        },

        /**
         * Save current canvas state
         */
        saveCanvasState() {
            // Auto-save to localStorage
            const state = {
                schema: this.currentSchema,
                canvas: this.fabricCanvas.toJSON(),
                timestamp: Date.now()
            };
            
            localStorage.setItem('schemaDesignerAutoSave', JSON.stringify(state));
        },

        /**
         * Bind keyboard shortcuts
         */
        bindKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Skip if typing in input field
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    return;
                }
                
                if (e.ctrlKey || e.metaKey) {
                    switch (e.key) {
                        case 'z':
                            e.preventDefault();
                            if (e.shiftKey) {
                                this.redo();
                            } else {
                                this.undo();
                            }
                            break;
                        case 'y':
                            e.preventDefault();
                            this.redo();
                            break;
                        case 's':
                            e.preventDefault();
                            this.saveSchema();
                            break;
                        case '=':
                        case '+':
                            e.preventDefault();
                            this.zoomIn();
                            break;
                        case '-':
                            e.preventDefault();
                            this.zoomOut();
                            break;
                        case '0':
                            e.preventDefault();
                            this.resetZoom();
                            break;
                    }
                } else {
                    switch (e.key) {
                        case 'Delete':
                        case 'Backspace':
                            e.preventDefault();
                            this.deleteSelected();
                            break;
                        case 'Escape':
                            this.fabricCanvas.discardActiveObject();
                            this.fabricCanvas.renderAll();
                            break;
                    }
                }
            });
        },

        /**
         * Get list of available column types
         */
        getColumnTypes() {
            return [
                'integer', 'bigint', 'varchar', 'text', 'longtext',
                'decimal', 'float', 'double', 'boolean', 'date',
                'datetime', 'timestamp', 'time', 'json', 'binary'
            ];
        },

        /**
         * Get list of relationship types
         */
        getRelationshipTypes() {
            return [
                { value: 'one-to-one', label: 'One to One' },
                { value: 'one-to-many', label: 'One to Many' },
                { value: 'many-to-one', label: 'Many to One' },
                { value: 'many-to-many', label: 'Many to Many' }
            ];
        }
    };
}

// Make the component globally available
window.schemaDesigner = schemaDesigner;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Laravel Visual Schema Designer loaded successfully');
});