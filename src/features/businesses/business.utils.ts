import type { BusinessCity, BusinessHoursStatus } from "./business.types";

export function getBusinessCityName(city: BusinessCity) {
  return typeof city === "string" ? city : city?.name ?? "";
}

export function hasDisplayableBusinessHours(hours: BusinessHoursStatus | null | undefined) {
  if (!hours || hours.remark?.trim().toLowerCase() === "hours unavailable") return false;

  const schedule = hours.schedule;
  return !schedule || Object.values(schedule).some((slots) => slots.length > 0);
}
