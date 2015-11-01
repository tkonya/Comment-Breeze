var commentApp = angular.module('commentApp', []);

commentApp.controller('CommentController', function($scope, $http) {

    $scope.comments = [];

    $scope.getComments = function() {
        console.log('trying to get comments');
        $http.get('/rest/comments').
            success(function (data) {
                console.log('returned success');

                console.log(data.length + ' comments received');

                $scope.comments = data;
                $scope.commentsLoaded = true;

            }).
            error(function () {
                console.error('returned error');
            });
    };

    $scope.getComments();

});