<?php

namespace App\Http\Resources;

use App\Models\RhythmExercise;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompositionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'content' => $this->content,
            'audio_url' => $this->resource instanceof RhythmExercise && $this->audio_path
                ? route('api.rhythm-exercises.audio.show', $this->id)
                : null,
            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map(fn ($category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ])->values()),
            'owner' => $this->whenLoaded('user', fn (): array => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
