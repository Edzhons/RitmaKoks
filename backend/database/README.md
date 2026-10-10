# Database schema

The initial schema separates rhythm exercises from melody compositions. Each editor stores its evolving document as JSON; fields used for ownership, publishing, attribution, and library filtering remain relational.

```mermaid
erDiagram
    USERS ||--o{ RHYTHM_EXERCISES : owns
    USERS ||--o{ MELODY_COMPOSITIONS : owns
    RHYTHM_EXERCISES o|--o{ RHYTHM_EXERCISES : copied_from
    MELODY_COMPOSITIONS o|--o{ MELODY_COMPOSITIONS : copied_from
    CATEGORIES ||--o{ CATEGORY_RHYTHM_EXERCISE : classifies
    RHYTHM_EXERCISES ||--o{ CATEGORY_RHYTHM_EXERCISE : categorized_as
    CATEGORIES ||--o{ CATEGORY_MELODY_COMPOSITION : classifies
    MELODY_COMPOSITIONS ||--o{ CATEGORY_MELODY_COMPOSITION : categorized_as

    USERS {
        bigint id PK
        string name
        string email UK
        enum role "user or admin; defaults to user"
    }
    CATEGORIES {
        bigint id PK
        string name UK
        string slug UK
        text description
    }
    RHYTHM_EXERCISES {
        bigint id PK
        bigint user_id FK
        bigint source_rhythm_exercise_id FK "nullable"
        string title
        text description
        json content
        timestamp published_at "nullable; private until set"
        timestamp deleted_at "soft delete"
    }
    MELODY_COMPOSITIONS {
        bigint id PK
        bigint user_id FK
        bigint source_melody_composition_id FK "nullable"
        string title
        text description
        json content
        timestamp published_at "nullable; private until set"
        timestamp deleted_at "soft delete"
    }
    CATEGORY_RHYTHM_EXERCISE {
        bigint category_id PK, FK
        bigint rhythm_exercise_id PK, FK
    }
    CATEGORY_MELODY_COMPOSITION {
        bigint category_id PK, FK
        bigint melody_composition_id PK, FK
    }
```

## Design notes

- The `users.role` enum supports `user` and `admin`; new accounts default to `user`.
- Rhythm and melody editor state is stored as structured JSON so the editor can evolve without a migration for every note or beat. Frequently filtered fields stay in indexed relational columns.
- A non-null `published_at` marks a public composition. New compositions are private; unpublishing clears the timestamp.
- Category joins allow a composition to have zero or more categories.
- A copied composition is a new, independently editable row. Its nullable self-reference preserves attribution; deleting the original permanently clears that reference.
- Compositions use soft deletion for later moderation and restoration. Categories and accounts are not soft-deleted in this initial schema.
- Deleting an account permanently cascades its compositions; deleting a category removes its category links. These actions are separate from the composition soft-delete workflow.
- `content` is the editor document, including rhythm/notation-specific values such as time signature, tempo, measures, notes, and rests. The application layer will validate its shape when the editors are implemented.
- The seeder adds one neutral `General` category and creates no default user account.

## Local database

Create a local MySQL database named `ritmakoks`, then configure `backend/.env` with its connection settings. Do not commit `.env`.

Run the schema and seed the default category:

```powershell
cd backend
php artisan migrate --seed
```

Reset a local development database and reseed it with:

```powershell
php artisan migrate:fresh --seed
```

`migrate:fresh` drops every table in the configured database; use it only with the disposable local development database.
