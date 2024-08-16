import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import "./App.css";
import { getContrastMap, getSpans, sortSpansInImage } from "./util";
import { kuwahara } from "./filter/kuwahara";
import { create } from "zustand";

interface AppState {
  lastEvent: SyntheticEvent | Event | null;
  show: string;
  setLastEvent: (e: SyntheticEvent | Event | null) => void;
  setShow: (_: string) => void;
}
const useAppStore = create<AppState>((set) => ({
  lastEvent: null,
  show: "",
  setShow: (show: string) => set((s): AppState => ({ ...s, show })),
  setLastEvent: (lastEvent: SyntheticEvent | Event | null) =>
    set((s): AppState => ({ ...s, lastEvent })),
}));

function App() {
  // TODO: Zustand all this?
  const [lowThreshold, setLowThreshold] = useState(0.4);
  const [highThreshold, setHighThreshold] = useState(0.8);
  const [fileDragged, setFileDragged] = useState(false);
  const [loadedImage, setImgData] = useState<ImageData | null>(null);
  const [kuwaharaChecked, setKuwaharaChecked] = useState(false);
  const appState = useAppStore();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const imgRef = useCallback((node: HTMLCanvasElement) => {
    if (!node) {
      return;
    }
    setCanvas(node);
    setCtx(node.getContext("2d", { willReadFrequently: true }));
  }, []);

  console.log("Last event", appState.lastEvent);
  console.log("Last show", appState.show);

  const loadImage = (file: File | Blob) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const image = new Image();
      image.src = e.target?.result as string;
      image.onload = function () {
        if (!canvas || !ctx) {
          return;
        }
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        setImgData(ctx.getImageData(0, 0, canvas.width, canvas.height) ?? null);
        setFileDragged(false);
      };
    };
    reader.readAsDataURL(file);
  };

  let imgData = useMemo(() => {
    if (!loadedImage) {
      return loadedImage;
    }
    if (appState.show === "kuwahara" && kuwaharaChecked) {
      return kuwahara(loadedImage);
    } else if (appState.show === "contrast") {
      return getContrastMap(loadedImage, highThreshold, lowThreshold);
    } else if (appState.show === "glitched" && loadedImage) {
      const contrastMap = getContrastMap(
        loadedImage,
        highThreshold,
        lowThreshold,
      );
      const spans = getSpans(contrastMap);
      const glitched = sortSpansInImage(loadedImage, spans);
      return glitched;
    }
    return loadedImage;
  }, [loadedImage, appState.show, appState.lastEvent]);

  useEffect(() => {
    if (!ctx) {
      return;
    }
    fetch("/glitchme/small.jpg").then(async (r) => {
      console.log("fetched");
      loadImage(await r.blob());
    });
  }, [ctx]);

  const handleKuwaharaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    appState.setLastEvent(e);
    appState.setShow("kuwahara");
    setKuwaharaChecked(e.target.checked);
  };

  const handleChange =
    (setValue: (value: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      appState.setLastEvent(e);
      appState.setShow("contrast");
      setValue(Number(e.target.value));
    };
  const handleScroll =
    (setValue: React.Dispatch<React.SetStateAction<number>>) =>
    (e: WheelEvent) => {
      appState.setLastEvent(e);
      appState.setShow("contrast");
      setValue((prev) => prev + (e.deltaY > 0 ? 0.01 : -0.01));
    };

  const handleGlitch = () => {
    if (!ctx || !imgData) {
      return;
    }
    appState.setShow("glitched");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileDragged(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileDragged(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    loadImage(file);
  };

  if (imgData) {
    ctx?.putImageData(imgData, 0, 0);
  }

  return (
    <>
      <div>
        <div
          className={clsx("image-container", fileDragged ? "highlight" : "")}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <canvas ref={imgRef} id="image"></canvas>
          {!loadedImage && <div>Drop an image here</div>}
        </div>
        <button className="glitch-button" onClick={handleGlitch}>
          Glitch me
        </button>
        <div>
          <div>
            <label>Low threshold</label>
            <ScrollableInput
              title="Low threshold"
              type="range"
              min="0"
              max="1"
              step="0.01"
              placeholder="0.4"
              value={lowThreshold}
              onWheel={handleScroll(setLowThreshold)}
              onChange={handleChange(setLowThreshold)}
              id="contrast-low"
            />
            {lowThreshold.toFixed(2)}
          </div>
          <div>
            <label>High threshold</label>
            <ScrollableInput
              title="High threshold"
              type="range"
              min="0"
              max="1"
              step="0.01"
              placeholder="0.8"
              value={highThreshold}
              onWheel={handleScroll(setHighThreshold)}
              onChange={handleChange(setHighThreshold)}
              id="contrast-high"
            />
            {highThreshold.toFixed(2)}
          </div>
          <div>
            <label>Kuwahara</label>
            <input
              type="checkbox"
              checked={kuwaharaChecked}
              onChange={handleKuwaharaChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}

type ScrollableInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onWheel"
> & {
  onWheel: (_: WheelEvent) => void;
};
function ScrollableInput({ onWheel, ...props }: ScrollableInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const handleScroll = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWheel(e);
  };
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const listener = handleScroll;
    ref.current.addEventListener("wheel", listener);
    return () => {
      ref.current?.removeEventListener("wheel", listener);
    };
  }, [ref.current, onWheel]);
  return <input {...props} ref={ref} />;
}

export default App;
