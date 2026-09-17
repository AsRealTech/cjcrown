import { StorageImage } from "@/components/public/StorageImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

type Condition = "new" | "like-new" | "good" | "vintage";

const CATEGORIES = [
  "Seating",
  "Tables",
  "Storage",
  "Beds",
  "Lighting",
  "Outdoor",
  "Decor",
];

export default function ListingEditor() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const existing = useQuery(
    api.furnitureListings.adminListing,
    id ? { id: id as unknown as Id<"furnitureListings"> } : "skip",
  );
  const create = useMutation(api.furnitureListings.createListing);
  const update = useMutation(api.furnitureListings.updateListing);
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [condition, setCondition] = useState<Condition | "none">("none");
  const [imageIds, setImageIds] = useState<Id<"_storage">[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [imageOrder, setImageOrder] = useState<number[]>([]);
  const [status, setStatus] = useState<"published" | "draft">("draft");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing listing into form state once it arrives.
  useEffect(() => {
    if (id && existing && !loaded) {
      setTitle(existing.title);
      setCategory(existing.category);
      setPrice(existing.price ? String(existing.price) : "");
      setCurrency(existing.currency);
      setDescription(existing.description);
      setMaterials(existing.materials ?? "");
      setDimensions(existing.dimensions ?? "");
      setCondition((existing.condition as Condition) ?? "none");
      setImageIds(existing.imageIds as Id<"_storage">[]);
      setImageUrls(existing.imageUrls ?? []);
      setImageOrder(existing.imageOrder ?? existing.imageIds.map((_, i) => i));
      setStatus(existing.status);
      setFeatured(existing.featured);
      setLoaded(true);
    }
  }, [id, existing, loaded]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newIds: Id<"_storage">[] = [];
      for (const file of Array.from(files)) {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!res.ok) throw new Error(`Upload failed (${res.status})`);
        const { storageId } = await res.json();
        newIds.push(storageId as Id<"_storage">);
      }
      const next = [...imageIds, ...newIds];
      setImageIds(next);
      setImageOrder(next.map((_, i) => i));
      toast.success(`${newIds.length} image${newIds.length > 1 ? "s" : ""} added`);
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...imageOrder];
    const b = index + dir;
    if (b < 0 || b >= next.length) return;
    [next[index], next[b]] = [next[b], next[index]];
    setImageOrder(next);
  };

  const removeImage = (imgId: Id<"_storage">) => {
    const idx = imageIds.indexOf(imgId);
    if (idx === -1) return;
    const nextIds = imageIds.filter((x) => x !== imgId);
    setImageIds(nextIds);
    setImageOrder(nextIds.map((_, i) => i));
  };

  const buildPayload = () => ({
    title: title.trim(),
    category,
    price: price === "" ? 0 : Number(price),
    currency,
    description: description.trim(),
    materials: materials.trim() || undefined,
    dimensions: dimensions.trim() || undefined,
    condition: condition === "none" ? undefined : condition,
    featured,
    imageIds,
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    imageOrder:
      imageOrder.length === imageIds.length ? imageOrder : imageIds.map((_, i) => i),
  });

  const validate = () => {
    if (!title.trim()) return "A title is required.";
    if (!description.trim()) return "A description is required.";
    if (price !== "" && Number.isNaN(Number(price))) return "Price must be a number.";
    return null;
  };

  const saveWithStatus = async (targetStatus: "published" | "draft") => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...buildPayload(), status: targetStatus };
      if (id) {
        await update({ id: id as unknown as Id<"furnitureListings">, ...payload });
        toast.success(
          targetStatus === "published" ? "Saved & published" : "Saved as draft",
        );
      } else {
        const newId = await create(payload);
        toast.success(
          targetStatus === "published" ? "Created & published" : "Created as draft",
        );
        navigate(`/admin/listings/${newId}/edit`, { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && existing === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/admin/listings"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to listings
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            {isEdit ? "Edit listing" : "New listing"}
          </h1>
        </div>
        {isEdit && status === "published" && existing?.slug && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/furniture/${existing.slug}`}>
              <Eye className="size-4" /> View public page
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="card-soft">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="le-title">Title *</Label>
                <Input
                  id="le-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Alder Lounge Chair"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={condition}
                    onValueChange={(v) => setCondition(v as Condition | "none")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like-new">Like new</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <div className="space-y-2">
                  <Label htmlFor="le-price">Price</Label>
                  <Input
                    id="le-price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Leave blank for 'Price on request'"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to show “Price on request”.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["USD", "EUR", "GBP", "CAD"].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="le-desc">Description *</Label>
                <Textarea
                  id="le-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe the piece, its story, finish and feel…"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="le-materials">Materials</Label>
                  <Input
                    id="le-materials"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="Solid white oak, brass"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="le-dims">Dimensions</Label>
                  <Input
                    id="le-dims"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="W 78 × D 92 × H 74 cm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-soft">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                {uploading ? (
                  <Loader2 className="size-6 animate-spin text-primary" />
                ) : (
                  <ImagePlus className="size-6 text-primary" />
                )}
                <span className="text-sm font-medium">
                  {uploading ? "Uploading…" : "Click to upload images"}
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG or WebP · the first image becomes the cover
                </span>
              </button>

              {/* External image URLs */}
              <div className="space-y-2">
                <Label htmlFor="le-url">Or add an image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="le-url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://…/chair.jpg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const url = urlInput.trim();
                      if (!url) return;
                      if (!/^https?:\/\//i.test(url)) {
                        toast.error("URL must start with http:// or https://");
                        return;
                      }
                      setImageUrls((prev) => [...prev, url]);
                      setUrlInput("");
                    }}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use uploaded files for best quality; URLs are handy for quick
                  mockups. URLs always display after uploads.
                </p>
              </div>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {imageUrls.map((url, i) => (
                    <div
                      key={url}
                      className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted"
                    >
                      <div className="aspect-square">
                        <img src={url} alt={`URL image ${i + 1}`} className="size-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-background/90 shadow hover:bg-background"
                        aria-label="Remove image"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imageIds.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {imageIds.map((imgId, i) => {
                    const pos = imageOrder[i] ?? i;
                    const canUp = pos > 0;
                    const canDown = pos < imageIds.length - 1;
                    return (
                      <div
                        key={imgId}
                        className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted"
                      >
                        <div className="aspect-square">
                          <StorageImage id={imgId} alt={`Image ${i + 1}`} />
                        </div>
                        {pos === 0 && (
                          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            Cover
                          </span>
                        )}
                        <div className="absolute inset-x-1 bottom-1 flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {canUp && (
                            <button
                              type="button"
                              onClick={() => move(i, -1)}
                              className="flex size-6 items-center justify-center rounded-full bg-background/90 shadow hover:bg-background"
                              aria-label="Move earlier"
                            >
                              <ArrowLeft className="size-3" />
                            </button>
                          )}
                          {canDown && (
                            <button
                              type="button"
                              onClick={() => move(i, 1)}
                              className="flex size-6 items-center justify-center rounded-full bg-background/90 shadow hover:bg-background"
                              aria-label="Move later"
                            >
                              <ArrowRight className="size-3" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(imgId)}
                          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-background/90 shadow hover:bg-background"
                          aria-label="Remove image"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <Card className="card-soft">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="le-featured">Featured</Label>
                <Switch id="le-featured" checked={featured} onCheckedChange={setFeatured} />
              </div>
              <div className="rounded-lg border border-border/60 p-3 text-xs text-muted-foreground">
                Current status: <span className="font-medium text-foreground">{status}</span>
                {id && existing && (
                  <>
                    {" "}· Views:{" "}
                    <span className="font-medium text-foreground">{existing.views}</span>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full rounded-full"
                  onClick={() => saveWithStatus("published")}
                  disabled={saving || uploading}
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {status === "published" ? "Save & keep published" : "Save & publish"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => saveWithStatus("draft")}
                  disabled={saving || uploading}
                >
                  Save as draft
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Drafts are hidden from the public catalog until published.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
