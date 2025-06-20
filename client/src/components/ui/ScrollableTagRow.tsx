import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableTagRowProps {
    tags: string[];
    className?: string;
}

const ScrollableTagRow: React.FC<ScrollableTagRowProps> = ({ tags, className = '' }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // Check if scrolling is needed and update arrow visibility
    const checkScrollPosition = () => {
        if (!scrollContainerRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

        // Show left arrow if not at the start
        setShowLeftArrow(scrollLeft > 0);

        // Show right arrow if not at the end
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
    };

    // Set up initial scroll check and event listener
    useEffect(() => {
        checkScrollPosition();

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);

            // Also check on window resize
            window.addEventListener('resize', checkScrollPosition);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', checkScrollPosition);
            }
            window.removeEventListener('resize', checkScrollPosition);
        };
    }, [tags]); // Re-run when tags change

    // Scroll functions
    const scrollLeft = () => {
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    };

    const scrollRight = () => {
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    };

    // If no tags, don't render
    if (tags.length === 0) return null; return (
        <div className={`relative flex items-center gap-3 ${className}`}>
            {/* Left scroll arrow */}
            {showLeftArrow && (
                <button
                    className="flex-shrink-0 z-10 flex items-center justify-center h-6 w-6 rounded-full bg-background/90 border border-primary/30 shadow-sm hover:bg-primary/10 transition-all hover:shadow-md hover:border-primary/50"
                    onClick={scrollLeft}
                    aria-label="Scroll tags left"
                >
                    <ChevronLeft size={14} className="text-primary" />
                </button>
            )}            {/* Scrollable container with gradient edges */}
            <div className="relative w-full overflow-hidden bg-black/10 backdrop-blur-sm rounded-md">{/* Left fade gradient - improved with multi-step gradient and better positioning */}
                {showLeftArrow && (
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-card via-card/80 to-transparent z-10 pointer-events-none rounded-l-md" />
                )}

                {/* Scrollable tag container - added padding to accommodate gradients */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto hide-scrollbar gap-2 py-1 px-3"
                >
                    {tags.map((tag, idx) => (
                        <span
                            key={`${tag}-${idx}`}
                            className="flex-shrink-0 px-2 py-1 bg-primary/90 text-white text-xs rounded-full shadow-sm whitespace-nowrap"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Right fade gradient - improved with multi-step gradient and better positioning */}
                {showRightArrow && (
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card via-card/80 to-transparent z-10 pointer-events-none rounded-r-md" />
                )}            </div>

            {/* Right scroll arrow */}
            {showRightArrow && (
                <button
                    className="flex-shrink-0 z-10 flex items-center justify-center h-6 w-6 rounded-full bg-background/90 border border-primary/30 shadow-sm hover:bg-primary/10 transition-all hover:shadow-md hover:border-primary/50"
                    onClick={scrollRight}
                    aria-label="Scroll tags right"
                >
                    <ChevronRight size={14} className="text-primary" />
                </button>
            )}
        </div>
    );
};

export default ScrollableTagRow;
