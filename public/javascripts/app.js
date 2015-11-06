'use strict';

// Declare app level module which depends on views, and components
angular.module('blog', [
  'ngStorage',
  'ngFileUpload',
  'ui.router',
  'ui.bootstrap',
]).
config(['$urlRouterProvider', '$httpProvider', '$stateProvider', function($urlRouterProvider, $httpProvider, $stateProvider) {
	$httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
	   return {
	       'request': function (config) {
	           config.headers = config.headers || {};
	           if ($localStorage.token) {
	               config.headers.Authorization = 'Bearer ' + $localStorage.token;
	           }
	           return config;
	       },
	       'responseError': function (response) {
	           if (response.status === 401 || response.status === 403) {
	               $location.path('/login');
	           }
	           return $q.reject(response);
	       }
	   };
	}]);
	$urlRouterProvider.otherwise('/');
	$stateProvider
	.state('home', {
            url: '/',
            views: {
                'header': {
                    templateUrl: '/views/header.html',
                    controller: 'HeaderCtrl'
                },
                'body': {
                    templateUrl: '/views/blogs.html',
                    controller: 'BlogsCtrl'
                }
            }
        })
	.state('register', {
            url: '/register',
            views: {
                'header': {
                    templateUrl: '/views/header.html',
                    controller: 'HeaderCtrl'
                },
                'body': {
                    templateUrl: '/views/register.html',
                    controller: 'RegisterCtrl'
                }
            }
        })
	.state('login', {
            url: '/login',
            views: {
                'header': {
                    templateUrl: '/views/header.html',
                    controller: 'HeaderCtrl'
                },
                'body': {
                    templateUrl: '/views/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })
	.state('blogs', {
            url: '/blogs',
            views: {
                'header': {
                    templateUrl: 'views/header.html',
                    controller: 'HeaderCtrl'
                },
                'body': {
                    templateUrl: 'views/blogs.html',
                    controller: 'BlogsCtrl'
                }
            }
        })
	.state('pages', {
            url: '/blogs/:blogId/pages',
            views: {
                'header': {
                    templateUrl: 'views/header.html',
                    controller: 'HeaderCtrl'
                },
                'body': {
                    templateUrl: 'views/pages.html',
                    controller: 'PagesCtrl'
                }
            }
        });
}]);
