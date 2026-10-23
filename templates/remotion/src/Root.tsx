import { Composition } from "remotion";
import { Main } from "./Main";

// The render workflow renders the composition named in render.json ("Main" by default).
// Set durationInFrames from the narration length: seconds * fps, plus about 15 frames.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
