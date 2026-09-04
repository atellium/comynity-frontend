import type { BusinessCity } from "./business.types";

export function getBusinessCityName(city: BusinessCity) {
  return typeof city === "string" ? city : city?.name ?? "";
}
