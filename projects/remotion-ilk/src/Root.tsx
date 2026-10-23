import { Composition } from "remotion";
import { Main } from "./Main";

// The render workflow renders the composition named in render.json ("Main" by default).
// 14.106 s audio * 30 fps = 424 frames, + 26 frames of tail = 450 frames = 15.0 s.
// Scene math: 102 + 243 + 129 - 12 - 12 = 450.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
