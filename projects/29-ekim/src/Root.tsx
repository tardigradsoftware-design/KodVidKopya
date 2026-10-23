import { Composition } from "remotion";
import { Main } from "./Main";

// 13.035 s audio * 30 fps = 392 frames, + 15 frames of tail = 407 frames.
// Scene math: 109 + 209 + 113 - 12 - 12 = 407.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={407}
        fps={30}
        width={720}
        height={1280}
      />
    </>
  );
};
