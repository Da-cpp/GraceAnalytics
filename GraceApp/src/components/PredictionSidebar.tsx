import React, { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';

interface PredictionFeatures {
  customer_footfall: number;
  store_type: 'Pharmacy' | 'Supermarket' | 'Wholesale/Chinese';
  normal_price_jmd: number;
  avg_unit_price_jmd: number;
}

interface SidebarProps {
  onUpdate: (values: PredictionFeatures) => void;
  prediction: number | null;
  isPredicting: boolean;
}

const PredictionSidebar: React.FC<SidebarProps> = ({ onUpdate, prediction, isPredicting }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const [values, setValues] = useState<PredictionFeatures>({
    customer_footfall: 850,
    store_type: 'Pharmacy',
    normal_price_jmd: 850.50,
    avg_unit_price_jmd: 850.50
  });

  const isFirstRender = useRef(true);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'range' ? parseFloat(value) : value
    }));
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      onUpdate(values);
      return;
    }

    const timer = setTimeout(() => {
      onUpdate(values);
    }, 2400); 

    return () => clearTimeout(timer);
  }, [values, onUpdate]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-red-700 text-white p-3 rounded-l-xl shadow-2xl transition-all z-40 border-l border-y border-white/20"
      >
        <span style={{ writingMode: 'vertical-rl' }} className="font-bold tracking-widest text-[10px] uppercase py-2">ADJUST</span>
      </button>

      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-500 ease-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-0 h-full flex flex-col">
          
          <div className="bg-gray-900 p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-black tracking-widest uppercase text-gray-400">Model Tuning</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>

            <div className="bg-white/10 p-4 rounded-xl border border-white/10">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Live Sales Estimate</p>
              <div className={`text-2xl font-mono transition-opacity ${isPredicting ? 'opacity-40' : 'opacity-100'}`}>
                {prediction !== null 
                  ? `J$${prediction.toLocaleString()}` 
                  : "..."}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Footfall</label>
                <span className="text-sm font-bold">{values.customer_footfall}</span>
              </div>
              <input 
                type="range" name="customer_footfall" min="0" max="5000" step="50"
                value={values.customer_footfall} onChange={handleChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Store Type</label>
              <select 
                name="store_type" value={values.store_type} onChange={handleChange}
                className="w-full p-2 bg-white border border-gray-300 text-xs font-bold rounded-lg"
              >
                <option value="Pharmacy">Pharmacy</option>
                <option value="Supermarket">Supermarket</option>
                <option value="Wholesale/Chinese">Wholesale/Chinese</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Base Price</label>
                <span className="text-sm font-bold">${values.normal_price_jmd}</span>
              </div>
              <input 
                type="range" name="normal_price_jmd" min="100" max="15000" step="100"
                value={values.normal_price_jmd} onChange={handleChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Unit Price</label>
                <span className="text-sm font-bold text-red-600">${values.avg_unit_price_jmd}</span>
              </div>
              <input 
                type="range" name="avg_unit_price_jmd" min="100" max="15000" step="100"
                value={values.avg_unit_price_jmd} onChange={handleChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
          </div>
          
          <div className="p-4 bg-white border-t">
             <button onClick={() => setIsOpen(false)} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold text-[10px] tracking-widest hover:bg-red-700 transition-all">
                CLOSE TUNER
             </button>
          </div>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default PredictionSidebar;