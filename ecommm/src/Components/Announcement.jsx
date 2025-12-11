import { useEffect, useState } from "react";
import "./Announcement.css";

function Announcement() {
  const announcements = [
    "🔥 The Locker is Unlocked!",
    "🎨 New Handmade Artist T-Shirts Available Now!"
  ];

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % announcements.length);
        setFade(true);
      }, 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  return (
    <div className="announce">
      <p className={fade ? "fade-in" : "fade-out"}>
        {announcements[index]}
      </p>
    </div>
  );
}

export default Announcement;
