import { Composition } from "remotion";
import { totalFrames } from "./kit/Film";
import { Main } from "./Main";
import { video } from "./video";

// Length, size and fps come from src/video.ts. Do not edit here.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={totalFrames(video)}
        fps={video.fps}
        width={video.width}
        height={video.height}
      />
    </>
  );
};
