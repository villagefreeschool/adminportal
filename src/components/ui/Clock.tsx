import { useState, useEffect } from 'react';

/**
 * A simple clock component that displays the current time
 */
export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-xl font-mono" data-testid="clock">
      {time.toLocaleTimeString()}
    </div>
  );
}
