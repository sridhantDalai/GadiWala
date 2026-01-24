import React, { useEffect, useRef, useState } from "react";
import "./scss/home.scss";

// gemini
import ShareDetails from "./shareDetails";
import { Footer, Header, Slide, Warning } from "./componets";

//gsap
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";



const Home = () => {
  // refs
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const firstArrowDownUsed = useRef(false);

  // state
  const [selectedVeh, setSelectedVeh] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const containerRef = useRef(null);

  const formRef = useRef(null);
  const specialRef = useRef(null);
  const [slid, setSlid] = useState(false);
  const [vehicleMode, setVehicleMode] = useState("sharing");
  const [locLoading, setLocLoading] = useState(false);


    useEffect(() => {
    if (selectedVeh === "bike" || selectedVeh === "car") {
      setVehicleMode("offline rented");
    } else if (selectedVeh === "erik" || selectedVeh === "auto") {
      setVehicleMode("sharing"); // default
    }
  }, [selectedVeh]);

    const toggleVehMode = () => {
    if (selectedVeh !== "erik" && selectedVeh !== "auto") return;

    setVehicleMode((prev) =>
      prev === "sharing" ? "offline rented" : "sharing"
    );
  };





  const tl = useRef(null);

    const [isMobile, setIsMobile] = useState(
    window.innerWidth < 780
  );

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 780);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

    useGSAP(() => {
      if (!isMobile) return;

      tl.current = gsap.timeline({ paused: true });

      tl.current
        .to(formRef.current, {
          x: "-200%",
          duration: 0.8,
          ease: "power3.inOut",
        })
        .fromTo(
          specialRef.current,
          { x: "200%" },
          {
            x: "0%",
            duration: 0.8,
            ease: "power3.inOut",
          },
          "<"
        );
    }, [isMobile]);


  const handleSlide = () => {
    if (!isMobile || !tl.current) return;

    if (!slid) {
      tl.current.play();
    } else {
      tl.current.reverse();
    }
    setSlid(!slid);
  };

      const getMyLocation = () => {
      setLocLoading(true);  
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();

            const addr = data.address || {};

            const street =
              addr.road ||
              addr.neighbourhood ||
              addr.suburb ||
              "";

            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              "";

            const state = addr.state || "";

            const place = [street, city, state]
              .filter(Boolean)
              .join(", ");


            if (fromRef.current) {
              fromRef.current.value = place;
              fromRef.current.focus();
              setLocLoading(false);
            }
          } catch (err) {
            console.error(err);
            alert("Failed to fetch location name");
          }
        },
        (error) => {
          alert("Location permission denied");
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    };


     // api key

  function extractJSON(text) {
    if (!text) return null;

    let cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in response");
    }

    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  }

async function main(fromValue, toValue) {
  try {
    setLoading(true);
    setResult(null);

    const vehicleModeFinal = vehicleMode;

    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `
ROLE:
You are a senior transport-research analyst specializing in Indian offline and shared mobility systems
(e-rickshaws, shared autos, local rentals, informal routes).

TASK:
Perform deep real-world research for LOCAL transport only (NO Ola/Uber/Rapido).
If its Offline Rented Vehicle type ONLY then do the Ola/Uber price.

OUTPUT:
Return ONLY valid JSON. No explanations. No markdown.

For distInKm:
- Must be accurate road distance in km
- Precision up to 0.1 km only

JSON SCHEMA (STRICT):
{
  "vehicle_type": "k",
  "from": "k",
  "to": "k",
  "distInKm": 6.6,
  "commonly_used_by_people": true,
  "direct_possible": true,
  "priceDetails": [
    "for Gandhi Maidan 15 Rs",
    "from there to station again 15 Rs"
  ],
  "routes": [
    ["Point A", "Point B"],
    ["Point C", "Point D"]
  ],
  "price_range": { "min": 0, "max": 0 },
  "sources": [],
  "final_confidence_score": 0.95
}

ROUTES RULES (VERY STRICT – MUST FOLLOW):
1. routes MUST be an array of arrays
2. Each inner array MUST contain EXACTLY 2 elements
3. Each element MUST be a place/landmark name (string)
4. DO NOT include start or end locations in routes
5. DO NOT include more than 2 routes
6. DO NOT repeat the same route
7. If only one route exists, return ONLY one array
8. Example valid formats ONLY:
   - [["A","B"]]
   - [["A","B"],["C","D"]]
9. Any other format is INVALID

k = ${selectedVeh} (${vehicleModeFinal})
from = ${fromValue}
to = ${toValue}

PRICING RULES:
- Prices must be based on surveys or official mentions between 2021–2026 ONLY
- Min and max price CANNOT be zero
- If vehicle type is offline rented, pricing must be extremely accurate
- If vehicle type is car (offline rented), be extra cautious and conservative

Return ONLY valid JSON that strictly follows all rules above.


        `,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Backend error:", errText);
      throw new Error("Backend API request failed");
    }

    const data = await response.json();

    if (!data.text) {
      throw new Error("No text returned from backend");
    }

    const parsed = extractJSON(data.text);

    // validations
    if (selectedVeh === "bike" && parsed.commonly_used_by_people === false) {
      alert("😅 We couldn't find sources related to bike transport on this route");
      return;
    }

    if (parsed.distInKm > 12) {
      parsed.vehicle_type = "offline rented";
    }

    setResult(parsed);
  } catch (error) {
    console.error("Frontend error:", error);
    alert("Failed to calculate route");
  } finally {
    setLoading(false);
  }
}


  const onSend = () => {
    const fromData = fromRef.current?.value.trim();
    const toData = toRef.current?.value.trim();

    if (!fromData || !toData) {
      alert("Fill From & To correctly");
      return;
    }

    if (!selectedVeh) {
      alert("Select a vehicle first");
      return;
    }

    main(fromData, toData);
  };

  useEffect(() => {
    const keyDown = (e) => {
      if (e.key === "ArrowDown" && !firstArrowDownUsed.current) {
        e.preventDefault();
        fromRef.current?.focus();
        firstArrowDownUsed.current = true;
        return;
      }

      if (e.key === "Enter") {
        onSend();
      }
    };

    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, [selectedVeh]);

  return (
    <div ref={containerRef} className="home">
      <Header/>
      <div ref={formRef} className="form1">
        <div className="title">
          <h1>GadiWala</h1>
          <p>compare the prices like a pro</p>
           {result && (
              <h2>{result.distInKm} KM</h2>
            )}
        </div>

        <div className="mid">
          <div className="veh">
            {["erik", "auto", "bike", "car"].map((veh) => (
              <div
                key={veh}
                onClick={() => setSelectedVeh(veh)}
                className={`${veh} ${
                  selectedVeh === veh ? "vehActive" : "vehNormal"
                }`}
              >
                <div className="img"></div>
              </div>
            ))}
          </div>
            <div className="ride">
              <h2>{vehicleMode}</h2>

              {(selectedVeh === "erik" || selectedVeh === "auto") && (
                <button onClick={toggleVehMode}>🔁</button>
              )}
            </div>
        </div>

        <div className="data">
          <input ref={fromRef} placeholder="From location" />
          <div className="me" onClick={getMyLocation}> {locLoading ? "⌛" : "📍"}</div>
          <input ref={toRef} placeholder="To location" />
        </div>

        <div className="down">
          <h3>Fares :</h3>
          <p>estimated :</p>

          <button onClick={onSend} disabled={loading}>
            <p>{loading ? "Calculating..." : "Calculate"}</p>
          </button>

          {result && (
            <h1>
              ₹{result.price_range.min} - ₹{result.price_range.max}
            </h1>
          )}
        </div>
      </div>

       <div ref={specialRef} className="special">
          <ShareDetails data={result} />
       </div>
        {isMobile && result && <Slide onSlide={handleSlide} />}
      <Warning/>
      <Footer/>
    </div>
  );
};

export default Home;
