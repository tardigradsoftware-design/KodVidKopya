import { Composition } from "remotion";
import { Main } from "./Main";
import { video } from "./video";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Main"
    component={Main}
    durationInFrames={video.fps * 30}
    fps={video.fps}
    width={video.width}
    height={video.height}
  />
);
