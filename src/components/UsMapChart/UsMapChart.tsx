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
  const [countiesMeshJsonData, setCountiesMeshJsonData] = useState<ReturnType<
    typeof mesh
  > | null>(null);
  const [newyorkTopoJsonData, setNewyorkTopoJsonData] = useState<ReturnType<
    typeof feature
  > | null>(null);
  const [massachusettsTopoJsonData, setMassachusettsTopoJsonData] =
    useState<ReturnType<typeof feature> | null>(null);

  const [population, setPopulation] = useState(null);

  const countiesAlbers10m = "counties-albers-10m.json";

  useEffect(() => {
    const fetchGeoData = async () => {
      // Fetch Geo Data
      const geoJsonDataJson = await fetch(`/${countiesAlbers10m}`);
      const geoJsonData = await geoJsonDataJson.json();

      // Nation
      console.log("geoJsonData", geoJsonData);
      const nationTopoJsonData = feature(
        geoJsonData,
        geoJsonData.objects.nation
      );
      setNationTopoJsonData(nationTopoJsonData);
      console.log("nationTopoJsonData", nationTopoJsonData);

      // New York
      const newYorkGeoJson = JSON.parse(JSON.stringify(geoJsonData));

      newYorkGeoJson.objects.states.geometries =
        geoJsonData.objects.states.geometries.filter(
          (d) => d.properties.name === "New York"
        );

      const newyorkTopoJsonData = feature(
        newYorkGeoJson,
        newYorkGeoJson.objects.states
      );
      setNewyorkTopoJsonData(newyorkTopoJsonData);

      // Massachusetts
      const massachusettsGeoJson = JSON.parse(JSON.stringify(geoJsonData));

      massachusettsGeoJson.objects.states.geometries =
        massachusettsGeoJson.objects.states.geometries.filter(
          (d) => d.properties.name === "Massachusetts"
        );
      const massachusettsTopoJsonData = feature(
        massachusettsGeoJson,
        massachusettsGeoJson.objects.states
      );
      setMassachusettsTopoJsonData(massachusettsTopoJsonData);
      console.log("massachusettsTopoJsonData", massachusettsTopoJsonData);

      // State Borders
      const stateMeshData = mesh(
        geoJsonData,
        geoJsonData.objects.states,
        (a, b) => a !== b
      );
      setStateMeshJsonData(stateMeshData);
      console.log("stateMeshData", stateMeshData);

      // Counties
      const countiesMeshData = mesh(
        geoJsonData,
        geoJsonData.objects.counties,
        (a, b) => a !== b
      );
      setCountiesMeshJsonData(countiesMeshData);
      console.log("countiesMeshData", countiesMeshData);

      // Fetch Geo Data
      const populationJson = await fetch("/population.json");
      const population = await populationJson.json();

      const populationCleand = population
        .slice(1) // removes a header line
        .map(([p, state, county]) => ({
          state,
          county,
          population: +p,
        }));

      setPopulation(populationCleand);
    };

    fetchGeoData();
  }, []);

  useEffect(() => {
    const currentPlotRef = plotRef.current;

    if (
      nationTopoJsonData &&
      stateMeshJsonData &&
      countiesMeshJsonData &&
      newyorkTopoJsonData &&
      massachusettsTopoJsonData &&
      population &&
      currentPlotRef
    ) {
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
          Plot.geo(countiesMeshJsonData, {
            stroke: "black",
            // title: (d) => d.properties.name,
          }),
          Plot.dot(
            population,
            Plot.centroid({
              r: "population",
              fill: "brown",
              fillOpacity: 0.5,
              stroke: "#fff",
              strokeOpacity: 0.5,
              // geometry: ({ state, county }) =>
              //   countymap.get(`${state}${county}`),
              // channels: {
              //   county: ({ state, county }) =>
              //     countymap.get(`${state}${county}`)?.properties.name,
              //   state: ({ state }) => statemap.get(state)?.properties.name,
              // },
              // tip: true,
            })
          ),
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
  }, [
    stateMeshJsonData,
    nationTopoJsonData,
    newyorkTopoJsonData,
    massachusettsTopoJsonData,
  ]);

  return <div ref={plotRef}>{/* The map will be rendered here */}</div>;
};

export default UsMapChart;
