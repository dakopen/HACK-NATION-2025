import { useEffect, useMemo, useRef, useState } from "react";
// Dynamic import helpers to avoid Vite optimize issues in dev
let loadFFmpeg: (() => Promise<{ FFmpeg: any }>) | null = null;
let loadFFmpegUtil: (() => Promise<{ fetchFile: any }>) | null = null;
if (typeof window !== "undefined") {
    loadFFmpeg = () => import("@ffmpeg/ffmpeg");
    loadFFmpegUtil = () => import("@ffmpeg/util");
}
import "./App.css";

type Step = "choose" | "generating" | "review" | "publish" | "analytics";

type Trend = {
    id: string;
    title: string;
    description: string;
    defaultHashtags: string[];
    coverUrl: string;
};

type Brand = {
    id: string;
    name: string;
    logoUrl: string;
};

const TRENDS: Trend[] = [
    {
        id: "italian-brainrot",
        title: "Italian Brainrot",
        description:
            "A meme trend characterized by absurd, AI-generated creatures with nonsensical Italian-sounding names and narratives, typically accompanied Italian-accented voiceovers.",
        defaultHashtags: ["#italianbrainrot", "#brainrot", "#tungtungtung"],
        coverUrl: "/tungtungtungsahur.png",
    },
    {
        id: "ibiza-final-boss",
        title: "Ibiza Final Boss",
        description:
            "The Ibiza final boss: the typical Englishman flying Ryanair to ibiza and partying like it's his life's calling.",
        defaultHashtags: ["#ibizafinalboss", "#finalboss", "#Ibiza"],
        coverUrl: "/ibizafinalboss.png",
    },
    {
        id: "labubu",
        title: "Labubu",
        description:
            "A Labubu, a little plush toy that looks cute and sinister at the same time, yet for some reason everybody wants one.",
        defaultHashtags: ["#labubu", "#gold", "#labubuthemonsters"],
        coverUrl: "/labubu.png",
    },
    {
        id: "ok-garmin",
        title: "Ok Garmin",
        description:
            "Near collision? Scream “Ok Garmin, video speichern” and you'll become famous.",
        defaultHashtags: ["#garmin", "#okaygarmin", "#okgarmin", "#videospeichern", "#dashcam"],
        coverUrl: "/okgarmin.png",
    },
];

const BRANDS: Brand[] = [
    {
        id: "apple",
        name: "Apple",
        logoUrl: "https://cdn.simpleicons.org/apple/ffffff",
    },
    {
        id: "openai",
        name: "OpenAI",
        logoUrl: "https://cdn.simpleicons.org/openai/ffffff",
    },
    {
        id: "nike",
        name: "Nike",
        logoUrl: "https://cdn.simpleicons.org/nike/ffffff",
    },
    {
        id: "starbucks",
        name: "Starbucks",
        logoUrl: "https://cdn.simpleicons.org/starbucks/ffffff",
    },
    {
        id: "tesla",
        name: "Tesla",
        logoUrl: "https://cdn.simpleicons.org/tesla/ffffff",
    },
];

// Generate default caption text based on selected trend and brand context
function getDefaultCaptionFor(trend: Trend, brandName: string): string {
    const brand = (brandName || "").trim();
    switch (trend.id) {
        case "italian-brainrot":
            if (brand === "Apple" || brand === "OpenAI") return "We got a new friend";
            break;
        case "ok-garmin":
            if (brand === "Tesla") return "Activate the autopilot anytime";
            break;
        case "ibiza-final-boss":
            if (brand === "Nike") return "Even the Ibiza final boss is waring Nike";
            break;
        case "labubu":
            if (brand === "Starbucks") return "All the Labubus love our coffee☕";
            break;
    }
    return `Using ${trend.title} for: ${brand || "your brand"}`;
}

const ORDER: Step[] = ["choose", "generating", "review", "publish"];

function StepIndicator({ step, onNavigate }: { step: Step; onNavigate: (s: Step) => void }) {
    const steps: { key: Step; label: string }[] = useMemo(
        () => [
            { key: "choose", label: "Select Trend" },
            { key: "generating", label: "Generate Video" },
            { key: "review", label: "Review" },
            { key: "publish", label: "Publish" },
        ],
        []
    );

    const getStatus = (key: Step) => {
        const currentIndex = ORDER.indexOf(step);
        const idx = ORDER.indexOf(key);
        if (idx < currentIndex) return "done";
        if (idx === currentIndex) return "current";
        return "todo";
    };

    return (
        <ol className="stepper">
            {steps.map((s, i) => (
                <li
                    key={s.key}
                    data-status={getStatus(s.key)}
                    onClick={() => {
                        if (ORDER.indexOf(s.key) <= ORDER.indexOf(step)) onNavigate(s.key);
                    }}
                    className="step-item"
                    role="button"
                >
                    <span className="index">{i + 1}</span>
                    <span>{s.label}</span>
                </li>
            ))}
        </ol>
    );
}

function TrendCard({
    trend,
    selected,
    onSelect,
}: {
    trend: Trend;
    selected: boolean;
    onSelect: (t: Trend) => void;
}) {
    return (
        <button
            className={`trend-card ${selected ? "selected" : ""}`}
            onClick={() => onSelect(trend)}
        >
            <div className="thumb-wrap">
                {/* Top badges for special trends */}
                {trend.id === "ibiza-final-boss" && (
                    <>
                        <div className="ribbon ribbon-newcomer">Newcomer</div>
                    </>
                )}
                {trend.id === "italian-brainrot" && (
                    <>
                        <div className="badge popular flame" aria-label="Most popular flame">
                            <span className="icon" role="img" aria-hidden>
                                🔥
                            </span>
                        </div>
                        <div className="ribbon ribbon-popular">Most popular</div>
                    </>
                )}
                <img className="trend-cover" src={trend.coverUrl} alt={trend.title} />
            </div>
            <div className="trend-title">{trend.title}</div>
            <div className="trend-desc">{trend.description}</div>
            <div className="hashtags">{trend.defaultHashtags.join(" ")}</div>
        </button>
    );
}

function ChooseStep({
    selectedTrend,
    onSelectTrend,
    companyContext,
    onUpdateContext,
    prompt,
    onUpdatePrompt,
    onGenerate,
}: {
    selectedTrend: Trend | null;
    onSelectTrend: (t: Trend) => void;
    companyContext: string;
    onUpdateContext: (val: string) => void;
    prompt: string;
    onUpdatePrompt: (val: string) => void;
    onGenerate: () => void;
}) {
    // Pure presentational; prompt is controlled by parent
    const isValidCurrentCombo =
        !!selectedTrend &&
        ((selectedTrend.id === "italian-brainrot" && companyContext === "Apple") ||
            (selectedTrend.id === "ibiza-final-boss" && companyContext === "Nike") ||
            (selectedTrend.id === "ok-garmin" && companyContext === "Tesla") ||
            (selectedTrend.id === "labubu" && companyContext === "Starbucks"));
    return (
        <div className="panel">
            <h2>Select a recent trend</h2>
            <div className="trend-grid">
                {TRENDS.map((t) => (
                    <TrendCard
                        key={t.id}
                        trend={t}
                        selected={selectedTrend?.id === t.id}
                        onSelect={onSelectTrend}
                    />
                ))}
            </div>

            <div className="brand-select">
                <h3>Select a brand</h3>
                <div className="brand-grid">
                    {BRANDS.map((b) => {
                        const isSelected = companyContext === b.name;
                        const allowed =
                            !!selectedTrend &&
                            ((selectedTrend.id === "italian-brainrot" && b.id === "apple") ||
                                (selectedTrend.id === "ibiza-final-boss" && b.id === "nike") ||
                                (selectedTrend.id === "ok-garmin" && b.id === "tesla") ||
                                (selectedTrend.id === "labubu" && b.id === "starbucks"));
                        return (
                            <button
                                type="button"
                                key={b.id}
                                className={`brand-card ${isSelected ? "selected" : ""} ${
                                    allowed ? "" : "disabled"
                                }`}
                                onClick={() => {
                                    if (!allowed) {
                                        alert(
                                            "The backend is currently mocked due to unavailable API credits for the models."
                                        );
                                        return;
                                    }
                                    onUpdateContext(b.name);
                                }}
                                aria-pressed={isSelected}
                                aria-disabled={!allowed}
                            >
                                <img
                                    className="brand-logo"
                                    src={b.logoUrl}
                                    alt={`${b.name} logo`}
                                    loading="lazy"
                                />
                                <div className="brand-name">{b.name}</div>
                            </button>
                        );
                    })}
                </div>
            </div>
            <br></br>
            {/* Prompt fine-tuning */}
            <div className="prompt-editor" style={{ marginTop: 16 }}>
                <h3>Adjust your branding in the video</h3>
                <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => onUpdatePrompt(e.target.value)}
                    placeholder="Describe how to adapt the meme for your brand..."
                />
                <p className="muted" style={{ marginTop: 6 }}>
                    This description will be integrated in our master-prompt that will be used to
                    generate the video.
                </p>
            </div>

            <div className="actions">
                <button className="primary" disabled={!isValidCurrentCombo} onClick={onGenerate}>
                    Generate Mock Video
                </button>
            </div>
        </div>
    );
}

function GeneratingStep({ onDone }: { onDone: () => void }) {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((p) => {
                const next = Math.min(p + Math.random() * 20, 100);
                return next;
            });
        }, 350);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (progress >= 100) {
            const t = setTimeout(onDone, 500);
            return () => clearTimeout(t);
        }
    }, [progress, onDone]);

    return (
        <div className="panel center">
            <div className="spinner" aria-hidden />
            <h2>Generating your video...</h2>
            <div className="progress">
                <div className="bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="muted">This is a mock. No calls to external services are made.</p>
        </div>
    );
}

function ReviewStep({
    trend,
    context,
    onBack,
    onContinue,
    onMerged,
}: {
    trend: Trend;
    context: string;
    onBack: () => void;
    onContinue: (caption: string, hashtags: string[]) => void;
    onMerged: (url: string) => void;
}) {
    const defaultCaption = getDefaultCaptionFor(trend, context);
    const [caption, setCaption] = useState<string>(defaultCaption);
    const [hashtagsText, setHashtagsText] = useState<string>(trend.defaultHashtags.join(" "));
    const media = useMemo(() => {
        if (trend.id === "ibiza-final-boss") {
            return {
                videoSrc: "/ibiza_boss.mp4",
                audioSrc: "/ibiza_boss.mp3",
                mergedDownloadName: "merged_ibiza_boss.mp4",
            } as const;
        }
        if (trend.id === "ok-garmin") {
            return {
                videoSrc: "/tesla_okgarmin.mp4",
                audioSrc: "/tesla_okgarmin.mp3",
                mergedDownloadName: "merged_tesla_okgarmin.mp4",
            } as const;
        }
        if (trend.id === "labubu") {
            return {
                videoSrc: "/starbucks_labubu.mp4",
                audioSrc: null,
                mergedDownloadName: "merged_starbucks_labubu.mp4",
            } as const;
        }
        return {
            videoSrc: "/apple_tungtung.mp4",
            audioSrc: "/apple_tungtung.mp3",
            mergedDownloadName: "merged_apple_tungtung.mp4",
        } as const;
    }, [trend.id]);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioAttached, setAudioAttached] = useState<boolean>(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [audioVolume, setAudioVolume] = useState<number>(1);
    const ffmpegRef = useRef<any | null>(null);
    const [merging, setMerging] = useState<boolean>(false);
    const [mergeError, setMergeError] = useState<string | null>(null);
    const [mergedReady, setMergedReady] = useState<boolean>(false);

    // Keep external audio in sync with the video element when attached
    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video || !audio) return;

        const handlePlay = () => {
            if (audioAttached) {
                audio.currentTime = video.currentTime;
                audio.playbackRate = video.playbackRate;
                void audio.play().catch(() => {});
            }
        };
        const handlePause = () => {
            if (audioAttached) audio.pause();
        };
        const handleRateChange = () => {
            audio.playbackRate = video.playbackRate;
        };
        const handleSeeked = () => {
            audio.currentTime = video.currentTime;
        };
        const handleTimeUpdate = () => {
            // Gentle re-sync to protect against drift
            const diff = Math.abs(audio.currentTime - video.currentTime);
            if (diff > 0.3) audio.currentTime = video.currentTime;
        };

        // Apply current attached state
        if (audioAttached) {
            video.muted = true;
            audio.currentTime = video.currentTime;
            audio.playbackRate = video.playbackRate;
            if (!video.paused) {
                void audio.play().catch(() => {});
            }
        } else {
            video.muted = false;
            audio.pause();
        }

        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("ratechange", handleRateChange);
        video.addEventListener("seeked", handleSeeked);
        video.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ratechange", handleRateChange);
            video.removeEventListener("seeked", handleSeeked);
            video.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, [audioAttached]);

    // Apply volume changes
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) audio.volume = audioVolume;
    }, [audioVolume]);

    const generateMergedVideo = async () => {
        setMergeError(null);
        setMerging(true);
        try {
            if (!ffmpegRef.current) {
                if (!loadFFmpeg || !loadFFmpegUtil) throw new Error("FFmpeg not available");
                const [{ FFmpeg }, { fetchFile }] = await Promise.all([
                    loadFFmpeg(),
                    loadFFmpegUtil(),
                ]);
                ffmpegRef.current = new FFmpeg();
                // Use default loader; can also provide core/wasm URLs via load({ coreURL, wasmURL })
                await ffmpegRef.current.load();
                // Cache fetchFile on the instance for reuse
                (ffmpegRef.current as any)._fetchFile = fetchFile;
            }
            const ffmpeg = ffmpegRef.current;
            if (!ffmpeg) throw new Error("FFmpeg init failed");

            // Write inputs
            const fetchFile = (ffmpeg as any)._fetchFile as (x: any) => Promise<Uint8Array>;
            await ffmpeg.writeFile("input.mp4", await fetchFile(media.videoSrc));
            await ffmpeg.writeFile("input.mp3", await fetchFile(media.audioSrc));

            // Mux audio onto video (copy video, re-encode audio to AAC), stop at shortest
            await ffmpeg.exec([
                "-i",
                "input.mp4",
                "-i",
                "input.mp3",
                "-c:v",
                "copy",
                "-c:a",
                "aac",
                "-shortest",
                "output.mp4",
            ]);

            const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
            const blob = new Blob([data], { type: "video/mp4" });
            const url = URL.createObjectURL(blob);

            // Update UI: detach external audio, replace player src, and report up
            setAudioAttached(false);
            const video = videoRef.current;
            const audio = audioRef.current;
            if (audio) audio.pause();
            if (video) {
                const wasPlaying = !video.paused;
                video.muted = false;
                video.src = url;
                await video.load();
                if (wasPlaying) void video.play().catch(() => {});
            }
            onMerged(url);
            setMergedReady(true);
        } catch (err: any) {
            setMergeError(err?.message ?? String(err));
        } finally {
            setMerging(false);
        }
    };

    return (
        <div className="panel">
            <h2>Review your video</h2>
            <div className="review">
                <video
                    ref={videoRef}
                    src={media.videoSrc}
                    controls
                    width={300}
                    height={534}
                    style={{ background: "#000", borderRadius: 12 }}
                />
                {/* Hidden audio element that will be played in sync with the video when attached */}
                {media.audioSrc && (
                    <audio
                        ref={audioRef}
                        src={media.audioSrc}
                        preload="auto"
                        onError={() => setAudioError(`Could not load ${media.audioSrc}`)}
                        style={{ display: "none" }}
                    />
                )}
                <div className="meta">
                    <label>Caption</label>
                    <textarea
                        rows={3}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />
                    <label>Hashtags</label>
                    <input value={hashtagsText} onChange={(e) => setHashtagsText(e.target.value)} />
                    <div className="option-row" style={{ marginTop: 8 }}>
                        <label>
                            <input
                                type="checkbox"
                                disabled={!media.audioSrc}
                                checked={!!media.audioSrc && audioAttached}
                                onChange={(e) => {
                                    setAudioError(null);
                                    setAudioAttached(e.target.checked);
                                }}
                            />{" "}
                            Add audio via{" "}
                            <img
                                src="https://11labs-nonprd-15f22c1d.s3.eu-west-3.amazonaws.com/0b9cd3e1-9fad-4a5b-b3a0-c96b0a1f1d2b/elevenlabs-logo-white.png"
                                alt="ElevenLabs"
                                style={{
                                    height: 14,
                                    verticalAlign: "text-bottom",
                                    transform: "translateY(-1px)",
                                }}
                            />
                        </label>
                    </div>
                    {media.audioSrc && audioAttached && (
                        <div
                            className="box"
                            role="region"
                            aria-label="ElevenLabs audio settings"
                            style={{
                                marginTop: 8,
                                padding: 12,
                                borderRadius: 8,
                                border: "1px solid var(--border, #333)",
                                background: "var(--surface, rgba(255,255,255,0.02))",
                            }}
                        >
                            <div className="muted">
                                Audio attached via{" "}
                                <img
                                    src="https://11labs-nonprd-15f22c1d.s3.eu-west-3.amazonaws.com/0b9cd3e1-9fad-4a5b-b3a0-c96b0a1f1d2b/elevenlabs-logo-white.png"
                                    alt="ElevenLabs"
                                    style={{
                                        height: 12,
                                        verticalAlign: "text-bottom",
                                        transform: "translateY(-1px)",
                                    }}
                                />{" "}
                                ✓
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    alignItems: "center",
                                    marginTop: 8,
                                }}
                            >
                                <label htmlFor="elevenlabs-volume" style={{ minWidth: 60 }}>
                                    Volume
                                </label>
                                <input
                                    id="elevenlabs-volume"
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={Math.round(audioVolume * 100)}
                                    onChange={(e) => setAudioVolume(Number(e.target.value) / 100)}
                                />
                                <span className="muted" style={{ width: 36, textAlign: "right" }}>
                                    {Math.round(audioVolume * 100)}%
                                </span>
                            </div>
                            {audioError && (
                                <div className="error" role="alert" style={{ marginTop: 8 }}>
                                    {audioError}
                                </div>
                            )}
                            <div className="actions" style={{ marginTop: 12 }}>
                                <button
                                    className="primary"
                                    disabled={merging}
                                    onClick={generateMergedVideo}
                                >
                                    {merging ? "Merging…" : "Generate merged video"}
                                </button>
                            </div>
                            {mergedReady && !merging && !mergeError && (
                                <div className="muted" style={{ marginTop: 8 }}>
                                    Merged video ready. You can download it in the Publish step.
                                </div>
                            )}
                            {mergeError && (
                                <div className="error" role="alert" style={{ marginTop: 8 }}>
                                    {mergeError}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="actions">
                        <button onClick={onBack}>Back</button>
                        <button
                            className="primary"
                            onClick={() =>
                                onContinue(caption, hashtagsText.split(/\s+/).filter(Boolean))
                            }
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

type PublishStatus = "idle" | "uploading" | "done";

function PublishStep({
    caption,
    hashtags,
    mergedUrl,
    onRestart,
    onAllDone,
}: {
    caption: string;
    hashtags: string[];
    mergedUrl: string | null;
    onRestart: () => void;
    onAllDone: () => void;
}) {
    const [targets, setTargets] = useState<string[]>(["tiktok"]);
    const [statusMap, setStatusMap] = useState<Record<string, PublishStatus>>({});
    const [started, setStarted] = useState(false);
    const notifiedRef = useRef(false);

    const startUploadFor = (platform: string, delayBase = 900) => {
        setStatusMap((m) => ({ ...m, [platform]: "uploading" }));
        const delay = delayBase + Math.random() * 900;
        setTimeout(() => {
            setStatusMap((m) => ({ ...m, [platform]: "done" }));
        }, delay);
    };

    const toggle = (t: string) => {
        setTargets((prev) => {
            const exists = prev.includes(t);
            const next = exists ? prev.filter((x) => x !== t) : [...prev, t];
            if (started && !exists) {
                // If uploading already started and user adds a new platform, start it immediately
                startUploadFor(t);
            }
            return next;
        });
    };

    const publish = () => {
        setStarted(true);
        // Kick off uploads for all currently selected targets
        targets.forEach((t, i) => startUploadFor(t, 900 + i * 600));
    };

    const allDone = targets.length > 0 && targets.every((t) => statusMap[t] === "done");

    useEffect(() => {
        if (allDone && !notifiedRef.current) {
            notifiedRef.current = true;
            // small delay to let the UI show the final "Uploaded ✓" state
            const t = setTimeout(() => onAllDone(), 600);
            return () => clearTimeout(t);
        }
    }, [allDone, onAllDone]);

    return (
        <div className="panel">
            <h2>Publish</h2>
            <p className="muted">
                Mock upload to selected platforms. Nothing actually leaves your machine.
            </p>
            <div className="publish">
                <div className="platforms">
                    <label>
                        <input
                            type="checkbox"
                            checked={targets.includes("tiktok")}
                            onChange={() => toggle("tiktok")}
                        />{" "}
                        TikTok
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={targets.includes("instagram")}
                            onChange={() => toggle("instagram")}
                        />{" "}
                        Instagram Reels
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={targets.includes("youtube")}
                            onChange={() => toggle("youtube")}
                        />{" "}
                        YouTube Shorts
                    </label>
                </div>

                <div className="preview">
                    <div className="caption-box">
                        <div className="label">Caption</div>
                        <div className="value">{caption}</div>
                    </div>
                    <div className="caption-box">
                        <div className="label">Hashtags</div>
                        <div className="value">{hashtags.join(" ")}</div>
                    </div>
                    {mergedUrl && (
                        <div className="caption-box">
                            <div className="label">Merged Video</div>
                            <div className="value">
                                <a className="button" href={mergedUrl} download>
                                    Download merged video
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!started ? (
                <div className="actions">
                    <button className="primary" disabled={targets.length === 0} onClick={publish}>
                        Publish
                    </button>
                </div>
            ) : (
                <div className="upload-status">
                    {targets.map((t) => (
                        <div key={t} className="upload-row" data-status={statusMap[t] ?? "idle"}>
                            <span className="platform">{t}</span>
                            <span className="state">
                                {statusMap[t] === "done"
                                    ? "Uploaded ✓"
                                    : statusMap[t] === "uploading"
                                    ? "Uploading…"
                                    : "Queued"}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {allDone && (
                <div className="actions">
                    <button onClick={onRestart}>Create another</button>
                </div>
            )}
        </div>
    );
}

export default function App() {
    const [step, setStep] = useState<Step>("choose");
    const [trend, setTrend] = useState<Trend | null>(null);
    const [context, setContext] = useState<string>("");
    const buildPrompt = (trend: Trend | null, brand: string) => {
        const brandName = brand || "your brand";
        if (!trend) {
            return `Create a short, catchy vertical video concept for ${brandName} using a trending meme. Keep it fast-paced with bold captions and include 3-5 relevant hashtags.`;
        }
        const tagLine = trend.defaultHashtags.join(" ");
        return `Create a short vertical video for ${brandName} using the "${trend.title}" meme. Style: ${trend.description} Captions should be bold and punchy. Include on-screen callout to ${brandName}. Keep it authentic, playful, and shareable. Hashtags: ${tagLine}.`;
    };
    const [prompt, setPrompt] = useState<string>(buildPrompt(trend, context));
    const [caption, setCaption] = useState<string>("");
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [mergedUrl, setMergedUrl] = useState<string | null>(null);
    const [newlyPostedId, setNewlyPostedId] = useState<string | null>(null);

    type AnalyticsPost = {
        id: string;
        caption: string;
        hashtags: string[];
        coverUrl: string; // image preview
        mediaUrl?: string; // optional video url
        platform: string;
        createdAt: string; // ISO
        views: number;
        likes: number;
        comments: { id: string; author: string; text: string }[];
    };

    const [feedItems, setFeedItems] = useState<AnalyticsPost[]>(() => [
        {
            id: "p1",
            caption: "POV: You’re the final boss landing in Ibiza ✈️",
            hashtags: ["#ibizafinalboss", "#finalboss", "#Ibiza"],
            coverUrl: "/ibizafinalboss.png",
            platform: "tiktok",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            views: 128_400,
            likes: 9_240,
            comments: [
                { id: "c1", author: "@maria", text: "This trend still hits 😂" },
                { id: "c2", author: "@leo", text: "Final boss energy fr" },
            ],
        },
        {
            id: "p2",
            caption: "Labubu goes gold for Q1 wins",
            hashtags: ["#labubu", "#gold", "#labubuthemonsters"],
            coverUrl: "/labubu.png",
            platform: "instagram",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            views: 64_900,
            likes: 4_310,
            comments: [
                { id: "c3", author: "@soph", text: "So cute omg" },
                { id: "c4", author: "@kim", text: "Where can I get this?!" },
            ],
        },
        {
            id: "p3",
            caption: "‘Ok Garmin’ but make it retail checkout",
            hashtags: ["#garmin", "#okgarmin", "#dashcam"],
            coverUrl: "/okgarmin.png",
            platform: "youtube",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            views: 42_120,
            likes: 2_640,
            comments: [{ id: "c5", author: "@jules", text: "LMFAO the cut at 0:05" }],
        },
    ]);

    // Sync prompt when the selected trend or brand changes, unless user already edited
    useEffect(() => {
        setPrompt(buildPrompt(trend, context));
    }, [trend, context]);

    const goBack = () => {
        if (!ORDER.includes(step)) return; // no-op outside pipeline
        const currentIdx = ORDER.indexOf(step);
        const prev = ORDER[Math.max(0, currentIdx - 1)];
        setStep(prev);
    };

    const handlePublishAllDone = () => {
        // Create a new mock post from current session
        const id = `new_${Date.now()}`;
        const coverUrl = trend?.coverUrl ?? "/tungtungtungsahur.png";
        const platform = "tiktok";
        const createdAt = new Date().toISOString();
        const captionToUse =
            caption ||
            (trend ? `Using ${trend.title} for ${context || "your brand"}` : "New meme post");
        const hashtagsToUse = hashtags.length ? hashtags : trend?.defaultHashtags ?? [];
        const views = 48 + Math.floor(Math.random() * 2_800);
        const likes = Math.floor(views * (0.06 + Math.random() * 0.004));
        const comments = [
            { id: `cm_${id}_1`, author: "@alex", text: "Already seeing this everywhere 🔥" },
            { id: `cm_${id}_2`, author: "@tay", text: "Algorithm picked it up quick" },
        ];
        const newItem: AnalyticsPost = {
            id,
            caption: captionToUse,
            hashtags: hashtagsToUse,
            coverUrl,
            mediaUrl:
                mergedUrl ??
                (trend?.id === "ibiza-final-boss"
                    ? "/ibiza_boss.mp4"
                    : trend?.id === "ok-garmin"
                    ? "/tesla_okgarmin.mp4"
                    : trend?.id === "labubu"
                    ? "/starbucks_labubu.mp4"
                    : "/apple_tungtung.mp4"),
            platform,
            createdAt,
            views,
            likes,
            comments,
        };
        setFeedItems((prev) => [newItem, ...prev]);
        setNewlyPostedId(id);
        // Do not auto-navigate; user can open analytics from header
    };

    function AnalyticsStep({
        items,
        highlightId,
        onCreateAnother,
    }: {
        items: typeof feedItems;
        highlightId: string | null;
        onCreateAnother: () => void;
    }) {
        const totalViews = items.reduce((sum, p) => sum + p.views, 0);
        const totalLikes = items.reduce((sum, p) => sum + p.likes, 0);
        const totalComments = items.reduce((sum, p) => sum + p.comments.length, 0);

        // Simple 7-day sparkline data (mock)
        const last7 = Array.from(
            { length: 7 },
            (_, i) => 200 + Math.round(Math.sin(i / 2) * 80 + Math.random() * 100)
        );
        const max7 = Math.max(...last7);
        const points = last7
            .map((v, i) => {
                const x = (i / 6) * 260;
                const y = 80 - (v / max7) * 80;
                return `${x},${y}`;
            })
            .join(" ");

        // Aggregate likes by platform to avoid duplicate platform rows
        const platformToLikes = items.reduce<Record<string, number>>((acc, p) => {
            acc[p.platform] = (acc[p.platform] ?? 0) + p.likes;
            return acc;
        }, {});
        const platformRows = Object.entries(platformToLikes);
        const maxLikes = Math.max(...platformRows.map(([, v]) => v));

        return (
            <div className="panel analytics">
                {/* Left: Recent posts */}
                <div className="analytics-left">
                    <div className="list-header">
                        <h3>Recent posts</h3>
                        <button onClick={onCreateAnother}>Create another</button>
                    </div>
                    <div className="feed-list">
                        {items.map((p) => (
                            <div
                                key={p.id}
                                className={`feed-item ${p.id === highlightId ? "new" : ""}`}
                            >
                                <div className="media">
                                    <img src={p.coverUrl} alt="cover" />
                                    {p.id === highlightId && <span className="pill">New</span>}
                                </div>
                                <div className="content">
                                    <div className="cap">{p.caption}</div>
                                    <div className="hash">{p.hashtags.join(" ")}</div>
                                    <div className="nums">
                                        <span>👁️ {p.views.toLocaleString()}</span>
                                        <span>❤️ {p.likes.toLocaleString()}</span>
                                        <span>💬 {p.comments.length}</span>
                                    </div>
                                    {p.comments[0] && (
                                        <div className="comment">
                                            <span className="author">{p.comments[0].author}</span>{" "}
                                            {p.comments[0].text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Charts */}
                <div className="analytics-right">
                    <h2>Performance analytics</h2>
                    <div className="stat-cards">
                        <div className="stat-card">
                            <div className="label">Total views</div>
                            <div className="value">{totalViews.toLocaleString()}</div>
                        </div>
                        <div className="stat-card">
                            <div className="label">Total likes</div>
                            <div className="value">{totalLikes.toLocaleString()}</div>
                        </div>
                        <div className="stat-card">
                            <div className="label">Comments</div>
                            <div className="value">{totalComments.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="charts">
                        <div className="chart-card">
                            <div className="chart-title">Views, last 7d</div>
                            <svg viewBox="0 0 260 100" className="chart" aria-label="Views">
                                <polyline
                                    fill="none"
                                    stroke="#646cff"
                                    strokeWidth="2"
                                    points={points}
                                />
                                {last7.map((v, i) => {
                                    const x = (i / 6) * 260;
                                    const y = 80 - (v / max7) * 80;
                                    return <circle key={i} cx={x} cy={y} r={2.2} fill="#9aa0ff" />;
                                })}
                            </svg>
                        </div>
                        <div className="chart-card">
                            <div className="chart-title">Likes by platform</div>
                            <div className="bars">
                                {platformRows.map(([platform, likeCount]) => {
                                    const pct = Math.min(
                                        100,
                                        Math.round((likeCount / (maxLikes || 1)) * 100)
                                    );
                                    return (
                                        <div key={platform} className="bar-row">
                                            <div className="bar-label">{platform}</div>
                                            <div className="bar-track">
                                                <div
                                                    className="bar-fill"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="bar-value">
                                                {likeCount.toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container full">
            <header className="app-header glass">
                <div className="left">
                    {ORDER.includes(step) && step !== "choose" && (
                        <button className="ghost back" onClick={goBack}>
                            ← Back
                        </button>
                    )}
                    <div className="brand">Trendify: Keep up with the Memes</div>
                </div>
                <div className="links">
                    {step !== "analytics" ? (
                        <button onClick={() => setStep("analytics")}>View analytics</button>
                    ) : (
                        <button onClick={() => setStep("choose")}>Close analytics</button>
                    )}
                </div>
            </header>

            {ORDER.includes(step) && <StepIndicator step={step} onNavigate={setStep} />}

            {step === "choose" && (
                <ChooseStep
                    selectedTrend={trend}
                    onSelectTrend={(t) => {
                        setTrend(t);
                        // Clear invalid brand selection when switching trend
                        setContext((prev) => {
                            const wasApple = prev === "Apple";
                            const wasNike = prev === "Nike";
                            const wasTesla = prev === "Tesla";
                            const wasStarbucks = prev === "Starbucks";
                            const staysValid =
                                (t.id === "italian-brainrot" && wasApple) ||
                                (t.id === "ibiza-final-boss" && wasNike) ||
                                (t.id === "ok-garmin" && wasTesla) ||
                                (t.id === "labubu" && wasStarbucks);
                            return staysValid ? prev : "";
                        });
                    }}
                    companyContext={context}
                    onUpdateContext={setContext}
                    prompt={prompt}
                    onUpdatePrompt={setPrompt}
                    onGenerate={() => {
                        setStep("generating");
                    }}
                />
            )}

            {step === "generating" && (
                <GeneratingStep
                    onDone={() => {
                        setStep("review");
                    }}
                />
            )}

            {step === "review" && trend && (
                <ReviewStep
                    trend={trend}
                    context={context}
                    onBack={() => setStep("choose")}
                    onMerged={(url) => {
                        // Revoke previous blob URL if any
                        if (mergedUrl) URL.revokeObjectURL(mergedUrl);
                        setMergedUrl(url);
                    }}
                    onContinue={(cap, tags) => {
                        setCaption(cap);
                        setHashtags(tags);
                        setStep("publish");
                    }}
                />
            )}

            {step === "publish" && (
                <PublishStep
                    caption={caption}
                    hashtags={hashtags}
                    mergedUrl={mergedUrl}
                    onRestart={() => {
                        setTrend(null);
                        setCaption("");
                        setHashtags([]);
                        setContext("");
                        setPrompt(buildPrompt(null, ""));
                        if (mergedUrl) URL.revokeObjectURL(mergedUrl);
                        setMergedUrl(null);
                        setStep("choose");
                    }}
                    onAllDone={handlePublishAllDone}
                />
            )}

            {step === "analytics" && (
                <AnalyticsStep
                    items={feedItems}
                    highlightId={newlyPostedId}
                    onCreateAnother={() => {
                        setTrend(null);
                        setCaption("");
                        setHashtags([]);
                        setContext("");
                        setPrompt(buildPrompt(null, ""));
                        if (mergedUrl) URL.revokeObjectURL(mergedUrl);
                        setMergedUrl(null);
                        setNewlyPostedId(null);
                        setStep("choose");
                    }}
                />
            )}

            <footer className="app-footer">
                Built for Hack Nation 2025 • Mock demo - no external uploads
            </footer>
        </div>
    );
}
