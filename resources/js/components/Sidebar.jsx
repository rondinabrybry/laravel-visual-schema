import React, { useState } from 'react';

export function Sidebar({ 
    isOpen, 
    onClose, 
    schemas, 
    currentSchema, 
    onNewSchema, 
    onLoadSchema, 
    onUpdateSchemaName,
    isDarkMode 
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(currentSchema?.name || '');

    const filteredSchemas = schemas.filter(schema => 
        schema.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNameEdit = () => {
        if (editName.trim() && editName !== currentSchema.name) {
            onUpdateSchemaName(editName.trim());
        }
        setIsEditingName(false);
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                ></div>
            )}
            
            {/* Sidebar */}
            <div className={`sidebar fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                            Schema Designer
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Current Schema Name */}
                    {currentSchema && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Current Schema
                            </label>
                            {isEditingName ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={handleNameEdit}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleNameEdit();
                                            }
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div
                                    onClick={() => {
                                        setEditName(currentSchema.name);
                                        setIsEditingName(true);
                                    }}
                                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
                                >
                                    {currentSchema.name}
                                </div>
                            )}
                        </div>
                    )}

                    {/* New Schema Button */}
                    <button
                        onClick={onNewSchema}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Schema
                    </button>
                </div>

                {/* Schema List */}
                <div className="flex-1 overflow-y-auto">
                    {/* Search */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search schemas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Schemas */}
                    <div className="p-4">
                        {filteredSchemas.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'No schemas found' : 'No schemas yet'}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredSchemas.map(schema => (
                                    <SchemaCard
                                        key={schema.id}
                                        schema={schema}
                                        isActive={currentSchema?.id === schema.id}
                                        onLoad={() => onLoadSchema(schema.id)}
                                        isDarkMode={isDarkMode}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Laravel Visual Schema Designer
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                        Press Ctrl+S to save • Ctrl+Z to undo
                    </div>
                </div>
            </div>
        </>
    );
}

function SchemaCard({ schema, isActive, onLoad, isDarkMode }) {
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Unknown';
        }
    };

    return (
        <div
            onClick={onLoad}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                isActive
                    ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
        >
            <div className={`font-medium ${
                isActive 
                    ? 'text-blue-800 dark:text-blue-200' 
                    : 'text-gray-800 dark:text-white'
            }`}>
                {schema.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Updated {formatDate(schema.updated_at)}
            </div>
            {schema.id === null && (
                <div className="text-xs text-orange-500 mt-1">
                    • Unsaved
                </div>
            )}
        </div>
    );
}