import { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

function format(secs: number): string {
  if (secs <= 0) return '00:00:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Live ticking countdown. `endTs` is a unix timestamp (seconds).
export default function Countdown({
  endTs,
  style,
  onExpire,
}: {
  endTs: number;
  style?: TextStyle | TextStyle[];
  onExpire?: () => void;
}) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, endTs - Math.floor(Date.now() / 1000))
  );

  useEffect(() => {
    setRemaining(Math.max(0, endTs - Math.floor(Date.now() / 1000)));
    const id = setInterval(() => {
      const r = Math.max(0, endTs - Math.floor(Date.now() / 1000));
      setRemaining(r);
      if (r <= 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endTs]);

  return <Text style={style}>{format(remaining)}</Text>;
}
