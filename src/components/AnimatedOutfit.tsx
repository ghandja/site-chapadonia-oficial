import React from "react";
import { getOutfitImage } from "../utils";

interface AnimatedOutfitProps {
  looktype: number;
  className?: string;
  alt?: string;
}

export const AnimatedOutfit: React.FC<AnimatedOutfitProps> = ({ looktype, className, alt = "" }) => {
  const lt = looktype || 128;

  return (
    <img
      src={`/sprites/outfit_frames/${lt}/1.png`}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).src = getOutfitImage(lt);
      }}
      referrerPolicy="no-referrer"
    />
  );
};

