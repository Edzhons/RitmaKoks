<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{
    public function show(): UserResource
    {
        return new UserResource(request()->user());
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $user->fill($request->safe()->only('name', 'email'));

        if ($request->user()->isAdmin() && $request->safe()->has('role')) {
            $user->role = $request->validated('role');
        }

        $user->save();

        return new UserResource($user);
    }
}
