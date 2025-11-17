"use client"

import { useEffect, useRef, useId, useState } from "react"

interface AnimatedTextProps {
  series?: string[]
  duration?: number
  transition?: number
  className?: string
}

export default function AnimatedText({
  series = ['Followers', 'unfollowers', 'Posts', 'Stories', 'Connections', 'Insights'],
  duration = 0.5,
  transition = 1,
  className = ""
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const filterId = `gooey-${useId().replace(/:/g, '-')}`
  const classId = useId().replace(/:/g, '-')
  const beforeRef = useRef<HTMLSpanElement>(null)
  const afterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let processedSeries = [...series]
    if (processedSeries.length % 2 === 1) {
      processedSeries = [...processedSeries, processedSeries[0]]
    }

    const seriesLength = processedSeries.length
    const seriesSplitLength = seriesLength / 2
    const itemDuration = duration + transition
    const totalDuration = itemDuration * seriesLength

    // Generate keyframes for opacity animations
    const generateKeyframes = (index: number, animName: string) => {
      let keyframes = `@keyframes ${animName} { `
      
      for (let i = 1; i <= seriesSplitLength; i++) {
        const startPercent = ((i - 1) / seriesSplitLength) * 100
        const endPercent = (i / seriesSplitLength) * 100 - 0.000001
        // Alternate opacity based on index
        const opacity = (i % 2 === (index % 2)) ? 1 : 0
        
        keyframes += `${startPercent.toFixed(2)}% { opacity: ${opacity}; } `
        keyframes += `${endPercent.toFixed(2)}% { opacity: ${opacity}; } `
      }
      
      keyframes += '}'
      return keyframes
    }

    // Update text content for before and after layers
    const updateTextContent = () => {
      let frame = 0
      const animate = () => {
        if (!beforeRef.current || !afterRef.current) {
          requestAnimationFrame(animate)
          return
        }

        const elapsed = (frame / 60) % totalDuration
        
        // Update before layer (odd items)
        const beforeStep = Math.floor((elapsed / totalDuration) * seriesSplitLength)
        const beforeItem = (beforeStep + 1) * 2 - 1
        let beforeIdx = beforeItem
        if (beforeIdx <= 0) beforeIdx += seriesLength
        if (beforeIdx > seriesLength) beforeIdx -= seriesLength
        const beforeActualIdx = ((beforeIdx - 1) % seriesLength + seriesLength) % seriesLength
        beforeRef.current.textContent = processedSeries[beforeActualIdx]
        
        // Update after layer (even items) with delay
        const afterElapsed = (elapsed + itemDuration) % totalDuration
        const afterStep = Math.floor((afterElapsed / totalDuration) * seriesSplitLength)
        const afterItem = (afterStep + 1) * 2
        let afterIdx = afterItem
        if (afterIdx <= 0) afterIdx += seriesLength
        if (afterIdx > seriesLength) afterIdx -= seriesLength
        const afterActualIdx = ((afterIdx - 1) % seriesLength + seriesLength) % seriesLength
        afterRef.current.textContent = processedSeries[afterActualIdx]
        
        frame++
        requestAnimationFrame(animate)
      }
      
      // Initialize
      if (beforeRef.current) {
        beforeRef.current.textContent = processedSeries[seriesLength - 2]
      }
      if (afterRef.current) {
        afterRef.current.textContent = processedSeries[seriesLength - 1]
      }
      
      requestAnimationFrame(animate)
    }

    updateTextContent()

    const oddAnimName = `gooey-odd-${classId}`
    const evenAnimName = `gooey-even-${classId}`

    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      document.head.appendChild(styleRef.current)
    }

    const maxWidth = Math.max(...processedSeries.map(s => s.length))
    const gradient = "linear-gradient(to right, #2563eb, #9333ea, #db2777)"

    styleRef.current.textContent = `
      ${generateKeyframes(1, oddAnimName)}
      ${generateKeyframes(0, evenAnimName)}
      
      .gooey-container-${classId} {
        position: relative;
        display: inline-block;
        min-width: ${maxWidth * 0.7}ch;
      }
      
      .gooey-layer-${classId} {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        white-space: nowrap;
        pointer-events: none;
        background: ${gradient};
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
        filter: blur(9px);
        animation-timing-function: ease;
        animation-iteration-count: infinite;
      }
      
      .gooey-before-${classId} {
        animation-name: ${oddAnimName};
        animation-duration: ${totalDuration}s;
      }
      
      .gooey-after-${classId} {
        animation-name: ${evenAnimName};
        animation-duration: ${totalDuration}s;
        animation-delay: ${itemDuration}s;
      }
      
      .gooey-main-${classId} {
        opacity: 0;
        position: absolute;
        visibility: hidden;
        user-select: none;
        pointer-events: none;
      }
    `

    return () => {
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current)
        styleRef.current = null
      }
    }
  }, [series, duration, transition, classId])

  const maxWidth = Math.max(...series.map(s => s.length))

  return (
    <>
      {/* SVG Gooey Filter */}
      <svg width="0" height="0" style={{ position: 'absolute', left: '-9999px' }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -8"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <span
        ref={containerRef}
        className={`gooey-container-${classId} ${className}`}
        style={{
          filter: `url(#${filterId})`,
          background: "linear-gradient(to right, #2563eb, #9333ea, #db2777)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        <span
          ref={beforeRef}
          className={`gooey-layer-${classId} gooey-before-${classId}`}
          aria-hidden="true"
        />
        <span
          ref={afterRef}
          className={`gooey-layer-${classId} gooey-after-${classId}`}
          aria-hidden="true"
        />
        <span className={`gooey-main-${classId}`} aria-hidden="true">
          {series[0]}
        </span>
      </span>
    </>
  )
}
