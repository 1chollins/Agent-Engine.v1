#!/bin/bash
# Generates 45-second silent MP3 placeholder tracks.
# Replace these with real royalty-free music before production.
# Requires: ffmpeg

for i in 01-upbeat 02-chill 03-elegant 04-inspiring 05-warm; do
  ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t 45 -q:a 9 "public/music/track-${i}.mp3" 2>/dev/null
  echo "Created track-${i}.mp3"
done

echo "Done. Replace these with real royalty-free tracks before production."
