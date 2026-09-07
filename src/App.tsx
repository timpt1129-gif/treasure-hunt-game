import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import AuthPage from './components/AuthPage';
import ScoreHistory from './components/ScoreHistory';
import GameEndAnimation from './components/GameEndAnimation';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import klaLogo from './assets/kla_logo.png';
import keyIcon from './assets/key.png';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [isGuest, setIsGuest] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAuthenticated = !!token;
  const showGame = isAuthenticated || isGuest;

  const logoRef = useRef<HTMLImageElement>(null);
  const posRef = useRef({ x: 100, y: 100, dx: 2, dy: 1.5 });

  const animateLogo = useCallback(() => {
    const el = logoRef.current;
    if (!el) return;
    const p = posRef.current;
    const w = window.innerWidth - el.offsetWidth;
    const h = window.innerHeight - el.offsetHeight;

    p.x += p.dx;
    p.y += p.dy;

    if (p.x <= 0) { p.x = 0; p.dx = Math.abs(p.dx); }
    if (p.x >= w) { p.x = w; p.dx = -Math.abs(p.dx); }
    if (p.y <= 0) { p.y = 0; p.dy = Math.abs(p.dy); }
    if (p.y >= h) { p.y = h; p.dy = -Math.abs(p.dy); }

    el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    requestAnimationFrame(animateLogo);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(animateLogo);
    return () => cancelAnimationFrame(id);
  }, [animateLogo]);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
    setScoreSaved(false);
  };

  useEffect(() => {
    if (showGame) initializeGame();
  }, [showGame]);

  // Save score when game ends for authenticated users
  useEffect(() => {
    if (!gameEnded || !token || scoreSaved) return;
    const result = score > 0 ? 'Win' : score < 0 ? 'Loss' : 'Tie';
    fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score, result }),
    })
      .then(res => {
        if (res.ok) {
          setScoreSaved(true);
          setRefreshKey(k => k + 1);
        }
      })
      .catch(() => {});
  }, [gameEnded, token, score, scoreSaved]);

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    const box = boxes.find(b => b.id === boxId);
    if (box && !box.isOpen) {
      const audio = new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound);
      audio.play();
    }

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          const newScore = box.hasTreasure ? score + 100 : score - 50;
          setScore(newScore);
          return { ...box, isOpen: true };
        }
        return box;
      });

      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const openedCount = updatedBoxes.filter(box => box.isOpen).length;
      if (treasureFound || openedCount >= 2) {
        setGameEnded(true);
      }

      return updatedBoxes;
    });
  };

  const handleAuth = (newToken: string, newUsername: string) => {
    setToken(newToken);
    setUsername(newUsername);
    setIsGuest(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    setIsGuest(false);
    setGameEnded(false);
  };

  if (!showGame) {
    return <AuthPage onAuth={handleAuth} onGuest={() => setIsGuest(true)} />;
  }

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col items-center justify-center p-8 relative">
      {/* Header bar with user info */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {isGuest ? (
          <span className="text-sm text-amber-600">Playing as Guest</span>
        ) : (
          <span className="text-sm text-amber-800">👤 {username}</span>
        )}
        <Button
          onClick={handleSignOut}
          className="text-xs px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-800 border border-amber-400"
        >
          {isGuest ? 'Sign In' : 'Sign Out'}
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Pick 2 of the 3 treasure chests to open!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$100 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
        </div>

        {gameEnded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`text-4xl font-semibold p-4 rounded-lg shadow-lg border-2 ${
              score > 0
                ? 'bg-green-100 text-green-800 border-green-300'
                : score < 0
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-amber-200/80 text-amber-800 border-amber-400'
            }`}
          >
            {score > 0 ? 'Win!' : score < 0 ? 'Loss!' : 'Tie!'}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {boxes.map((box) => (
              <motion.div
                key={box.id}
                className="flex flex-col items-center"
                style={{ cursor: box.isOpen ? 'default' : `url(${keyIcon}) 16 16, pointer` }}
                whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
                whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
                onClick={() => openBox(box.id)}
              >
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{
                    rotateY: box.isOpen ? 180 : 0,
                    scale: box.isOpen ? 1.1 : 1
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <img
                    src={box.isOpen
                      ? (box.hasTreasure ? treasureChest : skeletonChest)
                      : closedChest
                    }
                    alt={box.isOpen
                      ? (box.hasTreasure ? "Treasure!" : "Skeleton!")
                      : "Treasure Chest"
                    }
                    className="w-48 h-48 object-contain drop-shadow-lg"
                  />

                  {box.isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                    >
                      {box.hasTreasure ? (
                        <div className="text-2xl animate-bounce">✨💰✨</div>
                      ) : (
                        <div className="text-2xl animate-pulse">💀👻💀</div>
                      )}
                    </motion.div>
                  )}
                </motion.div>

                <div className="mt-4 text-center">
                  {box.isOpen ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className={`text-lg p-2 rounded-lg ${
                        box.hasTreasure
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {box.hasTreasure ? '+$100' : '-$50'}
                    </motion.div>
                  ) : (
                    <div className="text-amber-700 p-2">
                      Click to open!
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
      </div>

      {gameEnded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
                <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
                <p className="text-lg text-amber-800">
                  Final Score: <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${score}
                  </span>
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  {boxes.some(box => box.isOpen && box.hasTreasure)
                    ? 'Treasure found! Well done, treasure hunter! 🎉'
                    : 'No treasure found this time! Better luck next time! 💀'}
                </p>
                {isGuest && (
                  <p className="text-xs text-amber-500 mt-2">
                    Sign in to save your scores!
                  </p>
                )}
                {isAuthenticated && scoreSaved && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Score saved
                  </p>
                )}
              </div>

              <Button
                onClick={initializeGame}
                className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
              >
                Play Again
              </Button>
            </motion.div>
          )}

      {isAuthenticated && (
        <ScoreHistory token={token!} refreshKey={refreshKey} />
      )}

      {gameEnded && (
        <GameEndAnimation result={score > 0 ? 'win' : score < 0 ? 'loss' : 'tie'} />
      )}

      <img
        ref={logoRef}
        src={klaLogo}
        alt="KLA Logo"
        className="fixed top-0 left-0 w-48 h-48 object-contain rounded-lg pointer-events-none"
        style={{ opacity: 0.5 }}
      />
    </div>
  );
}
