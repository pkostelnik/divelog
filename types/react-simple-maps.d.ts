declare module "react-simple-maps" {
  import type { CSSProperties, ReactNode, SVGProps } from "react";

  export type ComposableMapProps = SVGProps<SVGSVGElement> & {
    projectionConfig?: Record<string, unknown>;
    style?: CSSProperties;
    children?: ReactNode;
  };

  export const ComposableMap: (props: ComposableMapProps) => JSX.Element;

  export type GeographyDefinition = Record<string, unknown> & { rsmKey: string };

  export type GeographiesProps = {
    geography: string | Record<string, unknown>;
    children: (args: { geographies: GeographyDefinition[] }) => ReactNode;
  };

  export const Geographies: (props: GeographiesProps) => JSX.Element;

  export type GeographyProps = SVGProps<SVGPathElement> & {
    geography: GeographyDefinition;
  };

  export const Geography: (props: GeographyProps) => JSX.Element;

  export type MarkerProps = SVGProps<SVGGElement> & {
    coordinates: [number, number];
    children?: ReactNode;
  };

  export const Marker: (props: MarkerProps) => JSX.Element;

  export type ZoomableGroupProps = {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
    disablePanning?: boolean;
    disableZooming?: boolean;
    children?: ReactNode;
  };

  export const ZoomableGroup: (props: ZoomableGroupProps) => JSX.Element;
}
