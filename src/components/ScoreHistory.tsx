import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface Score {
  score: number;
  result: string;
  played_at: string;
}

interface ScoreHistoryProps {
  token: string;
  refreshKey: number;
}

export default function ScoreHistory({ token, refreshKey }: ScoreHistoryProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/scores', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setScores(data); })
      .catch(() => {});
  }, [token, refreshKey]);

  if (scores.length === 0) return null;

  return (
    <div className="w-full max-w-md mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-center text-amber-700 hover:text-amber-900 text-sm underline mb-2"
      >
        {open ? 'Hide' : 'Show'} Score History ({scores.length})
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-300 overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-200/60">
                <th className="py-2 px-3 text-left text-amber-900">Date</th>
                <th className="py-2 px-3 text-center text-amber-900">Result</th>
                <th className="py-2 px-3 text-right text-amber-900">Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={i} className="border-t border-amber-200">
                  <td className="py-2 px-3 text-amber-700">
                    {new Date(s.played_at + 'Z').toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {s.result === 'Win' ? '🏆' : s.result === 'Tie' ? '🤝' : '💀'}
                    <span className="ml-1">{s.result}</span>
                  </td>
                  <td className={`py-2 px-3 text-right font-medium ${s.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${s.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
