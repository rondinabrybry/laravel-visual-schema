<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schema_designs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->json('data');
            $table->text('description')->nullable();
            $table->string('version')->default('1.0.0');
            $table->json('metadata')->nullable(); // For storing additional info like tags, author, etc.
            $table->timestamps();
            
            $table->index(['name']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schema_designs');
    }
};