"use client";

import { memo, useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import type { DiveSite } from "@/data/mock-data";
import { useDemoData } from "@/providers/demo-data-provider";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

type SiteMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  difficulty: DiveSite["difficulty"];
};

type MapView = {
  center: [number, number];
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

const difficultyRadius: Record<DiveSite["difficulty"], number> = {
  Beginner: 6,
  Fortgeschritten: 7,
  Pro: 8
};

function DiveSiteMapComponent({ mode = "visited" }: DiveSiteMapProps) {
  const { diveSites, diveLogs } = useDemoData();
  const { currentUser } = useAuth();
  const { t } = useI18n();

  const difficultyLabelMap = useMemo<Record<DiveSite["difficulty"], string>>(
    () => ({
      Beginner: t("dashboard.sites.difficulty.beginner"),
      Fortgeschritten: t("dashboard.sites.difficulty.advanced"),
      Pro: t("dashboard.sites.difficulty.pro")
    }),
    [t]
  );

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
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

  useEffect(() => {
    setView(initialView);
    setActiveSiteId((previous) => {
      if (previous && markers.some((marker) => marker.id === previous)) {
        return previous;
      }
      return markers[0]?.id ?? null;
    });
  }, [initialView, markers]);

  useEffect(() => {
    if (mapInstance) {
      mapInstance.setView(view.center, view.zoom);
    }
  }, [mapInstance, view]);

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
      if (marker && mapInstance) {
        const newView = {
          center: [marker.latitude, marker.longitude] as [number, number],
          zoom: determineFocusedZoom(markers.length)
        };
        setView(newView);
        mapInstance.setView(newView.center, newView.zoom);
      }
    },
    [markers, mapInstance]
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
    ? t("dashboard.sites.map.heading.all")
    : t("dashboard.sites.map.heading.visited");

  const headerDescription = mode === "all"
    ? t("dashboard.sites.map.description.all")
    : t("dashboard.sites.map.description.visited");

  if (mode === "visited" && (!currentUser?.id || markers.length === 0)) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.sites.map.heading.visited")}</h2>
          <p className="text-xs text-slate-500">
            {currentUser?.id
              ? t("dashboard.sites.map.empty.visited.authenticated")
              : t("dashboard.sites.map.empty.visited.unauthenticated")}
          </p>
        </header>
      </section>
    );
  }

  if (mode === "all" && markers.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.sites.map.heading.all")}</h2>
          <p className="text-xs text-slate-500">{t("dashboard.sites.map.empty.all")}</p>
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
            <span className="h-2 w-2 rounded-full bg-[#38BDF8]" aria-hidden="true" /> {difficultyLabelMap.Beginner}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#0EA5E9]" aria-hidden="true" /> {difficultyLabelMap.Fortgeschritten}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#0369A1]" aria-hidden="true" /> {difficultyLabelMap.Pro}
          </span>
          <button
            type="button"
            onClick={handleResetView}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-ocean-300 hover:text-ocean-700"
          >
            {t("dashboard.sites.map.actions.reset")}
          </button>
        </div>
      </header>
      <div className="mt-4 h-[360px] w-full relative">
        <MapContainer
          center={view.center}
          zoom={view.zoom}
          style={{ width: "100%", height: "100%" }}
          className="rounded-lg"
          ref={setMapInstance}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker) => {
            const isActive = marker.id === activeSiteId;
            return (
              <CircleMarker
                key={marker.id}
                center={[marker.latitude, marker.longitude]}
                radius={isActive ? difficultyRadius[marker.difficulty] + 2 : difficultyRadius[marker.difficulty]}
                pathOptions={{
                  fillColor: difficultyColor[marker.difficulty],
                  fillOpacity: isActive ? 0.9 : 0.7,
                  color: "#FFFFFF",
                  weight: isActive ? 2 : 1.5
                }}
                eventHandlers={{
                  click: () => handleMarkerSelect(marker.id)
                }}
              >
                <Tooltip>
                  {t("dashboard.sites.map.tooltip")
                    .replace("{name}", marker.name)
                    .replace("{latitude}", marker.latitude.toFixed(2))
                    .replace("{longitude}", marker.longitude.toFixed(2))}
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
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
                    {t("dashboard.sites.map.list.coordinates")
                      .replace("{latitude}", marker.latitude.toFixed(2))
                      .replace("{longitude}", marker.longitude.toFixed(2))
                      .replace("{difficulty}", difficultyLabelMap[marker.difficulty])}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
        {activeSite && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("dashboard.sites.map.selected.label")}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{activeSite.name}</h3>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-xs font-semibold text-slate-500">{t("dashboard.sites.map.selected.difficulty")}</dt>
                <dd className="text-xs font-semibold text-ocean-700">{difficultyLabelMap[activeSite.difficulty]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-xs font-semibold text-slate-500">{t("dashboard.sites.map.selected.coordinates")}</dt>
                <dd className="text-xs">
                  {t("dashboard.sites.map.selected.coordinatesValue")
                    .replace("{latitude}", activeSite.latitude.toFixed(4))
                    .replace("{longitude}", activeSite.longitude.toFixed(4))}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">
              {t("dashboard.sites.map.selected.helper")}
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
      center: [0, 0],
      zoom: 2
    };
  }

  const center = calculateCenter(markers);
  const zoom = determineZoom(markers.length);

  return {
    center,
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

  return [latitude, longitude];
}

function determineZoom(count: number): number {
  if (count === 1) {
    return 8;
  }
  if (count <= 3) {
    return 6;
  }
  if (count <= 6) {
    return 4;
  }
  return 3;
}

function determineFocusedZoom(count: number): number {
  if (count === 1) {
    return 10;
  }
  if (count <= 3) {
    return 8;
  }
  if (count <= 6) {
    return 6;
  }
  return 5;
}
