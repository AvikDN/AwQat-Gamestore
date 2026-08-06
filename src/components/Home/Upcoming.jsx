import React, { useState, useEffect } from 'react';

export default function Upcoming() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const slides = [
     { videoId: "rJrqHyojaa4", title: "Wolvarine" },
    { videoId: "VQRLujxTm3c", title: "GTA 6" },
    { videoId: "HLMX2w3cwuE", title: "God of War" },
    { videoId: "u2jrHzua0jA", title: "Resident Evil 9" },
    { videoId: "uPqxmNJxztA", title: "AC blackflag Resynced" }
  ];

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    let timer;
    if (!isHovered) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 10000);
    }
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  return (
    // Increased max-width to allow the slider to stretch wider on large screens
    <div className="relative w-full max-w-[1600px] mx-auto flex items-center justify-center py-8 md:py-16 px-2 md:px-8">
      
      <button 
        onClick={prevSlide}
        className="absolute left-1 md:left-4 z-10 text-gray-500 hover:text-gray-200 transition-colors"
      >
        <svg className="w-8 h-8 md:w-14 md:h-14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Main Overflow Container with responsive height and width */}
      <div 
        className="relative w-[90%] md:w-[88%] h-[350px] sm:h-[450px] md:h-[600px] lg:h-[75vh] max-h-[850px] bg-[#d9d9d9] overflow-hidden group shadow-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        
        <div 
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={slide.videoId} className="w-full h-full shrink-0 relative">
              
              {index === currentIndex && (
                <iframe
                  src={`https://www.youtube.com/embed/${slide.videoId}?autoplay=1&mute=1&loop=1&playlist=${slide.videoId}&controls=0&modestbranding=1`}
                  title="YouTube background video"
                  allow="autoplay; encrypted-media"
                  className="absolute inset-0 w-full h-full pointer-events-none scale-[1.35] md:scale-125 z-0"
                />
              )}

              <img 
                src={`https://img.youtube.com/vi/${slide.videoId}/maxresdefault.jpg`}
                alt="Video Thumbnail"
                className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 pointer-events-none ${(isHovered && index === currentIndex) ? 'opacity-0' : 'opacity-100'}`}
              />

              {/* Responsive Frosted Glass Mask */}
              <div 
                className="absolute left-0 top-0 w-3/4 md:w-3/5 lg:w-1/2 h-full bg-white/20 backdrop-blur-md flex flex-col justify-center px-6 md:px-16 lg:px-24 z-20 pointer-events-none"
                style={{
                  WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
                  maskImage: 'linear-gradient(to right, black 50%, transparent 100%)'
                }}
              >
                {/* Scaled typography for mobile vs desktop */}
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold text-white mb-4 md:mb-8 tracking-wide pointer-events-auto leading-tight">
                  {slide.title}
                </h2>
                <button className="bg-[#5c5c5c] text-white px-5 py-2.5 md:px-8 md:py-4 rounded-xl text-sm md:text-lg font-medium w-max hover:bg-gray-700 transition-colors pointer-events-auto shadow-lg">
                  Pre-Order Now
                </button>
              </div>

              {/* Scaled Play Icon */}
              <div className={`absolute inset-0 flex items-center justify-center z-30 pointer-events-none transition-opacity duration-300 ${(isHovered && index === currentIndex) ? 'opacity-0' : 'opacity-100'}`}>
                <svg className="w-20 h-20 md:w-32 md:h-32 text-white ml-12 md:ml-24 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 6v12l10-6z" />
                </svg>
              </div>

            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={nextSlide}
        className="absolute right-1 md:right-4 z-10 text-gray-500 hover:text-gray-200 transition-colors"
      >
        <svg className="w-8 h-8 md:w-14 md:h-14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Pagination Dots scaled for mobile */}
      <div className="absolute bottom-1 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-10">
        {slides.map((_, index) => (
          <div 
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 md:w-4 md:h-4 rounded-full cursor-pointer transition-colors ${
              currentIndex === index ? 'bg-[#4a4a4a]' : 'bg-[#d1d1d1] hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

    </div>
  );
}