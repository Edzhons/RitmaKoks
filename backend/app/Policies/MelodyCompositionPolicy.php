<?php

namespace App\Policies;

use App\Models\MelodyComposition;
use App\Models\User;

class MelodyCompositionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MelodyComposition $melodyComposition): bool
    {
        return $user->isAdmin() || $user->is($melodyComposition->user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, MelodyComposition $melodyComposition): bool
    {
        return $user->isAdmin() || $user->is($melodyComposition->user);
    }

    public function delete(User $user, MelodyComposition $melodyComposition): bool
    {
        return $this->update($user, $melodyComposition);
    }

    public function restore(User $user, MelodyComposition $melodyComposition): bool
    {
        return $this->update($user, $melodyComposition);
    }
}
