# RitmaKoks backend API

The Laravel API uses JSON responses and Sanctum session cookies for the Vue SPA. Composition and category endpoints require an authenticated user. Set the frontend origin in the backend CORS and Sanctum configuration as described in the root README.

## Composition resources

Both resources follow the same API contract:

| Operation | Rhythm exercises | Melody compositions |
| --- | --- | --- |
| List and search | `GET /api/rhythm-exercises` | `GET /api/melody-compositions` |
| Create | `POST /api/rhythm-exercises` | `POST /api/melody-compositions` |
| View | `GET /api/rhythm-exercises/{id}` | `GET /api/melody-compositions/{id}` |
| Update | `PATCH /api/rhythm-exercises/{id}` | `PATCH /api/melody-compositions/{id}` |
| Soft delete | `DELETE /api/rhythm-exercises/{id}` | `DELETE /api/melody-compositions/{id}` |
| List deleted | `GET /api/rhythm-exercises/trashed` | `GET /api/melody-compositions/trashed` |
| Restore | `POST /api/rhythm-exercises/{id}/restore` | `POST /api/melody-compositions/{id}/restore` |

`GET /api/categories` returns categories available for composition forms.

Create a composition with `title` and a JSON-object `content`; `description` and `category_ids` are optional. Update requests accept the same fields partially. Validation failures use HTTP 422 and Laravel's JSON `message`/`errors` shape, with user-facing messages in Latvian.

Clients may filter lists with `search`, `category_id`, `page`, and `per_page` (1–50; default 15). Ordering is controlled by `sort` (`created_at`, `updated_at`, or `title`) and `direction` (`asc` or `desc`). The list response has a stable shape:

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 0,
    "last_page": 1
  },
  "links": {
    "next": null,
    "previous": null
  }
}
```

Regular users only see and manage their own works; administrators can access all compositions. New works are always assigned to the authenticated user. Clients cannot set ownership, publication status, deletion status, or source attribution. Publishing is reserved for the later library/moderation workflow. Deletion is soft, and each owner's deleted works are listed separately and can be restored.

On the Vue side, [`../frontend/src/services/api.js`](../frontend/src/services/api.js) sends credentialed requests and CSRF headers; [`../frontend/src/composables/useCrudResource.js`](../frontend/src/composables/useCrudResource.js) provides shared collection, pagination, pending, validation-error, save, delete, and restore state. The rhythm editor stores its score in the composition `content` field as versioned JSON:

```json
{
  "schemaVersion": 1,
  "timeSignature": { "numerator": 4, "denominator": 4 },
  "tempo": 90,
  "measureCount": 2,
  "events": [
    { "id": "event-id", "measure": 1, "position": 0, "duration": 4, "kind": "sound" },
    { "id": "rest-id", "measure": 1, "position": 4, "duration": 4, "kind": "rest" }
  ]
}
```

`position` and `duration` are measured in sixteenth-note subdivisions from the start of each measure. Durations supported by the editor are 16, 8, 4, 2, and 1 subdivisions (whole through sixteenth note). Rhythm playback and presentation run in the browser; saved exercises remain private to their owner until the later library/publishing workflow.
