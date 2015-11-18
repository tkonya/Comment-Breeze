var commentApp = angular.module('commentApp', ['angular-clipboard']);

commentApp.controller('CommentController', function($scope, $http) {

    $scope.comments = [];
    $scope.commentViewLimit = '20';
    $scope.commentViewBegin = 0;

    $scope.studentName = null;
    $scope.studentGender = 'male';
    $scope.className = null;

    $scope.yourComment = '';


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

    $scope.addComment = function(comment) {

        console.log('Adding comment: ' + comment);

        var studentName;
        if ($scope.studentName == null || $scope.studentName == '') {
            studentName = 'Trevor';
        } else {
            studentName = $scope.studentName;
        }

        var className;
        if ($scope.className == null || $scope.className == '') {
            className = 'Software Development';
        } else {
            className = $scope.className;
        }

        comment = $scope.capitalizeFirstLetter($scope.fixGenderPronouns(comment.replace(/STUDENT_NAME/g, studentName).replace(/CLASS_NAME/g, className)));

        if ($scope.yourComment == '') {
            $scope.yourComment = comment;
        } else {
            $scope.yourComment = $scope.yourComment + ' ' + comment;
        }
    };

    $scope.fixCommentPronouns = function() {
        $scope.yourComment = $scope.fixGenderPronouns($scope.yourComment);
    };

    $scope.fixGenderPronouns = function(text) {
        var subject;
        var object;
        var possessiveAdjectives;
        var possessivePronouns;
        var reflexivePronouns;

        console.log('Changing gender to ' + $scope.studentGender + ' for the text:\n' + text);
        if ($scope.studentGender == 'male') {
            subject = 'he';
            object = 'him';
            possessiveAdjectives = 'his';
            possessivePronouns = 'his';
            reflexivePronouns = 'himself';
        } else if ($scope.studentGender == 'female') {
            subject = 'she';
            object = 'her';
            possessiveAdjectives = 'her';
            possessivePronouns = 'hers';
            reflexivePronouns = 'herself ';
        } else {
            subject = 'they';
            object = 'them';
            possessiveAdjectives = 'their';
            possessivePronouns = 'theirs';
            reflexivePronouns = 'themselves';
        }

        text = text.replace(/\bhe\b|\bshe\b|\bthey\b/g,subject).replace(/\bhim\b|\bher\b|\bthem\b/g,object).replace(/\bhis\b|\bhers\b|\btheirs\b/g,possessivePronouns).replace(/\bhis\b|\bher\b|\btheir\b/g,possessiveAdjectives).replace(/\bhimself\b|\bherself\b|\btheirself\b/g,reflexivePronouns);
        text = text.replace(/\bHe\b|\bShe\b|\bThey\b/g,$scope.capitalizeFirstLetter(subject)).replace(/\bHim\b|\bHer\b|\bThem\b/g,$scope.capitalizeFirstLetter(object)).replace(/\bHis\b|\bHers\b|\bTheirs\b/g,$scope.capitalizeFirstLetter(possessivePronouns)).replace(/\bHis\b|\bHer\b|\bTheir\b/g,$scope.capitalizeFirstLetter(possessiveAdjectives)).replace(/\bHimself\b|\bHerself\b|\bTheirself\b/g,$scope.capitalizeFirstLetter(reflexivePronouns));
        console.log('Fixed text: ' + text);
        return text;
    };

    $scope.capitalizeFirstLetter = function(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    $scope.changeCommentsPerPage = function() {
        $scope.currentCommentsPage = 1;
        $scope.totalCommentPages = Math.ceil($scope.comments.length / $scope.commentViewLimit);
        $scope.reportLimitStart = 0;
        $scope.reportLimitEnd = $scope.commentViewLimit;
    };

    $scope.changeReportsPage = function(newPage) {
        if (newPage >= 1 && newPage <= $scope.totalCommentPages) {
            $scope.currentReportPage = newPage;
            $scope.reportLimitStart = ($scope.currentReportPage - 1) * $scope.commentViewLimit;
        }
    };

    $scope.resetYourComment = function() {
        $scope.studentName = null;
        $scope.studentGender = 'male';
        $scope.className = null;
        $scope.yourComment = '';
    };

    $scope.makeSomethingUp = function() {
        $scope.yourComment = '';

        for (var i = 0; i < 10; ++i) {
            var randomComment = $scope.comments[Math.floor(Math.random() * $scope.comments.length)];
            $scope.addComment(randomComment.comment_text);
        }


    };

    $scope.getComments();

});