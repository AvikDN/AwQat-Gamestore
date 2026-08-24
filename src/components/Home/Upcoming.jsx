import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api-client';

const AUTOPLAY_INTERVAL = 10000;
const WHEEL_COOLDOWN = 600;
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 400;

export default function Upcoming() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Responsive state
  const [isDesktop, setIsDesktop] = useState(false);

  // Mobile video state
  const [mobileVideoActive, setMobileVideoActive] = useState(false);

  const carouselRef = useRef(null);
  const videoRef = useRef(null);
  const wheelTimeout = useRef(null);

  const shouldReduceMotion = useReducedMotion();

  /*
   * =========================================================
   * RESPONSIVE BREAKPOINT
   * =========================================================
   */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const handleChange = (event) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    // Older Safari fallback
    mediaQuery.addListener(handleChange);

    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  /*
   * =========================================================
   * FETCH UPCOMING GAMES
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
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
          return;
        }

        if (!mounted) return;

        console.error('Error fetching upcoming games:', err);

        setError(err);
        setSlides([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
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
   * KEEP INDEX VALID
   * =========================================================
   */
  useEffect(() => {
    setCurrentIndex((previousIndex) => {
      if (slides.length === 0) {
        return 0;
      }
      return Math.min(previousIndex, slides.length - 1);
    });
  }, [slides.length]);

  /*
   * =========================================================
   * CURRENT SLIDE
   * =========================================================
   */
  const currentSlide = slides[currentIndex] || null;
  const currentVideo = currentSlide?.video || null;

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */
  const nextSlide = useCallback(() => {
    setCurrentIndex((previousIndex) => {
      if (slides.length <= 1) {
        return previousIndex;
      }
      return previousIndex === slides.length - 1 ? 0 : previousIndex + 1;
    });
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((previousIndex) => {
      if (slides.length <= 1) {
        return previousIndex;
      }
      return previousIndex === 0 ? slides.length - 1 : previousIndex - 1;
    });
  }, [slides.length]);

  const goToSlide = useCallback(
    (index) => {
      if (index < 0 || index >= slides.length) {
        return;
      }
      setCurrentIndex(index);
    },
    [slides.length]
  );

  /*
   * =========================================================
   * RESET MOBILE VIDEO WHEN SLIDE CHANGES
   * =========================================================
   */
  useEffect(() => {
    setMobileVideoActive(false);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  /*
   * =========================================================
   * RESET VIDEO WHEN DEVICE TYPE CHANGES
   * =========================================================
   */
  useEffect(() => {
    setMobileVideoActive(false);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isDesktop]);

  /*
   * =========================================================
   * CAROUSEL AUTOPLAY
   *
   * Pauses when:
   * - hovered
   * - focused
   * - reduced motion is enabled
   * =========================================================
   */
  useEffect(() => {
    if (slides.length <= 1 || isHovered || isFocused || shouldReduceMotion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => {
      window.clearInterval(timer);
    };
  }, [slides.length, isHovered, isFocused, shouldReduceMotion, nextSlide]);

  /*
   * =========================================================
   * WHEEL / TRACKPAD NAVIGATION
   *
   * Only horizontal scrolling changes slides.
   * Vertical scrolling remains normal page scrolling.
   * =========================================================
   */
  const handleWheel = useCallback(
    (event) => {
      if (slides.length <= 1) {
        return;
      }

      if (wheelTimeout.current) {
        return;
      }

      if (Math.abs(event.deltaX) <= 30) {
        return;
      }

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

  /*
   * =========================================================
   * WHEEL CLEANUP
   * =========================================================
   */
  useEffect(() => {
    return () => {
      if (wheelTimeout.current) {
        window.clearTimeout(wheelTimeout.current);
      }
    };
  }, []);

  /*
   * =========================================================
   * DRAG / SWIPE
   * =========================================================
   */
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

  /*
   * =========================================================
   * KEYBOARD NAVIGATION
   * =========================================================
   */
  const handleKeyDown = useCallback(
    (event) => {
      if (slides.length <= 1) {
        return;
      }

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
   * VIDEO DISPLAY LOGIC
   *
   * DESKTOP:
   * Hover -> video
   *
   * MOBILE:
   * Tap -> video
   * =========================================================
   */
  const shouldShowDesktopVideo = isDesktop && isHovered && Boolean(currentVideo) && !shouldReduceMotion;
  const shouldShowMobileVideo = !isDesktop && mobileVideoActive && Boolean(currentVideo) && !shouldReduceMotion;
  const shouldShowVideo = shouldShowDesktopVideo || shouldShowMobileVideo;

  /*
   * =========================================================
   * MOBILE VIDEO TOGGLE
   * =========================================================
   */
  const toggleMobileVideo = useCallback(
    (event) => {
      event.stopPropagation();

      if (!currentVideo || isDesktop || shouldReduceMotion) {
        return;
      }

      setMobileVideoActive((previous) => !previous);
    },
    [currentVideo, isDesktop, shouldReduceMotion]
  );

  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */
  if (loading) {
    return (
      <div
        className="relative w-full max-w-[1600px] mx-auto flex items-center justify-center py-8 md:py-16 px-2 md:px-8"
        aria-busy="true"
        aria-label="Loading upcoming games"
      >
        <div className="w-[95%] md:w-[88%] h-[350px] sm:h-[450px] md:h-[600px] lg:h-[75vh] max-h-[850px] bg-[#1a1a1a] animate-pulse shadow-2xl rounded-2xl md:rounded-xl" />
      </div>
    );
  }

  /*
   * =========================================================
   * EMPTY / ERROR
   * =========================================================
   */
  if (error && slides.length === 0) {
    return null;
  }

  if (slides.length === 0) {
    return null;
  }

  /*
   * =========================================================
   * MAIN COMPONENT
   * =========================================================
   */
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
      {/*
       * =====================================================
       * PREVIOUS BUTTON
       * =====================================================
       */}
      {slides.length > 1 && (
        <motion.button
          type="button"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
          onClick={prevSlide}
          aria-label="Previous upcoming game"
          className="hidden md:flex items-center justify-center absolute left-2 lg:left-4 z-50 text-gray-500 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2ecc71] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
        >
          <svg
            className="w-12 h-12 lg:w-14 lg:h-14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}

      {/*
       * =====================================================
       * CAROUSEL
       * =====================================================
       */}
      <div
        className="relative w-[95%] md:w-[88%] h-[350px] sm:h-[450px] md:h-[600px] lg:h-[75vh] max-h-[850px] bg-[#121212] overflow-hidden group shadow-2xl rounded-2xl md:rounded-xl touch-pan-y"
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
            const imageUrl = slide?.images?.length > 0 ? slide.images[0]?.image : null;
            const videoUrl = slide?.video || null;
            const isActiveSlide = index === currentIndex;
            const isUpcoming = slide?.active === false;
            const title = slide?.title || 'Upcoming Game';
            const shouldLoadImage = Math.abs(index - currentIndex) <= 1;

            /*
             * Only active slide can render video.
             */
            const renderVideo = isActiveSlide && videoUrl && shouldShowVideo;

            return (
              <article
                key={slide?.id ?? `slide-${index}`}
                className="relative w-full h-full shrink-0 overflow-hidden bg-black select-none"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}: ${title}`}
                aria-hidden={!isActiveSlide}
              >
                {/*
                 * =================================================
                 * BACKGROUND FALLBACK
                 * =================================================
                 */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#1b1b1b] via-[#0c0c0c] to-black"
                  aria-hidden="true"
                />

                {/*
                 * =================================================
                 * UPCOMING RIBBON
                 * =================================================
                 */}
                {isUpcoming && (
                  <div className="absolute top-0 right-0 z-40 w-32 h-32 md:w-40 md:h-40 overflow-hidden pointer-events-none">
                    <div className="absolute top-6 -right-10 md:top-8 md:-right-12 w-[160px] md:w-[200px] rotate-45 bg-white text-black text-center font-black py-1.5 md:py-2 shadow-lg uppercase tracking-widest text-[10px] md:text-sm">
                      Upcoming
                    </div>
                  </div>
                )}

                {/*
                 * =================================================
                 * IMAGE
                 * =================================================
                 */}
                {imageUrl && (
                  <motion.img
                    src={imageUrl}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    loading={shouldLoadImage ? (index === currentIndex ? 'eager' : 'lazy') : 'lazy'}
                    decoding="async"
                    initial={false}
                    animate={{ opacity: renderVideo ? 0 : 1 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45 }}
                    className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
                  />
                )}

                {/*
                 * =================================================
                 * VIDEO
                 *
                 * Desktop: Hover -> video
                 * Mobile: Tap -> video
                 *
                 * Video only mounts when needed.
                 * =================================================
                 */}
                {renderVideo && (
                  <motion.video
                    ref={isActiveSlide ? videoRef : null}
                    key={`video-${slide?.id ?? index}-${shouldShowVideo ? 'active' : 'inactive'}`}
                    src={videoUrl}
                    poster={imageUrl || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4 }}
                    className="absolute inset-0 w-full h-full object-cover z-0 scale-[1.02] pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                {/*
                 * =================================================
                 * READABILITY OVERLAY
                 *
                 * Mobile gets stronger gradient.
                 * Desktop stays subtle so the frost effect remains visible.
                 * =================================================
                 */}
                <div
                  className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black via-black/45 to-transparent md:bg-gradient-to-r md:from-black/35 md:via-black/10 md:to-transparent"
                  aria-hidden="true"
                />

                {/*
                 * =================================================
                 * MOBILE BOTTOM GRADIENT
                 * =================================================
                 */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/2 z-20 pointer-events-none bg-gradient-to-t from-black/80 to-transparent md:hidden"
                  aria-hidden="true"
                />

                {/*
                 * =================================================
                 * FROSTED GLASS CONTENT PANEL
                 *
                 * IMPORTANT: backdrop-blur only exists on desktop.
                 * =================================================
                 */}
                <div className="absolute left-0 top-0 w-full md:w-3/5 lg:w-1/2 h-full z-30 flex flex-col justify-end md:justify-center px-6 pb-12 md:pb-0 md:px-16 lg:px-24 md:bg-white/10 md:backdrop-blur-md md:[mask-image:linear-gradient(to_right,black_50%,transparent_100%)] md:[-webkit-mask-image:linear-gradient(to_right,black_50%,transparent_100%)]">
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
                        className="pointer-events-auto inline-flex items-center justify-center w-max bg-[#2ecc71] text-black px-6 py-2.5 md:px-8 md:py-4 rounded-xl text-xs md:text-sm lg:text-lg font-extrabold hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all shadow-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2ecc71] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        Check Details
                      </Link>
                    )}
                  </motion.div>
                </div>

                {/*
                 * =================================================
                 * DESKTOP VIDEO PLAY INDICATOR
                 *
                 * No blur here. Just a subtle circle.
                 * =================================================
                 */}
                {videoUrl && isActiveSlide && isDesktop && !isHovered && !shouldReduceMotion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-40 hidden md:flex items-center justify-center pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-black/20 border border-white/20 shadow-[0_0_25px_rgba(0,0,0,0.35)]">
                      <svg
                        className="w-10 h-10 lg:w-12 lg:h-12 text-white/90 ml-1"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M7 6v12l10-6z" />
                      </svg>
                    </div>
                  </motion.div>
                )}

                {/*
                 * =================================================
                 * MOBILE PLAY / PAUSE BUTTON
                 *
                 * NO backdrop-blur.
                 * =================================================
                 */}
                {videoUrl && isActiveSlide && !isDesktop && !shouldReduceMotion && (
                  <motion.button
                    type="button"
                    onClick={toggleMobileVideo}
                    aria-label={mobileVideoActive ? 'Pause video' : 'Play video'}
                    aria-pressed={mobileVideoActive}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/35 hover:bg-black/50 active:bg-black/60 text-white transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2ecc71] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    {mobileVideoActive ? (
                      <svg
                        className="w-7 h-7 sm:w-8 sm:h-8"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 ml-1"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M7 6v12l10-6z" />
                      </svg>
                    )}
                  </motion.button>
                )}
              </article>
            );
          })}
        </motion.div>

        {/*
         * =====================================================
         * MOBILE SWIPE LABEL
         * =====================================================
         */}
        {slides.length > 1 && (
          <div
            className="absolute bottom-3 left-4 text-[10px] text-white/50 md:hidden pointer-events-none uppercase tracking-wider z-40"
            aria-hidden="true"
          >
            Swipe to browse
          </div>
        )}
      </div>

      {/*
       * =====================================================
       * NEXT BUTTON
       * =====================================================
       */}
      {slides.length > 1 && (
        <motion.button
          type="button"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
          onClick={nextSlide}
          aria-label="Next upcoming game"
          className="hidden md:flex items-center justify-center absolute right-2 lg:right-4 z-50 text-gray-500 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2ecc71] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
        >
          <svg
            className="w-12 h-12 lg:w-14 lg:h-14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      )}

      {/*
       * =====================================================
       * SLIDE INDICATORS
       * =====================================================
       */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-50"
          role="tablist"
          aria-label="Upcoming game slides"
        >
          {slides.map((slide, index) => {
            const isActive = currentIndex === index;

            return (
              <motion.button
                key={slide?.id ?? `indicator-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to game ${index + 1}: ${slide?.title || 'Upcoming Game'}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => goToSlide(index)}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.2 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2ecc71] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
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