import { Composition } from "remotion";
import { Film } from "./Film";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./timeline";

// Length comes from the measured narration: see src/timeline.ts.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Main" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  );
};
