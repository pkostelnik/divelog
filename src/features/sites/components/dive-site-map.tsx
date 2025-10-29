"use client";

import { memo, useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

import type { DiveSite } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";
import { useAuth } from "@/providers/auth-provider";

const GEOJSON_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type SiteMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  difficulty: DiveSite["difficulty"];
};

type MapView = {
  coordinates: [number, number];
  zoom: number;
};

type DiveSiteMapProps = {
  mode?: "visited" | "all";
};

const difficultyColor: Record<DiveSite["difficulty"], string> = {
  Beginner: "#38BDF8",
  Fortgeschritten: "#0EA5E9",
  Pro: "#0369A1"
};

function DiveSiteMapComponent({ mode = "visited" }: DiveSiteMapProps) {
  const { diveSites, diveLogs } = useDemoData();
  const { currentUser } = useAuth();

  const visitedSiteIds = useMemo(() => {
    if (!currentUser?.id) {
      return new Set<string>();
    }

    const ids = new Set<string>();
    diveLogs.forEach((log) => {
      // Ensure the map only includes spots from the signed-in diver.
      if (log.siteId && log.diverId === currentUser.id) {
        ids.add(log.siteId);
      }
    });

    return ids;
  }, [diveLogs, currentUser?.id]);

  const markers = useMemo<SiteMarker[]>(() => {
    if (mode === "all") {
      return diveSites.map((site) => ({
        id: site.id,
        name: site.name,
        latitude: site.coordinates.latitude,
        longitude: site.coordinates.longitude,
        difficulty: site.difficulty
      }));
    }

    if (!currentUser?.id || visitedSiteIds.size === 0) {
      return [];
    }

    return diveSites
      .filter((site) => visitedSiteIds.has(site.id))
      .map((site) => ({
        id: site.id,
        name: site.name,
        latitude: site.coordinates.latitude,
        longitude: site.coordinates.longitude,
        difficulty: site.difficulty
      }));
  }, [mode, diveSites, visitedSiteIds, currentUser?.id]);

  const initialView = useMemo<MapView>(() => calculateInitialView(markers), [markers]);

  const [view, setView] = useState<MapView>(initialView);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(markers[0]?.id ?? null);

  useEffect(() => {
    setView(initialView);
    setActiveSiteId((previous) => {
      if (previous && markers.some((marker) => marker.id === previous)) {
        return previous;
      }
      return markers[0]?.id ?? null;
    });
  }, [initialView, markers]);

  const activeSite = useMemo(() => {
    if (!activeSiteId) {
      return undefined;
    }
    return markers.find((marker) => marker.id === activeSiteId);
  }, [activeSiteId, markers]);

  const handleMarkerSelect = useCallback(
    (id: string) => {
      setActiveSiteId(id);
      const marker = markers.find((item) => item.id === id);
      if (marker) {
        setView({
          coordinates: [marker.longitude, marker.latitude],
          zoom: determineFocusedZoom(markers.length)
        });
      }
    },
    [markers]
  );

  const handleKeySelect = useCallback(
    (event: KeyboardEvent<SVGGElement>, id: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleMarkerSelect(id);
      }
    },
    [handleMarkerSelect]
  );

  const handleResetView = useCallback(() => {
    setView(calculateInitialView(markers));
  }, [markers]);

  const headerTitle = mode === "all"
    ? "Übersichtskarte der Tauchplätze"
    : "Karte der besuchten Spots";

  const headerDescription = mode === "all"
    ? "Alle im System hinterlegten Spots auf einen Blick. Wähle einen Marker, um Details einzublenden."
    : "Jeder Marker entspricht einem Tauchplatz aus deinem Logbuch. Wähle einen Eintrag, um die Karte automatisch auf diesen Spot zu fokussieren.";

  if (mode === "visited" && (!currentUser?.id || markers.length === 0)) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-900">Karte der besuchten Spots</h2>
          <p className="text-xs text-slate-500">
            {currentUser?.id
              ? "Du hast noch keine Tauchgänge mit einem Spot verknüpft."
              : "Bitte anmelden, um deine verknüpften Tauchspots zu sehen."}
          </p>
        </header>
      </section>
    );
  }

  if (mode === "all" && markers.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-900">Übersichtskarte der Tauchplätze</h2>
          <p className="text-xs text-slate-500">
            Es wurden noch keine Tauchplätze angelegt. Füge einen Spot hinzu, um ihn hier zu sehen.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">{headerTitle}</h2>
          <p className="text-xs text-slate-500">{headerDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#38BDF8]" /> Beginner
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#0EA5E9]" /> Fortgeschritten
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#0369A1]" /> Pro
          </span>
          <button
            type="button"
            onClick={handleResetView}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-ocean-300 hover:text-ocean-700"
          >
            Ansicht zurücksetzen
          </button>
        </div>
      </header>
      <div className="mt-4 h-[360px] w-full">
        <ComposableMap
          projectionConfig={{ scale: 140 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            center={view.coordinates}
            zoom={view.zoom}
            minZoom={0.9}
            maxZoom={6}
            translateExtent={[[-220, -120], [220, 120]]}
          >
            <Geographies geography={GEOJSON_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#E2E8F0"
                    stroke="#CBD5F5"
                    strokeWidth={0.5}
                    className="transition-colors hover:fill-slate-300"
                  />
                ))
              }
            </Geographies>
            {markers.map((marker) => {
              const isActive = marker.id === activeSiteId;
              return (
                <Marker
                  key={marker.id}
                  coordinates={[marker.longitude, marker.latitude]}
                >
                  <g
                    tabIndex={0}
                    role="button"
                    aria-pressed={isActive}
                    onClick={() => handleMarkerSelect(marker.id)}
                    onKeyDown={(event) => handleKeySelect(event, marker.id)}
                    focusable="true"
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:ring-offset-2"
                  >
                    <circle
                      r={isActive ? 6 : 4.5}
                      fill={difficultyColor[marker.difficulty]}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    />
                    {isActive && (
                      <circle r={10} fill="none" stroke="rgba(14,116,144,0.4)" strokeWidth={2} />
                    )}
                    <title>{`${marker.name} · ${marker.latitude.toFixed(2)}°, ${marker.longitude.toFixed(2)}°`}</title>
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <ul className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-1">
          {markers.map((marker) => {
            const isActive = marker.id === activeSiteId;
            return (
              <li key={marker.id}>
                <button
                  type="button"
                  onClick={() => handleMarkerSelect(marker.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    isActive
                      ? "border-ocean-300 bg-ocean-50 text-slate-700"
                      : "border-slate-200 bg-slate-50 hover:border-ocean-200 hover:bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800">{marker.name}</p>
                  <p>
                    {marker.latitude.toFixed(2)}°, {marker.longitude.toFixed(2)}° · {marker.difficulty}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
        {activeSite && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Ausgewählter Spot
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{activeSite.name}</h3>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-xs font-semibold text-slate-500">Schwierigkeit</dt>
                <dd className="text-xs font-semibold text-ocean-700">{activeSite.difficulty}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-xs font-semibold text-slate-500">Koordinaten</dt>
                <dd className="text-xs">
                  {activeSite.latitude.toFixed(4)}°, {activeSite.longitude.toFixed(4)}°
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">
              Nutze die Karte, um weitere Spots zu erkunden oder die Ansicht zurückzusetzen, wenn du dich verfahren hast.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export const DiveSiteMap = memo(DiveSiteMapComponent);

function calculateInitialView(markers: SiteMarker[]): MapView {
  if (markers.length === 0) {
    return {
      coordinates: [0, 0],
      zoom: 1.2
    };
  }

  const coordinates = calculateCenter(markers);
  const zoom = determineZoom(markers.length);

  return {
    coordinates,
    zoom
  };
}

function calculateCenter(markers: SiteMarker[]): [number, number] {
  const { latitudeSum, longitudeSum } = markers.reduce(
    (accumulator, marker) => {
      return {
        latitudeSum: accumulator.latitudeSum + marker.latitude,
        longitudeSum: accumulator.longitudeSum + marker.longitude
      };
    },
    { latitudeSum: 0, longitudeSum: 0 }
  );

  const latitude = latitudeSum / markers.length;
  const longitude = longitudeSum / markers.length;

  return [longitude, latitude];
}

function determineZoom(count: number): number {
  if (count === 1) {
    return 3;
  }
  if (count <= 3) {
    return 2;
  }
  if (count <= 6) {
    return 1.5;
  }
  return 1.2;
}

function determineFocusedZoom(count: number): number {
  if (count === 1) {
    return 4;
  }
  if (count <= 3) {
    return 3;
  }
  if (count <= 6) {
    return 2.3;
  }
  return 2;
}
