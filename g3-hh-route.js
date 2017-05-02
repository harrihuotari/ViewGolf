var app = angular.module("routeApp", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/player", {
        templateUrl : "g3-hh-player.html",
		controller: "playerController"
    })
    .when("/round", {
        templateUrl : "g3-hh-round.html",
		controller: "roundController"
    })
    .when("/newscore", {
        templateUrl : "g3-hh-newscore.html",
		controller: "newscoreController"
    })
    .when("/event", {
        templateUrl : "g3-hh-re.html",
		controller: "reController"
    })
    .when("/courses", {
        templateUrl : "g3-hh-courses.html",
		controller: "courseController"
    })
    .otherwise({
		templateUrl : "g3-maintext.html"
    });
});


app.controller("courseController", function($scope, $http,  AccessServerData) {
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Course";
		$http.get(url).then(function(response) {
			$scope.courses = response.data;
			console.log($scope.courses);
		}, function(error) {
			console.log(error);
		});
		
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Hole";
		$http.get(url).then(function(response) {
			$scope.holes = response.data;
			console.log($scope.holes);
		}, function(error) {
			console.log(error);
		});
		
		$scope.showModal = false;
		$scope.showCourseHoles = function(i) {
			$scope.showModal = !$scope.showModal;
			$scope.ind = i;
			var baseUrl = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Hole";
			var url = baseUrl + "/" + $scope.courses.data[i].Cid;
			$http.get(url).then(function(response) {
				$scope.courseholes = response.data;
				console.log($scope.courseholes);
			}, function(error) {
				console.log(error);
			});
			
		};

		$scope.storeHole = function (HoleNr, HoleName, HolePar, HoleHCP, CourseId) {
			var holedata = {
			HoleNr: HoleNr,
			HoleName: HoleName,
			HolePar: HolePar,
			HoleHCP: HoleHCP,
			CourseId: CourseId
			};
			console.log(holedata);
			var summaryPromise = AccessServerData.insHole(holedata);
			summaryPromise.then(function (data) {
				console.log(data);
				if (HoleNr > 0) {
					$scope.holeStoreStatus[HoleNr-1].storeStatus = true;	
				};
				var j = 0;
				$scope.allHolesStored = true;
				for (j = 0; j < 18; j++) {
					if (!$scope.holeStoreStatus[j].storeStatus == true) {
						$scope.allHolesStored = false;
						break;
					};
				};
				if ($scope.allHolesStored) {
					alert("All holes stored");
					$scope.hideCourses = false;
					$scope.courseStored = false;
				};
			}, function (err) {
				console.log(err);
			});					
			
		};
		
		$scope.storeHoles = function () {

			var valid = true;
			var i = 0;
			for (i=0; i < 18; i++) {
				if (isNaN($scope.newHole[i].HolePar) || (isNaN($scope.newHole[i].HoleHCP))) {
					valid = false;
					console.log("Not a number");
					break;
				};
			};
			$scope.holeStoreStatus = [
				{holeNr: 1, storeStatus: false}
			];
			for (i = 1; i < 18; i++) {
				$scope.holeStoreStatus.push({holeNr: (i+1), storeStatus:false})
			};
			if (valid) {
				console.log("All scores ok");
				for (j=0; j < 18; j++) {
					holeNr = $scope.newHole[j].HoleNr;
					holeName = $scope.newHole[j].HoleName;
					holePar = $scope.newHole[j].HolePar;
					holeHCP = $scope.newHole[j].HoleHCP;
					if ($scope.selectedCidFound) {
						$scope.storeHole(holeNr, holeName, holePar, holeHCP, $scope.selectedCid);
					};
				};
			};
		};
		
		$scope.initCourseEdit = function () {
			$scope.hideCourses = true;
		};

		$scope.getNewCourseid = function () {
			$scope.selectedCidFound = false;
			var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Course";
			$http.get(url).then(function(response) {
				$scope.courses = response.data;
				console.log($scope.courses);
				var i = 0;
				for (i=0; i < $scope.courses.data.length; i++) {
					if (($scope.courses.data[i].CourseName == $scope.newName) && 
					    ($scope.courses.data[i].Abbreviation == $scope.newAbbr) &&
						($scope.courses.data[i].CR == $scope.newCR)) {
						$scope.selectedCid = $scope.courses.data[i].Cid;
						$scope.selectedCidFound = true;					
					};
				};
			}, function(error) {
				console.log(error);
			});			
		};
		
		$scope.initNewHoles = function () {
			// initialize data structure for new holes, newHole[]....

			$scope.newHole = [
				{HoleNr: 1, HoleName:null, HolePar:3, HoleHCP:1}
			];
			var i = 1;
			for (i = 1; i < 18; i++) {
				$scope.newHole.push({HoleNr: (i+1), HoleName:null, HolePar:3, HoleHCP:1})
			};
		};
		
		$scope.cancelNewCourse = function () {
			$scope.hideCourses = false;
		};
		
		$scope.storeNewCourse = function () {
				
			// store course data 
			var coursedata = {
			CourseName: $scope.newName,
			Abbreviation: $scope.newAbbr,
			Location: $scope.newLocation,
			CoursePar: $scope.newPar,
			Front9Par: $scope.newFront9,
			Back9Par: $scope.newBack9,
			CourseSlope: $scope.newSlope,
			CR: $scope.newCR
			};
			console.log(coursedata);
			var summaryPromise = AccessServerData.insCourse(coursedata);
			summaryPromise.then(function (data) {
				$scope.courses.data.push(coursedata);
				console.log(data);
				$scope.courseStored = true;
				$scope.initNewHoles();
				// get course id in time for storing holes
				$scope.getNewCourseid();
			}, function (err) {
				console.log(err);
			});					
							
		};

		$scope.cancelHoles = function () {
			$scope.hideCourses = false;
			$scope.courseStored = false;
			$scope.selectedCidFound = false;	
		}
		$scope.editCourse = function () {
		};
});

app.controller("reController", function($scope, $http) {
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/RoundEvent";
		$http.get(url).then(function(response) {
			$scope.roundevents = response.data;
			console.log($scope.roundevents);
		}, function(error) {
			console.log(error);
		});
		$scope.showModal = false;
		$scope.toggleModal = function(i) {
			$scope.showModal = !$scope.showModal;
			$scope.ind = i;
		};
		$scope.editEvent = function(index) {
			$scope.selRoundName = $scope.roundevents.data[index].RoundName;
			$scope.selDate = $scope.roundevents.data[index].Date;
			$scope.selTemperature = $scope.roundevents.data[index].Temperature;
			$scope.selRain = $scope.roundevents.data[index].Rain;
			$scope.selSun = $scope.roundevents.data[index].Sun;
			$scope.selWind = $scope.roundevents.data[index].Wind;
			$scope.selWindDirection = $scope.roundevents.data[index].WindDirection;
			$scope.selCourseid = $scope.roundevents.data[index].Courseid;
			$scope.indexOfEvent = index;
			$scope.hideEvents = true;
		};
		$scope.updateEvent = function(RoundName, Date, Temperature, Rain, Sun, Wind, WindDirection, Courseid) {
			var eData = {
			RoundName: RoundName,
			Date: Date,
			Temperature: Temperature,
			Rain: Rain,
			Sun: Sun,
			Wind: Wind,
			WindDirection: WindDirection,
			Courseid: Courseid
			};

			// update into the data base
			var baseUrl = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/RoundEvent";
			var url = baseUrl + "/" + $scope.roundevents.data[$scope.indexOfEvent].REid;
			console.log(url);
			console.log(eData);
			$http.put(url, eData).then(function(response) {
				console.log(response.data);
			}, function(error) {
				console.log(error);
			});

			// update the page shown to user in events summary
			$scope.roundevents.data[$scope.indexOfEvent].RoundName = $scope.selRoundName;
			$scope.roundevents.data[$scope.indexOfEvent].Date = $scope.selDate;
			$scope.roundevents.data[$scope.indexOfEvent].Temperature = $scope.selTemperature;
			$scope.roundevents.data[$scope.indexOfEvent].Rain = $scope.selRain;
			$scope.roundevents.data[$scope.indexOfEvent].Sun = $scope.selSun;
			$scope.roundevents.data[$scope.indexOfEvent].Wind = $scope.selWind;
			$scope.roundevents.data[$scope.indexOfEvent].WindDirection = $scope.selWindDirection;

			// show event summary
			$scope.hideEvents = false;
		};

		$scope.cancelEditing = function () {
			$scope.hideEvents = false;
		};
});

// app.controller("summaryController", function($scope, $http, AccessServerData) {
//		var summaryPromise = AccessServerData.getSummary();
//		
//		summaryPromise.then(function (data) {
//			$scope.summary = data;
//			console.log(data);
//		}, function (err) {
//			console.log(err);
//		});
//		$scope.showModal = false;
//		$scope.toggleModal = function(i) {
//			$scope.showModal = !$scope.showModal;
//			$scope.ind = i;
//		}
// });
		
app.factory("AccessServerData", function ($http, $q) {
	var serviceObject = {};
	
	serviceObject.getSummary = function () {
		var deferred = $q.defer();

		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Roundsummary";
		$http.get(url).then(function(response) {
			deferred.resolve(response.data);
		}, function (error) {
			deferred.reject(error);
		});

		return deferred.promise;
	};

	
	serviceObject.getOneCourse = function (cid) {
		var deferred = $q.defer();
		var baseUrl = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Course";
		var url = baseUrl + "/" + cid;
		$http.get(url).then(function(response) {
			deferred.resolve(response.data);
			}, function (error) {
			deferred.reject(error);
		});
		return deferred.promise;
	};
	
	serviceObject.insPlayer = function (pdata) {
		var deferred = $q.defer();
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Player";
		$http.post(url, pdata).then(function(response) {
			deferred.resolve(response.data);
			}, function (error) {
			deferred.reject(error);
		});
		return deferred.promise;
	};

	serviceObject.insCourse = function (coursedata) {
		var deferred = $q.defer();
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Course";
		$http.post(url, coursedata).then(function(response) {
			deferred.resolve(response.data);
			}, function (error) {
			deferred.reject(error);
		});
		return deferred.promise;
	};

	serviceObject.insHole = function (holedata) {
		var deferred = $q.defer();
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Hole";
		$http.post(url, holedata).then(function(response) {
			deferred.resolve(response.data);
			}, function (error) {
			deferred.reject(error);
		});
		return deferred.promise;
	};
	
	serviceObject.insNewEvent = function (edata) {
		var deferred = $q.defer();
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/RoundEvent";
		$http.post(url, edata).then(function(response) {
			deferred.resolve(response.data);
			}, function (error) {
			deferred.reject(error);
		});
		return deferred.promise;
	};
	
	serviceObject.insPlayersRound = function (prData) {
		var deferred = $q.defer();
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/PlayersRound";
		console.log(prData);
		$http.post(url, prData).then(function(response) {
			deferred.resolve(response.data);
			}, function (error) {
			deferred.reject(error);
		});
		return deferred.promise;
	};

	serviceObject.insHoleScore = function (scData) {
		var deferred = $q.defer();
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Score";
		console.log(scData);
		$http.post(url, scData).then(function(response) {
			deferred.resolve(response.data);
			}, function (error) {
			deferred.reject(error);
		});
		return deferred.promise;
	};
	
	return serviceObject;	
});		



app.controller("playerController", function($scope, $http, $route, $timeout, AccessServerData) {
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Player";
		console.log(url);
		$http.get(url).then(function(response) {
			$scope.players = response.data;
			console.log($scope.players);
		}, function(error) {
			console.log(error);
		});
		$scope.showModal = false;
		$scope.toggleModal = function(i) {
			$scope.showModal = !$scope.showModal;
			$scope.ind = i;
		};
		$scope.initialize = function() {
			$scope.Fname = null;
			$scope.Lname = null;
			$scope.Sex = null;
			$scope.Courseabbr = null;
			$scope.Handicap = null;
			$scope.MobileNr = null;
			$scope.email = null;
			$scope.inserting = false;
			$scope.editing = false;
			$scope.change = false;
			$scope.hideVar = true;
		}
		$scope.delPlayer = function(i) {
			var x;
			var id = parseInt(i);
			if (((id == 1) || (id == 2) || (id == 3) || (id == 4))) {
				alert("It is illegal choice to try to delete this player!");
			}
			if (confirm("Are you sure to delete the player?") == true) {
				var baseUrl = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Player";
				console.log(id);
				var x = null;
				console.log(baseUrl);
				var url = baseUrl + "/" + id;
				console.log(url);
				if (!((id == 1) || (id == 2) || (id == 3) || (id == 4))) {
					$http.delete(url).then(function(response) {
						$scope.content = response.data;
						console.log($scope.content);
						var ind = 0;
						var k = 0;
						console.log($scope.players.data.length);
						for(k = 0; k < $scope.players.data.length; k++) {
							if (id == parseInt($scope.players.data[k].Pid)) {
								ind = k;
								break;
							}
						}
						$scope.players.data.splice(ind,1);
						console.log(ind);
						console.log($scope.players);						
					}, function(response) {
						$scope.content = "Not deleted";
					});
				} else {
					alert("You were already warned, this player is not to be deleted!");
				}
					
				// $timeout(4000);
				// $route.reload();
			} else {
				x = "Not deleted.";	
			}
		}
		$scope.Fname = null;
		$scope.Lname = null;
		$scope.Sex = null;
		$scope.Courseabbr = null;
		$scope.Handicap = null;
		$scope.MobileNr = null;
		$scope.email = null;
		$scope.inserting = false;
		$scope.editing = false;
		$scope.change = false;
		console.log($scope.change);

		// Inserting new player into database
		
		$scope.insertPlayer = function (Fname, Lname, Sex, Courseabbr, Handicap, MobileNr, email) {
			var pdata = {
			Fname: Fname,
			Lname: Lname,
			Sex: Sex,
			Courseabbr: Courseabbr,
			Handicap: Handicap,
			MobileNr: MobileNr,
			email: email
			};
			if ($scope.inserting == true) {
				console.log(pdata);
				var summaryPromise = AccessServerData.insPlayer(pdata);
				summaryPromise.then(function (data) {
					$scope.players.data.push(pdata);
					console.log(data);
				}, function (err) {
					console.log(err);
				});					
				$scope.inserting = false;
				$scope.hideVar = true;
				$scope.change = false;
			}
		}
		$scope.startInserting = function() {
			$scope.hideVar = false;
			$scope.inserting = true;
			$scope.editing = false;
			$scope.change = true;
			$scope.Fname = null;
			$scope.Lname = null;
			$scope.Sex = null;
			$scope.Courseabbr = null;
			$scope.Handicap = null;
			$scope.MobileNr = null;
			$scope.email = null;
			console.log($scope.hideVar);
			console.log($scope.change);
			}

		// Fetches only data for editing 
		$scope.editPlayer = function(i) {
			var id = parseInt(i);
			$scope.Playerid = id;
			var baseUrl = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Player";
			console.log(id);
			var url = baseUrl + "/" + id;
			console.log(url);
			var ind = 0;
			for(k = 0; k < $scope.players.data.length; k++) {
				if (id == parseInt($scope.players.data[k].Pid)) {
					ind = k;
					break;
				}
			}
			console.log(ind);
			$scope.Fname = $scope.players.data[ind].Fname;
			$scope.Lname = $scope.players.data[ind].Lname;
			$scope.Sex = $scope.players.data[ind].Sex;
			$scope.Courseabbr = $scope.players.data[ind].Courseabbr;
			$scope.Handicap = $scope.players.data[ind].Handicap;
			$scope.MobileNr = $scope.players.data[ind].MobileNr;
			$scope.email = $scope.players.data[ind].email;
			$scope.hideVar = false;
			$scope.editing = true;
			$scope.inserting = false;
			$scope.change = true;
			}

		// Updating the player into database
		$scope.updatePlayer = function (Fname, Lname, Sex, Courseabbr, Handicap, MobileNr, email) {
			var pdata = {
			Fname: Fname,
			Lname: Lname,
			Sex: Sex,
			Courseabbr: Courseabbr,
			Handicap: Handicap,
			MobileNr: MobileNr,
			email: email
			};
			if ($scope.editing == true) {
				console.log(pdata);
				var baseUrl = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Player";
				var url = baseUrl + "/" + $scope.Playerid;
				console.log(url);
				$http.put(url, pdata).then(function(response) {
					if (response.data)
						$scope.msg = "Post Data Method Executed Successfully!";
						var k = 0;
						console.log($scope.players.data.length);
						for(k = 0; k < $scope.players.data.length; k++) {
							if ($scope.Playerid == parseInt($scope.players.data[k].Pid)) {
								$scope.players.data[k].Fname = Fname;
								$scope.players.data[k].Lname = Lname;
								$scope.players.data[k].Sex = Sex;
								$scope.players.data[k].Courseabbr = Courseabbr;
								$scope.players.data[k].Handicap = Handicap;
								$scope.players.data[k].MobileNr = MobileNr;
								$scope.players.data[k].email = email;
								break;
							}
						}
					}, function (response) {
						$scope.msg = "Service not Exists";
						$scope.statusval = response.status;
						$scope.statustext = response.statusText;
						$scope.headers = response.headers();
					});
				$scope.editing = false;
				$scope.hideVar = true;
				$scope.change = false;
				console.log($scope.statustext);
				// $timeout(4000);
				// $route.reload();
				}
		}
			
});

app.controller("roundController", function($scope, $http, AccessServerData) {
		var summaryPromise = AccessServerData.getSummary();
		summaryPromise.then(function (data) {
			$scope.summary = data;
			console.log(data);
		}, function (err) {
			console.log(err);
		});

		$scope.getNewScore = function($index, pid, eid) {
			$scope.showModal = !$scope.showModal;
			$scope.ind = $index;
			var playerid = pid;
			var eventid = eid;

			var baseUrl = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Round";
			var url = baseUrl + "/" + playerid + "/" + eventid;
			console.log(url);
			$http.get(url).then(function(response) {
				$scope.holescores = response.data;
				console.log($scope.holescores);
				var sum = 0;
				var i = 0;
				var parResult = 3;
				for (i=0; i<18;i++) {
					sum += parseInt($scope.holescores.data[i].Score);
					};
				$scope.sumScore = sum;				
				sum=0;
				for (i=0; i<18;i++) {
					sum += parseInt($scope.holescores.data[i].BP);	
					};
				$scope.sumBP = sum;
				sum = 0;
				for (i=0; i<18;i++) {
					if($scope.holescores.data[i].Putts != null) {
						sum += parseInt($scope.holescores.data[i].Putts);	
						};					
					};
				$scope.sumPutts = sum;
				sum = 0;
				for (i=0; i<18;i++) {
					parResult = parseInt($scope.holescores.data[i].Par);
					if ((parResult == 4) || (parResult == 5)) {					
						if (!($scope.holescores.data[i].fw == null)) {
							if (($scope.holescores.data[i].fw == "Y") || ($scope.holescores.data[i].fw == "1") || ($scope.holescores.data[i].fw == true)) {
								sum++;
								}
							};
						};
					};
					/*
					if (!isNaN($scope.holescores.data[i].fw)) {
							sum += parseInt($scope.holescores.data[i].fw);
							};
						};
					};
					*/
				$scope.sumFW = sum;
				sum = 0;
				for (i=0; i<18;i++) {
					if (!($scope.holescores.data[i].gh == null)) {
						if (($scope.holescores.data[i].gh == "Y") || ($scope.holescores.data[i].gh == "1") || ($scope.holescores.data[i].gh == true)) {
							sum++;
							}
						};
					};
					/*
				    if (!isNaN($scope.holescores.data[i].gh)) {
						sum += parseInt($scope.holescores.data[i].gh);
					};
					*/
	
				$scope.sumGH = sum;

			}, function(error) {
				console.log(error);
			});
		}		
		$scope.showModal = false;
		$scope.toggleModal = function($index) {
			$scope.showModal = !$scope.showModal;
			$scope.ind = $index;
		};
});

app.controller("newscoreController", function($scope, $http, $route, $timeout, AccessServerData) {
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/RoundEvent";
		$http.get(url).then(function(response) {
			$scope.roundevents = response.data;
			console.log($scope.roundevents);
		}, function(error) {
			console.log(error);
		});

		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Course";
		$http.get(url).then(function(response) {
			$scope.courses = response.data;
			console.log($scope.courses);
		}, function(error) {
			console.log(error);
		});

		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Player";
		console.log(url);
		$http.get(url).then(function(response) {
			$scope.players = response.data;
			console.log($scope.players);
		}, function(error) {
			console.log(error);
		});
		
		var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/PlayersRound";
		console.log(url);
		$http.get(url).then(function(response) {
			$scope.playersRound = response.data;
			console.log($scope.playersRound);
		}, function(error) {
			console.log(error);
		});		
		
		$scope.initNewEvent = function(){
			$scope.hideNewEvent = false;
			$scope.RoundName = null;
			$scope.Date = null;
			$scope.Temperature = null;
			$scope.Rain = null;
			$scope.Sun = null;
			$scope.Wind = null;
			$scope.WindDirection = null;
		};

		$scope.initPlayersRound = function (cid) {
			$scope.hidePlayersRound = false;
		};

		$scope.getNewPRid = function () {
			var found = false;
			var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/PlayersRound";
			console.log(url);
			$http.get(url).then(function(response) {
				$scope.playersRound = response.data;
				console.log($scope.playersRound);
				var i = 0;
				console.log($scope.playersRound.data.length);
				for(i = 0; i < $scope.playersRound.data.length; i++) {
					if (($scope.playersRound.data[i].Playerid == $scope.selectedPid) && 
						($scope.playersRound.data[i].RoundEventid == $scope.selectedEid)) {
						$scope.selectedPRid = $scope.playersRound.data[i].PRid;
						console.log("PRid found = " + $scope.selectedPRid + " in getNewPRid");
						$scope.selectedPRidFound = true;
						found = true;
						break;
					};
				};
				}, function(error) {
				console.log(error);
				});		
			return found;
		};

		$scope.getPRid = function () {
			var i = 0;
			var found = false;
			console.log($scope.playersRound.data.length);
			for(i = 0; i < $scope.playersRound.data.length; i++) {
				if (($scope.playersRound.data[i].Playerid == $scope.selectedPid) && 
					($scope.playersRound.data[i].RoundEventid == $scope.selectedEid)) {
					$scope.selectedPRid = $scope.playersRound.data[i].PRid;
					$scope.selectedPRidFound = true;
					console.log("PRid found = " + $scope.selectedPRid);
					found = true;
					break;
				};
			};
			console.log("PRid found or not = " + found);
			return found;
		};
		
		$scope.storePlayersRound = function (TypeofTee, TeeTime, ExactHCP, RoundEventid, Playerid) {
			var prData = {
				TypeofTee: TypeofTee,
				TeeTime: TeeTime,
				ExactHCP: ExactHCP,
				RoundEventid: RoundEventid,
				Playerid: Playerid
			};
			console.log(prData);
			var summaryPromise = AccessServerData.insPlayersRound(prData);
			summaryPromise.then(function (data) {
				console.log(data);

				// get the new PRid
				var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/PlayersRound";
				console.log(url);
				$http.get(url).then(function(response) {
					$scope.playersRound = response.data;
					console.log($scope.playersRound);
					$scope.newPRidStored = $scope.getPRid();
					if ($scope.newPRidStored) {
						console.log("PRid now ok. Safe to store scores.");
						
					} else {
						console.log("Still problems with PRid");
					};
					}, function(error) {
						console.log(error);
					});		

				}, function (err) {
				console.log(err);
			});
		};
		
		$scope.storeScoreOfHole = function (HoleNr, HoleScore, Putts, FairwayHit, GreenHit, PlayersRoundid, Holeid) {
			var scData = {
				HoleNr: HoleNr,
				HoleScore: HoleScore,
				Putts: Putts,
				FairwayHit: FairwayHit,
				GreenHit: GreenHit,
				PlayersRoundid: PlayersRoundid,
				Holeid: Holeid
			};
			console.log("store hole" + scData);
			var summaryPromise = AccessServerData.insHoleScore(scData);
			summaryPromise.then(function (data) {
				console.log(data);
				if (scData.HoleNr == 18) {
					alert("Score card stored to database successfully!");
					$scope.hideScoreCard = true;
					$scope.scoreCardReady = true;
					$scope.summaryOfRound();
				};
			}, function (err) {
				console.log(err);
			});
		};
		$scope.initScoreCard = function () {
			
			// Do here initializations of the data structure
			$scope.scard = [
				{holeid: 1, hole: 1, par:3, hcp:1, score:null ,bp:0, putts:null, fw:null ,gh:null}
			];
			var i = 1;
			for (i = 1; i < 18; i++) {
				$scope.scard.push({holeid: 1, hole: 1, par:3, hcp:1, score:null ,bp:0, putts:null, fw:null, gh:null})
			};

			// Get hole data for each hole and store to score card 
			console.log($scope.scard);
			var baseUrl = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Hole";
			var url = baseUrl + "/" + $scope.selectedCid;
			console.log(url);
			var s = 0;
			$http.get(url).then(function(response) {
				$scope.courseHoles = response.data;
				console.log($scope.courseHoles);
				var j = 0;
				len = $scope.courseHoles.data.length;
				for (j = 0; j < len && j < 18; j++) {
					$scope.scard[j].holeid = $scope.courseHoles.data[j].Hid;
					$scope.scard[j].hole = $scope.courseHoles.data[j].HoleNr;
					$scope.scard[j].par = $scope.courseHoles.data[j].HolePar;
					$scope.scard[j].hcp = $scope.courseHoles.data[j].HoleHCP;
					switch ($scope.courseHoles.data[j].HolePar) {
						case "3":
							$scope.scard[j].score = 4;
							break;
						case "4":
							$scope.scard[j].score = 5;
							break;
						case "5":
							$scope.scard[j].score = 6;
							break;
						default:
							$scope.scard[j].score = 5;
					}
					
					$scope.scard[j].putts = 2;
					};

				// show pre-filled score card to user
				$scope.hideScoreCard = false;
				$scope.hidePlayersRound = true;
				$scope.hideNewEvent = true;				
				console.log($scope.scard);
				}, function(error) {
				console.log(error);
				});
		};
		
		// Inserting new event into database
		$scope.storeNewEvent = function (RoundName, Date, Temperature, Rain, Sun, Wind, WindDirection, Courseid) {
			var edata = {
			RoundName: RoundName,
			Date: Date,
			Temperature: Temperature,
			Rain: Rain,
			Sun: Sun,
			Wind: Wind,
			WindDirection: WindDirection,
			Courseid: Courseid
			};		
			// Find Courseid based on the name of the course
			var k = 0;
			searchedIndex = 0;
			var cour = "";
			var found = false;
			console.log($scope.courses.data.length);
			console.log($scope.selectedCourseName);
			var description = "";
			var abbr = "";
			var cid = 0;
			if (RoundName != null) {
				description = RoundName.repeat(1);	
			}
			if (description.length < 20) {
				for (k = 0; k < $scope.courses.data.length; k++) {
					cid = $scope.courses.data[k].Cid;
					if (cid == parseInt(Courseid)) {
						abbr = $scope.courses.data[k].Abbreviation;
					}
				}
				description = description + " " + Date + " " + abbr + " " + $scope.selectedPlayerName;
				// console.log("This is the description " + description);
				if (description.length > 45) {
					description = description.slice(0,45);
					console.log("This is the description now " + description);
				}
				edata.RoundName = description.repeat(1);
				$scope.RoundName = description.repeat(1);
			}
			
			for(k = 0; k < $scope.courses.data.length; k++) {
				cour = $scope.courses.data[k].CourseName.repeat(1);
				console.log(cour);
				if (cour.localeCompare($scope.selectedCourseName) == 0) {
					searchedIndex = k;
					found = true;
					$scope.selectedCid = $scope.courses.data[k].Cid;
					$scope.selectedDate = Date;
					console.log("Date and cid: " + $scope.selectedDate + " " + $scope.selectedCid)
					break;
				};
			};
			console.log(found);
			if (found) {
				// Insert new event
				edata.Courseid = $scope.courses.data[searchedIndex].Cid;
				console.log(edata);	
				
				var summaryPromise = AccessServerData.insNewEvent(edata);
				summaryPromise.then(function (data) {
					$scope.hideNewEvent = true;
					console.log(data);
					// Event stored. Go now to inserting score card. But create first players round.
					// For that, get event id, ie. REid based on the RoundName, in order to refer into it in PlayersRound
					
					var url = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/RoundEvent";
					$http.get(url).then(function(response) {
						$scope.roundevents = response.data;
						console.log($scope.roundevents);
						var i = 0;
						var rname = "";
						var eventid = 1;
						var found3 = false;
						console.log($scope.roundevents.data.length);
						console.log($scope.RoundName);
						for(i = 0; i < $scope.roundevents.data.length; i++) {
							rname = $scope.roundevents.data[i].RoundName.repeat(1);
							if ((rname.localeCompare($scope.RoundName) == 0) && ($scope.roundevents.data[i].Date == Date) && ($scope.roundevents.data[i].Courseid == $scope.selectedCid)) {
								eventid = $scope.roundevents.data[i].REid;
								console.log(eventid);
								console.log(rname);
								$scope.selectedEid = eventid;
								found3 = true;
								break;
							};
						};
						// Find player id based on the name of the player
						// == 0)&& (lname.localeCompare($scope.selectedPlayerLname) == 0)
						var j = 0;
						var fname = "";
						var lname = "";
						var name = "";
						var playerid = 1;
						var found2 = false;
						console.log($scope.players.data.length);
						console.log($scope.selectedPlayerName);
						// console.log($scope.selectedPlayerLname);
						for(j = 0; j < $scope.players.data.length; j++) {
							fname = $scope.players.data[j].Fname.repeat(1);
							lname = $scope.players.data[j].Lname.repeat(1);
							name = fname + " " + lname;
							if (name.localeCompare($scope.selectedPlayerName) == 0) {
								playerid = $scope.players.data[j].Pid;
								$scope.selectedPid = playerid;
								console.log("$scope.selectedPid = " + $scope.selectedPid + "in store new event");
								found2 = true;
								break;
							};
						};
						if (found2 && found3) {
//							var teeTim = new Date;
//							teeTim = $scope.teeTime.getTime();
//							var hours = teeTim.getHours();
//							var minutes = teeTim.getMinutes();
//							console.log(teeTim);
							$scope.storePlayersRound("Yellow", $scope.teeTime, $scope.exactHCP, $scope.selectedEid, $scope.selectedPid);
							$scope.initScoreCard();
						};
							
					}, function(error) {
						console.log(error);
					});

				}, function (err) {
					console.log(err);
				});
			};
		};

		$scope.storeRoundInfo = function () {

			// selectedRoundName, teeTime, selectedPlayerFname, selectedPlayerLname, exactHCP
			
			// get event id, ie. REid based on the RoundName in order to add info to PlayersRound
			// and also course id, to use it later for filling in the score card
			var i = 0;
			var rname = "";
			var eventid = 1;
			var found3 = false;
			console.log($scope.roundevents.data.length);
			console.log($scope.selectedRoundName);
			for(i = 0; i < $scope.roundevents.data.length; i++) {
				rname = $scope.roundevents.data[i].RoundName.repeat(1);
				if (rname.localeCompare($scope.selectedRoundName) == 0){
					console.log(rname);
					eventid = $scope.roundevents.data[i].REid;
					$scope.selectedEid = eventid;
					console.log("$scope.selectedEid = " + $scope.selectedEid + " in storeRoundInfo");
					$scope.selectedCid = $scope.roundevents.data[i].Courseid;
					console.log("$scope.selectedCid = " + $scope.selectedCid);
					$scope.dateWhen = $scope.roundevents.data[i].Date;
					console.log("$scope.dateWhen = " + $scope.dateWhen);

					//	get course by id, and get course name there
					var j = 0;
					var cid = 0;
					for (j = 0; j < $scope.courses.data.length; j++) {
						cid = $scope.courses.data[j].Cid;
						if (cid == $scope.selectedCid) {
							$scope.selectedCourseName = $scope.courses.data[j].CourseName.repeat(1);
							$scope.selectedCourseAbbreviation = $scope.courses.data[j].Abbreviation.repeat(1);
							console.log("$scope.selectedCourseName = " + $scope.selectedCourseName);
							found3 = true;
							break;
						};
					};
				};
			};	
				
			// Find player id based on the name of the player
			//  == 0)&& (lname.localeCompare($scope.selectedPlayerLname) == 0)
			
			var fname = "";
			var lname = "";
			var name = "";
			var playerid = 1;
			var found2 = false;
			console.log($scope.players.data.length);
			console.log($scope.selectedPlayerName);
			// console.log($scope.selectedPlayerLname);
			for(i = 0; i < $scope.players.data.length; i++) {
				fname = $scope.players.data[i].Fname.repeat(1);
				lname = $scope.players.data[i].Lname.repeat(1);
				name = fname + " " + lname;
				console.log(name);
				if (name.localeCompare($scope.selectedPlayerName) == 0) {
					playerid = $scope.players.data[i].Pid;
					$scope.selectedPid = playerid;
					found2 = true;
					console.log("$scope.selectedPid = " + $scope.selectedPid + " in storeRoundInfo");
					break;
				};
			};
			if (found2 && found3) {
				// check that this was not already stored
				console.log("found2 and found3 true in line 813");
				if (!$scope.getPRid()) {
					console.log("New round: storePlayersRound");
					$scope.newPRidStored = false;
					$scope.storePlayersRound("Yellow", $scope.teeTime, $scope.exactHCP, $scope.selectedEid, $scope.selectedPid);
				} else {
					console.log("already stored");
				};
				
//				console.log($scope.teeTime.getHours());
//				console.log($scope.teeTime.getMinutes());
				$scope.initScoreCard();
			};
		};
	
		$scope.initialize = function () {
			$scope.hidePlayersRound = true;
			$scope.hideScoreCard = true;
			$scope.hideNewEvent = true;
			$scope.scoreCardReady = false;
			$scope.hideSummary = true;
		};
		$scope.summaryOfRound = function () {
			var baseUrl = "http://home.tamk.fi/~c6hhuota/CMD/cmd_api/cmd_api/index.php/Round";
			var url = baseUrl + "/" + $scope.selectedPid + "/" + $scope.selectedEid;
			console.log(url);
			$http.get(url).then(function(response) {
				$scope.holescores = response.data;
				console.log($scope.holescores);
				var sum = 0;
				for (i=0; i<18;i++) {
					sum += parseInt($scope.holescores.data[i].Score);
					};
				$scope.sumScore = sum;				
				var sum=0;
				for (i=0; i<18;i++) {
					sum += parseInt($scope.holescores.data[i].BP);	
					};
				$scope.sumBP = sum;
				sum=0;
				for (i=0; i<18;i++) {
					sum += parseInt($scope.scard[i].putts);
					};
				$scope.sumPutts = sum;
				sum = 0;
				for (i=0; i<18;i++) {
					if (!($scope.scard[i].fw == null)) {
						if (($scope.scard[i].fw == "Y") || ($scope.scard[i].fw == "1") || ($scope.scard[i].fw == true)) {
							sum++;
							}
						};
					};
				$scope.sumFW = sum;
				sum = 0;
				for (i=0; i<18;i++) {
					if (!($scope.scard[i].fw == null)) {
						if(($scope.scard[i].gh == "Y") || ($scope.scard[i].gh == "1") || ($scope.scard[i].gh == true)) {
							sum++;
						}
					};
				};
				$scope.sumGH = sum;
				$scope.hideSummary = false;
			}, function(error) {
				console.log(error);
			});		
		};
		$scope.storeScoreCard = function () {
			var valid = true;
			var i = 0;
			for (i=0; i < 18; i++) {
				if (isNaN($scope.scard[i].score)) {
					valid = false;
					console.log("Not a number");
					break;
				};
			};
			if (valid) {
				console.log("All scores ok");
				var j = 0;
				var holenr = 0;
				var holeScore = 0;
				var fairwayHit = null;
				var greenHit = null;
				var holeid = 0;
				var putts = null;
				var prid = $scope.selectedPRid;
				console.log(prid);
				for (j=0; j < 18; j++) {
					holenr = $scope.scard[j].hole;
					holeScore = $scope.scard[j].score;
					putts = $scope.scard[j].putts;
					fairwayHit = $scope.scard[j].fw;
					greenHit = $scope.scard[j].gh;
					if (($scope.scard[j].fw == "1") || ($scope.scard[j].fw == true) || ($scope.scard[j].fw == "Y")) {
						fairwayHit = true;
					} else {
						$scope.scard[j].fw = "0";
						fairwayHit = false;
					};
					if (($scope.scard[j].gh == "1") || ($scope.scard[j].gh == true) || ($scope.scard[j].gh == "Y")){
						greenHit = true;
					} else {
						$scope.scard[j].gh = "0";
						greenHit = false;
					};
					holeid = $scope.scard[j].holeid;
					if ($scope.selectedPRidFound || $scope.newPRidStored) {
						$scope.storeScoreOfHole(holenr, holeScore, putts, fairwayHit, greenHit, prid, holeid);
					};
				};
			};
		};
});

