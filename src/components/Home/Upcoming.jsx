import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api-client';

const AUTOPLAY_INTERVAL = 10000;
const WHEEL_COOLDOWN = 600;
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 400;

/*
 * =========================================================
 * UNIVERSAL VIDEO PARSER
 * =========================================================
 */
const parseVideoSource = (url) => {
  if (!url || typeof url !== 'string') return null;
  const raw = url.trim();
  if (!raw) return null;

  // 1. YouTube URLs (standard watch, shortlinks, shorts, embeds)
  const ytMatch = raw.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      type: 'iframe',
      src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`,
      thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    };
  }

  // 2. Vimeo URLs
  const vimeoMatch = raw.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&autopause=0&controls=0&background=1`,
      thumbnail: null,
    };
  }

  // 3. Direct video streams (Cloudinary, AWS S3, MP4/WebM hosts)
  let cleanUrl = raw.replace(/^http:\/\//i, 'https://');

  if (cleanUrl.includes('cloudinary.com')) {
    cleanUrl = cleanUrl.replace('/image/upload/', '/video/upload/');
    const hasExtension = /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(cleanUrl);
    if (!hasExtension) {
      const [base, query] = cleanUrl.split('?');
      cleanUrl = `${base}.mp4${query ? `?${query}` : ''}`;
    }
  }

  return {
    type: 'video',
    src: cleanUrl,
    thumbnail: null,
  };
};

export default function Upcoming() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [isDesktop, setIsDesktop] = useState(false);
  const [mobileVideoActive, setMobileVideoActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const carouselRef = useRef(null);
  const videoRef = useRef(null);
  const wheelTimeout = useRef(null);

  const shouldReduceMotion = useReducedMotion();

  /*
   * =========================================================
   * VIEWPORT LISTENER
   * =========================================================
   */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = (event) => setIsDesktop(event.matches);

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /*
   * =========================================================
   * DATA FETCHING
   * =========================================================
   */
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const fetchUpcomingGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/games/upcoming/', {
          signal: controller.signal,
        });

        if (!mounted) return;

        const responseData = response?.data;
        const data = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.results)
          ? responseData.results
          : [];

        setSlides(data);
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        if (!mounted) return;

        console.error('Error fetching upcoming games:', err);
        setError(err);
        setSlides([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUpcomingGames();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  /*
   * =========================================================
   * INDEX BOUNDS VALIDATION
   * =========================================================
   */
  useEffect(() => {
    setCurrentIndex((prev) => {
      if (slides.length === 0) return 0;
      return Math.min(prev, slides.length - 1);
    });
  }, [slides.length]);

  const currentSlide = slides[currentIndex] || null;
  const currentVideo = currentSlide?.video || null;

  /*
   * =========================================================
   * CAROUSEL CONTROLS
   * =========================================================
   */
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (slides.length <= 1 ? prev : prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (slides.length <= 1 ? prev : prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = useCallback(
    (index) => {
      if (index < 0 || index >= slides.length) return;
      setCurrentIndex(index);
    },
    [slides.length]
  );

  /*
   * =========================================================
   * MEDIA STATE RESET
   * =========================================================
   */
  useEffect(() => {
    setMobileVideoActive(false);
    setVideoReady(false);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [currentIndex, isDesktop]);

  /*
   * =========================================================
   * AUTOPLAY
   * =========================================================
   */
  useEffect(() => {
    if (slides.length <= 1 || isHovered || isFocused || shouldReduceMotion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(timer);
  }, [slides.length, isHovered, isFocused, shouldReduceMotion, nextSlide]);

  /*
   * =========================================================
   * HARDWARE GESTURES (WHEEL, TOUCH, KEYS)
   * =========================================================
   */
  const handleWheel = useCallback(
    (event) => {
      if (slides.length <= 1 || wheelTimeout.current) return;
      if (Math.abs(event.deltaX) <= 30) return;

      wheelTimeout.current = true;

      if (event.deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      window.setTimeout(() => {
        wheelTimeout.current = null;
      }, WHEEL_COOLDOWN);
    },
    [slides.length, nextSlide, prevSlide]
  );

  useEffect(() => {
    return () => {
      if (wheelTimeout.current) window.clearTimeout(wheelTimeout.current);
    };
  }, []);

  const handleDragEnd = useCallback(
    (_event, info) => {
      const swipeDistance = info.offset.x;
      const swipeVelocity = info.velocity.x;

      if (swipeDistance < -SWIPE_DISTANCE || swipeVelocity < -SWIPE_VELOCITY) {
        nextSlide();
      } else if (swipeDistance > SWIPE_DISTANCE || swipeVelocity > SWIPE_VELOCITY) {
        prevSlide();
      }
    },
    [nextSlide, prevSlide]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (slides.length <= 1) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextSlide();
          break;
        case 'Home':
          event.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          event.preventDefault();
          goToSlide(slides.length - 1);
          break;
        default:
          break;
      }
    },
    [slides.length, prevSlide, nextSlide, goToSlide]
  );

  /*
   * =========================================================
   * VIDEO PLAYBACK RUNTIME
   * =========================================================
   */
  const shouldPlayVideo = (isDesktop && isHovered) || (!isDesktop && mobileVideoActive);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (shouldPlayVideo) {
      el.muted = true;
      el.defaultMuted = true;
      const promise = el.play();
      if (promise !== undefined) {
        promise.catch(() => {});
      }
    } else {
      el.pause();
    }
  }, [shouldPlayVideo]);

  const toggleMobileVideo = useCallback(
    (event) => {
      event.stopPropagation();
      if (!currentVideo || isDesktop || shouldReduceMotion) return;
      setMobileVideoActive((prev) => !prev);
    },
    [currentVideo, isDesktop, shouldReduceMotion]
  );

  if (loading) {
    return (
      <div className="relative w-full max-w-[1600px] mx-auto flex items-center justify-center py-8 md:py-16 px-2 md:px-8">
        <div className="w-[95%] md:w-[88%] h-87.5 sm:h-112.5 md:h-150 lg:h-[75vh] max-h-212.5 bg-[#1a1a1a] animate-pulse shadow-2xl rounded-2xl md:rounded-xl" />
      </div>
    );
  }

  if (error && slides.length === 0) return null;
  if (slides.length === 0) return null;

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: 'easeOut' }}
      className="relative w-full max-w-[1600px] mx-auto flex items-center justify-center py-8 md:py-16 px-2 md:px-8 overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Upcoming games"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (carouselRef.current && !carouselRef.current.contains(event.relatedTarget)) {
          setIsFocused(false);
        }
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={carouselRef}
    >
      {slides.length > 1 && (
        <motion.button
          type="button"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
          onClick={prevSlide}
          aria-label="Previous upcoming game"
          className="hidden md:flex items-center justify-center absolute left-2 lg:left-4 z-50 text-gray-500 hover:text-white transition-colors cursor-pointer rounded-full"
        >
          <svg className="w-12 h-12 lg:w-14 lg:h-14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}

      <div
        className="relative w-[95%] md:w-[88%] h-87.5 sm:h-112.5 md:h-150 lg:h-[75vh] max-h-212.5 bg-[#121212] overflow-hidden group shadow-2xl rounded-2xl md:rounded-xl touch-pan-y"
        onWheel={handleWheel}
      >
        <motion.div
          className="flex w-full h-full cursor-grab active:cursor-grabbing"
          drag={slides.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={shouldReduceMotion ? 0 : 0.25}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          initial={false}
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 300, damping: 32, mass: 0.8 }
          }
        >
          {slides.map((slide, index) => {
            const rawImageUrl = slide?.images?.length > 0 ? slide.images[0]?.image : null;
            const videoMeta = parseVideoSource(slide?.video);
            const imageUrl = rawImageUrl || videoMeta?.thumbnail || null;

            const isActiveSlide = index === currentIndex;
            const isUpcoming = slide?.active === false;
            const title = slide?.title || 'Upcoming Game';
            const shouldLoadImage = Math.abs(index - currentIndex) <= 1;

            return (
              <article
                key={slide?.id ?? `slide-${index}`}
                className="relative w-full h-full shrink-0 overflow-hidden bg-black select-none"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}: ${title}`}
                aria-hidden={!isActiveSlide}
              >
                <div className="absolute inset-0 bg-linear-to-br from-[#1b1b1b] via-[#0c0c0c] to-black" />

                {isUpcoming && (
                  <div className="absolute top-0 right-0 z-40 w-32 h-32 md:w-40 md:h-40 overflow-hidden pointer-events-none">
                    <div className="absolute top-6 -right-10 md:top-8 md:-right-12 w-40 md:w-50 rotate-45 bg-white text-black text-center font-black py-1.5 md:py-2 shadow-lg uppercase tracking-widest text-[10px] md:text-sm">
                      Upcoming
                    </div>
                  </div>
                )}

                {/* POSTER IMAGE */}
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt=""
                    draggable={false}
                    loading={shouldLoadImage ? (index === currentIndex ? 'eager' : 'lazy') : 'lazy'}
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
                      isActiveSlide && shouldPlayVideo && videoReady ? 'opacity-0 z-0' : 'opacity-100 z-10'
                    }`}
                  />
                )}

                {/* YOUTUBE / VIMEO IFRAME */}
                {isActiveSlide && videoMeta?.type === 'iframe' && shouldPlayVideo && (
                  <div className="absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-none">
                    <iframe
                      src={videoMeta.src}
                      title={title}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] md:w-[130%] md:h-[130%] pointer-events-none border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      tabIndex={-1}
                      onLoad={() => setVideoReady(true)}
                    />
                  </div>
                )}

                {/* NATIVE MP4 / CLOUDINARY DIRECT VIDEO */}
                {isActiveSlide && videoMeta?.type === 'video' && (
                  <video
                    ref={(el) => {
                      videoRef.current = el;
                      if (el) {
                        el.muted = true;
                        el.defaultMuted = true;
                      }
                    }}
                    src={videoMeta.src}
                    loop
                    playsInline
                    preload="auto"
                    className={`absolute inset-0 w-full h-full object-cover scale-[1.02] pointer-events-none transition-opacity duration-300 ${
                      shouldPlayVideo && videoReady ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                    onPlaying={() => setVideoReady(true)}
                    aria-hidden="true"
                  />
                )}

                <div className="absolute inset-0 z-20 pointer-events-none bg-linear-to-t from-black via-black/45 to-transparent md:bg-linear-to-r md:from-black/35 md:via-black/10 md:to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 z-20 pointer-events-none bg-linear-to-t from-black/80 to-transparent md:hidden" />

                {/* TEXT / ACTION PANEL */}
                <div className="absolute left-0 top-0 w-full md:w-3/5 lg:w-1/2 h-full z-30 flex flex-col justify-end md:justify-center px-6 pb-12 md:pb-0 md:px-16 lg:px-24 md:bg-white/10 md:backdrop-blur-md md:mask-[linear-gradient(to_right,black_50%,transparent_100%)]">
                  <motion.div
                    initial={false}
                    animate={isActiveSlide ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
                    className="pointer-events-none"
                  >
                    <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-8 tracking-wide leading-tight line-clamp-2 md:line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {title}
                    </h2>

                    {slide?.id != null && (
                      <Link
                        to={`/product/${slide.id}`}
                        tabIndex={isActiveSlide ? 0 : -1}
                        className="pointer-events-auto inline-flex items-center justify-center w-max bg-[#2ecc71] text-black px-6 py-2.5 md:px-8 md:py-4 rounded-xl text-xs md:text-sm lg:text-lg font-extrabold hover:bg-[#27ae60] transition-all shadow-lg cursor-pointer"
                      >
                        Check Details
                      </Link>
                    )}
                  </motion.div>
                </div>

                {/* DESKTOP PLAY INDICATOR */}
                {videoMeta && isActiveSlide && isDesktop && !isHovered && !shouldReduceMotion && (
                  <div className="absolute inset-0 z-40 hidden md:flex items-center justify-center pointer-events-none">
                    <div className="flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-black/20 border border-white/20 shadow-[0_0_25px_rgba(0,0,0,0.35)]">
                      <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white/90 ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 6v12l10-6z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* MOBILE PLAY / PAUSE BUTTON */}
                {videoMeta && isActiveSlide && !isDesktop && !shouldReduceMotion && (
                  <motion.button
                    type="button"
                    onClick={toggleMobileVideo}
                    aria-label={mobileVideoActive ? 'Pause video' : 'Play video'}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/35 hover:bg-black/50 active:bg-black/60 text-white transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
                  >
                    {mobileVideoActive ? (
                      <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 6v12l10-6z" />
                      </svg>
                    )}
                  </motion.button>
                )}
              </article>
            );
          })}
        </motion.div>

        {slides.length > 1 && (
          <div className="absolute bottom-3 left-4 text-[10px] text-white/50 md:hidden pointer-events-none uppercase tracking-wider z-40">
            Swipe to browse
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <motion.button
          type="button"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
          onClick={nextSlide}
          aria-label="Next upcoming game"
          className="hidden md:flex items-center justify-center absolute right-2 lg:right-4 z-50 text-gray-500 hover:text-white transition-colors cursor-pointer rounded-full"
        >
          <svg className="w-12 h-12 lg:w-14 lg:h-14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-50" role="tablist">
          {slides.map((slide, index) => {
            const isActive = currentIndex === index;
            return (
              <motion.button
                key={slide?.id ?? `indicator-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => goToSlide(index)}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.2 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer transition-all ${
                  isActive ? 'bg-[#2ecc71] shadow-[0_0_8px_#2ecc71]' : 'bg-gray-500 hover:bg-white'
                }`}
              />
            );
          })}
        </div>
      )}
    </motion.section>
  );
}