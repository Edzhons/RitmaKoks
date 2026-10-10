<?php

namespace Tests\Feature;

use App\Models\RhythmExercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RhythmAudioTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Referer' => 'http://localhost:5173/',
        ]);

        Storage::fake('local');
    }

    public function test_owner_can_upload_and_stream_private_rhythm_audio(): void
    {
        $user = User::factory()->create();
        $exercise = $this->createExercise($user);
        $this->actingAs($user);

        $upload = $this->postJson("/api/rhythm-exercises/{$exercise->id}/audio", [
            'audio' => UploadedFile::fake()->create('dziesma.mp3', 4, 'audio/mpeg'),
        ])->assertOk()
            ->assertJsonPath('message', 'Dziesmas audio fails saglabāts.')
            ->assertJsonPath('data.id', $exercise->id);

        $audioPath = $exercise->fresh()->audio_path;
        $this->assertNotNull($audioPath);
        Storage::disk('local')->assertExists($audioPath);

        $audioUrl = $upload->json('data.audio_url');
        $this->get($audioUrl)
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeaderContains('Cache-Control', 'private')
            ->assertHeaderContains('Cache-Control', 'no-store');

        $this->actingAs(User::factory()->create())
            ->get($audioUrl)
            ->assertForbidden();
    }

    public function test_audio_upload_rejects_unsupported_files_and_oversized_files(): void
    {
        $user = User::factory()->create();
        $exercise = $this->createExercise($user);
        $this->actingAs($user);

        $this->postJson("/api/rhythm-exercises/{$exercise->id}/audio", [
            'audio' => UploadedFile::fake()->create('program.exe', 5, 'application/x-msdownload'),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('audio');

        $this->postJson("/api/rhythm-exercises/{$exercise->id}/audio", [
            'audio' => UploadedFile::fake()->create('parliels.mp3', 51201, 'audio/mpeg'),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('audio');
    }

    public function test_audio_upload_and_removal_require_the_composition_owner(): void
    {
        $owner = User::factory()->create();
        $exercise = $this->createExercise($owner);
        $this->actingAs(User::factory()->create());

        $this->postJson("/api/rhythm-exercises/{$exercise->id}/audio", [
            'audio' => UploadedFile::fake()->create('dziesma.mp3', 4, 'audio/mpeg'),
        ])->assertForbidden();

        $this->deleteJson("/api/rhythm-exercises/{$exercise->id}/audio")
            ->assertForbidden();
    }

    public function test_owner_can_replace_and_remove_saved_audio(): void
    {
        $user = User::factory()->create();
        $exercise = $this->createExercise($user);
        $this->actingAs($user);

        $this->postJson("/api/rhythm-exercises/{$exercise->id}/audio", [
            'audio' => UploadedFile::fake()->create('pirma.mp3', 4, 'audio/mpeg'),
        ])->assertOk();
        $firstPath = $exercise->fresh()->audio_path;

        $this->postJson("/api/rhythm-exercises/{$exercise->id}/audio", [
            'audio' => UploadedFile::fake()->create('otra.wav', 4, 'audio/wav'),
        ])->assertOk();
        $secondPath = $exercise->fresh()->audio_path;

        $this->assertNotSame($firstPath, $secondPath);
        Storage::disk('local')->assertMissing($firstPath);
        Storage::disk('local')->assertExists($secondPath);

        $this->deleteJson("/api/rhythm-exercises/{$exercise->id}/audio")
            ->assertOk()
            ->assertJsonPath('message', 'Dziesmas audio fails noņemts.')
            ->assertJsonPath('data.audio_url', null);

        Storage::disk('local')->assertMissing($secondPath);
        $this->assertNull($exercise->fresh()->audio_path);
    }

    private function createExercise(User $owner): RhythmExercise
    {
        return RhythmExercise::create([
            'user_id' => $owner->id,
            'title' => 'Skanošie žesti',
            'content' => ['schemaVersion' => 2, 'cues' => []],
        ]);
    }
}
