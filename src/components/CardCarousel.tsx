import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArticleCard, type ArticleCardData } from "./ArticleCard";

interface Props {
  articles: ArticleCardData[];
  visibleCount?: number;
  autoSlideMs?: number;
}

export function CardCarousel({ articles, visibleCount = 3, autoSlideMs = 4000 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const trackRef = useRef<HTMLDivElement>(null);
  const [effectiveVisibleCount, setEffectiveVisibleCount] = useState(visibleCount);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setEffectiveVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setEffectiveVisibleCount(Math.min(visibleCount, 2));
      } else {
        setEffectiveVisibleCount(visibleCount);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visibleCount]);

  const maxIndex = Math.max(0, articles.length - effectiveVisibleCount);

  // Keep currentIndex bounded if effectiveVisibleCount changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [effectiveVisibleCount, articles.length, currentIndex, maxIndex]);

  const next = useCallback(() => {
    setDirection("left");
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setDirection("right");
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-slide
  useEffect(() => {
    if (isHovered || articles.length <= effectiveVisibleCount) return;
    const timer = setInterval(next, autoSlideMs);
    return () => clearInterval(timer);
  }, [isHovered, next, autoSlideMs, articles.length, effectiveVisibleCount]);

  if (!articles.length) return null;

  const translatePercent = -(currentIndex * (100 / effectiveVisibleCount));

  return (
    <div
      className="group/carousel relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation buttons */}
      {articles.length > effectiveVisibleCount && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 md:-left-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-glass/80 text-silver backdrop-blur-md transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-[0_0_20px_-4px] hover:shadow-gold/40 opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 md:-right-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-glass/80 text-silver backdrop-blur-md transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-[0_0_20px_-4px] hover:shadow-gold/40 opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Carousel viewport */}
      <div className="overflow-hidden rounded-2xl" style={{ perspective: "1200px" }}>
        <div
          ref={trackRef}
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,0.9,0.36,1)]"
          style={{
            transform: `translateX(${translatePercent}%)`,
          }}
        >
          {articles.map((article, idx) => (
            <div
              key={article.id}
              className="carousel-card shrink-0 px-3"
              style={{
                width: `${100 / effectiveVisibleCount}%`,
                transformStyle: "preserve-3d",
              }}
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {articles.length > effectiveVisibleCount && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? "left" : "right");
                setCurrentIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentIndex
                  ? "w-8 bg-gold shadow-[0_0_8px_0] shadow-gold/50"
                  : "w-1.5 bg-silver/30 hover:bg-silver/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
