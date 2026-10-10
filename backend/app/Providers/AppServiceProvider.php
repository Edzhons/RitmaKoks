<?php

namespace App\Providers;

use App\Models\MelodyComposition;
use App\Models\RhythmExercise;
use App\Models\User;
use App\Policies\MelodyCompositionPolicy;
use App\Policies\RhythmExercisePolicy;
use App\Policies\UserPolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(RhythmExercise::class, RhythmExercisePolicy::class);
        Gate::policy(MelodyComposition::class, MelodyCompositionPolicy::class);

        ResetPassword::createUrlUsing(
            fn (User $user, string $token): string => config('app.frontend_url')
                .'/password/reset?token='.urlencode($token)
                .'&email='.urlencode($user->getEmailForPasswordReset()),
        );
    }
}
