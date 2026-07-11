import { forwardRef, type CSSProperties } from "react";

import { FORMAT_DIMENSIONS } from "@/lib/studio-post-types";
import { C, FONT_BODY, type TemplateProps } from "./templates/shared";
import { RENDERERS, type PostTemplate } from "./templates";

export type { PostTemplate } from "./templates";

export type PostPreviewProps = TemplateProps & { template: PostTemplate };

export const PostPreview = forwardRef<HTMLDivElement, PostPreviewProps>(function PostPreview(props, ref) {
  const { width, height } = FORMAT_DIMENSIONS[props.format];
  const root: CSSProperties = {
    width,
    height,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: C.black,
    fontFamily: FONT_BODY,
  };
  return (
    <div ref={ref} style={root}>
      {RENDERERS[props.template](props)}
    </div>
  );
});
