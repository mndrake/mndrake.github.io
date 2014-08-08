var app = angular.module('app', []);

app.factory('NED', function($http) {
    var NED = {
        async: function(point) {
            var url = "http://ned.usgs.gov/epqs/pqs.php?callback=JSON_CALLBACK";
            var promise = $http.jsonp(url, { 
                params: {
                    x: point.lon,
                    y: point.lat,
                    units: "Meters",
                    output: "json"
                }}).then(function (response) {
                return response.data.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation
            });            
            return promise;
        }
    };
    return NED;
});

Number.prototype.toRad = function() { return this * Math.PI / 180; }
Number.prototype.toDeg = function() { return this * 180 / Math.PI; }

function LatLon(lat, lon, height, radius) {
    if (!(this instanceof LatLon)) return new LatLon(lat, lon, height, radius);
    if (typeof height == 'undefined') height = 0;
    if (typeof radius == 'undefined') radius = 6371;
    radius = Math.min(Math.max(radius, 6353), 6384);
    this.lat = Number(lat);
    this.lon = Number(lon);
    this.height = Number(height);
    this.radius = Number(radius);
}

LatLon.prototype.destinationPoint = function(brng, dist) {
    dist = dist / 6371;
    brng = brng.toRad();
    var lat1 = this.lat.toRad(), lon1 = this.lon.toRad();
    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) + Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));
    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) * Math.cos(lat1), Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2));
    if (isNaN(lat2) || isNaN(lon2)) return null;   
    return new LatLon(lat2.toDeg(), lon2.toDeg());
};

app.controller('MainCtrl', function(NED, $scope) {
    $scope.lat = 42;
    $scope.lon = -88;
    $scope.distance =  0.1;

    $scope.getRelativeElevation = function() {
        var totalPoints = 8;
        $scope.point = LatLon($scope.lat, $scope.lon);
        $scope.points = _.range(totalPoints).map(function(t) { return $scope.point.destinationPoint(t*360/totalPoints, $scope.distance); });
                       
        var updateRelativeElevation = function() {
            var averageElevation  = _.reduce($scope.points, function(memo, num) { return memo + num.height; }, 0) / totalPoints;
            $scope.relativeElevation = $scope.point.height - averageElevation;
        };

        NED.async($scope.point).then(function(d){$scope.elevationPoint = d; $scope.point.height = d; updateRelativeElevation();});
         
        // need to refactor .. below is hack until I figure out how to push index into closure       
        NED.async($scope.points[0]).then(function(d){$scope.points[0].height=d; updateRelativeElevation();});
        NED.async($scope.points[1]).then(function(d){$scope.points[1].height=d; updateRelativeElevation();});
        NED.async($scope.points[2]).then(function(d){$scope.points[2].height=d; updateRelativeElevation();});
        NED.async($scope.points[3]).then(function(d){$scope.points[3].height=d; updateRelativeElevation();});
        NED.async($scope.points[4]).then(function(d){$scope.points[4].height=d; updateRelativeElevation();});
        NED.async($scope.points[5]).then(function(d){$scope.points[5].height=d; updateRelativeElevation();});        
        NED.async($scope.points[6]).then(function(d){$scope.points[6].height=d; updateRelativeElevation();});        
        NED.async($scope.points[7]).then(function(d){$scope.points[7].height=d; updateRelativeElevation();});
                        
        
//        for (var i in indexPoints) {            
//            NED.async(points[i]).then(function(d) {
//                console.log("elevation " + i + " : " + d);                
//                $scope.elevationPoints[i] = d;});
//        }        

    };
        
});
