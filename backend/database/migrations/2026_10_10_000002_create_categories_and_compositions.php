<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('rhythm_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('source_rhythm_exercise_id')
                ->nullable()
                ->constrained('rhythm_exercises')
                ->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('content');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['user_id', 'deleted_at']);
            $table->index(['published_at', 'created_at']);
        });

        Schema::create('melody_compositions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('source_melody_composition_id')
                ->nullable()
                ->constrained('melody_compositions')
                ->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('content');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['user_id', 'deleted_at']);
            $table->index(['published_at', 'created_at']);
        });

        Schema::create('category_rhythm_exercise', function (Blueprint $table) {
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rhythm_exercise_id')->constrained()->cascadeOnDelete();
            $table->primary(['category_id', 'rhythm_exercise_id']);
        });

        Schema::create('category_melody_composition', function (Blueprint $table) {
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('melody_composition_id')->constrained()->cascadeOnDelete();
            $table->primary(['category_id', 'melody_composition_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_melody_composition');
        Schema::dropIfExists('category_rhythm_exercise');
        Schema::dropIfExists('melody_compositions');
        Schema::dropIfExists('rhythm_exercises');
        Schema::dropIfExists('categories');
    }
};
