# API Endpoints Guide

This document provides a comprehensive overview of the API endpoints used in the TVK App Frontend project. Each endpoint is listed with its HTTP method, route, expected parameters, and a brief description of its use case.

---

## User Endpoints

### Update Profile
- **POST** `/v1/auth/update-profile`
- **Body:** `{ name: string }`
- **Description:** Update the user's name in their profile.

### Update Avatar
- **POST** `/v1/auth/update-avatar`
- **Body:** `FormData` with `avatar: File`
- **Description:** Update the user's avatar image.

### Change Password
- **POST** `/v1/auth/change-password`
- **Body:** `{ current_password, password, password_confirmation }`
- **Description:** Change the user's password.

### Fetch User Stats
- **GET** `/v1/user/stats`
- **Description:** Retrieve user statistics such as points, games played, and trophies.

### Update Nickname
- **PATCH** `/v1/auth/update-nickname`
- **Body:** `{ nickname: string }`
- **Description:** Update the user's nickname. Premium users have unlimited changes; free users have limited changes.

---

## Store Endpoints

### Get Coin Packages
- **GET** `/store/coins`
- **Description:** Retrieve available coin packages for purchase.

### Get Merch Items
- **GET** `/store/merch`
- **Description:** Retrieve available merchandise items.

### Get Power-Ups
- **GET** `/store/powerups`
- **Description:** Retrieve available power-up items.

---

## Game Endpoints

### Get All Games
- **GET** `/v1/games`
- **Description:** Fetch all games with metadata and trophy thresholds.

### Get Global Leaderboard
- **GET** `/v1/games/leaderboard/overall`
- **Description:** Fetch the global leaderboard aggregated by total trophies.

### Join Game
- **POST** `/v1/games/{id}/join`
- **Description:** Join a game session. Returns a participant object.

### Submit Score
- **POST** `/v1/games/participant/{participantId}/score`
- **Body:** `{ score, coins, data? }`
- **Description:** Submit score and coins for a game session.

### Get Game Leaderboard
- **GET** `/v1/games/{id}/leaderboard`
- **Description:** Fetch leaderboard for a specific game.

### Get Participant Trophies
- **GET** `/v1/games/participant/{participantId}/trophies`
- **Description:** Get trophies for a specific participant.

### Get My Trophies
- **GET** `/v1/games/my/trophies`
- **Description:** Get current user's trophies across all games.

---

## Event Endpoints

### Get All Events
- **GET** `/v1/events`
- **Description:** Retrieve all events.

### Get Event by ID
- **GET** `/v1/events/{id}`
- **Description:** Retrieve details for a specific event.

### Participate in Event
- **POST** `/v1/events/{id}/participate`
- **Body:** `{ submission: string }`
- **Description:** Submit a participation entry for an event.

### Get Event Scoreboard
- **GET** `/v1/events/{id}/scoreboard`
- **Description:** Retrieve the scoreboard for a specific event.

---

## Content Endpoints

### Get All Content
- **GET** `/v1/contents?page={page}`
- **Description:** Retrieve paginated content items.

### Get Content by ID
- **GET** `/v1/contents/{id}`
- **Description:** Retrieve a specific content item by ID.

### Upload Content
- **POST** `/v1/contents/upload`
- **Body:** `FormData` with content fields and file
- **Description:** Upload new content (title, category, type, is_premium, description, file).

### Delete Content
- **DELETE** `/v1/contents/{id}`
- **Description:** Delete a specific content item by ID.

---

## Notes
- All endpoints are relative to the API base URL (e.g., `https://api.tvkmembers.com/api`).
- Some endpoints may require authentication (token in headers).
- For file uploads, use `multipart/form-data`.

---

For more details on request/response payloads, refer to the respective service files in the `src/services/` directory.
