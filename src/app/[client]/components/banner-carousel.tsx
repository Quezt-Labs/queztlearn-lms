"use client";

import React from "react";
import Image from "next/image";

interface BannerCarouselProps {
  banners: string[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [index, setIndex] = React.useState(0);

  if (!banners.length) return null;

  const current = banners[index];

  const goTo = (next: number) => {
    const total = banners.length;
    const normalized = ((next % total) + total) % total;
    setIndex(normalized);
  };

  return (
    <div className="relative w-full h-40 md:h-64 lg:h-72">
      <Image
        src={current}
        alt={`Banner ${index + 1}`}
        fill
        className="object-cover"
      />
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background px-3 py-1 text-xs"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background px-3 py-1 text-xs"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-1.5 w-5 rounded-full transition ${
                  i === index ? "bg-primary" : "bg-muted/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


