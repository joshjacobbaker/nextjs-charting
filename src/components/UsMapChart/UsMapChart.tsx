"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { feature, mesh } from "topojson-client";

const UsMapChart = () => {
  const plotRef = useRef<HTMLDivElement>(null);
  const [nationTopoJsonData, setNationTopoJsonData] = useState<ReturnType<
    typeof feature
  > | null>(null);
  const [stateMeshJsonData, setStateMeshJsonData] = useState<ReturnType<
    typeof mesh
  > | null>(null);

  const countiesAlbers10m = "counties-albers-10m.json";

  useEffect(() => {
    const fetchGeoData = async () => {
      const geoJsonDataJson = await fetch(`/${countiesAlbers10m}`);
      const geoJsonData = await geoJsonDataJson.json();

      console.log("geoJsonData", geoJsonData);
      const nationTopoJsonData = feature(
        geoJsonData,
        geoJsonData.objects.nation
      );
      setNationTopoJsonData(nationTopoJsonData);
      console.log("nationTopoJsonData", nationTopoJsonData);

      //   const stateMeshJson = await fetch("/state-mesh.json");
      //   const stateMeshData = await stateMeshJson.json();

      const stateMeshData = mesh(
        geoJsonData,
        geoJsonData.objects.states,
        (a, b) => a !== b
      );

      //   const stateMeshData = feature(geoJsonData, geoJsonData.objects.states);

      console.log("stateMeshData", stateMeshData);
      setStateMeshJsonData(stateMeshData);
    };

    fetchGeoData();
  }, []);

  useEffect(() => {
    const currentPlotRef = plotRef.current;

    if (nationTopoJsonData && stateMeshJsonData && currentPlotRef) {
      const nationPlot = Plot.plot({
        width: 975,
        height: 600,
        projection: "identity",
        r: { range: [0, 40] },
        marks: [
          Plot.geo(nationTopoJsonData, {
            fill: "grey",
            title: (d) => d.properties.name,
          }),
          Plot.geo(stateMeshJsonData, {
            stroke: "black",
            // title: (d) => d.properties.name,
          }),
        ],
      });

      // Append the plot to the ref element
      if (currentPlotRef) {
        currentPlotRef.appendChild(nationPlot);
      }
    }
    // }

    // Cleanup the plot on component unmount
    return () => {
      if (currentPlotRef) {
        currentPlotRef.innerHTML = "";
      }
    };
  }, [stateMeshJsonData, nationTopoJsonData]);

  return <div ref={plotRef}>{/* The map will be rendered here */}</div>;
};

export default UsMapChart;
