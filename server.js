import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';
import { config } from './config.js';

dotenv.config();

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Webshare rotating proxy credentials
const PROXY_URL = config.PROXY_URL;

// Only create proxy agent if PROXY_URL is provided
const proxyAgent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : null;

async function getTikmateMetadata(tiktokUrl) {
  try {
    const apiUrl = "https://api.tikmate.app/api/lookup";

    const axiosConfig = {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      proxy: false // must disable axios's built-in proxy to use the agent
    };

    // Only add httpsAgent if proxy is configured
    if (proxyAgent) {
      axiosConfig.httpsAgent = proxyAgent;
    }

    const response = await axios.post(
      apiUrl,
      new URLSearchParams({ url: tiktokUrl }).toString(),
      axiosConfig
    );

    const data = response.data;
    if (!data.success) {
      throw new Error("TikMate API returned failure");
    }

    // Build and attach download URL
    const { token, id } = data;
    data.no_watermark_download_url = `https://tikmate.app/download/${token}/${id}.mp4`;

    return data;

  } catch (err) {
    console.error("❌ Error:", err.message);
    return null;
  }
}

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'TikTok Downloader API is running!' });
});

app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'TikTok URL is required' 
      });
    }

    if (!url.includes('tiktok.com')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid TikTok URL' 
      });
    }

    console.log(`Processing TikTok URL: ${url}`);
    
    const metadata = await getTikmateMetadata(url);
    
    if (!metadata) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to process TikTok URL. Please check the URL and try again.' 
      });
    }

    // Return the metadata with additional frontend-friendly fields
    const response = {
      success: true,
      data: {
        ...metadata,
        downloadUrl: metadata.no_watermark_download_url,
        thumbnail: metadata.cover || metadata.dynamic_cover,
        title: metadata.desc || 'TikTok Video',
        author: metadata.author_name || metadata.author_id,
        authorAvatar: metadata.author_avatar,
        likeCount: metadata.like_count,
        commentCount: metadata.comment_count,
        shareCount: metadata.share_count,
        createTime: metadata.create_time
      }
    };

    res.json(response);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TikTok Downloader API running on port ${PORT}`);
  if (PROXY_URL) {
    console.log(`📡 Proxy configured: ${PROXY_URL.split('@')[1] || '***'}`);
  } else {
    console.log(`⚠️  No proxy configured - requests will be made directly`);
  }
}); 