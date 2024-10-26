'use client'

import React from 'react';

interface VNCViewerProps {
  url: string;
}

const VNCViewer: React.FC<VNCViewerProps> = ({ url }) => {
  return (
    <iframe
      src={url}
      style={{ width: '100%', height: '100%', border: 'none' }}
      allow="fullscreen"
    />
  );
};

export default VNCViewer;
