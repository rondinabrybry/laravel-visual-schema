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
        showToolbox: true,
        activeTab: 'tables',
        zoom: 100,
        gridSize: 20,
        showGrid: true,
        
        // Relationship drawing mode
        isDrawingRelationship: false,
        relationshipStartTable: null,
        tempRelationshipLine: null,
        
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
                allowTouchScrolling: true,
                snapToGrid: true,
                snapAngle: 15
            });

            // Setup grid pattern
            this.setupGrid();

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

            // Relationship drawing events
            this.fabricCanvas.on('mouse:down', (e) => {
                this.handleCanvasMouseDown(e);
            });

            this.fabricCanvas.on('mouse:move', (e) => {
                this.handleCanvasMouseMove(e);
            });

            this.fabricCanvas.on('mouse:up', (e) => {
                this.handleCanvasMouseUp(e);
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
            
            this.setupGrid();
            this.fabricCanvas.renderAll();
        },

        /**
         * Setup grid pattern on canvas
         */
        setupGrid() {
            if (!this.fabricCanvas || !this.showGrid) return;

            const canvasWidth = this.fabricCanvas.getWidth();
            const canvasHeight = this.fabricCanvas.getHeight();
            const gridSize = this.gridSize;

            // Remove existing grid
            const existingGrid = this.fabricCanvas.getObjects().filter(obj => obj.isGrid);
            existingGrid.forEach(obj => this.fabricCanvas.remove(obj));

            // Create grid dots
            const dots = [];
            for (let x = 0; x <= canvasWidth; x += gridSize) {
                for (let y = 0; y <= canvasHeight; y += gridSize) {
                    const dot = new fabric.Circle({
                        left: x,
                        top: y,
                        radius: 1,
                        fill: this.isDarkMode ? '#374151' : '#e5e7eb',
                        selectable: false,
                        evented: false,
                        isGrid: true,
                        excludeFromExport: true
                    });
                    dots.push(dot);
                }
            }

            // Add dots to canvas (send to back)
            dots.forEach(dot => {
                this.fabricCanvas.add(dot);
                this.fabricCanvas.sendToBack(dot);
            });

            this.fabricCanvas.renderAll();
        },

        /**
         * Toggle grid visibility
         */
        toggleGrid() {
            this.showGrid = !this.showGrid;
            if (this.showGrid) {
                this.setupGrid();
            } else {
                const gridObjects = this.fabricCanvas.getObjects().filter(obj => obj.isGrid);
                gridObjects.forEach(obj => this.fabricCanvas.remove(obj));
            }
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
         * Quick add table with default structure
         */
        addQuickTable(tableName = null) {
            const name = tableName || prompt('Enter table name:');
            if (!name || !name.trim()) return;

            const tableData = {
                id: 'table_' + Date.now(),
                name: name.trim(),
                columns: [
                    { name: 'id', type: 'integer', primary: true, nullable: false, autoIncrement: true },
                    { name: 'created_at', type: 'timestamp', primary: false, nullable: true, autoIncrement: false },
                    { name: 'updated_at', type: 'timestamp', primary: false, nullable: true, autoIncrement: false }
                ],
                position: { 
                    x: Math.random() * 400 + 100, 
                    y: Math.random() * 300 + 100 
                }
            };

            // Create visual representation
            const tableGroup = this.createTableVisual(tableData);
            this.fabricCanvas.add(tableGroup);
            
            // Add to schema data
            this.currentSchema.tables.push(tableData);
            
            // Update history
            this.addToHistory(`Added quick table: ${tableData.name}`);
            this.saveCanvasState();
            
            this.fabricCanvas.renderAll();
        },

        /**
         * Add predefined table templates
         */
        addTableTemplate(templateType) {
            const templates = {
                users: {
                    name: 'users',
                    columns: [
                        { name: 'id', type: 'integer', primary: true, nullable: false, autoIncrement: true },
                        { name: 'name', type: 'varchar', primary: false, nullable: false, autoIncrement: false },
                        { name: 'email', type: 'varchar', primary: false, nullable: false, autoIncrement: false },
                        { name: 'email_verified_at', type: 'timestamp', primary: false, nullable: true, autoIncrement: false },
                        { name: 'password', type: 'varchar', primary: false, nullable: false, autoIncrement: false },
                        { name: 'remember_token', type: 'varchar', primary: false, nullable: true, autoIncrement: false },
                        { name: 'created_at', type: 'timestamp', primary: false, nullable: true, autoIncrement: false },
                        { name: 'updated_at', type: 'timestamp', primary: false, nullable: true, autoIncrement: false }
                    ]
                },
                posts: {
                    name: 'posts',
                    columns: [
                        { name: 'id', type: 'integer', primary: true, nullable: false, autoIncrement: true },
                        { name: 'user_id', type: 'integer', primary: false, nullable: false, autoIncrement: false },
                        { name: 'title', type: 'varchar', primary: false, nullable: false, autoIncrement: false },
                        { name: 'slug', type: 'varchar', primary: false, nullable: false, autoIncrement: false },
                        { name: 'content', type: 'text', primary: false, nullable: true, autoIncrement: false },
                        { name: 'published_at', type: 'timestamp', primary: false, nullable: true, autoIncrement: false },
                        { name: 'created_at', type: 'timestamp', primary: false, nullable: true, autoIncrement: false },
                        { name: 'updated_at', type: 'timestamp', primary: false, nullable: true, autoIncrement: false }
                    ]
                },
                categories: {
                    name: 'categories',
                    columns: [
                        { name: 'id', type: 'integer', primary: true, nullable: false, autoIncrement: true },
                        { name: 'name', type: 'varchar', primary: false, nullable: false, autoIncrement: false },
                        { name: 'slug', type: 'varchar', primary: false, nullable: false, autoIncrement: false },
                        { name: 'description', type: 'text', primary: false, nullable: true, autoIncrement: false },
                        { name: 'parent_id', type: 'integer', primary: false, nullable: true, autoIncrement: false },
                        { name: 'created_at', type: 'timestamp', primary: false, nullable: true, autoIncrement: false },
                        { name: 'updated_at', type: 'timestamp', primary: false, nullable: true, autoIncrement: false }
                    ]
                }
            };

            const template = templates[templateType];
            if (!template) return;

            const tableData = {
                id: 'table_' + Date.now(),
                name: template.name,
                columns: [...template.columns],
                position: { 
                    x: Math.random() * 400 + 100, 
                    y: Math.random() * 300 + 100 
                }
            };

            // Create visual representation
            const tableGroup = this.createTableVisual(tableData);
            this.fabricCanvas.add(tableGroup);
            
            // Add to schema data
            this.currentSchema.tables.push(tableData);
            
            // Update history
            this.addToHistory(`Added ${templateType} table`);
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

            // Table name text (editable)
            const nameText = new fabric.Text(tableData.name, {
                left: tableData.position.x + 10,
                top: tableData.position.y + 12,
                fontSize: 14,
                fontWeight: 'bold',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                editable: true
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
                lockUniScaling: true,
                cornerStyle: 'circle',
                cornerColor: this.isDarkMode ? '#60a5fa' : '#3b82f6',
                cornerSize: 8,
                transparentCorners: false
            });

            // Add custom properties
            tableGroup.set({
                tableId: tableData.id,
                type: 'table',
                tableData: tableData
            });

            // Add double-click to edit table name
            tableGroup.on('mousedblclick', () => {
                this.editTableName(tableData.id);
            });

            return tableGroup;
        },

        /**
         * Edit table name inline
         */
        editTableName(tableId) {
            const table = this.currentSchema.tables.find(t => t.id === tableId);
            if (!table) return;

            const newName = prompt('Edit table name:', table.name);
            if (newName && newName.trim() && newName.trim() !== table.name) {
                const oldName = table.name;
                table.name = newName.trim();
                
                // Update visual representation
                this.rebuildTableVisual(tableId);
                
                this.addToHistory(`Renamed table: ${oldName} → ${newName.trim()}`);
                this.saveCanvasState();
            }
        },

        /**
         * Rebuild visual representation of a specific table
         */
        rebuildTableVisual(tableId) {
            // Remove old visual
            const objects = this.fabricCanvas.getObjects();
            const oldTableObject = objects.find(obj => obj.tableId === tableId);
            if (oldTableObject) {
                this.fabricCanvas.remove(oldTableObject);
            }

            // Find table data and recreate visual
            const tableData = this.currentSchema.tables.find(t => t.id === tableId);
            if (tableData) {
                const tableGroup = this.createTableVisual(tableData);
                this.fabricCanvas.add(tableGroup);
                this.fabricCanvas.renderAll();
            }
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
                autoIncrement: false,
                foreignKey: false,
                references: null
            });
        },

        /**
         * Detect potential foreign key relationships
         */
        detectForeignKeys() {
            const suggestions = [];
            
            this.currentSchema.tables.forEach(table => {
                table.columns.forEach(column => {
                    // Check if column name suggests a foreign key (ends with _id)
                    if (column.name.endsWith('_id') && column.name !== 'id') {
                        const referencedTableName = column.name.replace('_id', '');
                        const referencedTable = this.currentSchema.tables.find(t => 
                            t.name === referencedTableName || 
                            t.name === referencedTableName + 's' ||
                            t.name === referencedTableName.slice(0, -1) // handle plurals
                        );
                        
                        if (referencedTable) {
                            // Check if relationship already exists
                            const existingRelation = this.currentSchema.relationships.find(r => 
                                (r.from === table.id && r.to === referencedTable.id) ||
                                (r.from === referencedTable.id && r.to === table.id)
                            );
                            
                            if (!existingRelation) {
                                suggestions.push({
                                    fromTable: referencedTable.id,
                                    toTable: table.id,
                                    fromColumn: 'id',
                                    toColumn: column.name,
                                    type: 'one-to-many',
                                    confidence: 'high'
                                });
                            }
                        }
                    }
                });
            });
            
            return suggestions;
        },

        /**
         * Auto-create relationships based on foreign key detection
         */
        autoCreateRelationships() {
            const suggestions = this.detectForeignKeys();
            let createdCount = 0;
            
            suggestions.forEach(suggestion => {
                const relationship = {
                    id: 'rel_' + Date.now() + '_' + createdCount,
                    from: suggestion.fromTable,
                    to: suggestion.toTable,
                    type: suggestion.type,
                    fromColumn: suggestion.fromColumn,
                    toColumn: suggestion.toColumn
                };
                
                // Create visual relationship
                this.createRelationshipVisual(relationship);
                
                // Add to schema data
                this.currentSchema.relationships.push(relationship);
                createdCount++;
            });
            
            if (createdCount > 0) {
                this.addToHistory(`Auto-created ${createdCount} relationships`);
                this.saveCanvasState();
                this.fabricCanvas.renderAll();
                
                alert(`Created ${createdCount} relationships based on foreign key detection!`);
            } else {
                alert('No potential relationships detected. Make sure your tables have columns ending with "_id" that match other table names.');
            }
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

            // Calculate optimal connection points
            const fromPoint = this.getOptimalConnectionPoint(fromTable, toTable);
            const toPoint = this.getOptimalConnectionPoint(toTable, fromTable);

            // Create relationship line with curves for better ERD appearance
            const path = this.createRelationshipPath(fromPoint, toPoint, relationship.type);
            
            const relationshipLine = new fabric.Path(path, {
                stroke: this.isDarkMode ? '#60a5fa' : '#3b82f6',
                strokeWidth: 2,
                fill: '',
                selectable: true,
                evented: true,
                strokeDashArray: relationship.type === 'many-to-many' ? [5, 5] : null
            });

            // Add relationship symbols at endpoints
            const fromSymbol = this.createRelationshipSymbol(fromPoint, relationship.type, 'from');
            const toSymbol = this.createRelationshipSymbol(toPoint, relationship.type, 'to');

            // Add relationship label
            const midX = (fromPoint.x + toPoint.x) / 2;
            const midY = (fromPoint.y + toPoint.y) / 2;
            
            const relationshipLabel = new fabric.Text(this.getRelationshipLabel(relationship), {
                left: midX,
                top: midY - 10,
                fontSize: 10,
                fill: this.isDarkMode ? '#60a5fa' : '#3b82f6',
                fontFamily: 'Arial, sans-serif',
                originX: 'center',
                originY: 'center',
                backgroundColor: this.isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                padding: 2
            });

            // Group all relationship elements
            const relationshipGroup = new fabric.Group([relationshipLine, fromSymbol, toSymbol, relationshipLabel], {
                selectable: true,
                evented: true,
                hasControls: false,
                hasBorders: true,
                lockMovementX: false,
                lockMovementY: false
            });

            relationshipGroup.set({
                relationshipId: relationship.id,
                type: 'relationship',
                relationshipData: relationship
            });

            this.fabricCanvas.add(relationshipGroup);
            this.fabricCanvas.sendToBack(relationshipGroup);
        },

        /**
         * Create curved path for relationship line
         */
        createRelationshipPath(fromPoint, toPoint, relationshipType) {
            const dx = toPoint.x - fromPoint.x;
            const dy = toPoint.y - fromPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Add slight curve for better visual appearance
            const curvature = Math.min(distance * 0.1, 30);
            const midX = (fromPoint.x + toPoint.x) / 2;
            const midY = (fromPoint.y + toPoint.y) / 2;
            
            // Calculate perpendicular offset for curve
            const perpX = -dy / distance * curvature;
            const perpY = dx / distance * curvature;
            
            const controlX = midX + perpX;
            const controlY = midY + perpY;
            
            return `M ${fromPoint.x} ${fromPoint.y} Q ${controlX} ${controlY} ${toPoint.x} ${toPoint.y}`;
        },

        /**
         * Create relationship symbol (crow's foot notation)
         */
        createRelationshipSymbol(point, relationshipType, side) {
            const symbolSize = 8;
            let symbol;
            
            // Determine symbol based on relationship type and side
            if (relationshipType === 'one-to-many') {
                if (side === 'from') {
                    // One side - small circle
                    symbol = new fabric.Circle({
                        left: point.x - symbolSize/2,
                        top: point.y - symbolSize/2,
                        radius: symbolSize/2,
                        fill: '',
                        stroke: this.isDarkMode ? '#60a5fa' : '#3b82f6',
                        strokeWidth: 2
                    });
                } else {
                    // Many side - crow's foot
                    const path = `M ${point.x} ${point.y} L ${point.x - symbolSize} ${point.y - symbolSize/2} M ${point.x} ${point.y} L ${point.x - symbolSize} ${point.y + symbolSize/2} M ${point.x} ${point.y} L ${point.x - symbolSize} ${point.y}`;
                    symbol = new fabric.Path(path, {
                        stroke: this.isDarkMode ? '#60a5fa' : '#3b82f6',
                        strokeWidth: 2,
                        fill: ''
                    });
                }
            } else if (relationshipType === 'many-to-many') {
                // Many on both sides - crow's foot
                const path = `M ${point.x} ${point.y} L ${point.x - symbolSize} ${point.y - symbolSize/2} M ${point.x} ${point.y} L ${point.x - symbolSize} ${point.y + symbolSize/2} M ${point.x} ${point.y} L ${point.x - symbolSize} ${point.y}`;
                symbol = new fabric.Path(path, {
                    stroke: this.isDarkMode ? '#60a5fa' : '#3b82f6',
                    strokeWidth: 2,
                    fill: ''
                });
            } else {
                // One-to-one - circles on both sides
                symbol = new fabric.Circle({
                    left: point.x - symbolSize/2,
                    top: point.y - symbolSize/2,
                    radius: symbolSize/2,
                    fill: '',
                    stroke: this.isDarkMode ? '#60a5fa' : '#3b82f6',
                    strokeWidth: 2
                });
            }
            
            return symbol;
        },

        /**
         * Get optimal connection point between two tables
         */
        getOptimalConnectionPoint(fromTable, toTable) {
            const fromBounds = fromTable.getBoundingRect();
            const toBounds = toTable.getBoundingRect();
            
            const fromCenterX = fromBounds.left + fromBounds.width / 2;
            const fromCenterY = fromBounds.top + fromBounds.height / 2;
            const toCenterX = toBounds.left + toBounds.width / 2;
            const toCenterY = toBounds.top + toBounds.height / 2;
            
            // Determine which side of the table to connect to
            const dx = toCenterX - fromCenterX;
            const dy = toCenterY - fromCenterY;
            
            let connectionPoint = {};
            
            if (Math.abs(dx) > Math.abs(dy)) {
                // Connect to left or right side
                if (dx > 0) {
                    // Connect to right side of fromTable
                    connectionPoint = {
                        x: fromBounds.left + fromBounds.width,
                        y: fromCenterY
                    };
                } else {
                    // Connect to left side of fromTable
                    connectionPoint = {
                        x: fromBounds.left,
                        y: fromCenterY
                    };
                }
            } else {
                // Connect to top or bottom side
                if (dy > 0) {
                    // Connect to bottom side of fromTable
                    connectionPoint = {
                        x: fromCenterX,
                        y: fromBounds.top + fromBounds.height
                    };
                } else {
                    // Connect to top side of fromTable
                    connectionPoint = {
                        x: fromCenterX,
                        y: fromBounds.top
                    };
                }
            }
            
            return connectionPoint;
        },

        /**
         * Get relationship label
         */
        getRelationshipLabel(relationship) {
            const fromTable = this.getTableNameById(relationship.from);
            const toTable = this.getTableNameById(relationship.to);
            
            if (relationship.fromColumn && relationship.toColumn) {
                return `${fromTable}.${relationship.fromColumn} → ${toTable}.${relationship.toColumn}`;
            }
            
            return this.getRelationshipSymbol(relationship.type);
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
                // Temporarily hide grid for export
                const gridObjects = this.fabricCanvas.getObjects().filter(obj => obj.isGrid);
                gridObjects.forEach(obj => obj.set('visible', false));
                
                const dataURL = this.fabricCanvas.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: 2
                });
                
                // Restore grid visibility
                gridObjects.forEach(obj => obj.set('visible', this.showGrid));
                this.fabricCanvas.renderAll();
                
                this.downloadFile(dataURL, `${this.currentSchema.name}.png`);
            } catch (error) {
                console.error('Export to PNG failed:', error);
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
                // Temporarily hide grid for export
                const gridObjects = this.fabricCanvas.getObjects().filter(obj => obj.isGrid);
                gridObjects.forEach(obj => obj.set('visible', false));
                
                const svgString = this.fabricCanvas.toSVG();
                const dataURL = 'data:image/svg+xml;base64,' + btoa(svgString);
                
                // Restore grid visibility
                gridObjects.forEach(obj => obj.set('visible', this.showGrid));
                this.fabricCanvas.renderAll();
                
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
                
                // Temporarily hide grid for export
                const gridObjects = this.fabricCanvas.getObjects().filter(obj => obj.isGrid);
                gridObjects.forEach(obj => obj.set('visible', false));
                
                const imgData = this.fabricCanvas.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: 2
                });
                
                // Restore grid visibility
                gridObjects.forEach(obj => obj.set('visible', this.showGrid));
                this.fabricCanvas.renderAll();
                
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
                        case 'd':
                            e.preventDefault();
                            this.duplicateObject();
                            break;
                        case 'g':
                            e.preventDefault();
                            this.groupObjects();
                            break;
                        case 'u':
                            e.preventDefault();
                            this.ungroupObjects();
                            break;
                        case 't':
                            e.preventDefault();
                            this.addQuickTable();
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
                        case 'Enter':
                            // Double-click behavior on Enter
                            const activeObject = this.fabricCanvas.getActiveObject();
                            if (activeObject && activeObject.tableId) {
                                this.editTableName(activeObject.tableId);
                            }
                            break;
                        case ' ':
                            e.preventDefault();
                            this.fitToWindow();
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
        },

        /**
         * Alignment tools
         */
        alignObjects(alignment) {
            const activeObjects = this.fabricCanvas.getActiveObjects();
            if (activeObjects.length < 2) {
                alert('Please select at least 2 objects to align');
                return;
            }

            let targetValue;
            switch (alignment) {
                case 'left':
                    targetValue = Math.min(...activeObjects.map(obj => obj.left));
                    activeObjects.forEach(obj => obj.set({ left: targetValue }));
                    break;
                case 'right':
                    targetValue = Math.max(...activeObjects.map(obj => obj.left + obj.width * obj.scaleX));
                    activeObjects.forEach(obj => obj.set({ left: targetValue - obj.width * obj.scaleX }));
                    break;
                case 'top':
                    targetValue = Math.min(...activeObjects.map(obj => obj.top));
                    activeObjects.forEach(obj => obj.set({ top: targetValue }));
                    break;
                case 'bottom':
                    targetValue = Math.max(...activeObjects.map(obj => obj.top + obj.height * obj.scaleY));
                    activeObjects.forEach(obj => obj.set({ top: targetValue - obj.height * obj.scaleY }));
                    break;
                case 'center-horizontal':
                    const centerX = activeObjects.reduce((sum, obj) => sum + obj.left + (obj.width * obj.scaleX) / 2, 0) / activeObjects.length;
                    activeObjects.forEach(obj => obj.set({ left: centerX - (obj.width * obj.scaleX) / 2 }));
                    break;
                case 'center-vertical':
                    const centerY = activeObjects.reduce((sum, obj) => sum + obj.top + (obj.height * obj.scaleY) / 2, 0) / activeObjects.length;
                    activeObjects.forEach(obj => obj.set({ top: centerY - (obj.height * obj.scaleY) / 2 }));
                    break;
            }

            this.fabricCanvas.renderAll();
            this.addToHistory(`Aligned objects: ${alignment}`);
            this.saveCanvasState();
        },

        /**
         * Distribute objects evenly
         */
        distributeObjects(direction) {
            const activeObjects = this.fabricCanvas.getActiveObjects();
            if (activeObjects.length < 3) {
                alert('Please select at least 3 objects to distribute');
                return;
            }

            if (direction === 'horizontal') {
                activeObjects.sort((a, b) => a.left - b.left);
                const leftmost = activeObjects[0].left;
                const rightmost = activeObjects[activeObjects.length - 1].left + activeObjects[activeObjects.length - 1].width * activeObjects[activeObjects.length - 1].scaleX;
                const totalWidth = rightmost - leftmost;
                const gap = totalWidth / (activeObjects.length - 1);

                activeObjects.forEach((obj, index) => {
                    if (index > 0 && index < activeObjects.length - 1) {
                        obj.set({ left: leftmost + gap * index });
                    }
                });
            } else {
                activeObjects.sort((a, b) => a.top - b.top);
                const topmost = activeObjects[0].top;
                const bottommost = activeObjects[activeObjects.length - 1].top + activeObjects[activeObjects.length - 1].height * activeObjects[activeObjects.length - 1].scaleY;
                const totalHeight = bottommost - topmost;
                const gap = totalHeight / (activeObjects.length - 1);

                activeObjects.forEach((obj, index) => {
                    if (index > 0 && index < activeObjects.length - 1) {
                        obj.set({ top: topmost + gap * index });
                    }
                });
            }

            this.fabricCanvas.renderAll();
            this.addToHistory(`Distributed objects: ${direction}`);
            this.saveCanvasState();
        },

        /**
         * Send object to back/front
         */
        sendToBack() {
            const activeObject = this.fabricCanvas.getActiveObject();
            if (activeObject) {
                this.fabricCanvas.sendToBack(activeObject);
                // Keep grid dots at the very back
                const gridObjects = this.fabricCanvas.getObjects().filter(obj => obj.isGrid);
                gridObjects.forEach(obj => this.fabricCanvas.sendToBack(obj));
                this.fabricCanvas.renderAll();
                this.addToHistory('Sent to back');
            }
        },

        sendToFront() {
            const activeObject = this.fabricCanvas.getActiveObject();
            if (activeObject) {
                this.fabricCanvas.bringToFront(activeObject);
                this.fabricCanvas.renderAll();
                this.addToHistory('Brought to front');
            }
        },

        /**
         * Group/ungroup selected objects
         */
        groupObjects() {
            const activeObjects = this.fabricCanvas.getActiveObjects();
            if (activeObjects.length < 2) {
                alert('Please select at least 2 objects to group');
                return;
            }

            const group = new fabric.Group(activeObjects, {
                cornerStyle: 'circle',
                cornerColor: this.isDarkMode ? '#60a5fa' : '#3b82f6'
            });

            this.fabricCanvas.remove(...activeObjects);
            this.fabricCanvas.add(group);
            this.fabricCanvas.setActiveObject(group);
            this.fabricCanvas.renderAll();
            this.addToHistory('Grouped objects');
            this.saveCanvasState();
        },

        ungroupObjects() {
            const activeObject = this.fabricCanvas.getActiveObject();
            if (activeObject && activeObject.type === 'group') {
                const objects = activeObject.getObjects();
                activeObject.destroy();
                this.fabricCanvas.remove(activeObject);
                
                objects.forEach(obj => {
                    this.fabricCanvas.add(obj);
                });
                
                this.fabricCanvas.renderAll();
                this.addToHistory('Ungrouped objects');
                this.saveCanvasState();
            }
        },

        /**
         * Duplicate selected object
         */
        duplicateObject() {
            const activeObject = this.fabricCanvas.getActiveObject();
            if (!activeObject) return;

            activeObject.clone((cloned) => {
                cloned.set({
                    left: cloned.left + 20,
                    top: cloned.top + 20
                });

                // If it's a table, update the data
                if (cloned.type === 'table' || cloned.tableId) {
                    const originalTable = this.currentSchema.tables.find(t => t.id === activeObject.tableId);
                    if (originalTable) {
                        const newTableData = {
                            ...originalTable,
                            id: 'table_' + Date.now(),
                            name: originalTable.name + '_copy',
                            position: { x: cloned.left, y: cloned.top }
                        };
                        
                        cloned.set({
                            tableId: newTableData.id,
                            tableData: newTableData
                        });
                        
                        this.currentSchema.tables.push(newTableData);
                    }
                }

                this.fabricCanvas.add(cloned);
                this.fabricCanvas.setActiveObject(cloned);
                this.fabricCanvas.renderAll();
                this.addToHistory('Duplicated object');
                this.saveCanvasState();
            });
        },

        /**
         * Toggle relationship drawing mode
         */
        toggleRelationshipMode() {
            this.isDrawingRelationship = !this.isDrawingRelationship;
            
            if (this.isDrawingRelationship) {
                this.fabricCanvas.defaultCursor = 'crosshair';
                this.fabricCanvas.hoverCursor = 'crosshair';
                this.fabricCanvas.selection = false;
                
                // Highlight all tables
                this.highlightTables(true);
            } else {
                this.fabricCanvas.defaultCursor = 'default';
                this.fabricCanvas.hoverCursor = 'move';
                this.fabricCanvas.selection = true;
                
                // Remove highlights
                this.highlightTables(false);
                
                // Clean up any temporary line
                if (this.tempRelationshipLine) {
                    this.fabricCanvas.remove(this.tempRelationshipLine);
                    this.tempRelationshipLine = null;
                }
                
                this.relationshipStartTable = null;
            }
            
            this.fabricCanvas.renderAll();
        },

        /**
         * Highlight tables for relationship drawing
         */
        highlightTables(highlight) {
            const tables = this.fabricCanvas.getObjects().filter(obj => obj.type === 'table' || obj.tableId);
            
            tables.forEach(table => {
                if (highlight) {
                    table.set({
                        stroke: this.isDarkMode ? '#10b981' : '#059669',
                        strokeWidth: 3,
                        shadow: {
                            color: this.isDarkMode ? '#10b981' : '#059669',
                            blur: 10,
                            offsetX: 0,
                            offsetY: 0
                        }
                    });
                } else {
                    table.set({
                        stroke: this.isDarkMode ? '#6b7280' : '#d1d5db',
                        strokeWidth: 1,
                        shadow: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            blur: 5,
                            offsetX: 2,
                            offsetY: 2
                        }
                    });
                }
            });
        },

        /**
         * Handle canvas mouse down for relationship drawing
         */
        handleCanvasMouseDown(e) {
            if (!this.isDrawingRelationship) return;
            
            const target = e.target;
            
            // Check if clicked on a table
            if (target && (target.type === 'table' || target.tableId)) {
                if (!this.relationshipStartTable) {
                    // Start drawing relationship
                    this.relationshipStartTable = target;
                    
                    // Create temporary line
                    const pointer = this.fabricCanvas.getPointer(e.e);
                    const startPoint = this.getOptimalConnectionPoint(target, { getBoundingRect: () => ({ left: pointer.x, top: pointer.y, width: 0, height: 0 }) });
                    
                    this.tempRelationshipLine = new fabric.Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
                        stroke: this.isDarkMode ? '#10b981' : '#059669',
                        strokeWidth: 2,
                        strokeDashArray: [5, 5],
                        selectable: false,
                        evented: false
                    });
                    
                    this.fabricCanvas.add(this.tempRelationshipLine);
                } else if (target !== this.relationshipStartTable) {
                    // End drawing relationship
                    this.createQuickRelationship(this.relationshipStartTable, target);
                    
                    // Clean up
                    if (this.tempRelationshipLine) {
                        this.fabricCanvas.remove(this.tempRelationshipLine);
                        this.tempRelationshipLine = null;
                    }
                    
                    this.relationshipStartTable = null;
                    this.toggleRelationshipMode(); // Exit drawing mode
                }
            }
        },

        /**
         * Handle canvas mouse move for relationship drawing
         */
        handleCanvasMouseMove(e) {
            if (!this.isDrawingRelationship || !this.relationshipStartTable || !this.tempRelationshipLine) return;
            
            const pointer = this.fabricCanvas.getPointer(e.e);
            const startPoint = this.getOptimalConnectionPoint(this.relationshipStartTable, { getBoundingRect: () => ({ left: pointer.x, top: pointer.y, width: 0, height: 0 }) });
            
            this.tempRelationshipLine.set({
                x1: startPoint.x,
                y1: startPoint.y,
                x2: pointer.x,
                y2: pointer.y
            });
            
            this.fabricCanvas.renderAll();
        },

        /**
         * Handle canvas mouse up for relationship drawing
         */
        handleCanvasMouseUp(e) {
            // Currently handled in mouse down
        },

        /**
         * Create quick relationship between two tables
         */
        createQuickRelationship(fromTable, toTable) {
            const relationship = {
                id: 'rel_' + Date.now(),
                from: fromTable.tableId,
                to: toTable.tableId,
                type: 'one-to-many',
                fromColumn: 'id',
                toColumn: this.suggestForeignKeyColumn(fromTable, toTable)
            };

            // Create visual relationship
            this.createRelationshipVisual(relationship);
            
            // Add to schema data
            this.currentSchema.relationships.push(relationship);
            
            this.addToHistory(`Drew relationship: ${this.getTableNameById(relationship.from)} → ${this.getTableNameById(relationship.to)}`);
            this.saveCanvasState();
            this.fabricCanvas.renderAll();
        },

        /**
         * Suggest foreign key column name
         */
        suggestForeignKeyColumn(fromTable, toTable) {
            const fromTableData = this.currentSchema.tables.find(t => t.id === fromTable.tableId);
            const toTableData = this.currentSchema.tables.find(t => t.id === toTable.tableId);
            
            if (!fromTableData || !toTableData) return 'id';
            
            // Look for existing foreign key column
            const foreignKeyColumn = toTableData.columns.find(col => 
                col.name === fromTableData.name + '_id' ||
                col.name === fromTableData.name.slice(0, -1) + '_id' // handle plurals
            );
            
            return foreignKeyColumn ? foreignKeyColumn.name : fromTableData.name + '_id';
        }
    };
}

// Make the component globally available
window.schemaDesigner = schemaDesigner;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Laravel Visual Schema Designer loaded successfully');
});