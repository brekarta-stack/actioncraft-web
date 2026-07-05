/**
 * <model-viewer> 커스텀 엘리먼트 JSX 타입 (@google/model-viewer).
 * React 19 는 JSX 네임스페이스가 react 모듈 아래로 이동했으므로 module augmentation 으로 선언.
 */
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  alt?: string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  exposure?: string;
  "camera-controls"?: boolean | string;
  "auto-rotate"?: boolean | string;
  "auto-rotate-delay"?: number | string;
  "rotation-per-second"?: string;
  "shadow-intensity"?: number | string;
  "touch-action"?: string;
  "interaction-prompt"?: string;
  "camera-orbit"?: string;
  "field-of-view"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}
