<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\MelodyComposition;
use App\Models\RhythmExercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_default_to_the_regular_user_role(): void
    {
        $user = User::factory()->create();

        $this->assertSame(UserRole::User, $user->role);

        $user->update(['role' => UserRole::Admin]);

        $this->assertSame(UserRole::Admin, $user->refresh()->role);
    }

    public function test_rhythm_exercise_copies_keep_attribution_and_are_independent(): void
    {
        $author = User::factory()->create();
        $copyOwner = User::factory()->create();
        $category = Category::create([
            'name' => 'Beginner',
            'slug' => 'beginner',
        ]);
        $source = RhythmExercise::create([
            'user_id' => $author->id,
            'title' => 'Original rhythm',
            'content' => ['tempo' => 90, 'measures' => []],
        ]);
        $source->categories()->attach($category);

        $copy = RhythmExercise::create([
            'user_id' => $copyOwner->id,
            'source_rhythm_exercise_id' => $source->id,
            'title' => 'My rhythm',
            'content' => ['tempo' => 120, 'measures' => []],
        ]);

        $this->assertNull($source->published_at);
        $this->assertSame($author->id, $source->user->id);
        $this->assertSame($source->id, $copy->source->id);
        $this->assertSame(120, $copy->content['tempo']);
        $this->assertSame(90, $source->content['tempo']);
        $this->assertCount(1, $source->categories);

        $source->delete();
        $this->assertTrue($copy->refresh()->source->trashed());
    }

    public function test_melody_compositions_support_multiple_categories(): void
    {
        $owner = User::factory()->create();
        $composition = MelodyComposition::create([
            'user_id' => $owner->id,
            'title' => 'First melody',
            'content' => ['notes' => []],
            'published_at' => now(),
        ]);
        $categories = collect([
            ['name' => 'Beginner', 'slug' => 'beginner'],
            ['name' => 'Practice', 'slug' => 'practice'],
        ])->map(fn (array $attributes) => Category::create($attributes));

        $composition->categories()->attach($categories->pluck('id'));

        $this->assertSame($owner->id, $composition->user->id);
        $this->assertNotNull($composition->published_at);
        $this->assertCount(2, $composition->categories);
    }

    public function test_database_seeder_creates_the_general_category_idempotently(): void
    {
        $this->seed();
        $this->seed();

        $this->assertDatabaseHas('categories', [
            'name' => 'General',
            'slug' => 'general',
        ]);
        $this->assertSame(1, Category::where('slug', 'general')->count());
        $this->assertDatabaseCount('users', 0);
    }
}
