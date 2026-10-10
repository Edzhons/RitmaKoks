<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug', 'description'])]
class Category extends Model
{
    public function rhythmExercises(): BelongsToMany
    {
        return $this->belongsToMany(RhythmExercise::class);
    }

    public function melodyCompositions(): BelongsToMany
    {
        return $this->belongsToMany(MelodyComposition::class);
    }
}
