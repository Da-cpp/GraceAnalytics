import { useState, Suspense, lazy } from "react";
import { scaleQuantile } from "d3-scale";

const MapChart = lazy(() => import("./MapChart"));

const JAMAICA_GEO_URL = "/jamaica_parishes.json";

const parishData = [
  { name: "Kingston", population: 156704, opportunityScore: 45, insight: "Market saturated." },
  { name: "Saint Andrew", population: 573300, opportunityScore: 65, insight: "Optimize digital targeting." },
  { name: "Saint Catherine", population: 516200, opportunityScore: 92, insight: "Critical Growth Zone." },
  { name: "Clarendon", population: 245100, opportunityScore: 82, insight: "Launch radio campaign." },
  { name: "Saint James", population: 183800, opportunityScore: 75, insight: "Focus on retail placement." },
  { name: "Saint Ann", population: 172300, opportunityScore: 58, insight: "Steady performance." },
  { name: "Manchester", population: 189700, opportunityScore: 72, insight: "Test premium lines." },
  { name: "Saint Elizabeth", population: 150200, opportunityScore: 88, insight: "Expand wholesale reach." },
  { name: "Westmoreland", population: 144100, opportunityScore: 50, insight: "Monitor pricing." },
  { name: "Portland", population: 81700, opportunityScore: 35, insight: "Niche market." },
  { name: "Saint Mary", population: 113600, opportunityScore: 62, insight: "Logistics potential." },
  { name: "Saint Thomas", population: 93900, opportunityScore: 40, insight: "Emerging market." },
  { name: "Trelawny", population: 75100, opportunityScore: 55, insight: "Consistent ROI." },
  { name: "Hanover", population: 69500, opportunityScore: 30, insight: "Local distribution only." },
];

const GeospatialMetrics = () => {
  const [hovered, setHovered] = useState<any>(null);

 
  const colorScale = (scaleQuantile() as any)
    .domain(parishData.map((d) => d.opportunityScore))
    .range(["#fee2e2", "#fecaca", "#f87171", "#ef4444", "#E21F26"]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Regional Analysis</h2>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
          GraceKennedy Strategy • 2026
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl relative min-h-[550px] flex items-center justify-center overflow-hidden">
          <Suspense fallback={<div className="p-20 text-center">Loading Intelligence Map...</div>}>
            <MapChart 
              geoUrl={JAMAICA_GEO_URL} 
              data={parishData} 
              onHover={setHovered}
              colorScale={colorScale}
            />
          </Suspense>

          {hovered && (
            <div className="absolute bottom-8 left-8 bg-gray-900 text-white p-6 rounded-[2rem] shadow-2xl border-l-8 border-red-600 animate-in slide-in-from-left-4 max-w-xs z-10">
              <p className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-1">{hovered.name}</p>
              <p className="text-3xl font-black">{hovered.population.toLocaleString()}</p>
              <p className="text-xs text-gray-400 italic mt-1 font-medium leading-tight">"{hovered.insight}"</p>
            </div>
          )}
        </div>

        {/* sidebar */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-8">
          <h4 className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest">
            High Priority Zones
          </h4>

          <div className="space-y-2">
            {/* {[...parishData]
              .sort((a, b) => b.opportunityScore - a.opportunityScore)
              .slice(0, 5)
              .map((p) => (
                <div key={p.name} className="flex justify-between items-center text-sm p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: colorScale(p.opportunityScore) as string }} 
                    />
                    <span className="font-bold text-gray-700 group-hover:text-black">{p.name}</span>
                  </div>
                  <span className="font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg text-[10px]">
                    {p.opportunityScore}%
                  </span>
                </div>
              ))} */}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            {/* <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Strategy Note</p>
            <p className="text-xs text-gray-500 leading-relaxed italic">
              Heatmap indicates distribution opportunity based on population density and current GraceKennedy retail footprint.
            </p> */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GeospatialMetrics;