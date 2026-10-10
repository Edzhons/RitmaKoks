<?php

namespace App\Policies;

use App\Models\RhythmExercise;
use App\Models\User;

class RhythmExercisePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, RhythmExercise $rhythmExercise): bool
    {
        return $user->isAdmin() || $user->is($rhythmExercise->user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, RhythmExercise $rhythmExercise): bool
    {
        return $user->isAdmin() || $user->is($rhythmExercise->user);
    }

    public function delete(User $user, RhythmExercise $rhythmExercise): bool
    {
        return $this->update($user, $rhythmExercise);
    }

    public function restore(User $user, RhythmExercise $rhythmExercise): bool
    {
        return $this->update($user, $rhythmExercise);
    }
}
