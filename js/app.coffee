app = angular.module 'app', []

app.factory 'NED', ($http) ->
  async: (point) ->
    $http.get "http://ned.usgs.gov/epqs/pqs.php",
      params: { x: point.lon, y: point.lat, units: "Meters", output: "json" }
    .then (response) -> response.data.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation

Number::toRad = () -> this * Math.PI / 180
Number::toDeg = () -> this * 180 / Math.PI

class LatLon
  constructor: (@lat = 0, @lon = 0, @height = 0, @radius = 6371) ->
  destinationPoint: (bearing, distance) ->
    d = distance / @radius
    b = bearing.toRad()
    lat1 = @lat.toRad()
    lon1 = @lon.toRad()
    lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b))
    lon2 = lon1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2))
    if isNaN(lat2) or isNaN(lon2) then null
    else new LatLon(lat2.toDeg(), lon2.toDeg())

app.controller 'MainCtrl', (NED, $scope) ->
  $scope.lat = 42
  $scope.lon = -88
  $scope.distance = 0.1
  $scope.getRelativeElevation = ->
    totalPoints = 8
    $scope.point = new LatLon(Number($scope.lat), Number($scope.lon))
    $scope.points = _.range(totalPoints).map (t) -> $scope.point.destinationPoint(t*360/totalPoints, $scope.distance)
    updateRelativeElevation = ->
      averageElevation = _.reduce($scope.points, ((memo, num) -> memo + num.height), 0) / totalPoints
      $scope.relativeElevation = $scope.point.height - averageElevation
    getElevation = (p) -> NED.async(p).then (e) -> p.height=e; updateRelativeElevation()
    getElevation $scope.point
    _.each $scope.points, getElevation
