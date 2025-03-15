"use client";

import React, { useEffect, useRef } from "react";
import * as Plot from "@observablehq/plot";

const PlotComponent = () => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a plot when the component mounts
    const plot = Plot.plot({
      marks: [
        Plot.dot(
          [
            { x: 1, y: 1 },
            { x: 2, y: 3 },
            { x: 3, y: 2 },
            { x: 4, y: 4 },
          ],
          { x: "x", y: "y" },
        ),
      ],
    });

    const currentPlotRef = plotRef.current;

    // Append the plot to the ref element
    if (currentPlotRef) {
      currentPlotRef.appendChild(plot);
    }

    // Cleanup the plot on component unmount
    return () => {
      if (currentPlotRef) {
        currentPlotRef.innerHTML = "";
      }
    };
  }, []);

  return <div ref={plotRef} />;
};

export default PlotComponent;
