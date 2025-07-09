# TikTok Downloader Backend API

This is the backend API for the TikTok video downloader website. It uses the TikMate API with a proxy agent to fetch video metadata and download URLs.

## Features

- Fetches TikTok video metadata using TikMate API
- Uses rotating proxy to avoid rate limiting
- Returns video information including:
  - Video thumbnail
  - Author information
  - Like, comment, and share counts
  - Creation date
  - Download URL (no watermark)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file with:
```
PORT=3001
PROXY_URL=http://your-proxy-credentials@proxy-server:port
```

**Note:** The `PROXY_URL` is optional but recommended for production to avoid rate limiting.

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Deployment on Render.com

1. **Connect your repository** to Render.com
2. **Create a new Web Service**
3. **Configure environment variables** in Render dashboard:
   - `PORT`: Leave empty (Render sets this automatically)
   - `PROXY_URL`: Your proxy service URL (optional but recommended)
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Health Check Path**: `/api/health`

**Important:** Make sure to add your proxy credentials as environment variables in Render's dashboard, not in your code.

## API Endpoints

### POST /api/download
Downloads TikTok video metadata and generates download URL.

**Request Body:**
```json
{
  "url": "https://www.tiktok.com/@username/video/1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://tikmate.app/download/token/id.mp4",
    "thumbnail": "https://...",
    "title": "Video description",
    "author": "username",
    "authorAvatar": "https://...",
    "likeCount": 1234567,
    "commentCount": 1234,
    "shareCount": 567,
    "createTime": "Apr 10, 2025"
  }
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T18:16:00.000Z"
}
```

## Dependencies

- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `axios`: HTTP client
- `https-proxy-agent`: Proxy support
- `dotenv`: Environment variable management

## Proxy Configuration

The API uses a rotating proxy service to avoid rate limiting from TikTok. You can configure your own proxy by setting the `PROXY_URL` environment variable.

Default proxy format:
```
http://username:password@proxy-server:port
``` 