import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "../components/scss/shareDetails.scss";


const ShareDetails = ({ data }) => {

  const viewRef = useRef(null);

  const [showSource, setShowSource] = useState(false);
  const [activePathIndex, setActivePathIndex] = useState(0);

    useEffect(() => {
    if (!viewRef.current) return;

    gsap.fromTo(
        viewRef.current,
        {
        opacity: 0,
        y: showSource ? 20 : -20,
        },
        {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
        }
    );
    }, [showSource]);

  if (!data) return null;

  const today = new Date().toLocaleDateString("en-IN");



  const routes =
    Array.isArray(data.routes) && data.routes.length > 0
      ? data.routes
      : [[]]; 

  const cleanedRoutes = routes.map(route =>
  Array.isArray(route) && route.length > 2
    ? route.slice(1, -1)
    : []
);


    if (!showSource) {
    return (
        <div ref={viewRef} className="shareDetails">
            {cleanedRoutes.map((viaList, index) => (
            <ShareCard
                key={index}
                n={index + 1}
                from={data.from}
                viaList={viaList}
                to={data.to}
                confidence={data.final_confidence_score}
                date={today}
                isActive={activePathIndex === index}
                onSelect={() => setActivePathIndex(index)}
                onDetails={() => setShowSource(true)}
            />
            ))}
        </div>
    );
    }

        return (
        <div ref={viewRef}>
            <Sources
            from={data.from}
            to={data.to}
            viaList={routes[activePathIndex]}
            data={data}
            date={today}
            onBack={() => setShowSource(false)}
            />
        </div>
        );

};

export const ShareCard = ({
  n,
  from,
  viaList,
  to,
  confidence,
  date,
  isActive,
  onSelect,
  onDetails,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`shareCard ${isActive ? "active" : ""}`}
    >
      <div className="title">
        <h1>{`Path ${n}`}</h1>
      </div>

      <div className="mainDet">
        <div className="left">
          <div className="places">
            <p>{`→ ${from}`}</p>

            {viaList.length > 0 ? (
              viaList.map((via, i) => (
                <p key={i} id="via">{`• ${via}`}</p>
              ))
            ) : (
              <p id="via">• Direct Route</p>
            )}

            <p>{`→ ${to}`}</p>
          </div>

          <div className="details">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDetails();
              }}
            >
              <p>Check Details</p>
            </button>
          </div>
        </div>

        <div className="right">
          <p>Confidence as per</p>
          <p>{date}</p>
          <div className="percent">
            <h1>{confidence * 100}%</h1>
          </div>
        </div>
      </div>
    </div>
  );
};


export const Sources = ({ from, to, viaList, data, date, onBack }) => {
  return (
    <div className="cardSource">
      <div className="title">
        <h1>Path Details</h1>
      </div>

      <div className="mainDet">
        <div className="left">
          <div className="places">
            <p>{`→ ${from}`}</p>

            {viaList.length > 0 ? (
              viaList.map((via, i) => (
                <p key={i} id="via">{`• ${via}`}</p>
              ))
            ) : (
              <p id="via">• Direct Route</p>
            )}

            <p>{`→ ${to}`}</p>
          </div>
        </div>

        <div className="right">
          <p>Confidence as per</p>
          <p>{date}</p>
          <div className="percent">
            <h1>{data.final_confidence_score * 100}%</h1>
          </div>
        </div>
      </div>

      <div className="show">
        <div className="detail">
          <h2>Price Detail&apos;s</h2>
          {Array.isArray(data.priceDetails) &&
            data.priceDetails.map((item, i) => (
              <li key={i} id="detailRoute">
                {item}
              </li>
            ))}
        </div>

        <div className="source">
          <h2>Source</h2>
          {Array.isArray(data.sources) &&
            data.sources.map((src, i) => <li key={i}>{src}</li>)}
        </div>

        <div className="back">
          <button onClick={onBack}>
            <p>Back</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDetails;
