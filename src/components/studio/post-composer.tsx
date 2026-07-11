"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import {
  FORMAT_DIMENSIONS,
  FORMAT_LABELS,
  FORMAT_ORDER,
  POST_TYPES,
  POST_TYPE_ORDER,
  type PostFormat,
  type PostTypeKey,
} from "@/lib/studio-post-types";
import { buildCaption } from "@/lib/studio-captions";
import { PostPreview, type PostTemplate } from "@/components/studio/post-preview";
import { TEMPLATES } from "@/components/studio/templates";

/** On-screen scale per format (the export still renders at full 1080-wide). */
const DISPLAY_SCALE: Record<PostFormat, number> = { square: 0.44, story: 0.34, facebook: 0.4 };

/** localStorage key for the remembered brand identity fields. */
const BRAND_STORAGE_KEY = "ffs-brand-profile-v1";

const GROUP_ORDER = ["Classic", "Marketing", "Showcase", "Diagonal", "Flyer", "Script", "Statement", "Bold", "Soft", "Luxury", "Playful", "Agent Promo", "Co-Brand"] as const;

/**
 * Simple mode shows one curated look per template group — six diverse
 * choices instead of the full gallery. "Fine-tune" reveals everything.
 */
const CURATED_LOOKS = GROUP_ORDER.map((group) =>
  TEMPLATES.find((t) => t.group === group)
)
  .filter((t): t is (typeof TEMPLATES)[number] => Boolean(t))
  .slice(0, 6);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type ImgKind = "photo" | "headshot" | "logo";

/** Downscale + recompress an upload so a 20MB phone photo doesn't bloat the PNG or freeze the browser. */
const IMG_OPTS: Record<ImgKind, { maxEdge: number; type: string; quality: number }> = {
  photo: { maxEdge: 1600, type: "image/jpeg", quality: 0.82 },
  headshot: { maxEdge: 800, type: "image/jpeg", quality: 0.85 },
  logo: { maxEdge: 600, type: "image/png", quality: 1 }, // PNG keeps logo transparency
};

async function downscaleToDataUrl(file: File, kind: ImgKind): Promise<string> {
  const { maxEdge, type, quality } = IMG_OPTS[kind];
  const raw = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = raw;
  });
  const longEdge = Math.max(img.width, img.height);
  const factor = Math.min(1, maxEdge / longEdge);
  if (factor === 1 && raw.length < 1_500_000) return raw; // already small enough
  const w = Math.round(img.width * factor);
  const h = Math.round(img.height * factor);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return raw;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL(type, quality);
}

export function PostComposer() {
  const exportRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const lookScrollRef = useRef<HTMLDivElement>(null);
  const [colW, setColW] = useState(440);

  const [postType, setPostType] = useState<PostTypeKey>("now_leasing");
  const [format, setFormat] = useState<PostFormat>("square");
  const [template, setTemplate] = useState<PostTemplate>("overlay");
  const [headline, setHeadline] = useState("Brand-new pool homes in Cape Coral");
  const [area, setArea] = useState("Cape Coral, FL");
  const [beds, setBeds] = useState("4");
  const [baths, setBaths] = useState("2");
  const [garage, setGarage] = useState("3-Car");
  const [sqft, setSqft] = useState("");
  const [pool, setPool] = useState("Private Pool");
  const [price, setPrice] = useState("");
  const [feature1, setFeature1] = useState("Cathedral ceilings");
  const [feature2, setFeature2] = useState("42″ cabinets + granite");
  const [feature3, setFeature3] = useState("Screened lanai");
  const [cta, setCta] = useState(POST_TYPES.now_leasing.defaultCta);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [extraPhotos, setExtraPhotos] = useState<(string | null)[]>([null, null, null]);
  const [agentName, setAgentName] = useState("");
  const [agentTitle, setAgentTitle] = useState("");
  const [headshotUrl, setHeadshotUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("frameandformstudio.com");
  const [address, setAddress] = useState("Cape Coral · Fort Myers · Naples");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerRole, setPartnerRole] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerHeadshotUrl, setPartnerHeadshotUrl] = useState<string | null>(null);
  const [service1, setService1] = useState("First-Time Buyers — guiding you to your first home with ease");
  const [service2, setService2] = useState("Sellers — maximizing value and making the process seamless");
  const [service3, setService3] = useState("Investors — smart real estate moves, strong returns");
  const [service4, setService4] = useState("Relocations — landing you softly in Southwest Florida");
  const [socialHandle, setSocialHandle] = useState("");
  const [tagline, setTagline] = useState("");
  const [email, setEmail] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState<"caption" | "tags" | null>(null);
  const [batchPhotos, setBatchPhotos] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);
  const [autofilling, setAutofilling] = useState(false);
  const [advanced, setAdvanced] = useState(false);

  const config = POST_TYPES[postType];

  function handlePostTypeChange(key: PostTypeKey) {
    setPostType(key);
    setCta(POST_TYPES[key].defaultCta);
  }

  function loadImage(event: ChangeEvent<HTMLInputElement>, set: (v: string | null) => void, kind: ImgKind = "photo") {
    const file = event.target.files?.[0];
    if (!file) return;
    downscaleToDataUrl(file, kind)
      .then(set)
      .catch(() => set(null));
  }

  function handleExtraPhoto(index: number, event: ChangeEvent<HTMLInputElement>) {
    loadImage(event, (v) => setExtraPhotos((prev) => prev.map((p, i) => (i === index ? v : p))), "photo");
  }

  const stats = useMemo(() => {
    if (config.sensitive) return []; // commercial showcase — no residential specs
    const out: string[] = [];
    if (beds.trim()) out.push(`${beds.trim()} Bed`);
    if (baths.trim()) out.push(`${baths.trim()} Bath`);
    if (garage.trim()) out.push(`${garage.trim()} Garage`);
    if (sqft.trim()) {
      const n = Number(sqft.replace(/[^0-9]/g, ""));
      out.push(`${Number.isFinite(n) && n > 0 ? n.toLocaleString() : sqft.trim()} Sqft`);
    }
    if (pool.trim()) out.push(pool.trim());
    return out;
  }, [config.sensitive, beds, baths, garage, sqft, pool]);

  const features = useMemo(
    () => [feature1, feature2, feature3].map((f) => f.trim()).filter(Boolean),
    [feature1, feature2, feature3],
  );

  const photos = useMemo(
    () => [photoUrl, ...extraPhotos].filter((x): x is string => Boolean(x)),
    [photoUrl, extraPhotos],
  );

  const services = useMemo(
    () => [service1, service2, service3, service4].map((s) => s.trim()).filter(Boolean),
    [service1, service2, service3, service4],
  );

  const { caption, hashtags } = useMemo(
    () =>
      buildCaption({
        postType,
        headline,
        area,
        stats,
        features,
        price,
        showPrice: config.showPrice,
        cta,
      }),
    [postType, headline, area, stats, features, price, config.showPrice, cta],
  );

  async function handleCopy(kind: "caption" | "tags") {
    const text = kind === "caption" ? `${caption}\n\n${hashtags}` : hashtags;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      window.alert("Copy failed — select the text and copy manually.");
    }
  }

  /**
   * Fire-and-forget: persist an exported graphic to the user's content
   * library so the dashboard and Content tab reflect Quick Post work.
   */
  function saveQuickPost(
    dataUrl: string,
    meta: {
      postType: string;
      templateKey: string;
      format: string;
      headline: string;
      area: string;
      caption: string;
      hashtags: string;
    }
  ) {
    fetch("/api/quick-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl, ...meta }),
    }).catch(() => {});
  }

  async function handleDownload() {
    const node = exportRef.current;
    if (!node) return;
    setIsExporting(true);
    try {
      await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const { width, height } = FORMAT_DIMENSIONS[format];
      const dataUrl = await toPng(node, { width, height, pixelRatio: 1, cacheBust: true });
      const link = document.createElement("a");
      const base = slugify(`${config.eyebrow} ${area || headline}`) || "ffs-post";
      link.download = `${base}.png`;
      link.href = dataUrl;
      link.click();
      saveQuickPost(dataUrl, {
        postType,
        templateKey: template,
        format,
        headline,
        area,
        caption,
        hashtags,
      });
    } catch (error) {
      console.error("Export failed", error);
      window.alert("Export failed — see the browser console for details.");
    } finally {
      setIsExporting(false);
    }
  }

  /** Shrink an existing data URL for the vision API (768px JPEG). */
  async function shrinkForApi(dataUrl: string): Promise<string> {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
    const factor = Math.min(1, 768 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * factor);
    canvas.height = Math.round(img.height * factor);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.75);
  }

  /**
   * AI autofill: photo + location in → headline, features, pool, CTA out.
   * Runs automatically when a hero photo is uploaded (silent on failure)
   * and manually from the button (which reports errors).
   */
  async function handleAutofill(sourceUrl?: string, silent = false) {
    const src = sourceUrl ?? photoUrl;
    if (!src) return;
    setAutofilling(true);
    try {
      const image = await shrinkForApi(src);
      const res = await fetch("/api/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, area, postLabel: config.eyebrow }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? `Autofill failed (${res.status})`);
      }
      const result = (await res.json()) as {
        headline: string;
        features: string[];
        pool: string;
        cta: string;
        area: string;
      };
      if (result.headline) setHeadline(result.headline);
      if (result.features[0]) setFeature1(result.features[0]);
      if (result.features[1]) setFeature2(result.features[1]);
      if (result.features[2]) setFeature3(result.features[2]);
      setPool(result.pool);
      if (result.cta) setCta(result.cta);
      if (result.area) setArea(result.area);
    } catch (error) {
      console.error("Autofill failed", error);
      if (!silent) {
        window.alert(
          error instanceof Error ? error.message : "Autofill failed — try again."
        );
      }
    } finally {
      setAutofilling(false);
    }
  }

  /**
   * Bulk photo upload: up to 4 at once. The first becomes the hero
   * (tap any thumbnail to change that), the rest fill the collage
   * slots. Autofill fires on the hero automatically.
   */
  async function handlePhotosUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 4);
    if (files.length === 0) return;
    try {
      const urls = await Promise.all(
        files.map((f) => downscaleToDataUrl(f, "photo"))
      );
      setPhotoUrl(urls[0]);
      setExtraPhotos([urls[1] ?? null, urls[2] ?? null, urls[3] ?? null]);
      // Silent autofill on the hero — a hiccup never interrupts upload.
      void handleAutofill(urls[0], true);
    } catch {
      setPhotoUrl(null);
    }
  }

  /** Promote a photo to hero; the old hero takes its slot. */
  function makeHero(url: string) {
    if (!photoUrl || url === photoUrl) return;
    const oldHero = photoUrl;
    setExtraPhotos((prev) => prev.map((p) => (p === url ? oldHero : p)));
    setPhotoUrl(url);
    void handleAutofill(url, true);
  }

  /**
   * "Make my week": one click turns the batch photos into a varied week
   * of content. Each photo gets its own AI-drafted copy, a rotated post
   * type (anchored on the currently selected type), and a rotated look.
   * Output: one ZIP with every graphic in Square + Story plus a
   * captions.txt with ready-to-paste captions per day.
   */
  async function handleMakeWeek() {
    const node = exportRef.current;
    if (!node || batchPhotos.length === 0) return;

    const weekPhotos = batchPhotos.slice(0, 7);
    const anchor = postType;
    const weekTypes: PostTypeKey[] = [
      anchor,
      "recently_photographed",
      "open_house",
      anchor,
      "agent_promo",
      "recently_photographed",
      anchor,
    ];

    const original = {
      photoUrl,
      extraPhotos,
      format,
      template,
      postType,
      headline,
      area,
      feature1,
      feature2,
      feature3,
      pool,
      cta,
    };

    setIsExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const { buildZip, dataUrlToBytes } = await import("@/lib/zip");
      const entries: { name: string; data: Uint8Array }[] = [];
      const captionLines: string[] = [];
      const formats: PostFormat[] = ["square", "story"];
      const total = weekPhotos.length * formats.length;
      let done = 0;

      for (let i = 0; i < weekPhotos.length; i++) {
        const dayType = weekTypes[i % weekTypes.length];
        const dayConfig = POST_TYPES[dayType];
        const look = CURATED_LOOKS[i % CURATED_LOOKS.length].key;

        // Draft this day's copy from its photo (fall back to current
        // fields if the AI call hiccups — the week never fails on copy).
        setBatchProgress(`Writing day ${i + 1} copy…`);
        let draft = {
          headline,
          features: [feature1, feature2, feature3],
          pool,
          cta: dayConfig.defaultCta,
          area,
        };
        try {
          const image = await shrinkForApi(weekPhotos[i]);
          const res = await fetch("/api/autofill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image, area, postLabel: dayConfig.eyebrow }),
          });
          if (res.ok) {
            const ai = (await res.json()) as {
              headline: string;
              features: string[];
              pool: string;
              cta: string;
              area: string;
            };
            draft = {
              headline: ai.headline || draft.headline,
              features: [
                ai.features[0] || feature1,
                ai.features[1] || feature2,
                ai.features[2] || feature3,
              ],
              pool: ai.pool,
              cta: ai.cta || dayConfig.defaultCta,
              area: ai.area || area,
            };
          }
        } catch {
          // fall back silently
        }

        // Drive the live preview into this day's state. The OTHER week
        // photos fill the collage slots so multi-photo templates never
        // render empty "upload a photo" placeholders.
        const others = weekPhotos.filter((_, k) => k !== i);
        setPhotoUrl(weekPhotos[i]);
        setExtraPhotos([others[0] ?? null, others[1] ?? null, others[2] ?? null]);
        setPostType(dayType);
        setTemplate(look);
        setHeadline(draft.headline);
        setFeature1(draft.features[0]);
        setFeature2(draft.features[1]);
        setFeature3(draft.features[2]);
        setPool(draft.pool);
        setCta(draft.cta);
        if (draft.area) setArea(draft.area);

        // Caption for the day (pure function — no state dependency)
        const dayStats = dayConfig.sensitive
          ? []
          : stats;
        const { caption: dayCaption, hashtags: dayTags } = buildCaption({
          postType: dayType,
          headline: draft.headline,
          area: draft.area || area,
          stats: dayStats,
          features: draft.features.filter((f) => f.trim()),
          price,
          showPrice: dayConfig.showPrice,
          cta: draft.cta,
        });

        for (const fmt of formats) {
          setBatchProgress(`Rendering day ${i + 1} — ${done + 1} of ${total}…`);
          setFormat(fmt);
          await new Promise((r) => setTimeout(r, 60));
          await waitForRender(node);
          const { width, height } = FORMAT_DIMENSIONS[fmt];
          const dataUrl = await toPng(node, { width, height, pixelRatio: 1, cacheBust: true });
          entries.push({
            name: `day-${String(i + 1).padStart(2, "0")}-${dayType}-${fmt}.png`,
            data: dataUrlToBytes(dataUrl),
          });
          // Persist the square render to the content library (one save
          // per day keeps the library tidy).
          if (fmt === "square") {
            saveQuickPost(dataUrl, {
              postType: dayType,
              templateKey: look,
              format: fmt,
              headline: draft.headline,
              area: draft.area || area,
              caption: dayCaption,
              hashtags: dayTags,
            });
          }
          done++;
        }
        captionLines.push(
          `===== Day ${i + 1} — ${dayConfig.name} =====\n\n${dayCaption}\n\n${dayTags}\n`
        );
      }

      setBatchProgress("Packaging ZIP…");
      entries.push({
        name: "captions.txt",
        data: new TextEncoder().encode(captionLines.join("\n")),
      });
      const blob = buildZip(entries);
      const link = document.createElement("a");
      link.download = `ffs-week-of-content.zip`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Make my week failed", error);
      window.alert("Make my week failed — see the browser console for details.");
    } finally {
      setPhotoUrl(original.photoUrl);
      setExtraPhotos(original.extraPhotos);
      setFormat(original.format);
      setTemplate(original.template);
      setPostType(original.postType);
      setHeadline(original.headline);
      setArea(original.area);
      setFeature1(original.feature1);
      setFeature2(original.feature2);
      setFeature3(original.feature3);
      setPool(original.pool);
      setCta(original.cta);
      setBatchProgress(null);
      setIsExporting(false);
    }
  }

  async function handleBatchPhotos(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 12);
    if (files.length === 0) return;
    const urls = await Promise.all(files.map((f) => downscaleToDataUrl(f, "photo")));
    setBatchPhotos(urls);
  }

  /** Wait until every <img> inside the export node has decoded. */
  async function waitForRender(node: HTMLElement) {
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 120));
    const images = Array.from(node.querySelectorAll("img"));
    await Promise.allSettled(images.map((img) => img.decode?.().catch(() => {})));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

  /**
   * Batch export: renders every batch photo through the CURRENT template
   * and details, in BOTH formats, and downloads one ZIP. Works by
   * driving the live preview state photo-by-photo and capturing each
   * render — what you see is exactly what each file contains.
   */
  async function handleBatchExport() {
    const node = exportRef.current;
    if (!node || batchPhotos.length === 0) return;

    const original = { photoUrl, format };
    setIsExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const { buildZip, dataUrlToBytes } = await import("@/lib/zip");
      const entries: { name: string; data: Uint8Array }[] = [];
      const base = slugify(`${config.eyebrow} ${area || headline}`) || "ffs-post";
      const formats: PostFormat[] = [...FORMAT_ORDER];
      const total = batchPhotos.length * formats.length;
      let done = 0;

      for (let i = 0; i < batchPhotos.length; i++) {
        for (const fmt of formats) {
          setBatchProgress(`Rendering ${done + 1} of ${total}…`);
          setPhotoUrl(batchPhotos[i]);
          setFormat(fmt);
          await new Promise((r) => setTimeout(r, 60));
          await waitForRender(node);
          const { width, height } = FORMAT_DIMENSIONS[fmt];
          const dataUrl = await toPng(node, { width, height, pixelRatio: 1, cacheBust: true });
          entries.push({
            name: `${base}-${String(i + 1).padStart(2, "0")}-${fmt}.png`,
            data: dataUrlToBytes(dataUrl),
          });
          done++;
        }
      }

      setBatchProgress("Packaging ZIP…");
      const blob = buildZip(entries);
      const link = document.createElement("a");
      link.download = `${base}-batch.zip`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Batch export failed", error);
      window.alert("Batch export failed — see the browser console for details.");
    } finally {
      setPhotoUrl(original.photoUrl);
      setFormat(original.format);
      setBatchProgress(null);
      setIsExporting(false);
    }
  }

  // Measure the preview column so the render scales to fit any screen (mobile-safe).
  useEffect(() => {
    const el = colRef.current;
    if (!el) return;
    const update = () => setColW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- Brand memory: identity fields persist on this device ----------------
  // Load once on mount; saved values win over the built-in placeholders.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BRAND_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, unknown>;
      const applyText = (key: string, set: (v: string) => void) => {
        const v = saved[key];
        if (typeof v === "string" && v.length > 0) set(v);
      };
      const applyImage = (key: string, set: (v: string | null) => void) => {
        const v = saved[key];
        if (typeof v === "string" && v.startsWith("data:")) set(v);
      };
      applyText("agentName", setAgentName);
      applyText("agentTitle", setAgentTitle);
      applyText("phone", setPhone);
      applyText("website", setWebsite);
      applyText("address", setAddress);
      applyText("socialHandle", setSocialHandle);
      applyText("tagline", setTagline);
      applyText("email", setEmail);
      applyText("partnerName", setPartnerName);
      applyText("partnerRole", setPartnerRole);
      applyText("partnerPhone", setPartnerPhone);
      applyText("service1", setService1);
      applyText("service2", setService2);
      applyText("service3", setService3);
      applyText("service4", setService4);
      applyImage("headshotUrl", setHeadshotUrl);
      applyImage("logoUrl", setLogoUrl);
      applyImage("partnerHeadshotUrl", setPartnerHeadshotUrl);
    } catch {
      // Corrupt storage — start fresh.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save (debounced) whenever an identity field changes. Photos are small
  // data URLs (≤ ~200KB each after downscaling), well inside storage limits.
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          BRAND_STORAGE_KEY,
          JSON.stringify({
            agentName,
            agentTitle,
            phone,
            website,
            address,
            socialHandle,
            tagline,
            email,
            partnerName,
            partnerRole,
            partnerPhone,
            service1,
            service2,
            service3,
            service4,
            headshotUrl,
            logoUrl,
            partnerHeadshotUrl,
          })
        );
      } catch {
        // Storage full or unavailable — brand memory is best-effort.
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [
    agentName,
    agentTitle,
    phone,
    website,
    address,
    socialHandle,
    tagline,
    email,
    partnerName,
    partnerRole,
    partnerPhone,
    service1,
    service2,
    service3,
    service4,
    headshotUrl,
    logoUrl,
    partnerHeadshotUrl,
  ]);

  const dims = FORMAT_DIMENSIONS[format];
  const maxScale = DISPLAY_SCALE[format];
  const fitScale = Math.min(maxScale, Math.max(0.05, (colW - 4) / dims.width));
  const THUMB_W = 120;
  const thumbScale = THUMB_W / dims.width;

  // Everything a template needs except which template — shared by the gallery
  // thumbnails and the full-size selected preview, so one set of details
  // flows into whatever layout is chosen.
  const basePreview = {
    format,
    eyebrow: config.eyebrow,
    headline,
    stats,
    features,
    price,
    showPrice: config.showPrice,
    cta,
    photoUrl,
    photos,
    agentName,
    agentTitle,
    headshotUrl,
    phone,
    website,
    address,
    logoUrl,
    partnerName,
    partnerRole,
    partnerPhone,
    partnerHeadshotUrl,
    services,
    socialHandle,
    tagline,
    email,
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_460px]">
      {/* ---- Form ---- */}
      <div className="flex flex-col gap-6">
        <Field label="Post type">
          <PillGroup>
            {POST_TYPE_ORDER.map((key) => (
              <Pill key={key} active={postType === key} onClick={() => handlePostTypeChange(key)}>
                {POST_TYPES[key].name}
              </Pill>
            ))}
          </PillGroup>
        </Field>

        <Field label="Photos — up to 4 at once">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotosUpload}
            className="w-full rounded-lg border border-forest/20 bg-white/60 px-2.5 py-1.5 text-xs text-ink/80 file:mr-2 file:rounded file:border-0 file:bg-forest file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-cream"
          />
          {photos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {photos.map((url) => {
                const isHero = url === photoUrl;
                return (
                  <button
                    key={url.slice(-24)}
                    type="button"
                    onClick={() => makeHero(url)}
                    title={isHero ? "Hero photo" : "Tap to make hero"}
                    className={`relative overflow-hidden rounded-lg border-2 transition-colors ${
                      isHero ? "border-tan" : "border-transparent hover:border-forest/40"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-16 w-16 object-cover" />
                    {isHero && (
                      <span className="absolute bottom-0 left-0 right-0 bg-tan/90 py-0.5 text-center text-[9px] font-bold uppercase text-cream">
                        Hero
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-1 text-xs text-ink/55">
            {autofilling
              ? "✨ Reading your photo — drafting the headline, features, and CTA…"
              : photoUrl
                ? "✨ Details drafted from your hero photo — tap a thumbnail to switch hero, or tweak under Fine-tune."
                : "Drop your listing photos and the AI writes the post details for you."}
          </p>
        </Field>

        {/* The look — arrow-scrollable carousel of every style */}
        <Field label={`The look — scroll through all ${TEMPLATES.length} styles`}>
          <div className="relative">
            <button
              type="button"
              aria-label="Scroll looks left"
              onClick={() =>
                lookScrollRef.current?.scrollBy({
                  left: -lookScrollRef.current.clientWidth * 0.8,
                  behavior: "smooth",
                })
              }
              className="absolute -left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-forest/20 bg-cream text-lg text-forest shadow-md transition-colors hover:bg-forest hover:text-cream"
            >
              ‹
            </button>
            <div
              ref={lookScrollRef}
              className="flex gap-2.5 overflow-x-auto scroll-smooth px-8 py-1"
              style={{ scrollbarWidth: "thin" }}
            >
              {TEMPLATES.map((t) => {
                const selected = t.key === template;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTemplate(t.key)}
                    aria-pressed={selected}
                    className={`flex shrink-0 flex-col items-center gap-1.5 rounded-lg border p-1.5 transition-colors ${
                      selected ? "border-tan bg-tan/10" : "border-forest/15 hover:border-forest/40"
                    }`}
                  >
                    <div
                      style={{ width: THUMB_W * 0.75, height: dims.height * thumbScale * 0.75, overflow: "hidden" }}
                      className="rounded bg-ink/5"
                    >
                      <div
                        style={{ transform: `scale(${thumbScale * 0.75})`, transformOrigin: "top left", width: dims.width }}
                      >
                        <PostPreview template={t.key} {...basePreview} />
                      </div>
                    </div>
                    <span className={`max-w-[90px] truncate text-[10px] font-medium ${selected ? "text-forest" : "text-ink/60"}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              aria-label="Scroll looks right"
              onClick={() =>
                lookScrollRef.current?.scrollBy({
                  left: lookScrollRef.current.clientWidth * 0.8,
                  behavior: "smooth",
                })
              }
              className="absolute -right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-forest/20 bg-cream text-lg text-forest shadow-md transition-colors hover:bg-forest hover:text-cream"
            >
              ›
            </button>
          </div>
          <button
            type="button"
            onClick={() => setTemplate(TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)].key)}
            className="mt-2 rounded-lg border border-forest/25 px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-forest/5"
          >
            🎲 Surprise me
          </button>
        </Field>

        {/* Fine-tune toggle — everything detailed lives behind it */}
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="flex items-center justify-between rounded-xl border border-forest/15 bg-white/40 px-5 py-3.5 text-sm font-medium text-ink transition-colors hover:border-forest/40"
        >
          <span>
            Fine-tune{" "}
            <span className="font-normal text-ink/50">
              — formats, wording, specs, agent branding, all {TEMPLATES.length} templates
            </span>
          </span>
          <span aria-hidden className="text-ink/40">{advanced ? "▲" : "▼"}</span>
        </button>

        {advanced && (
        <>
        <Field label="Format">
          <PillGroup>
            {FORMAT_ORDER.map((f) => (
              <Pill key={f} active={format === f} onClick={() => setFormat(f)}>
                {FORMAT_LABELS[f]}
              </Pill>
            ))}
          </PillGroup>
        </Field>

        <Field label="Replace individual collage photos">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <FileInput key={i} onChange={(e) => handleExtraPhoto(i, e)} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleAutofill()}
            disabled={!photoUrl || autofilling}
            className="mt-2 h-10 w-full rounded-lg bg-tan px-4 text-sm font-semibold text-cream transition-colors hover:bg-tan/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {autofilling ? "Reading the photo…" : "✨ Re-run autofill from hero photo"}
          </button>
        </Field>

        <Field label="Headline (the hook)">
          <TextInput value={headline} onChange={setHeadline} />
        </Field>

        <Field label="Area / location">
          <TextInput value={area} onChange={setArea} placeholder="Cape Coral, FL" />
        </Field>

        {config.agent ? (
          <div className="flex flex-col gap-4 rounded-xl border border-tan/40 bg-tan/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-forest/70">
              Agent promo — services &amp; social (shown by the Agent Promo templates)
            </p>
            <Field label="Services — up to 4 (use “Label — description”)">
              <div className="flex flex-col gap-2">
                <TextInput value={service1} onChange={setService1} placeholder="First-Time Buyers — guiding you home" />
                <TextInput value={service2} onChange={setService2} placeholder="Sellers — maximizing value" />
                <TextInput value={service3} onChange={setService3} placeholder="Investors — strong returns" />
                <TextInput value={service4} onChange={setService4} placeholder="Relocations — soft landings" />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Social handle">
                <TextInput value={socialHandle} onChange={setSocialHandle} placeholder="@closingwithyou" />
              </Field>
              <Field label="Email">
                <TextInput value={email} onChange={setEmail} placeholder="you@brokerage.com" />
              </Field>
            </div>
            <Field label="Tagline / bio line">
              <TextInput value={tagline} onChange={setTagline} placeholder="I help buyers, sellers & investors navigate SWFL with confidence." />
            </Field>
          </div>
        ) : config.sensitive ? (
          <p className="rounded-lg border border-tan/40 bg-tan/10 px-4 py-3 text-sm text-ink/70">
            Commercial showcase — residential specs (beds / baths / price) are hidden for this post type.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Beds">
              <TextInput value={beds} onChange={setBeds} inputMode="numeric" />
            </Field>
            <Field label="Baths">
              <TextInput value={baths} onChange={setBaths} inputMode="numeric" />
            </Field>
            <Field label="Garage">
              <TextInput value={garage} onChange={setGarage} placeholder="3-Car" />
            </Field>
            <Field label="Sqft (optional)">
              <TextInput value={sqft} onChange={setSqft} inputMode="numeric" />
            </Field>
            <Field label="Pool / lot">
              <TextInput value={pool} onChange={setPool} placeholder="Private Pool" />
            </Field>
          </div>
        )}

        {config.showPrice ? (
          <Field label="Price">
            <TextInput value={price} onChange={setPrice} placeholder="$489,000" />
          </Field>
        ) : null}

        <Field label="Top 3 features">
          <div className="flex flex-col gap-2">
            <TextInput value={feature1} onChange={setFeature1} placeholder="Feature 1" />
            <TextInput value={feature2} onChange={setFeature2} placeholder="Feature 2" />
            <TextInput value={feature3} onChange={setFeature3} placeholder="Feature 3" />
          </div>
        </Field>

        <Field label="Call to action">
          <TextInput value={cta} onChange={setCta} />
        </Field>

        {/* Agent & contact — optional; powers the Showcase templates */}
        <div className="flex flex-col gap-4 rounded-xl border border-forest/15 bg-white/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest/70">Agent &amp; contact (optional)</p>
          <p className="-mt-2 text-xs text-ink/50">
            Remembered on this device — fill it once and every future visit starts branded.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Agent / company">
              <TextInput value={agentName} onChange={setAgentName} placeholder="Olivia Wilson" />
            </Field>
            <Field label="Title">
              <TextInput value={agentTitle} onChange={setAgentTitle} placeholder="Realtor®" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Headshot">
              <FileInput onChange={(e) => loadImage(e, setHeadshotUrl, "headshot")} />
            </Field>
            <Field label="Logo">
              <FileInput onChange={(e) => loadImage(e, setLogoUrl, "logo")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <TextInput value={phone} onChange={setPhone} placeholder="(239) 555-0123" />
            </Field>
            <Field label="Website">
              <TextInput value={website} onChange={setWebsite} placeholder="frameandformstudio.com" />
            </Field>
          </div>
          <Field label="Service area / address">
            <TextInput value={address} onChange={setAddress} placeholder="Cape Coral · Fort Myers · Naples" />
          </Field>
        </div>

        {/* Co-brand partner — optional; powers the Co-Brand + Twin Agent templates */}
        <div className="flex flex-col gap-4 rounded-xl border border-forest/15 bg-white/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest/70">
            Co-brand partner (optional) — title co, lender, or co-listing agent
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Partner name">
              <TextInput value={partnerName} onChange={setPartnerName} placeholder="Heights Title — Ged Law" />
            </Field>
            <Field label="Partner role">
              <TextInput value={partnerRole} onChange={setPartnerRole} placeholder="Title & Closing" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Partner phone">
              <TextInput value={partnerPhone} onChange={setPartnerPhone} placeholder="(239) 555-0100" />
            </Field>
            <Field label="Partner headshot / logo">
              <FileInput onChange={(e) => loadImage(e, setPartnerHeadshotUrl, "headshot")} />
            </Field>
          </div>
        </div>

        {/* Template gallery — tap a look; the pinned preview (right) updates instantly */}
        <div className="flex w-full flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/55">
            Templates — tap one to apply your details ({TEMPLATES.length} styles)
          </p>
          {GROUP_ORDER.map((group) => {
            const items = TEMPLATES.filter((t) => t.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-forest/70">{group}</p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {items.map((t) => {
                    const selected = t.key === template;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTemplate(t.key)}
                        aria-pressed={selected}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-1.5 transition-colors ${
                          selected ? "border-tan bg-tan/10" : "border-forest/15 hover:border-forest/40"
                        }`}
                      >
                        <div
                          style={{ width: THUMB_W, height: dims.height * thumbScale, overflow: "hidden" }}
                          className="rounded bg-ink/5"
                        >
                          <div style={{ transform: `scale(${thumbScale})`, transformOrigin: "top left", width: dims.width }}>
                            <PostPreview template={t.key} {...basePreview} />
                          </div>
                        </div>
                        <span className={`text-[11px] font-medium ${selected ? "text-forest" : "text-ink/60"}`}>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        </>
        )}
      </div>

      {/* ---- Pinned preview + download + caption (top on mobile, sticky on desktop) ---- */}
      <div
        ref={colRef}
        className="order-first flex w-full flex-col items-center gap-4 lg:order-none lg:sticky lg:top-8 lg:self-start"
      >
        {/* Selected template — full-size live preview (the export target) */}
        <div
          data-testid="preview"
          style={{ width: dims.width * fitScale, height: dims.height * fitScale, overflow: "hidden" }}
          className="rounded-xl border border-forest/15 shadow-sm"
        >
          <div style={{ transform: `scale(${fitScale})`, transformOrigin: "top left", width: dims.width }}>
            <PostPreview ref={exportRef} template={template} {...basePreview} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting}
          className="h-12 w-full rounded-xl bg-forest px-8 text-base font-medium text-cream transition-colors hover:bg-forest/90 disabled:opacity-50"
        >
          {isExporting ? "Exporting…" : "Download PNG"}
        </button>
        <p className="text-center text-xs text-ink/55">
          Exports at full {dims.width}×{dims.height}. What you see is what downloads.
        </p>

        {/* Make my week / batch export */}
        <div className="w-full rounded-xl border border-tan/40 bg-tan/10 p-4" style={{ maxWidth: dims.width * fitScale }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">
              📅 Make my week
            </span>
            {batchPhotos.length > 0 && (
              <span className="text-xs text-ink/50">
                {Math.min(batchPhotos.length, 7)} day{batchPhotos.length === 1 ? "" : "s"} ready
              </span>
            )}
          </div>
          <p className="mb-3 text-xs leading-relaxed text-ink/60">
            Drop up to 7 photos and click once: every photo becomes its own
            post — AI-written copy, a rotating mix of post types and looks —
            downloaded as one ZIP with a ready-to-paste captions file.
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleBatchPhotos}
            className="mb-3 w-full rounded-lg border border-forest/20 bg-white/60 px-2.5 py-1.5 text-xs text-ink/80 file:mr-2 file:rounded file:border-0 file:bg-forest file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-cream"
          />
          <button
            type="button"
            onClick={handleMakeWeek}
            disabled={isExporting || batchPhotos.length === 0}
            className="h-11 w-full rounded-lg bg-forest px-4 text-sm font-semibold text-cream transition-colors hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {batchProgress ??
              (batchPhotos.length > 0
                ? `Make my week — ${Math.min(batchPhotos.length, 7)} posts + captions`
                : "Choose photos above to enable")}
          </button>
          <button
            type="button"
            onClick={handleBatchExport}
            disabled={isExporting || batchPhotos.length === 0}
            className="mt-2 h-9 w-full rounded-lg border border-forest/25 px-4 text-xs font-medium text-forest transition-colors hover:bg-forest/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Or: same design for every photo ({batchPhotos.length * FORMAT_ORDER.length || 0} images)
          </button>
        </div>

        {/* Caption */}
        <div className="w-full rounded-xl border border-forest/15 bg-white/50 p-4" style={{ maxWidth: dims.width * fitScale }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">Caption</span>
            <div className="flex gap-2">
              <CopyButton onClick={() => handleCopy("caption")} label={copied === "caption" ? "Copied!" : "Copy all"} />
              <CopyButton onClick={() => handleCopy("tags")} label={copied === "tags" ? "Copied!" : "Tags"} />
            </div>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{caption}</p>
          <p className="mt-3 text-sm leading-relaxed text-tan">{hashtags}</p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- small UI pieces */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink/55">{label}</span>
      {children}
    </div>
  );
}

function PillGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active ? "border-forest bg-forest text-cream" : "border-forest/25 bg-transparent text-ink/70 hover:bg-forest/5"
      }`}
    >
      {children}
    </button>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      className="w-full rounded-lg border border-forest/20 bg-white/60 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-tan focus:ring-2 focus:ring-tan/30"
    />
  );
}

function FileInput({ onChange }: { onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      className="w-full rounded-lg border border-forest/20 bg-white/60 px-2.5 py-1.5 text-xs text-ink/80 file:mr-2 file:rounded file:border-0 file:bg-forest file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-cream"
    />
  );
}

function CopyButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-forest/25 px-2.5 py-1 text-xs font-medium text-forest transition-colors hover:bg-forest/5"
    >
      {label}
    </button>
  );
}
