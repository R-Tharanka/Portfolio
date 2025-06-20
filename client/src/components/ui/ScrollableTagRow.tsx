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
    if (tags.length === 0) return null;

    return (
        <div className={`relative flex items-center ${className}`}>
            {/* Left scroll arrow */}
            {showLeftArrow && (
                <button
                    className="absolute left-0 z-10 flex items-center justify-center h-6 w-6 rounded-full bg-background/80 border border-primary/20 shadow-sm hover:bg-primary/10 transition-colors"
                    onClick={scrollLeft}
                    aria-label="Scroll tags left"
                >
                    <ChevronLeft size={14} className="text-primary" />
                </button>
            )}

            {/* Scrollable container with gradient edges */}
            <div className="relative w-full overflow-hidden">
                {/* Left fade gradient */}
                {showLeftArrow && (
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
                )}

                {/* Scrollable tag container */}        <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto hide-scrollbar gap-2 py-1 px-1"
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

                {/* Right fade gradient */}
                {showRightArrow && (
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
                )}
            </div>

            {/* Right scroll arrow */}
            {showRightArrow && (
                <button
                    className="absolute right-0 z-10 flex items-center justify-center h-6 w-6 rounded-full bg-background/80 border border-primary/20 shadow-sm hover:bg-primary/10 transition-colors"
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
