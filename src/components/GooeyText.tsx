"use client";

import React from "react";
import "./GooeyText.scss";

const GooeyText: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[80px] sm:min-h-[120px] md:min-h-[160px] lg:min-h-[200px] flex items-center justify-center px-4">
      <div className="text"></div>
      
      {/* SVG FILTER - Reduced blur to keep Roboto letterforms sharp */}
      <svg>
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"></feGaussianBlur>
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="gooey"></feColorMatrix>
          <feComposite in="SourceGraphic" in2="gooey" operator="atop"></feComposite>
        </filter>
      </svg>
    </div>
  );
};

export default GooeyText;

