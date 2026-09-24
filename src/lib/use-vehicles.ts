import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublishedVehicles } from "./vehicles.functions";
import { vehicles, type Vehicle } from "@/data/vehicles";
import placeholder from "@/assets/car-1.jpg";

/** Véhicules du catalogue de base + véhicules publiés depuis l'espace vendeur. */
export function useAllVehicles(): Vehicle[] {
  const list = useServerFn(listPublishedVehicles);
  const { data } = useQuery({
    queryKey: ["vehicules-publies"],
    queryFn: () => list({}),
    staleTime: 60_000,
  });

  const publies: Vehicle[] = (data ?? []).map((v) => ({
    ...v,
    image: v.image || placeholder,
  }));

  return [...publies, ...vehicles];
}
