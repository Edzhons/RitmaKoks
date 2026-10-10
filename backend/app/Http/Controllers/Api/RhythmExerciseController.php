<?php

namespace App\Http\Controllers\Api;

use App\Models\RhythmExercise;

class RhythmExerciseController extends CompositionController
{
    protected function modelClass(): string
    {
        return RhythmExercise::class;
    }
}
