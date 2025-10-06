<?php

use BryBry\LaravelVisualSchema\Http\Controllers\SchemaDesignerController;
use BryBry\LaravelVisualSchema\Http\Controllers\SchemaApiController;
use Illuminate\Support\Facades\Route;

// Main designer interface
Route::get('/', [SchemaDesignerController::class, 'index'])->name('schema-designer.index');

// API routes for schema operations
Route::prefix('api')->name('api.')->group(function () {
    // Schema CRUD
    Route::get('schemas', [SchemaApiController::class, 'index'])->name('schemas.index');
    Route::post('schemas', [SchemaApiController::class, 'store'])->name('schemas.store');
    Route::get('schemas/{id}', [SchemaApiController::class, 'show'])->name('schemas.show');
    Route::put('schemas/{id}', [SchemaApiController::class, 'update'])->name('schemas.update');
    Route::delete('schemas/{id}', [SchemaApiController::class, 'destroy'])->name('schemas.destroy');
    
    // Export functionality
    Route::post('schemas/{id}/export', [SchemaApiController::class, 'export'])->name('schemas.export');
    
    // Import functionality
    Route::post('schemas/import', [SchemaApiController::class, 'import'])->name('schemas.import');
});

// Signed URL for sharing (if enabled)
Route::get('share/{signature}', [SchemaDesignerController::class, 'share'])
    ->name('schema-designer.share')
    ->middleware('signed');