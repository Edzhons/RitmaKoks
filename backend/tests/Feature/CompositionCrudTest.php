<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\MelodyComposition;
use App\Models\RhythmExercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompositionCrudTest extends TestCase
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

    public function test_composition_endpoints_require_an_authenticated_user(): void
    {
        $this->getJson('/api/rhythm-exercises')->assertUnauthorized();
        $this->postJson('/api/melody-compositions', [])->assertUnauthorized();
        $this->getJson('/api/categories')->assertUnauthorized();
    }

    public function test_rhythm_exercises_support_creation_search_categories_pagination_and_ordering(): void
    {
        $user = User::factory()->create();
        $category = Category::create([
            'name' => 'Pamatritmi',
            'slug' => 'pamatritmi',
        ]);
        $otherCategory = Category::create([
            'name' => 'Sarežģīti ritmi',
            'slug' => 'sarezgitie-ritmi',
        ]);
        $this->actingAs($user);

        $created = $this->postJson('/api/rhythm-exercises', [
            'title' => 'Divdaļu takts',
            'description' => 'Pamatvingrinājums',
            'content' => ['beats' => [['note' => 'quarter']]],
            'category_ids' => [$category->id],
        ])->assertCreated()
            ->assertJsonPath('data.title', 'Divdaļu takts')
            ->assertJsonPath('data.owner.id', $user->id)
            ->assertJsonPath('data.categories.0.id', $category->id)
            ->assertJsonMissingPath('data.published_at');

        $this->postJson('/api/rhythm-exercises', [
            'title' => 'Vingrinājums bez kategorijas',
            'content' => ['beats' => []],
            'category_ids' => [$otherCategory->id],
        ])->assertCreated();

        $this->getJson('/api/rhythm-exercises?search=divda%C4%BCu&category_id='.$category->id.'&per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $created->json('data.id'))
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('meta.last_page', 1);

        $this->getJson('/api/rhythm-exercises?sort=invalid')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('sort');
        $this->getJson('/api/rhythm-exercises?per_page=51')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('per_page');
        $this->getJson('/api/rhythm-exercises?sort=title&direction=asc&per_page=1&page=2')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Vingrinājums bez kategorijas')
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('links.previous', fn (string $url): bool => str_contains($url, 'page=1'));

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('data.0.id', $category->id);
    }

    public function test_melody_composition_updates_synchronize_categories_without_changing_owner(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Melodijas', 'slug' => 'melodijas']);
        $anotherCategory = Category::create(['name' => 'Notis', 'slug' => 'notis']);
        $this->actingAs($user);

        $composition = $this->postJson('/api/melody-compositions', [
            'title' => 'Pirmā melodija',
            'content' => ['notes' => []],
            'category_ids' => [$category->id],
            'user_id' => User::factory()->create()->id,
            'published_at' => now()->toISOString(),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['user_id', 'published_at']);

        $composition = $this->postJson('/api/melody-compositions', [
            'title' => 'Pirmā melodija',
            'content' => ['notes' => [['pitch' => 'C4']]],
            'category_ids' => [$category->id],
        ])->assertCreated();

        $id = $composition->json('data.id');

        $this->patchJson("/api/melody-compositions/{$id}", [
            'title' => 'Atjaunota melodija',
            'content' => ['notes' => [['pitch' => 'D4']]],
            'category_ids' => [$anotherCategory->id],
            'user_id' => User::factory()->create()->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('user_id');

        $this->patchJson("/api/melody-compositions/{$id}", [
            'title' => 'Atjaunota melodija',
            'content' => ['notes' => [['pitch' => 'D4']]],
            'category_ids' => [$anotherCategory->id],
        ])->assertOk()
            ->assertJsonPath('data.title', 'Atjaunota melodija')
            ->assertJsonPath('data.owner.id', $user->id)
            ->assertJsonPath('data.categories.0.id', $anotherCategory->id);

        $this->patchJson("/api/melody-compositions/{$id}", [
            'description' => 'Daļēji atjaunots apraksts',
        ])->assertOk()
            ->assertJsonPath('data.title', 'Atjaunota melodija')
            ->assertJsonPath('data.description', 'Daļēji atjaunots apraksts')
            ->assertJsonPath('data.categories.0.id', $anotherCategory->id);

        $this->assertDatabaseHas('melody_compositions', [
            'id' => $id,
            'user_id' => $user->id,
        ]);
    }

    public function test_composition_validation_rejects_missing_fields_unknown_categories_and_duplicates(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/rhythm-exercises', [
                'title' => '',
                'content' => 'not an object',
                'category_ids' => [999, 999],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title',
                'content',
                'category_ids.0',
                'category_ids.1',
            ]);
    }

    public function test_users_can_only_view_update_delete_and_restore_their_own_work(): void
    {
        $owner = User::factory()->create();
        $anotherUser = User::factory()->create();
        $exercise = RhythmExercise::create([
            'user_id' => $owner->id,
            'title' => 'Privāts vingrinājums',
            'content' => ['beats' => []],
        ]);
        $exercise->delete();
        $activeExercise = RhythmExercise::create([
            'user_id' => $owner->id,
            'title' => 'Aktīvs privāts vingrinājums',
            'content' => ['beats' => []],
        ]);
        $this->actingAs($anotherUser);

        $this->getJson('/api/rhythm-exercises')
            ->assertOk()
            ->assertJsonCount(0, 'data');
        $this->getJson('/api/rhythm-exercises/trashed')
            ->assertOk()
            ->assertJsonCount(0, 'data');
        $this->getJson("/api/rhythm-exercises/{$activeExercise->id}")->assertForbidden();
        $this->patchJson("/api/rhythm-exercises/{$activeExercise->id}", ['title' => 'Pārņemts'])
            ->assertForbidden();
        $this->deleteJson("/api/rhythm-exercises/{$activeExercise->id}")->assertForbidden();
        $this->postJson("/api/rhythm-exercises/{$exercise->id}/restore")->assertForbidden();

        $this->assertDatabaseHas('rhythm_exercises', [
            'id' => $exercise->id,
            'title' => 'Privāts vingrinājums',
        ]);
        $this->assertNotNull($exercise->fresh()->deleted_at);
        $this->assertNull($activeExercise->fresh()->deleted_at);
    }

    public function test_soft_deleted_work_is_listed_separately_and_can_be_restored_by_its_owner(): void
    {
        $user = User::factory()->create();
        $exercise = RhythmExercise::create([
            'user_id' => $user->id,
            'title' => 'Atjaunojams ritms',
            'content' => ['beats' => []],
        ]);
        $this->actingAs($user);

        $this->deleteJson("/api/rhythm-exercises/{$exercise->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Darbs pārvietots uz dzēsto darbu sarakstu.');

        $this->getJson('/api/rhythm-exercises')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/rhythm-exercises/trashed')
            ->assertOk()
            ->assertJsonPath('data.0.id', $exercise->id);

        $this->postJson("/api/rhythm-exercises/{$exercise->id}/restore")
            ->assertOk()
            ->assertJsonPath('data.id', $exercise->id);

        $this->assertNull($exercise->fresh()->deleted_at);
        $this->getJson('/api/rhythm-exercises')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/rhythm-exercises/trashed')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_administrators_can_moderate_owned_work_and_list_all_compositions(): void
    {
        $owner = User::factory()->create();
        $exercise = RhythmExercise::create([
            'user_id' => $owner->id,
            'title' => 'Skolotāja vingrinājums',
            'content' => ['beats' => []],
        ]);
        $admin = User::factory()->create();
        $admin->forceFill(['role' => UserRole::Admin])->save();
        $this->actingAs($admin);

        $this->getJson('/api/rhythm-exercises')
            ->assertOk()
            ->assertJsonCount(1, 'data');
        $this->patchJson("/api/rhythm-exercises/{$exercise->id}", ['title' => 'Moderēts darbs'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Moderēts darbs');
    }

    public function test_both_resource_types_support_soft_delete_and_restore(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        foreach ([
            ['/api/rhythm-exercises', RhythmExercise::class],
            ['/api/melody-compositions', MelodyComposition::class],
        ] as [$endpoint, $modelClass]) {
            $response = $this->postJson($endpoint, [
                'title' => 'Darbs atjaunošanai',
                'content' => ['items' => []],
            ])->assertCreated();

            $id = $response->json('data.id');

            $this->deleteJson("{$endpoint}/{$id}")->assertOk();
            $this->postJson("{$endpoint}/{$id}/restore")
                ->assertOk()
                ->assertJsonPath('data.id', $id);

            $this->assertDatabaseHas((new $modelClass)->getTable(), [
                'id' => $id,
                'deleted_at' => null,
            ]);
        }
    }
}
