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

On the Vue side, [`../frontend/src/services/api.js`](../frontend/src/services/api.js) sends credentialed requests and CSRF headers; [`../frontend/src/composables/useCrudResource.js`](../frontend/src/composables/useCrudResource.js) provides shared collection, pagination, pending, validation-error, save, delete, and restore state. Skanošie žesti stores song-relative gesture cues in the composition `content` field as versioned JSON:

```json
{
  "schemaVersion": 3,
  "tempo": 100,
  "timeSignature": { "numerator": 4, "denominator": 4 },
  "cues": [
    { "id": "event-id", "beat": 0, "gesture": "clap" },
    { "id": "next-id", "beat": 2, "gesture": "stomp" }
  ]
}
```

Each cue's `beat` is a zero-based integer beat index from the beginning of the song. Only one cue can occupy a beat; unoccupied beats are pauses. While recording, a gesture is snapped to the nearest available beat, preferring a later beat when equally near. `tempo` is quarter notes per minute (30–240), and `timeSignature` accepts numerators 2–12 and denominators 2, 4, 8, or 16. These settings define beat duration and measure grouping in the presentation; they do not change the uploaded audio. Existing version 2 second-based cues are converted to beats when opened, separating collisions onto available beats. Existing version 1 note-grid exercises are converted to clap cues.

Audio files are uploaded separately using `POST /api/rhythm-exercises/{id}/audio` as `multipart/form-data` with an `audio` file field. MP3, WAV, OGG, M4A, and WEBM files up to 50 MB are accepted. `GET /api/rhythm-exercises/{id}/audio` streams the file with authenticated, owner/admin access; `DELETE` removes it. Audio is stored on Laravel's private local disk, outside the public web root, and is removed when replaced or explicitly deleted. The composition response returns `audio_url` when a song is attached. Teachers need permission to upload and distribute the songs they use.

Skanošie žesti playback follows the uploaded song in the browser, distinguishes the current and next cue (including repeated gestures), and provides a measure-and-beat presentation grid with a return-to-start control. Public sharing remains part of the later library milestone. Krāsainās notis and the classroom-instrument activity are separate roadmap items.
