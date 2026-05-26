#!/usr/bin/env python3
"""
Video SEO Audit Script
======================

Downloads a YouTube video, extracts representative frames, analyzes them with
vision_analyze, and compiles a structured SEO audit report.

Usage:
    python3 scripts/video-seo-audit.py <video_url> [--output report.md]

Example:
    python3 scripts/video-seo-audit.py https://www.youtube.com/watch?v=ABC123

Requirements:
    - yt-dlp (for downloading videos)
    - ffmpeg (for frame extraction)
"""

import argparse
import json
import subprocess
import sys
import os
import tempfile
import re
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import base64
import time


def get_video_id(url: str) -> str:
    """Extract YouTube video ID from URL."""
    parsed = urlparse(url)
    if parsed.netloc == 'www.youtube.com' and parsed.path.startswith('/watch'):
        params = parse_qs(parsed.query)
        return params.get('v', [''])[0]
    elif parsed.netloc in ('youtu.be', 'youtube.com'):
        return parsed.path.split('/')[-1]
    else:
        raise ValueError(f"Invalid YouTube URL: {url}")


def get_video_duration(url: str) -> int:
    """Get video duration in seconds using ffprobe."""
    video_id = get_video_id(url)
    cmd = [
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        f'https://www.youtube.com/watch?v={video_id}'
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
    if result.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {result.stderr}")
    return int(result.stdout.strip())


def get_video_metadata(url: str) -> dict:
    """Extract video metadata using yt-dlp."""
    video_id = get_video_id(url)
    cmd = [
        'yt-dlp', '--dump-json',
        f'https://www.youtube.com/watch?v={video_id}'
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp failed: {result.stderr}")
    return json.loads(result.stdout.strip())


def download_video(url: str, output_path: Path) -> Path:
    """Download video at 720p max."""
    video_id = get_video_id(url)
    cmd = [
        'yt-dlp', '-o', str(output_path),
        '-f', 'best[height<=720]',
        '--no-playlist',
        url
    ]
    print(f"Downloading {url}...")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        raise RuntimeError(f"Download failed: {result.stderr}")
    return output_path


def extract_frames(video_path: Path, output_dir: Path, duration: int, fps: float = 0.5) -> list:
    """Extract frames at specified fps."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    cmd = [
        'ffmpeg', '-y', '-i', str(video_path),
        f'-vf', f'fps={fps},scale=540:-1',
        f'-q:v', '2',
        str(output_dir / 'frame_%04d.jpg')
    ]
    print(f"Extracting frames from {duration}s video at {fps*100:.0f}% fps...")
    start = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    elapsed = time.time() - start
    
    if result.returncode != 0:
        raise RuntimeError(f"Frame extraction failed: {result.stderr}")
    
    frames = sorted(output_dir.glob('frame_*.jpg'))
    print(f"Extracted {len(frames)} frames in {elapsed:.0f}s")
    return frames


def pick_key_frames(frames: list, count: int = 12) -> list:
    """Pick representative frames evenly spaced."""
    if len(frames) <= count:
        return frames
    step = len(frames) // count
    return [frames[i] for i in range(0, len(frames), step)][:count]


def encode_frames_to_base64(frames: list) -> dict:
    """Encode frames as base64 for API calls (max ~12 frames)."""
    encoded = {}
    for i, frame in enumerate(frames[:12]):
        with open(frame, 'rb') as f:
            encoded[f"frame_{i:02d}"] = base64.b64encode(f.read()).decode('utf-8')
    return encoded


def analyze_with_gemini(frames: dict, user_prompt: str) -> dict:
    """
    Analyze frames using vision model via OpenRouter.
    Returns structured analysis.
    """
    # This is the placeholder — actual implementation would call:
    # 1. OpenRouter API with Gemini 2.5 Flash
    # 2. Send frames as base64 image data
    # 3. Get back JSON with visual analysis
    
    # For now, return a placeholder structure
    return {
        "success": False,
        "error": "vision model integration not configured",
        "analysis_length": 0,
        "model_used": "gemini-2.5-flash"
    }


def compile_report(video_url: str, metadata: dict, duration: int, 
                   frames: list, analysis: dict) -> str:
    """Compile SEO audit report in Markdown format."""
    
    title = metadata.get('title', 'Unknown Video')
    channel = metadata.get('channel', 'Unknown Channel')
    views = metadata.get('view_count', 'N/A')
    likes = metadata.get('likes', 'N/A')
    description = metadata.get('description', 'No description available')
    tags = metadata.get('tags', [])
    published = metadata.get('upload_date', 'Unknown')
    
    report = f"""# Video SEO Audit Report

**Video:** {title}  
**Channel:** {channel}  
**URL:** [{title}]({video_url})  
**Published:** {published}  
**Duration:** {duration}s ({duration//60}m {duration%60}s)  
**Views:** {views}  
**Likes:** {likes}  
**Report Date:** {time.strftime('%Y-%m-%d %H:%M')}

---

## Overview

This audit analyzes the video's visual content and on-page SEO elements.

## On-Page SEO Analysis

### Title Optimization
**Current Title:** {title}

**Evaluation:**
- **Character Count:** {len(title)} characters (ideal: 30-60 for YouTube)
- **Keywords Present:** {', '.join([t for t in tags if len(t) < 30]) or 'None detected'}
- **Action:** Consider adding primary keyword early in the title if missing

### Description Analysis
**Description Length:** {len(description)} characters

**Evaluation:**
- **First 160 Characters:** {description[:160] + '...' if len(description) > 160 else description}
- **Call-to-Action:** {"Present" if any('subscribe' in d.lower() for d in [description] + tags) else 'Missing'}
- **Keywords Used:** {', '.join([t for t in tags if len(t) < 30]) or 'None detected'}
- **Action:** Add more specific timestamps, links, and keywords to boost engagement

### Tags & Keywords
**Tags:** {', '.join(tags[:10])}{'...' if len(tags) > 10 else ''}

**Recommendation:**
- Add 3-5 highly specific long-tail keywords
- Include competitor brand names if relevant
- Add related search terms your audience would use

## Thumbnail Analysis

**Note:** Frame extraction shows visual content. Thumbnail analysis requires separate access to the uploaded thumbnail.

**Visual Content Summary:**
"""
    
    # Add frame analysis if available
    if analysis.get('success'):
        visual = analysis.get('visual_analysis', {})
        report += f"""
### Frame Analysis Results

{json.dumps(visual, indent=2)}
"""
    
    report += """
## Content Recommendations

### High-Impact Improvements
1. **Title:** Consider A/B testing with a stronger hook or urgency
2. **Description:** Add more specific timestamps (e.g., 0:00 Intro, 2:30 Feature Demo)
3. **Tags:** Add 3-5 highly specific long-tail keywords
4. **Thumbnail:** Ensure text overlay is visible and matches search intent

### SEO Checklist
- [ ] Title under 60 characters
- [ ] First 160 characters contain primary keyword
- [ ] Description includes call-to-action
- [ ] Tags have 10-15 relevant keywords
- [ ] Transcript uploaded (if applicable)
- [ ] Custom thumbnail with text overlay
- [ ] Pinned comment strategy

## Summary

**Overall SEO Score:** TBD (requires manual review of title/description/tags)

**Priority Actions:**
1. Review and optimize title for search intent
2. Expand description with timestamps and keywords
3. Add 5-10 highly specific tags
4. Ensure thumbnail matches search query intent

---

*Generated by Video SEO Audit Script v0.1*
"""
    
    return report


def main():
    parser = argparse.ArgumentParser(description='Video SEO Audit Tool')
    parser.add_argument('video_url', help='YouTube video URL')
    parser.add_argument('--output', '-o', help='Output file for report (default: stdout)')
    parser.add_argument('--quiet', '-q', action='store_true', help='Suppress progress output')
    
    args = parser.parse_args()
    
    if not args.quiet:
        print("Video SEO Audit Tool v0.1")
        print("=" * 40)
    
    try:
        # Step 1: Get metadata
        if not args.quiet:
            print("Step 1: Extracting metadata...")
        metadata = get_video_metadata(args.video_url)
        duration = get_video_duration(args.video_url)
        
        # Step 2: Download video
        if not args.quiet:
            print("Step 2: Downloading video...")
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            video_path = tmpdir / 'video.mp4'
            download_video(args.video_url, video_path)
            
            # Step 3: Extract frames
            if not args.quiet:
                print("Step 3: Extracting frames...")
            frames_dir = tmpdir / 'frames'
            frames = extract_frames(video_path, frames_dir, duration)
            
            # Step 4: Pick key frames
            key_frames = pick_key_frames(frames, 12)
            
            # Step 5: Analyze frames
            if not args.quiet:
                print("Step 4: Analyzing frames...")
            encoded = encode_frames_to_base64(key_frames)
            analysis = analyze_with_gemini(encoded, "Analyze this video content for visual elements, text overlays, and overall theme. Return JSON with visual_summary, key_elements, and recommendations.")
            
            # Step 6: Compile report
            if not args.quiet:
                print("Step 5: Compiling report...")
            report = compile_report(args.video_url, metadata, duration, key_frames, analysis)
            
            # Output
            if args.output:
                with open(args.output, 'w') as f:
                    f.write(report)
                print(f"Report saved to {args.output}")
            else:
                print(report)
    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
