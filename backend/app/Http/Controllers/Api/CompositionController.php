<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompositionIndexRequest;
use App\Http\Requests\CompositionRequest;
use App\Http\Resources\CompositionResource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

abstract class CompositionController extends Controller
{
    /**
     * @return class-string<Model>
     */
    abstract protected function modelClass(): string;

    public function index(CompositionIndexRequest $request): JsonResponse
    {
        Gate::authorize('viewAny', $this->modelClass());

        return $this->paginatedResponse($this->queryForOwner($request)->paginate(
            $request->integer('per_page', 15),
        ));
    }

    public function trashed(CompositionIndexRequest $request): JsonResponse
    {
        Gate::authorize('viewAny', $this->modelClass());

        $query = $this->queryForOwner($request, withTrashed: true)->onlyTrashed();

        return $this->paginatedResponse($query->paginate($request->integer('per_page', 15)));
    }

    public function store(CompositionRequest $request): JsonResponse
    {
        Gate::authorize('create', $this->modelClass());
        $attributes = $request->safe()->only(['title', 'description', 'content']);

        $composition = DB::transaction(function () use ($request, $attributes): Model {
            $modelClass = $this->modelClass();
            $composition = $modelClass::create([
                ...$attributes,
                'user_id' => $request->user()->id,
            ]);

            $composition->categories()->sync($request->validated('category_ids', []));

            return $composition;
        });

        return (new CompositionResource($composition->load(['categories', 'user'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $composition): CompositionResource
    {
        $model = $this->findComposition($composition);
        Gate::authorize('view', $model);

        return new CompositionResource($model->load(['categories', 'user']));
    }

    public function update(CompositionRequest $request, int $composition): CompositionResource
    {
        $model = $this->findComposition($composition);
        Gate::authorize('update', $model);

        DB::transaction(function () use ($request, $model): void {
            $model->fill($request->safe()->only(['title', 'description', 'content']));
            $model->save();

            if ($request->safe()->has('category_ids')) {
                $model->categories()->sync($request->validated('category_ids'));
            }
        });

        return new CompositionResource($model->load(['categories', 'user']));
    }

    public function destroy(int $composition): JsonResponse
    {
        $model = $this->findComposition($composition);
        Gate::authorize('delete', $model);
        $model->delete();

        return response()->json(['message' => 'Darbs pārvietots uz dzēsto darbu sarakstu.']);
    }

    public function restore(int $composition): CompositionResource
    {
        $model = $this->findTrashedComposition($composition);
        Gate::authorize('restore', $model);
        $model->restore();

        return new CompositionResource($model->load(['categories', 'user']));
    }

    /**
     * @return Builder<Model>
     */
    private function queryForOwner(CompositionIndexRequest $request, bool $withTrashed = false): Builder
    {
        $modelClass = $this->modelClass();
        $query = $modelClass::query()->with(['categories', 'user']);

        if ($withTrashed) {
            $query->withTrashed();
        }

        if (! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($search = $request->validated('search')) {
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->validated('category_id')) {
            $query->whereHas('categories', fn (Builder $builder) => $builder->whereKey($categoryId));
        }

        $sort = $request->validated('sort', 'created_at');
        $direction = $request->validated('direction', 'desc');

        return $query->orderBy($sort, $direction)->orderBy('id', 'desc');
    }

    private function findComposition(int $id): Model
    {
        $modelClass = $this->modelClass();
        $model = $modelClass::query()->with(['categories', 'user'])->find($id);

        abort_if($model === null, 404);

        return $model;
    }

    private function findTrashedComposition(int $id): Model
    {
        $modelClass = $this->modelClass();
        $model = $modelClass::onlyTrashed()->with(['categories', 'user'])->find($id);

        abort_if($model === null, 404, 'Dzēstais darbs nav atrasts.');

        return $model;
    }

    private function paginatedResponse(LengthAwarePaginator $paginator): JsonResponse
    {
        return response()->json([
            'data' => CompositionResource::collection($paginator->getCollection())->resolve(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
            'links' => [
                'next' => $paginator->nextPageUrl(),
                'previous' => $paginator->previousPageUrl(),
            ],
        ]);
    }
}
