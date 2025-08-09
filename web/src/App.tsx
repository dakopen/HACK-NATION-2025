import { useEffect, useMemo, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import "./App.css";

type Step = "choose" | "generating" | "review" | "publish";

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
        description: "Fast-cuts, zooms, meme-y sound bed with over-the-top captions.",
        defaultHashtags: ["#italianbrainrot", "#meme", "#viral"],
        coverUrl: "/tungtungtungsahur.png",
    },
    {
        id: "ibiza-final-boss",
        title: "Ibiza Final Boss",
        description: "The final boss of the game 'Ibiza'.",
        defaultHashtags: ["#ibizafinalboss", "#ibizafinalboss2025", "#ibizafinalboss2025live"],
        coverUrl: "/ibizafinalboss.png",
    },
    {
        id: "labubu",
        title: "Labubu",
        description:
            "Labubu is a cute and funny character from the game 'Hello Kitty's Surprise Party'.",
        defaultHashtags: ["#labubu", "#labubu2025", "#labubu2025live"],
        coverUrl: "/labubu.png",
    },
    {
        id: "ok-garmin",
        title: "Ok Garmin",
        description: "'Ok Garmin' stoppe das video",
        defaultHashtags: ["#okgarmin", "#okgarminlive", "#okgarminlive2025"],
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
    onGenerate,
}: {
    selectedTrend: Trend | null;
    onSelectTrend: (t: Trend) => void;
    companyContext: string;
    onUpdateContext: (val: string) => void;
    onGenerate: () => void;
}) {
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
                        return (
                            <button
                                type="button"
                                key={b.id}
                                className={`brand-card ${isSelected ? "selected" : ""}`}
                                onClick={() => onUpdateContext(b.name)}
                                aria-pressed={isSelected}
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

            <div className="actions">
                <button
                    className="primary"
                    disabled={!selectedTrend || !companyContext}
                    onClick={onGenerate}
                >
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
    const defaultCaption = `Using ${trend.title} for: ${context || "your brand"}`;
    const [caption, setCaption] = useState<string>(defaultCaption);
    const [hashtagsText, setHashtagsText] = useState<string>(trend.defaultHashtags.join(" "));
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioAttached, setAudioAttached] = useState<boolean>(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [audioVolume, setAudioVolume] = useState<number>(1);
    const ffmpegRef = useRef<FFmpeg | null>(null);
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
                ffmpegRef.current = new FFmpeg();
                await ffmpegRef.current.load();
            }
            const ffmpeg = ffmpegRef.current;
            if (!ffmpeg) throw new Error("FFmpeg init failed");

            // Write inputs
            await ffmpeg.writeFile("input.mp4", await fetchFile("/apple_tungtung.mp4"));
            await ffmpeg.writeFile("input.mp3", await fetchFile("/apple_tungtung.mp3"));

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
                    src="/apple_tungtung.mp4"
                    controls
                    width={300}
                    height={534}
                    style={{ background: "#000", borderRadius: 12 }}
                />
                {/* Hidden audio element that will be played in sync with the video when attached */}
                <audio
                    ref={audioRef}
                    src="/apple_tungtung.mp3"
                    preload="auto"
                    onError={() => setAudioError("Could not load /apple_tungtung.mp3")}
                    style={{ display: "none" }}
                />
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
                                checked={audioAttached}
                                onChange={(e) => {
                                    setAudioError(null);
                                    setAudioAttached(e.target.checked);
                                }}
                            />{" "}
                            Add audio via ElevenLabs
                        </label>
                    </div>
                    {audioAttached && (
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
                            <div className="muted">Audio attached via ElevenLabs ✓</div>
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
}: {
    caption: string;
    hashtags: string[];
    mergedUrl: string | null;
    onRestart: () => void;
}) {
    const [targets, setTargets] = useState<string[]>(["tiktok"]);
    const [statusMap, setStatusMap] = useState<Record<string, PublishStatus>>({});
    const [started, setStarted] = useState(false);

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
                                <a
                                    className="button"
                                    href={mergedUrl}
                                    download="merged_apple_tungtung.mp4"
                                >
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
    const [caption, setCaption] = useState<string>("");
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [mergedUrl, setMergedUrl] = useState<string | null>(null);

    const goBack = () => {
        const currentIdx = ORDER.indexOf(step);
        const prev = ORDER[Math.max(0, currentIdx - 1)];
        setStep(prev);
    };

    return (
        <div className="container full">
            <header className="app-header glass">
                <div className="left">
                    {step !== "choose" && (
                        <button className="ghost back" onClick={goBack}>
                            ← Back
                        </button>
                    )}
                    <div className="brand">Keep up with the trends</div>
                </div>
            </header>

            <StepIndicator step={step} onNavigate={setStep} />

            {step === "choose" && (
                <ChooseStep
                    selectedTrend={trend}
                    onSelectTrend={(t) => setTrend(t)}
                    companyContext={context}
                    onUpdateContext={setContext}
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
                        if (mergedUrl) URL.revokeObjectURL(mergedUrl);
                        setMergedUrl(null);
                        setStep("choose");
                    }}
                />
            )}

            <footer className="app-footer">
                Built for Hack Nation 2025 • Mock demo – no external uploads
            </footer>
        </div>
    );
}
