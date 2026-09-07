import { Link } from "@tanstack/react-router";
import { Gauge, Fuel, Cog, MapPin } from "lucide-react";
import { formatPrice, type Vehicle } from "@/data/vehicles";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link
      to="/vehicules/$id"
      params={{ id: vehicle.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        <img
          src={vehicle.image}
          alt={`${vehicle.marque} ${vehicle.modele} ${vehicle.annee} à vendre à Abidjan`}
          loading="lazy"
          width={1200}
          height={800}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {vehicle.annee}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold leading-tight text-card-foreground">
            {vehicle.nom}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden="true" /> {vehicle.ville}
          </p>
        </div>
        <ul className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-1">
            <Gauge className="size-3.5" aria-hidden="true" />
            {new Intl.NumberFormat("fr-FR").format(vehicle.kilometrage)} km
          </li>
          <li className="flex items-center gap-1">
            <Fuel className="size-3.5" aria-hidden="true" />
            {vehicle.carburant}
          </li>
          <li className="flex items-center gap-1">
            <Cog className="size-3.5" aria-hidden="true" />
            {vehicle.boite}
          </li>
        </ul>
        <p className="mt-auto text-xl font-bold text-primary">
          {formatPrice(vehicle.prix)}
        </p>
      </div>
    </Link>
  );
}
