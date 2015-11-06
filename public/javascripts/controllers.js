'use strict';

angular.module('blog')

.controller('HeaderCtrl', ['$scope', '$http', '$localStorage', '$location', 'profile', '$state', 'blogs', 
	function($scope, $http, $localStorage, $location, profile, $state, blogs) {
		if ($localStorage.token != null && $localStorage.token != undefined) {
			profile.get().then(function successCallback($request) {
				$localStorage.user = $request.data;
				$scope.username = $localStorage.user.username;
			}, function errorCallback($response) {
			    // dang
			});
		}

		if ($state.current.name == 'pages') {
			blogs.get($state.params.blogId).then(function successCallback($request) {
				$scope.title = $request.data.title;
			}, function errorCallback($response) {
			    // dang
			});
		} else {
			$scope.title = 'Simple Blog';
		}

		$scope.showUserInfo = function() {
			if ($localStorage.token == null || $localStorage.token == undefined) {
				return false;
			}
			return true;
		}

		$scope.logout = function() {
			$localStorage.token = null;
			$state.go('home');
		}

		$scope.login = function() {
			$localStorage.token = null;
			$state.go('login');
		}

		$scope.register = function() {
			$localStorage.token = null;
			$state.go('register');
		}

		$scope.submit = function() {
	        if ($scope.pageTitle && $scope.pageBody) {
	        	var page = {
	        		title: $scope.pageTitle,
	        		body: $scope.pageBody,
	        	}
	        	pages.create(page).then(function successCallback($request) {
					$scope.pages = $request.data;
				}, function errorCallback($response) {
				    $scope.errorMessage = "Unable to create page"
				});
	        }
	    };
	}])
.controller('RegisterCtrl', ['$scope', '$http', '$state', function($scope, $http, $state) {
    $scope.submit = function() {
        if ($scope.username && $scope.password) {
        	var req = {
				method: 'POST',
				url: '/api/register',
				data: { username: $scope.username, password: $scope.password }
			}
	    	$http(req)
	    	.then(function successCallback($response) {
    			$scope.username = '';
				$scope.password = '';
				$state.go('login');
			}, function errorCallback($response) {
			    $scope.errorMessage = $response.data.message;
			});
        }
    };
}])
.controller('LoginCtrl', ['$scope', '$http', '$localStorage', '$state', function($scope, $http, $localStorage, $state) {
    $scope.submit = function() {
        if ($scope.username && $scope.password) {
        	var req = {
				method: 'POST',
				url: '/api/login',
				data: { username: $scope.username, password: $scope.password }
			}
	    	$http(req)
	    	.then(function successCallback($response) {
	    		$localStorage.token = $response.data.token;
    			$state.go('home');
			}, function errorCallback($response) {
			    $scope.errorMessage = $response.data.message;
			});
        }
    };
}])
.controller('BlogsCtrl', ['$scope', '$http', '$location', '$localStorage', 'blogs', 
	function($scope, $http, $location, $localStorage, blogs) {

	blogs.get().then(function successCallback($request) {
		$scope.blogs = $request.data;
	}, function errorCallback($response) {
	    // dang
	});

	$scope.showCreate = function() {
			if ($localStorage.token == null || $localStorage.token == undefined) {
				return false;
			}
			return true;
		}

	$scope.deleteBlog = function(blog) {
			blogs.delete(blog._id).then(function successCallback($request) {
				var index = $scope.blogs.indexOf(blog);
				$scope.blogs.splice(index, 1);
			}, function errorCallback($response) {
			    $scope.errorMessage = "Unable to delete blog"
			});
		}

	$scope.submit = function() {
        if (this.blogTitle) {
        	blogs.create({ blogTitle: this.blogTitle }).then(function successCallback($request) {
				$scope.blogs.push($request.data);
			}, function errorCallback($response) {
			    $scope.errorMessage = "Unable to create blog"
			});
        }
    };
}])
.controller('PagesCtrl', ['$scope', '$http', '$location', '$localStorage', '$stateParams', 'pages', 'Upload', 
	function($scope, $http, $location, $localStorage, $stateParams, pages, Upload) {
	pages.get($stateParams.blogId).then(function successCallback($request) {
		$scope.pages = $request.data;
	}, function errorCallback($response) {
	    // dang
	});

	$scope.showCreate = function() {
			if ($localStorage.token == null || $localStorage.token == undefined) {
				return false;
			}
			return true;
		}

	$scope.deletePage = function(page) {
			pages.delete(page).then(function successCallback($request) {
				var index = $scope.pages.indexOf(page);
				$scope.pages.splice(index, 1);
			}, function errorCallback($response) {
			    $scope.errorMessage = "Unable to delete page"
			});
		}

	$scope.submit = function(file) {
        if (this.pageTitle && this.pageBody) {
        	var page = {
        		title: this.pageTitle,
        		body: this.pageBody,
        		blogId: $stateParams.blogId
        	}
        	if (file) {
        		page.file = file;
		        Upload.upload({
		            url: '/api/blogs/' + page.blogId + '/pages',
		            data: page
		        }).then(function ($response) {
		        	$scope.errorMessage = "Added page";
		            $scope.pages.push($response.data);
		        }, function ($response) {
		            $scope.errorMessage = "Unable to create page"
		        });
		    } else {
	        	pages.create(page).then(function successCallback($request) {
		        	$scope.errorMessage = "Added page";
					$scope.pages.push($request.data);
				}, function errorCallback($response) {
				    $scope.errorMessage = "Unable to create page"
				});
			}
        }
    };
}]);