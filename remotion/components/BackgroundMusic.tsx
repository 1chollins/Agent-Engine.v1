/**
 * BackgroundMusic — seeded track with fade-in/fade-out, trimmed to the
 * composition length. Renders nothing if no tracks are installed.
 */
import React from "react";
import {
  Audio,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { pickTrackFor } from "../lib/music";

const FADE_IN_FRAMES = 30; // 1s
const FADE_OUT_FRAMES = 45; // 1.5s
const BASE_VOLUME = 0.7;

type BackgroundMusicProps = {
  seed: number;
};

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ seed }) => {
  const { durationInFrames } = useVideoConfig();
  const track = pickTrackFor(seed);

  if (!track) {
    return null;
  }

  return (
    <Audio
      src={staticFile(track.file)}
      loop
      volume={(f) =>
        interpolate(
          f,
          [
            0,
            FADE_IN_FRAMES,
            durationInFrames - FADE_OUT_FRAMES,
            durationInFrames,
          ],
          [0, BASE_VOLUME, BASE_VOLUME, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      }
    />
  );
};
