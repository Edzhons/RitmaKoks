<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RhythmAudioRequest;
use App\Http\Resources\CompositionResource;
use App\Models\RhythmExercise;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class RhythmAudioController extends Controller
{
    public function store(RhythmAudioRequest $request, int $composition): JsonResponse
    {
        $exercise = RhythmExercise::findOrFail($composition);
        Gate::authorize('update', $exercise);

        $disk = Storage::disk('local');
        $previousPath = $exercise->audio_path;
        $path = $request->file('audio')->store(
            "rhythm-audio/{$exercise->user_id}/{$exercise->id}",
            'local',
        );

        if ($path === false) {
            abort(500, 'Dziesmas audio failu neizdevās saglabāt.');
        }

        try {
            $exercise->audio_path = $path;
            $exercise->save();
        } catch (Throwable $error) {
            $disk->delete($path);

            throw $error;
        }

        if ($previousPath && $previousPath !== $path) {
            $disk->delete($previousPath);
        }

        return response()->json([
            'message' => 'Dziesmas audio fails saglabāts.',
            'data' => (new CompositionResource($exercise->load(['categories', 'user'])))->resolve(),
        ]);
    }

    public function show(int $composition): BinaryFileResponse
    {
        $exercise = RhythmExercise::findOrFail($composition);
        Gate::authorize('view', $exercise);

        abort_if(! $exercise->audio_path, 404, 'Šim vingrinājumam nav pievienota dziesma.');

        $disk = Storage::disk('local');
        abort_if(! $disk->exists($exercise->audio_path), 404, 'Dziesmas audio fails nav atrasts.');

        $response = response()->file($disk->path($exercise->audio_path), [
            'Content-Type' => $disk->mimeType($exercise->audio_path) ?: 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
        ]);
        $response->setPrivate();
        $response->headers->addCacheControlDirective('no-store');

        return $response;
    }

    public function destroy(int $composition): JsonResponse
    {
        $exercise = RhythmExercise::findOrFail($composition);
        Gate::authorize('update', $exercise);

        if ($exercise->audio_path) {
            Storage::disk('local')->delete($exercise->audio_path);
            $exercise->audio_path = null;
            $exercise->save();
        }

        return response()->json([
            'message' => 'Dziesmas audio fails noņemts.',
            'data' => (new CompositionResource($exercise->load(['categories', 'user'])))->resolve(),
        ]);
    }
}
