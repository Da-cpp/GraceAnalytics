import React from 'react';

const CustomerMap: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '400px',
    marginBottom: '20px'
  };

  const iframeStyle: React.CSSProperties = {
    border: '2px solid #eee',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontFamily: 'Arial, sans-serif' }}>GK Customer Segments Map</h2>
      <iframe 
        src="/jamaica_clusters_map.html" 
        width="100%" 
        height="100%" 
        style={iframeStyle}
        title="GK Customer Map"
        sandbox="allow-scripts allow-same-origin" 
      />
    </div>
  );
};

export default CustomerMap;