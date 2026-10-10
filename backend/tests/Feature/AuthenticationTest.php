<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Referer' => 'http://localhost:5173/',
        ]);
    }

    public function test_registration_creates_a_regular_user_and_starts_a_session(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Testa Lietotājs',
            'email' => 'teacher@example.com',
            'password' => 'very-secure-password',
            'password_confirmation' => 'very-secure-password',
            'role' => 'admin',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Testa Lietotājs')
            ->assertJsonPath('data.role', UserRole::User->value)
            ->assertJsonMissingPath('data.password')
            ->assertJsonMissingPath('data.remember_token');

        $user = User::where('email', 'teacher@example.com')->firstOrFail();
        $this->assertSame(UserRole::User, $user->role);
        $this->assertAuthenticatedAs($user);
    }

    public function test_registration_validates_password_and_email(): void
    {
        $this->postJson('/api/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_login_and_logout_use_the_web_session(): void
    {
        $user = User::factory()->create([
            'email' => 'teacher@example.com',
            'password' => 'very-secure-password',
        ]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'very-secure-password',
        ])->assertOk()->assertJsonPath('data.id', $user->id);

        $this->getJson('/api/user')->assertOk()->assertJsonPath('data.email', $user->email);

        $this->postJson('/api/logout')->assertOk();
        Auth::forgetGuards();
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_login_rejects_invalid_credentials_with_a_latvian_validation_error(): void
    {
        User::factory()->create(['email' => 'teacher@example.com']);

        $this->postJson('/api/login', [
            'email' => 'teacher@example.com',
            'password' => 'incorrect-password',
        ])->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'E-pasta adrese vai parole nav pareiza.');
    }

    public function test_users_can_update_their_profile_but_cannot_escalate_their_role(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->patchJson("/api/users/{$user->id}", [
            'name' => 'Jauns vārds',
            'role' => 'admin',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('role');

        $this->patchJson("/api/users/{$user->id}", [
            'name' => 'Jauns vārds',
        ])->assertOk()->assertJsonPath('data.name', 'Jauns vārds');

        $this->assertSame(UserRole::User, $user->fresh()->role);
    }

    public function test_admin_can_manage_user_roles_and_users_cannot_edit_another_account(): void
    {
        $user = User::factory()->create();
        $anotherUser = User::factory()->create();

        $this->actingAs($user)
            ->patchJson("/api/users/{$anotherUser->id}", ['name' => 'Neatļauta maiņa'])
            ->assertForbidden();

        $admin = User::factory()->create();
        $admin->forceFill(['role' => UserRole::Admin])->save();

        $this->actingAs($admin)
            ->patchJson("/api/users/{$user->id}", ['role' => UserRole::Admin->value])
            ->assertOk()
            ->assertJsonPath('data.role', UserRole::Admin->value);
    }

    public function test_password_reset_link_is_sent_without_exposing_account_existence(): void
    {
        app()->setLocale('lv');
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Ja konts ar norādīto e-pasta adresi eksistē, uz to nosūtīta paroles atjaunošanas saite.',
            );

        Notification::assertSentTo($user, ResetPassword::class);

        $notification = Notification::sent($user, ResetPassword::class)->first();
        $mail = $notification->toMail($user);
        $this->assertSame('Atjauno savu paroli', $mail->subject);
        $this->assertStringContainsString('/password/reset?token=', $mail->actionUrl);

        $this->postJson('/api/forgot-password', ['email' => 'missing@example.com'])
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Ja konts ar norādīto e-pasta adresi eksistē, uz to nosūtīta paroles atjaunošanas saite.',
            );
    }

    public function test_password_reset_changes_the_password_and_invalidates_the_token(): void
    {
        $user = User::factory()->create(['email' => 'teacher@example.com']);
        $token = Password::createToken($user);

        $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])->assertOk();

        $this->assertTrue(password_verify('new-secure-password', $user->fresh()->password));

        $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'another-secure-password',
            'password_confirmation' => 'another-secure-password',
        ])->assertUnprocessable();
    }

    public function test_user_policy_limits_access_to_owners_and_admins(): void
    {
        $user = User::factory()->create();
        $anotherUser = User::factory()->create();
        $admin = User::factory()->create();
        $admin->forceFill(['role' => UserRole::Admin])->save();

        $this->assertTrue(Gate::forUser($user)->allows('view', $user));
        $this->assertFalse(Gate::forUser($user)->allows('view', $anotherUser));
        $this->assertTrue(Gate::forUser($admin)->allows('viewAny', User::class));
        $this->assertTrue(Gate::forUser($admin)->allows('delete', $anotherUser));
    }
}
