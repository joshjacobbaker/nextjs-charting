"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { feature } from "topojson-client";
// import { Root } from "@/types";

const UsMapChart = () => {
  const plotRef = useRef<HTMLDivElement>(null);
  const [nationTopoJsonData, setNationTopoJsonData] = useState<ReturnType<
    typeof feature
  > | null>(null);
  //   const [stateMeshJsonData, setStateMeshJsonData] = useState<ReturnType<
  //     typeof mesh
  //   > | null>(null);

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

      //   const stateMeshJson = await fetch("/state-mesh.json");
      //   const stateMeshData = await stateMeshJson.json();

      //   const stateMeshData = mesh(
      //     geoJsonData,
      //     geoJsonData.objects.states,
      //     (a, b) => {
      //       return a !== b;
      //     }
      //   );

      //   console.log("stateMeshData", stateMeshData);
      //   setStateMeshJsonData(stateMeshData);
    };

    fetchGeoData();

    const currentPlotRef = plotRef.current;

    if (nationTopoJsonData && currentPlotRef) {
      const nationPlot = Plot.plot({
        width: 975,
        height: 600,
        projection: "identity",
        r: { range: [0, 40] },
        marks: [
          Plot.geo(nationTopoJsonData, {
            fill: "#ddd",
            title: (d) => d.properties.name,
          }),
          //   Plot.geo(stateMeshJsonData, {
          //     fill: "black",
          //     // title: (d) => d.properties.name,
          //   }),
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
  }, [nationTopoJsonData]);

  return <div ref={plotRef}>{/* The map will be rendered here */}</div>;
};

export default UsMapChart;
