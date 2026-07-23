import { api } from "./client";

export interface Location {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
}

export async function createLocation(
  name: string,
  latitude: number,
  longitude: number,
  address?: string
): Promise<Location> {
  return api<Location>("/api/locations", {
    method: "POST",
    auth: true,
    body: { name, latitude, longitude, address },
  });
}
