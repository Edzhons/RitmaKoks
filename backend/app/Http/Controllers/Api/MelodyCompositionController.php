<?php

namespace App\Http\Controllers\Api;

use App\Models\MelodyComposition;

class MelodyCompositionController extends CompositionController
{
    protected function modelClass(): string
    {
        return MelodyComposition::class;
    }
}
