# Backend Database Schema & API Requirements

This document outlines the database schema and API endpoints required to support the TVK App's gaming and leaderboard features.

## 1. Database Schema

### Existing Tables (Refined)

#### `users`
Standard Laravel users table with profile fields.

```php
Schema::create('users', function (Blueprint $table) {
    $table->bigIncrements('id');
    $table->string('name'); // Username
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->string('avatar')->nullable(); // URL to avatar image
    
    // Membership Tier
    $table->enum('membership_tier', ['free', 'super_fan'])->default('free');
    
    $table->rememberToken();
    $table->timestamps();
});
```

#### `games`
Stores metadata about each game, including trophy thresholds.

```php
Schema::create('games', function (Blueprint $table) {
    $table->bigIncrements('id');
    $table->string('name'); // e.g., "Space Invaders", "City Defender"
    $table->text('description')->nullable();
    $table->boolean('is_premium')->default(false);
    $table->text('rules')->nullable();
    
    // CRITICAL: 'meta' must store trophy thresholds
    // Example: {"trophy_thresholds": {"BRONZE": 500, "SILVER": 1000, "GOLD": 2000, "PLATINUM": 5000}}
    $table->json('meta')->nullable(); 
    
    $table->unsignedBigInteger('created_by');
    $table->timestamps();

    $table->foreign('created_by')->references('id')->on('users');
});
```

#### `game_participants` (Game Sessions)
Records every game session played by a user.

```php
Schema::create('game_participants', function (Blueprint $table) {
    $table->bigIncrements('id');
    $table->unsignedBigInteger('game_id');
    $table->unsignedBigInteger('user_id');
    $table->integer('score')->default(0);
    $table->integer('coins')->default(0); // Coins earned in this specific session
    
    // Store game-specific stats here
    // Example: {"waves_cleared": 5, "accuracy": "90%", "lives_left": 2}
    $table->json('data')->nullable();
    
    $table->enum('status', ['pending', 'active', 'finished'])->default('pending');
    $table->timestamps();

    $table->foreign('game_id')->references('id')->on('games');
    $table->foreign('user_id')->references('id')->on('users');
});
```

### New Required Tables

#### `user_trophies`
Tracks the highest trophy tier earned by a user for each game. This is essential for the leaderboard.

```php
Schema::create('user_trophies', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id');
    $table->unsignedBigInteger('game_id');
    
    // The tier achieved
    $table->enum('tier', ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']);
    
    // The score that triggered this trophy
    $table->integer('score_at_time_of_earning'); 
    
    $table->timestamps();

    $table->foreign('user_id')->references('id')->on('users');
    $table->foreign('game_id')->references('id')->on('games');
    
    // Constraint: A user can only have one entry per game per tier 
    // (Or simplify to just store the highest tier per game)
    $table->unique(['user_id', 'game_id', 'tier']); 
});
```

#### `user_wallets` (Optional / If not exists)
To store the user's total coin balance.

```php
Schema::create('user_wallets', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id');
    $table->integer('balance')->default(0);
    $table->timestamps();
    
    $table->foreign('user_id')->references('id')->on('users');
});
```

---

## 2. API Endpoints

### Game Management

**GET /api/games**
*   **Purpose**: Fetch list of games to display on the "Games" page.
*   **Response**:
    ```json
    [
        {
            "id": 1,
            "name": "Space Invaders",
            "meta": {
                "trophy_thresholds": { "BRONZE": 1000, "SILVER": 2500, "GOLD": 5000, "PLATINUM": 10000 }
            }
        }
    ]
    ```

### Game Session & Scoring

**POST /api/games/{id}/start**
*   **Purpose**: Initialize a game session.
*   **Action**: Create a row in `game_participants` with status `active`.
*   **Validation Logic (Membership Rules)**:
    1.  **Super Fan**:
        *   Can play any game (Premium or Free) unlimited times.
    2.  **Free Tier**:
        *   **Premium Games**: Cannot play (Return 403 Forbidden).
        *   **Free Games**: Max **3 plays per day** (across all games or per game, depending on business logic).
        *   *Implementation*: Count `game_participants` records for this `user_id` created `today`. If count >= 3, return error.
*   **Response**: 
    *   Success: `{ "session_id": 123 }`
    *   Error: `{ "message": "Daily limit reached. Upgrade to Super Fan for unlimited access." }`

**POST /api/games/{id}/submit**
*   **Purpose**: Submit final score and coins.
*   **Payload**:
    ```json
    {
        "score": 5500,
        "coins": 50,
        "data": { "lives": 2 }
    }
    ```
*   **Backend Logic**:
    1.  Update `game_participants` (set `score`, `coins`, `status`='finished').
    2.  Add `coins` to user's wallet.
    3.  **Trophy Check**:
        *   Fetch `meta.trophy_thresholds` from `games` table.
        *   Compare `score` against thresholds.
        *   If a new tier is reached (e.g., score > 5000 for PLATINUM), insert/update `user_trophies`.

### Leaderboard

**GET /api/leaderboard**
*   **Purpose**: Global leaderboard based on **Total Trophies**.
*   **Logic**: Aggregate data from `user_trophies`.
*   **Response**:
    ```json
    [
        {
            "user_id": 1,
            "username": "CyberNinja",
            "avatar": "url...",
            "total_trophies": 45,
            "rank": 1,
            "trophy_breakdown": {
                "PLATINUM": 5,
                "GOLD": 15,
                "SILVER": 20,
                "BRONZE": 5
            }
        }
    ]
    ```

### User Stats & History

**GET /api/user/stats**
*   **Purpose**: Display coins and trophies in the app header.
*   **Response**:
    ```json
    {
        "total_trophies": 12,
        "coins": 1500
    }
    ```

**GET /api/user/history**
*   **Purpose**: Fetch a user's past game sessions (e.g., for a "Recent Activity" list).
*   **Response**: (Matches the `game_participants` table structure)
    ```json
    {
        "history": [
            {
                "id": 1,
                "game_id": 2,
                "user_id": 1,
                "score": 120,
                "coins": 0,
                "data": {
                    "level_reached": 5,
                    "enemies_defeated": 42,
                    "accuracy": "95%"
                },
                "status": "active",
                "created_at": "2025-12-04T07:15:11.000000Z",
                "updated_at": "2025-12-04T07:25:06.000000Z"
            }
        ]
    }
    ```
