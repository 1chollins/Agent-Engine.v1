/**
 * BackgroundMusic — seeded track with fade-in/fade-out, trimmed to the
 * composition length. Renders nothing if no tracks are installed.
 *
 * ALSO renders the free-tier <Watermark /> (visibility driven by the
 * top-level `watermark` input prop). This component is the one element
 * every composition mounts, so hooking the watermark here covers all
 * eleven templates from a single point. If a composition ever drops
 * music, it must mount <Watermark /> itself.
 */
import React from "react";
import {
  Audio,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { pickTrackFor } from "../lib/music";
import { Watermark } from "./Watermark";

const FADE_IN_FRAMES = 30; // 1s
const FADE_OUT_FRAMES = 45; // 1.5s
const BASE_VOLUME = 0.7;

type BackgroundMusicProps = {
  seed: number;
};

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ seed }) => {
  const { durationInFrames } = useVideoConfig();
  const track = pickTrackFor(seed);

  return (
    <>
      {track && (
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
      )}
      <Watermark />
    </>
  );
};
