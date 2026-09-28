import logoAsset from "@/assets/zoomauto-logo.webp.asset.json";

export function BrandLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src={logoAsset.url} alt="Zoom Auto" className={className} />;
}