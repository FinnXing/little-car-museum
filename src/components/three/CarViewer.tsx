"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type RefObject,
  type ReactNode,
} from "react";
import { Box3, Color, Mesh, Object3D, Vector3 } from "three";
import type { CameraConfig, VehicleColor } from "@/types";
import type {
  CarViewerProps,
  ModelQuality,
  ViewerInteractionType,
} from "@/types/viewer";
import {
  cameraPositionForPreset,
  disposeObject3D,
  resolveModelUrl,
  selectModelQuality,
  type CameraPreset,
} from "@/lib/three/viewer-utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: (error: Error) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ModelErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    void _info;
    this.props.onError(error);
  }

  render() {
    return this.state.error ? null : this.props.children;
  }
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function useWebGLSupport() {
  const [supported] = useState<boolean | null>(() => {
    if (typeof document === "undefined") return null;
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      const loseContext = context?.getExtension("WEBGL_lose_context");
      loseContext?.loseContext();
      return Boolean(context);
    } catch {
      return false;
    }
  });

  return supported;
}

function cloneScene(source: Object3D) {
  const cloned = source.clone(true);
  let hasColorMaterials = false;
  cloned.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.geometry = child.geometry.clone();
    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => {
        const nextMaterial = material.clone();
        if (nextMaterial.name === "body_paint") hasColorMaterials = true;
        return nextMaterial;
      });
    } else {
      child.material = child.material.clone();
      if (child.material.name === "body_paint") hasColorMaterials = true;
    }
  });
  return { cloned, hasColorMaterials };
}

function ModelScene({
  url,
  selectedColor,
  onReady,
}: {
  url: string;
  selectedColor?: VehicleColor;
  onReady: (supportsColor: boolean) => void;
}) {
  const gltf = useGLTF(url);
  const { cloned: scene, hasColorMaterials } = useMemo(() => {
    const model = cloneScene(gltf.scene);
    const { cloned } = model;
    const bounds = new Box3().setFromObject(cloned);
    const center = bounds.getCenter(new Vector3());
    cloned.position.sub(center);
    cloned.position.y -= bounds.min.y - center.y;
    return model;
  }, [gltf.scene]);

  useEffect(() => {
    onReady(hasColorMaterials);
    return () => {
      disposeObject3D(scene);
    };
  }, [hasColorMaterials, onReady, scene]);

  useEffect(() => {
    if (!scene || !selectedColor) return;
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach((material) => {
        if (
          material.name === "body_paint" ||
          selectedColor.materialNames.includes(material.name)
        ) {
          if ("color" in material) {
            material.color = new Color(selectedColor.colorValue);
          }
        }
      });
    });
  }, [scene, selectedColor]);

  return <primitive object={scene} scale={1.18} />;
}

interface CameraRigProps {
  cameraConfig: CameraConfig;
  command: { preset: CameraPreset; nonce: number } | null;
  cancelSignal: number;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}

function CameraRig({
  cameraConfig,
  command,
  cancelSignal,
  controlsRef,
}: CameraRigProps) {
  const { camera } = useThree();
  const animation = useRef<{
    startedAt: number;
    fromPosition: Vector3;
    toPosition: Vector3;
    fromTarget: Vector3;
    toTarget: Vector3;
  } | null>(null);

  useEffect(() => {
    if (!command) return;
    const [x, y, z] = cameraPositionForPreset(command.preset, cameraConfig);
    const controls = controlsRef.current;
    animation.current = {
      startedAt: performance.now(),
      fromPosition: camera.position.clone(),
      toPosition: new Vector3(x, y, z),
      fromTarget:
        controls?.target.clone() ??
        new Vector3(
          cameraConfig.target.x,
          cameraConfig.target.y,
          cameraConfig.target.z,
        ),
      toTarget: new Vector3(
        cameraConfig.target.x,
        cameraConfig.target.y,
        cameraConfig.target.z,
      ),
    };
  }, [camera, cameraConfig, command, controlsRef]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(
      cameraConfig.target.x,
      cameraConfig.target.y,
      cameraConfig.target.z,
    );
    camera.lookAt(controls.target);
    controls.update();
  }, [camera, cameraConfig, controlsRef]);

  useEffect(() => {
    if (cancelSignal > 0) animation.current = null;
  }, [cancelSignal]);

  useFrame(() => {
    const current = animation.current;
    const controls = controlsRef.current;
    if (!current || !controls) return;
    const progress = Math.min((performance.now() - current.startedAt) / 420, 1);
    const eased = 1 - (1 - progress) ** 3;
    camera.position.lerpVectors(
      current.fromPosition,
      current.toPosition,
      eased,
    );
    controls.target.lerpVectors(current.fromTarget, current.toTarget, eased);
    camera.lookAt(controls.target);
    controls.update();
    if (progress === 1) animation.current = null;
  });

  return null;
}

function ProgressReporter({
  onProgress,
}: {
  onProgress: (progress: number) => void;
}) {
  const { progress } = useProgress();
  useEffect(() => onProgress(Math.round(progress)), [onProgress, progress]);
  return null;
}

function FallbackGallery({
  imageUrls,
  onRetry,
}: {
  imageUrls: string[];
  onRetry: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const imageUrl = imageUrls[index] ?? imageUrls[0];

  return (
    <div className="grid min-h-[20rem] place-items-center bg-mint-soft p-5 sm:min-h-[28rem]">
      {imageUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- fallback URLs may be user-configured remote assets.
        <img
          src={imageUrl}
          alt="汽车占位预览"
          className="max-h-[25rem] w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="grid max-w-sm gap-3 text-center">
          <span className="text-6xl" aria-hidden="true">
            🚗
          </span>
          <p className="font-display text-xl font-black text-ink">
            图片还在准备中
          </p>
          <p className="font-semibold leading-7 text-ink-muted">
            可以稍后重试，或先回到汽车展厅。
          </p>
        </div>
      )}
      <div className="col-span-full flex flex-wrap justify-center gap-3">
        {imageUrls.length > 1 ? (
          <button
            type="button"
            className="min-h-11 rounded-full border-2 border-ink bg-card px-4 font-bold"
            onClick={() => {
              setFailed(false);
              setIndex((current) => (current + 1) % imageUrls.length);
            }}
          >
            换一张图片
          </button>
        ) : null}
        <button
          type="button"
          className="min-h-11 rounded-full border-2 border-ink bg-ink px-4 font-bold text-paper"
          onClick={onRetry}
        >
          重试 3D 模型
        </button>
      </div>
    </div>
  );
}

function ViewerButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      className="min-h-11 shrink-0 rounded-full border-2 border-ink bg-card px-4 text-sm font-bold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

export function CarViewer({
  vehicleId,
  highModelUrl,
  lowModelUrl,
  fallbackImageUrls,
  coverImageUrl,
  defaultCamera,
  colors,
  hotspots: _hotspots,
  autoRotate: initialAutoRotate = false,
  preferredQuality = "AUTO",
  onLoadStart,
  onProgress,
  onLoadSuccess,
  onLoadError,
  onInteraction,
}: CarViewerProps) {
  const reducedMotion = useReducedMotion();
  const webglSupported = useWebGLSupport();
  const deviceSignals = useMemo(() => {
    if (typeof navigator === "undefined") {
      return {
        isMobile: false,
        saveData: false,
        effectiveType: undefined,
        deviceMemory: undefined,
      };
    }
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    return {
      isMobile: window.matchMedia("(max-width: 767px)").matches,
      saveData: Boolean(connection?.saveData),
      effectiveType: connection?.effectiveType,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number })
        .deviceMemory,
    };
  }, []);
  const initialQuality = useMemo(
    () =>
      selectModelQuality({
        preferredQuality,
        hasHighModel: Boolean(highModelUrl),
        hasLowModel: Boolean(lowModelUrl),
        ...deviceSignals,
      }),
    [deviceSignals, highModelUrl, lowModelUrl, preferredQuality],
  );
  const [quality, setQuality] = useState<Exclude<ModelQuality, "AUTO"> | null>(
    initialQuality,
  );
  const [status, setStatus] = useState<
    "LOADING" | "READY" | "ERROR" | "FALLBACK_IMAGE"
  >(initialQuality ? "LOADING" : "FALLBACK_IMAGE");
  const [progress, setProgress] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState(colors[0]?.id);
  const [supportsColor, setSupportsColor] = useState(false);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [command, setCommand] = useState<{
    preset: CameraPreset;
    nonce: number;
  } | null>(null);
  const [cancelSignal, setCancelSignal] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const loadSuccessSent = useRef(false);
  const modelErrorCount = useRef(0);

  useEffect(() => onLoadStart?.(), [onLoadStart, vehicleId]);

  const modelUrl = resolveModelUrl({ quality, highModelUrl, lowModelUrl });
  const selectedColor = colors.find((color) => color.id === selectedColorId);
  const imageUrls = useMemo(
    () =>
      Array.from(
        new Set([coverImageUrl, ...fallbackImageUrls].filter(Boolean)),
      ),
    [coverImageUrl, fallbackImageUrls],
  );

  const reportProgress = useCallback(
    (value: number) => {
      setProgress(value);
      onProgress?.(value);
    },
    [onProgress],
  );

  const handleSceneReady = useCallback(
    (supports: boolean) => {
      setSupportsColor(supports);
      setStatus("READY");
      setProgress(100);
      onProgress?.(100);
      if (!loadSuccessSent.current) {
        loadSuccessSent.current = true;
        onLoadSuccess?.();
      }
    },
    [onLoadSuccess, onProgress],
  );

  const handleModelError = useCallback(
    (error: Error) => {
      modelErrorCount.current += 1;
      onLoadError?.(error);
      if (quality === "HIGH" && lowModelUrl && modelErrorCount.current === 1) {
        setQuality("LOW");
        setProgress(0);
        setRetryKey((key) => key + 1);
        onLoadStart?.();
        return;
      }
      setStatus("ERROR");
    },
    [lowModelUrl, onLoadError, onLoadStart, quality],
  );

  const emitInteraction = (type: ViewerInteractionType) =>
    onInteraction?.(type);
  const setCameraPreset = (preset: CameraPreset) => {
    setCommand({ preset, nonce: Date.now() });
    emitInteraction(
      preset === "RESET"
        ? "RESET"
        : (`VIEW_${preset}` as ViewerInteractionType),
    );
  };

  const handleRetry = () => {
    modelErrorCount.current = 0;
    loadSuccessSent.current = false;
    setStatus(modelUrl ? "LOADING" : "FALLBACK_IMAGE");
    setProgress(0);
    setRetryKey((key) => key + 1);
  };

  const showFallback =
    webglSupported === false ||
    !modelUrl ||
    status === "ERROR" ||
    status === "FALLBACK_IMAGE";
  const controlsDisabled = showFallback || status !== "READY";
  void _hotspots;

  return (
    <section
      aria-labelledby={`${vehicleId}-viewer-title`}
      className="grid gap-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-black tracking-[0.18em] text-teal uppercase">
            Look around
          </p>
          <h2
            id={`${vehicleId}-viewer-title`}
            className="mt-1 font-display text-2xl font-black text-ink"
          >
            旋转汽车看看
          </h2>
        </div>
        <span className="rounded-full border-2 border-ink bg-sun px-3 py-1 text-sm font-bold">
          {showFallback
            ? "图片预览"
            : quality === "HIGH"
              ? "高质量模型"
              : quality === "LOW"
                ? "轻量模型"
                : "图片预览"}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-mint-soft shadow-[8px_8px_0_var(--color-ink)]">
        {showFallback ? (
          <FallbackGallery imageUrls={imageUrls} onRetry={handleRetry} />
        ) : (
          <div
            className="relative min-h-[20rem] sm:min-h-[28rem]"
            onWheel={() => emitInteraction("ZOOM")}
            onPointerDown={() => {
              setIsInteracting(true);
              setCancelSignal((signal) => signal + 1);
              emitInteraction("ROTATE");
            }}
            onPointerUp={() => setIsInteracting(false)}
          >
            <ModelErrorBoundary
              key={`${modelUrl}-${retryKey}`}
              onError={handleModelError}
            >
              <Canvas
                camera={{
                  position: [
                    defaultCamera.position.x,
                    defaultCamera.position.y,
                    defaultCamera.position.z,
                  ],
                  fov: defaultCamera.fov ?? 42,
                  near: 0.1,
                  far: 100,
                }}
                dpr={[1, 1.75]}
                gl={{ antialias: true, alpha: true }}
                shadows
              >
                <color attach="background" args={["#e8f4ee"]} />
                <ambientLight intensity={1.8} />
                <hemisphereLight args={["#fff7d7", "#7aa99c", 1.5]} />
                <directionalLight
                  position={[4, 6, 5]}
                  intensity={2.4}
                  castShadow
                />
                <directionalLight position={[-4, 3, -3]} intensity={0.75} />
                <mesh
                  rotation={[-Math.PI / 2, 0, 0]}
                  position={[0, -0.55, 0]}
                  receiveShadow
                >
                  <circleGeometry args={[5, 64]} />
                  <meshStandardMaterial color="#b7ddc9" roughness={0.95} />
                </mesh>
                <Suspense fallback={null}>
                  <ProgressReporter onProgress={reportProgress} />
                  {modelUrl ? (
                    <ModelScene
                      url={modelUrl}
                      selectedColor={selectedColor}
                      onReady={handleSceneReady}
                    />
                  ) : null}
                </Suspense>
                <OrbitControls
                  ref={controlsRef}
                  enablePan={false}
                  enableDamping
                  dampingFactor={0.08}
                  minDistance={defaultCamera.minDistance}
                  maxDistance={defaultCamera.maxDistance}
                  minPolarAngle={defaultCamera.minPolarAngle}
                  maxPolarAngle={defaultCamera.maxPolarAngle}
                  autoRotate={autoRotate && !reducedMotion && !isInteracting}
                  autoRotateSpeed={1.1}
                  onStart={() => {
                    setIsInteracting(true);
                    setCancelSignal((signal) => signal + 1);
                  }}
                  onEnd={() => setIsInteracting(false)}
                />
                <CameraRig
                  cameraConfig={defaultCamera}
                  command={command}
                  cancelSignal={cancelSignal}
                  controlsRef={controlsRef}
                />
              </Canvas>
            </ModelErrorBoundary>
            {status !== "READY" ? (
              <div
                role="status"
                aria-live="polite"
                className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border-2 border-ink bg-card/95 p-3"
              >
                <div className="flex items-center justify-between gap-3 text-sm font-bold">
                  <span>
                    {progress >= 100 ? "正在整理模型" : "正在加载 3D 模型"}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-mint-soft"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-teal transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid gap-3 rounded-[1.5rem] border-2 border-ink bg-card p-4">
        <div
          className="flex flex-wrap gap-2 overflow-x-auto pb-1"
          aria-label="汽车视角"
        >
          <ViewerButton
            label="复位"
            disabled={controlsDisabled}
            onClick={() => setCameraPreset("RESET")}
          />
          <ViewerButton
            label="前方"
            disabled={controlsDisabled}
            onClick={() => setCameraPreset("FRONT")}
          />
          <ViewerButton
            label="后方"
            disabled={controlsDisabled}
            onClick={() => setCameraPreset("BACK")}
          />
          <ViewerButton
            label="左侧"
            disabled={controlsDisabled}
            onClick={() => setCameraPreset("LEFT")}
          />
          <ViewerButton
            label="右侧"
            disabled={controlsDisabled}
            onClick={() => setCameraPreset("RIGHT")}
          />
          <ViewerButton
            label="上方"
            disabled={controlsDisabled}
            onClick={() => setCameraPreset("TOP")}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink/15 pt-3">
          {supportsColor && colors.length > 0 ? (
            <div
              className="flex flex-wrap items-center gap-2"
              aria-label="汽车颜色"
            >
              <span className="text-sm font-bold text-ink-muted">颜色</span>
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  aria-label={`选择${color.nameCn}`}
                  aria-pressed={selectedColorId === color.id}
                  className="grid size-9 place-items-center rounded-full border-2 border-ink aria-pressed:ring-4 aria-pressed:ring-sun"
                  style={{ backgroundColor: color.colorValue }}
                  onClick={() => {
                    setSelectedColorId(color.id);
                    emitInteraction("COLOR_CHANGE");
                  }}
                >
                  <span className="sr-only">{color.nameCn}</span>
                </button>
              ))}
            </div>
          ) : (
            <span className="text-sm font-semibold text-ink-muted">
              当前模型没有可切换颜色
            </span>
          )}
          <button
            type="button"
            aria-pressed={autoRotate}
            disabled={controlsDisabled || reducedMotion}
            className="min-h-11 rounded-full border-2 border-ink bg-sun px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => {
              const next = !autoRotate;
              setAutoRotate(next);
              emitInteraction(next ? "AUTO_ROTATE_START" : "AUTO_ROTATE_STOP");
            }}
          >
            {reducedMotion
              ? "已按设备设置暂停旋转"
              : autoRotate
                ? "暂停自动旋转"
                : "开启自动旋转"}
          </button>
        </div>
      </div>
      <p className="text-sm leading-6 font-semibold text-ink-muted">
        拖动汽车可以环视，滚轮或双指可以缩放。模型加载失败时会自动切换到图片预览。
      </p>
    </section>
  );
}
