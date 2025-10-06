<?php

namespace BryBry\LaravelVisualSchema\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SchemaDesign extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'data',
        'description',
        'version',
        'metadata'
    ];

    protected $casts = [
        'data' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Get the primary key type.
     */
    public function getKeyType(): string
    {
        return 'string';
    }

    /**
     * Get the auto-incrementing key type.
     */
    public function getIncrementing(): bool
    {
        return false;
    }

    /**
     * Scope for searching by name
     */
    public function scopeSearch($query, $term)
    {
        return $query->where('name', 'like', '%' . $term . '%');
    }

    /**
     * Get table count from schema data
     */
    public function getTableCountAttribute(): int
    {
        return count($this->data['tables'] ?? []);
    }

    /**
     * Get relationship count from schema data
     */
    public function getRelationshipCountAttribute(): int
    {
        return count($this->data['relationships'] ?? []);
    }
}