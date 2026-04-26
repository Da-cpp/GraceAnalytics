import { geoMercator, geoPath } from "d3-geo";
import { useEffect, useState } from "react";
import { feature } from "topojson-client";

const MapChart = ({ geoUrl, data, onHover, colorScale }: any) => {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((topology) => {
        
        const geo = feature(topology, topology.objects.jamaica || topology.objects.jamaica_parishes);
        setGeoData(geo);
      })
      .catch(err => console.error("Error loading map JSON:", err));
  }, [geoUrl]);

  
  const projection = geoMercator()
        .scale(18000)            
        .center([-77.3, 18.15])  
        .translate([400, 225]);  

  const pathGenerator = geoPath().projection(projection);

  if (!geoData) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-gray-400 font-bold uppercase text-xs">Loading Geo-Spatial Data...</div>
    </div>
  );

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg 
        viewBox="0 0 800 450" 
        preserveAspectRatio="xMidYMid meet" 
        className="w-full h-auto max-h-[500px] drop-shadow-2xl"
      >
        {geoData.features.map((feature: any, i: number) => {
          const name = feature.properties.name || feature.properties.NAME_1 || feature.properties.NA2;
          
          const match = data.find(
            (p: any) => p.name.toLowerCase() === name?.toLowerCase()
          );

          return (
            <path
              key={i}
              d={pathGenerator(feature) || ""}
              fill={match ? colorScale(match.opportunityScore) : "#F3F4F6"}
              stroke="#ffffff"
              strokeWidth={1.5}
              onMouseEnter={() => onHover(match || null)}
              onMouseLeave={() => onHover(null)}
              className="transition-all duration-300 hover:fill-gray-900 cursor-pointer"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default MapChart;