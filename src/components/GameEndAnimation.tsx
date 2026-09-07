import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  emoji: string;
  x: number;
  rotate: number;
  delay: number;
  duration: number;
  size: number;
  swayX: number;
}

function generateWinParticles(): Particle[] {
  const emojis = ['🎉', '🏆', '✨', '💰', '🎊', '⭐', '🥇', '💎'];
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    x: Math.random() * 100,
    rotate: Math.random() * 720 - 360,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    size: 1.5 + Math.random() * 2,
    swayX: 0,
  }));
}

function generateLossParticles(): Particle[] {
  const emojis = ['💀', '☠️', '👻', '🦴', '💀', '☠️', '👻', '🦴'];
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    x: Math.random() * 100,
    rotate: Math.random() * 360 - 180,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    size: 2 + Math.random() * 3,
    swayX: (Math.random() - 0.5) * 200,
  }));
}

export default function GameEndAnimation({ result }: { result: 'win' | 'loss' | 'tie' }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setParticles(result === 'loss' ? generateLossParticles() : generateWinParticles());
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [result]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 50 }}
        >
          {/* Dark overlay for loss */}
          {result === 'loss' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-black"
            />
          )}

          {/* Screen shake wrapper for loss */}
          <motion.div
            className="absolute inset-0"
            animate={
              result === 'loss'
                ? { x: [0, -8, 8, -6, 6, -3, 3, 0], y: [0, 4, -4, 3, -3, 2, -2, 0] }
                : {}
            }
            transition={result === 'loss' ? { duration: 0.6, delay: 0.2 } : {}}
          >
            {result === 'loss'
              ? particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{
                      left: `${p.x}%`,
                      bottom: '-10%',
                      opacity: 0,
                      scale: 0,
                      rotate: 0,
                    }}
                    animate={{
                      bottom: `${30 + Math.random() * 60}%`,
                      opacity: [0, 0.8, 1, 1, 0],
                      scale: [0, p.size * 1.2, p.size, p.size * 0.9, 0],
                      rotate: p.rotate,
                      x: [0, p.swayX / 2, p.swayX, p.swayX / 2, 0],
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      ease: 'easeOut',
                    }}
                    className="absolute"
                    style={{ fontSize: `${p.size}rem` }}
                  >
                    {p.emoji}
                  </motion.div>
                ))
              : particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{
                      left: `${p.x}%`,
                      top: '-10%',
                      opacity: 1,
                      scale: 0,
                      rotate: 0,
                    }}
                    animate={{
                      top: '110%',
                      opacity: [0, 1, 1, 0.5, 0],
                      scale: [0, p.size, p.size, p.size * 0.8, 0.5],
                      rotate: p.rotate,
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      ease: 'easeIn',
                    }}
                    className="absolute"
                    style={{ fontSize: `${p.size}rem` }}
                  >
                    {p.emoji}
                  </motion.div>
                ))}
          </motion.div>

          {/* Center text */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <div className="text-8xl mb-4">
              {result === 'win' ? '🏆' : result === 'loss' ? '💀' : '🤝'}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`text-5xl font-bold drop-shadow-lg ${
                result === 'win'
                  ? 'text-yellow-300'
                  : result === 'loss'
                  ? 'text-red-400'
                  : 'text-white'
              }`}
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}
            >
              {result === 'win' ? 'VICTORY!' : result === 'loss' ? 'DEFEATED!' : 'DRAW!'}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
