import type { Coordinates } from "./location.types";

const EARTH_RADIUS_METERS = 6_371_000;
const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export function getDistanceInMeters(from: Coordinates, to: Coordinates) {
	const latitudeDelta = toRadians(to.lat - from.lat);
	const longitudeDelta = toRadians(to.lng - from.lng);
	const fromLatitude = toRadians(from.lat);
	const toLatitude = toRadians(to.lat);
	const haversine =
		Math.sin(latitudeDelta / 2) ** 2
		+ Math.cos(fromLatitude)
		* Math.cos(toLatitude)
		* Math.sin(longitudeDelta / 2) ** 2;

	return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
}

export function getBrowserCoordinates(timeout = 10_000) {
	return new Promise<Coordinates>((resolve, reject) => {
		if (!("geolocation" in navigator)) {
			reject(new Error("Geolocation is not supported by this browser."));
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => resolve({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			}),
			(error) => reject(error),
			{ enableHighAccuracy: true, timeout, maximumAge: 60_000 },
		);
	});
}
