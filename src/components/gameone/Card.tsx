import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { CardData } from '../../utils/types';

interface CardProps {
  id: number;
  cardData: CardData;
  onCardFlip: (id: number) => void;
}

const Card: React.FC<CardProps> = ({ id, cardData, onCardFlip }) => {
  const isFlipped = cardData.status !== '';
  const isMatch = cardData.status === 'match';
  const isMismatch = cardData.status === 'mismatch';

 
  const handleClick = () => {
    if (!isFlipped) {
      onCardFlip(id);
    }
  };

  return (
    <div className="relative w-full h-full perspective-1000">
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={handleClick}
        style={{ transformStyle: 'preserve-3d' }} 
      >
        
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-xl overflow-hidden border-2 border-slate-700/50"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }} 
        >
         
          <div className="w-full h-full bg-slate-900 relative flex items-center justify-center group hover:bg-slate-800 transition-colors duration-300">
          
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black opacity-90" />
            
          
            <div className="absolute inset-2 border border-slate-700/30 rounded-lg" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 text-slate-600 group-hover:text-yellow-500 transition-colors duration-300 transform group-hover:scale-110">
               <HelpCircle size={32} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div
          className={`absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden border-2 
            ${isMatch ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 
              isMismatch ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-slate-600'}`}
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)' 
          }}
        >
          <div className="relative w-full h-full bg-black">
            <img
              src={cardData?.image}
              alt={cardData?.name ?? 'movie-poster'}
              className="w-full h-full object-cover pointer-events-none"
            />
            
           
            {(isMatch || isMismatch) && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                {isMatch && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="bg-yellow-500 rounded-full p-2 text-black shadow-lg"
                  >
                    <CheckCircle2 size={32} strokeWidth={3} />
                  </motion.div>
                )}
                {isMismatch && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="bg-red-600 rounded-full p-2 text-white shadow-lg"
                  >
                     <XCircle size={32} strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            )}

       
            {!isMatch && !isMismatch && (
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-50 pointer-events-none" />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Card;