export type LocationConfig = {
  lon: string;
  lat: string;
  resource: string;
  delimiter: "|" | ",";
  indent: "true" | "false";
  profile_mode: "simple" | "detailed";
  measures: "true" | "false";
};

export type ElevationData = {
  elevations: Elevation[];
  height_differences: HeightDifferences;
};

export type Elevation = {
  lon: number;
  lat: number;
  z: number;
  acc: string;
};

export type HeightDifferences = {
  positive: number;
  negative: number;
};
