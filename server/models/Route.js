/* eslint-disable require-jsdoc */
class Route {
  constructor(userId, origin, destination, elevation, duration, distance, fullRouteName, elevationDestination, destinationName, originName) {
    (this.userId = userId),
    (this.origin = origin),
    (this.destination = destination),
    (this.elevation = elevation),
    (this.duration = duration),
    (this.distance = distance),
    (this.fullRouteName = fullRouteName),
    (this.elevationDestination = elevationDestination),
    (this.destinationName = destinationName),
    (this.originName = originName);
  }
}
module.exports = Route;

