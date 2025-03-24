"use client";

export type Root = Root2[];

export interface Root2 {
  state: string;
  county: string;
  population: number;
}

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
  // state map state
  const [stateMap, setStateMap] = useState<Map<string, GeoJSON.Feature> | null>(
    null
  );
  // county map state
  const [countyMap, setCountyMap] = useState<Map<
    string,
    GeoJSON.Feature
  > | null>(null);

  const [population, setPopulation] = useState<Root | null>(null);

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

      // Create state map

      const statesFeatureCollection = feature(
        geoJsonData,
        geoJsonData.objects.states
      );
      const statemap: Map<string, GeoJSON.Feature> = new Map(
        statesFeatureCollection.features.map((d) => [d.id, d])
      );
      setStateMap(statemap);
      // console.log("statemap", statesFeatureCollection);
      console.log("statemap", statemap);

      // Counties
      const countiesMeshData = mesh(
        geoJsonData,
        geoJsonData.objects.counties,
        (a, b) => a !== b
      );
      setCountiesMeshJsonData(countiesMeshData);
      console.log("countiesMeshData", countiesMeshData);

      // Create county map
      const countiesFeatureCollection = feature(
        geoJsonData,
        geoJsonData.objects.counties
      );

      const countymap: Map<string, GeoJSON.Feature> = new Map(
        countiesFeatureCollection.features.map((d) => [d.id, d])
      );

      console.log("countyMap", countymap);

      setCountyMap(countymap);

      console.log(
        "countymap",
        feature(geoJsonData, geoJsonData.objects.counties)
      );

      // Fetch Geo Data
      const populationJson = await fetch("/population.json");
      const population: Root = await populationJson.json();
      console.log("population", population);
      const populationCleand = population.map(
        ({ population, state, county }) => ({
          state,
          county,
          population: +population,
        })
      );

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
      countyMap &&
      stateMap &&
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
          // Plot.geo(countiesMeshJsonData, {
          //   stroke: "black",
          //   // title: (d) => d.properties.name,
          // }),
          Plot.geo(newyorkTopoJsonData, {
            fill: "blue",
            fillOpacity: 0.5,
            stroke: "black",
            title: "New York",
          }),
          Plot.geo(massachusettsTopoJsonData, {
            fill: "red",
            fillOpacity: 0.5,
            stroke: "black",
            title: "Massachusetts",
          }),
          Plot.dot(
            population,
            Plot.centroid({
              r: "population",
              fill: "state",
              fillOpacity: 0.5,
              stroke: "#fff",
              strokeOpacity: 0.5,
              // title: (d) =>
              //   `${
              //     (countyMap.get(`${d.state}${d.county}`)?.properties?.name ??
              //       "",
              //     stateMap?.get(d.state)?.properties?.name ?? "")
              //   }: ${d.population.toLocaleString()}`,
              geometry: ({ state, county }) =>
                countyMap.get(`${state}${county}`),
              channels: {
                county: ({ state, county }) =>
                  countyMap.get(`${state}${county}`)?.properties?.name ?? "",
                state: ({ state }) => stateMap?.get(state)?.properties?.name,
              },
            })
          ),
          Plot.tip(
            population,
            Plot.pointer({
              x: (d) => d.state,
              y: (d) => d.county,
              // geometry: ({ state, county }) =>
              //   countyMap.get(`${state}${county}`),
              fill: "state",
              fillOpacity: 0.6,
              stroke: "white",
              strokeWidth: 2,
              title: (d) => {
                return `${
                  countyMap.get(`${d.state}${d.county}`)?.properties?.name ?? ""
                }, ${
                  stateMap?.get(d.state)?.properties?.name ?? ""
                }: ${d.population.toLocaleString()} /n ${JSON.stringify(d)}`;
              },
              highlight: true, // Add this line to enable highlighting
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
    countiesMeshJsonData,
    population,
    countyMap,
    stateMap,
  ]);

  return <div ref={plotRef}>{/* The map will be rendered here */}</div>;
};

export default UsMapChart;
