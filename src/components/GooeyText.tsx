"use client";

import React from "react";
import "./GooeyText.scss";

const GooeyText: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[50px] sm:min-h-[70px] md:min-h-[100px] lg:min-h-[140px] flex items-center justify-center px-4">
      <div className="text"></div>
      
      {/* SVG GOOEY FILTER - Sharp corners for Roboto geometric look, minimal blur */}
      <svg>
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur"></feGaussianBlur>
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 38 -12" result="gooey"></feColorMatrix>
          <feComposite in="SourceGraphic" in2="gooey" operator="atop"></feComposite>
        </filter>
      </svg>
    </div>
  );
};

export default GooeyText;

