# Video SEO Audit Workflow

## Overview

Automated YouTube video SEO audit pipeline that:
1. Downloads videos at 720p
2. Extracts representative frames
3. Analyzes visual content with multimodal vision models
4. Generates structured SEO reports with actionable recommendations

## Scripts

### `video-seo-audit-full.py`
Complete workflow with vision model integration. Requires:
- OpenRouter API key (for Gemini 2.5 Flash)
- `yt-dlp` and `ffmpeg` installed

### `video-seo-audit-client.py`
Client-friendly version with simple frame analysis. Good for:
- Quick audits without API keys
- Testing the pipeline
- Basic SEO recommendations

### `video-seo-audit.py`
Minimal version for embedding in other workflows.

## Usage

```bash
# Quick audit (no API key needed)
python3 scripts/video-seo-audit-client.py https://www.youtube.com/watch?v=ABC123

# Full audit with vision analysis
python3 scripts/video-seo-audit-full.py https://www.youtube.com/watch?v=ABC123

# Save to file
python3 scripts/video-seo-audit-client.py https://www.youtube.com/watch?v=ABC123 --output report.md

# Suppress progress output
python3 scripts/video-seo-audit-client.py https://www.youtube.com/watch?v=ABC123 -q
```

## Report Output

Reports include:
- **Title optimization** (character count, keywords, CTR implications)
- **Description analysis** (first 160 chars, CTAs, keyword placement)
- **Tags analysis** (coverage, specificity, recommendations)
- **Visual content analysis** (frame-by-frame breakdown)
- **Action plan** (Priority 1/2/3 with specific steps)
- **SEO score estimate** (weighted criteria scoring)

## Cost Estimates

| Video Length | Frames | Est. Tokens | Gemini Flash | Gemini Pro |
|--------------|--------|-------------|--------------|------------|
| 5 min | 150 | ~38K | ~$0.01 | ~$0.05 |
| 10 min | 300 | ~77K | ~$0.02 | ~$0.10 |
| 20 min | 600 | ~155K | ~$0.05 | ~$0.19 |
| 30 min | 900 | ~232K | ~$0.07 | ~$0.29 |

Frame sampling at 0.5 fps cuts cost by half with minimal quality loss.

## Requirements

```bash
# Install dependencies
brew install yt-dlp ffmpeg

# Python packages (already included)
pip3 install pillow requests
```

## Integration with Hermes

The `video_analyze` tool in Hermes Agent provides the same functionality:
```yaml
# config.yaml
auxiliary:
  vision:
    provider: crof-ai
    model: kimi-k2.6
    timeout: 120
```

Use `video_analyze` when running inside Hermes sessions for seamless integration.

## Notes

- Videos >30 min are sampled more sparsely to control cost
- Non-YouTube videos (TikTok, Instagram, X) supported via frame-only analysis
- Transcript extraction available via `youtube-content` skill for audio analysis
- Thumbnails require separate access (not included in frame extraction)

## Future Enhancements

- [ ] Integrate with YouTube Data API for performance metrics
- [ ] A/B testing recommendations for titles/thumbnails
- [ ] Competitor comparison analysis
- [ ] Transcript keyword density analysis
- [ ] Visual trend detection across channel videos
