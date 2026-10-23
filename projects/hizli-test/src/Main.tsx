import { Film } from "./kit/Film";
import { video } from "./video";

// The film is built from src/video.ts. For a scene type the kit does not have,
// write a component in src/ and add it to kit/Film.tsx (SceneSpec and SceneView).
export const Main: React.FC = () => <Film video={video} />;
