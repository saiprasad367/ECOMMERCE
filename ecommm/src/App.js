import { useEffect, useState } from "react";
import "./App.css";
import Announcemnt from "./Components/Announcement";
import CircularText from "./Components/CircularText";
import Navbar from "./Components/Navbar";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loader for 3.5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    // Preloader
    return (
      <div className="preloader">
        <CircularText
          text="UNLOCK*THE*UNSEEN*"
          onHover="speedUp"
          spinDuration={20}
          className="preloader-text"
        />
      </div>
    );
  }

  // Main website after preloader
  return (
    <div className="App">
      <Announcemnt />
     <Navbar/>
    </div>
  );
}

export default App;
