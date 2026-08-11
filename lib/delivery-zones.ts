import { DeliveryZone } from '@/lib/commerce-types';

function normalizeLocationValue(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase();
}

export function resolveDeliveryZone(
  zones: DeliveryZone[],
  country: string,
  city?: string | null
) {
  const normalizedCountry = normalizeLocationValue(country);
  const normalizedCity = normalizeLocationValue(city);

  const activeZones = zones.filter((zone) => zone.isActive !== false);
  const exactMatch = activeZones.find(
    (zone) =>
      normalizeLocationValue(zone.country) === normalizedCountry &&
      normalizeLocationValue(zone.city) === normalizedCity
  );

  if (exactMatch) {
    return exactMatch;
  }

  return activeZones.find(
    (zone) =>
      normalizeLocationValue(zone.country) === normalizedCountry &&
      normalizeLocationValue(zone.city) === ''
  ) ?? null;
}

export function resolveDeliveryFee(
  zones: DeliveryZone[],
  country: string,
  city?: string | null
) {
  return resolveDeliveryZone(zones, country, city)?.fee ?? null;
}
