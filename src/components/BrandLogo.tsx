import logoAsset from "@/assets/zoomauto-logo.webp.asset.json";

export function BrandLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src="/zoomauto-logo.webp" alt="Zoom Auto" className={className} />;
}