'use strict';

angular.module('blog')

.factory('pages', function($http) {
        return {
            get : function(blogId) {
                return $http.get('/api/blogs/' + blogId + '/pages');
            },
            create : function(pageData) {
                return $http.post('/api/blogs/' + pageData.blogId + '/pages', pageData);
            },
            delete : function(pageData) {
                return $http.delete('/api/blogs/' + pageData._blog + '/pages/' + pageData._id);
            }
        }
})

.factory('blogs', function($http) {
        return {
            get : function(blogId) {
            	if (blogId == undefined) {
                	return $http.get('/api/blogs');
                } else {
                	return $http.get('/api/blogs/' + blogId);
                }
            },
            create : function(blogData) {
                return $http.post('/api/blogs', blogData);
            },
            delete : function(id) {
                return $http.delete('/api/blogs/' + id);
            }
        }
})

.factory('profile', function($http) {
        return {
            get : function() {
                return $http.get('/api/profile');
            }
        }
})