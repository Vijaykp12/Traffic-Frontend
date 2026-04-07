/**
 * Calculates the geodetic distance between two points using the Haversine formula.
 * @param {Array} a - [longitude, latitude] of point 1
 * @param {Array} b - [longitude, latitude] of point 2
 * @returns {number} Distance in kilometers
 */
export function haversine(a, b) {
    const R = 6371; // Earth's radius in km
    const dLat = (b[1] - a[1]) * (Math.PI / 180);
    const dLon = (b[0] - a[0]) * (Math.PI / 180);

    const lat1 = a[1] * (Math.PI / 180);
    const lat2 = b[1] * (Math.PI / 180);

    const h =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) *
        Math.cos(lat1) * Math.cos(lat2);

    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Estimates travel speed based on city congestion levels.
 * @param {string} status - "Low", "Medium", or "High"
 * @returns {number} Speed in km/h
 */
export function getEstimatedSpeed(status) {
    const mapping = {
        "High": 18,
        "Medium": 30,
        "Low": 45
    };
    return mapping[status] || 30;
}