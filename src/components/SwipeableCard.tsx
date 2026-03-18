import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipe: () => void;
  onClick?: () => void;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({ children, onSwipe, onClick }) => {
  const [translateX, setTranslateX] = useState(0);
  const handlers = useSwipeable({
    onSwiping: (event) => {
      if (event.deltaX < 0) {
        setTranslateX(Math.max(event.deltaX, -80));
      }
    },
    onSwipedLeft: (event) => {
      if (event.deltaX < -50) {
        setTranslateX(-80);
      } else {
        setTranslateX(0);
      }
    },
    onSwipedRight: () => {
      setTranslateX(0);
    },
    swipeDuration: 300,
  });

  const handleClick = (e: React.MouseEvent) => {
    if (translateX !== 0) {
      e.preventDefault();
      e.stopPropagation();
      setTranslateX(0);
      return;
    }
    onClick?.();
  };

  return (
    <div {...handlers} className="relative select-none">
      <div 
        className="absolute right-0 inset-y-0 w-20 bg-red-500 flex items-center justify-center rounded-r-lg"
        style={{ opacity: translateX < -10 ? 1 : 0 }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwipe();
            setTranslateX(0);
          }}
          className="p-3 text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div 
        onClick={handleClick}
        className="bg-white shadow-sm border border-gray-200"
        style={{ 
          transform: `translateX(${translateX}px)`, 
          transition: 'transform 0.2s ease-out, border-radius 0.2s ease-out',
          borderTopRightRadius: translateX < -10 ? '0' : '0.5rem',
          borderBottomRightRadius: translateX < -10 ? '0' : '0.5rem',
        }}
      >
        {children}
      </div>
    </div>
  );
};
