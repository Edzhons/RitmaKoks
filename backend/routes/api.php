<?php

use App\Http\Controllers\Api\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Api\Auth\NewPasswordController;
use App\Http\Controllers\Api\Auth\PasswordResetLinkController;
use App\Http\Controllers\Api\Auth\RegisteredUserController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MelodyCompositionController;
use App\Http\Controllers\Api\RhythmAudioController;
use App\Http\Controllers\Api\RhythmExerciseController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::post('/register', [RegisteredUserController::class, 'store'])->middleware('throttle:6,1');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('throttle:6,1');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->middleware('throttle:3,1');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])->middleware('throttle:6,1');
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [UserController::class, 'show']);
    Route::patch('/users/{user}', [UserController::class, 'update']);
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/rhythm-exercises/{composition}/audio', [RhythmAudioController::class, 'store'])
        ->whereNumber('composition')
        ->name('api.rhythm-exercises.audio.store');
    Route::get('/rhythm-exercises/{composition}/audio', [RhythmAudioController::class, 'show'])
        ->whereNumber('composition')
        ->name('api.rhythm-exercises.audio.show');
    Route::delete('/rhythm-exercises/{composition}/audio', [RhythmAudioController::class, 'destroy'])
        ->whereNumber('composition')
        ->name('api.rhythm-exercises.audio.destroy');

    foreach ([
        'rhythm-exercises' => RhythmExerciseController::class,
        'melody-compositions' => MelodyCompositionController::class,
    ] as $resource => $controller) {
        Route::get("/{$resource}/trashed", [$controller, 'trashed']);
        Route::post("/{$resource}/{composition}/restore", [$controller, 'restore'])
            ->whereNumber('composition');
        Route::get("/{$resource}", [$controller, 'index']);
        Route::post("/{$resource}", [$controller, 'store']);
        Route::get("/{$resource}/{composition}", [$controller, 'show'])
            ->whereNumber('composition');
        Route::patch("/{$resource}/{composition}", [$controller, 'update'])
            ->whereNumber('composition');
        Route::delete("/{$resource}/{composition}", [$controller, 'destroy'])
            ->whereNumber('composition');
    }
});
