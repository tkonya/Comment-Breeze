var commentApp = angular.module('commentApp', ['angular-clipboard', 'ngMaterial'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('amber')
            .accentPalette('deep-purple')
            .backgroundPalette('grey').dark();
    });

commentApp.controller('CommentController', function($scope, $http, $timeout, $mdToast) {

    $scope.comments = [];
    $scope.commentViewLimit = 20;
    $scope.commentViewBegin = 0;
    $scope.currentCommentsPage = 1;
    $scope.totalCommentPages = null;

    $scope.studentName = null;
    $scope.oldStudentName = null;

    $scope.studentGender = 'male';

    $scope.className = null;
    $scope.oldClassName = null;

    $scope.yourCommentIntroduction = '';
    $scope.yourComment = '';
    $scope.yourCommentConclusion = '';

    $scope.searchComments = '';

    $scope.makeSomethingUpSize = 10;

    $scope.defaultStudentName = 'Sung-hyun';
    $scope.defaultClassName = 'English class';

    $scope.getComments = function() {
        console.log('trying to get comments');
        $http.get('/rest/comments').
            success(function (data) {
                console.log('returned success');

                console.log(data.length + ' comments received');

                $scope.comments = data;

                $scope.changeCommentsPerPage();
            }).
            error(function () {
                console.error('returned error');
            });
    };

    $scope.addComment = function(comment, showToast) {

        console.log('Adding comment: ' + comment);

        $scope.oldStudentName = $scope.studentName;

        comment = $scope.capitalizeFirstLetter($scope.fixGenderPronouns($scope.replaceClassName($scope.replaceStudentName(comment))));

        if ($scope.yourComment == '') {
            $scope.yourComment = comment;
        } else {
            $scope.yourComment = $scope.yourComment + ' ' + comment;
        }

        if (showToast) {
            $mdToast.show(
                {
                    template: '<md-toast style="overflow: hidden; position: fixed;">Comment added</md-toast>',
                    position: 'top left'
                }
            );
        }
    };

    $scope.commentsCopied = function() {
        $mdToast.show(
            {
                template: '<md-toast style="overflow: hidden; position: fixed;">Comments copied to clipboard</md-toast>',
                position: 'top left'
            }
        );
    };

    $scope.fixCommentPronouns = function() {
        $timeout(function() {
            $scope.yourCommentIntroduction = $scope.fixGenderPronouns($scope.yourCommentIntroduction);
            $scope.yourComment = $scope.fixGenderPronouns($scope.yourComment);
            $scope.yourCommentConclusion = $scope.fixGenderPronouns($scope.yourCommentConclusion);

            $mdToast.show(
                {
                    template: '<md-toast style="overflow: hidden; position: fixed;">Gender pronouns changed</md-toast>',
                    position: 'top left'
                }
            );

        }, 50);
    };

    $scope.fixGenderPronouns = function(text) {
        var subject;
        var object;
        var possessiveAdjectives;
        var possessivePronouns;
        var reflexivePronouns;
        var girlBoyChild;

        console.log('Changing gender to ' + $scope.studentGender + ' for the text:\n' + text);
        if ($scope.studentGender == 'male') {
            subject = 'he';
            object = 'him';
            possessiveAdjectives = 'his';
            possessivePronouns = 'his';
            reflexivePronouns = 'himself';
            girlBoyChild = 'boy';
        } else if ($scope.studentGender == 'female') {
            subject = 'she';
            object = 'her';
            possessiveAdjectives = 'her';
            possessivePronouns = 'hers';
            reflexivePronouns = 'herself ';
            girlBoyChild = 'girl';
        } else {
            subject = 'they';
            object = 'them';
            possessiveAdjectives = 'their';
            possessivePronouns = 'theirs';
            reflexivePronouns = 'themselves';
            girlBoyChild = 'child';
        }

        text = text.replace(/\bboy\b|\bgirl\b|\bchild\b/g,girlBoyChild).replace(/\bBoy\b|\bGirl\b|\bChild\b/g,$scope.capitalizeFirstLetter(girlBoyChild));
        text = text.replace(/\bhe\b|\bshe\b|\bthey\b/g,subject).replace(/\bhim\b|\bher\b|\bthem\b/g,object).replace(/\bhis\b|\bhers\b|\btheirs\b/g,possessivePronouns).replace(/\bhis\b|\bher\b|\btheir\b/g,possessiveAdjectives).replace(/\bhimself\b|\bherself\b|\btheirself\b/g,reflexivePronouns);
        text = text.replace(/\bHe\b|\bShe\b|\bThey\b/g,$scope.capitalizeFirstLetter(subject)).replace(/\bHim\b|\bHer\b|\bThem\b/g,$scope.capitalizeFirstLetter(object)).replace(/\bHis\b|\bHers\b|\bTheirs\b/g,$scope.capitalizeFirstLetter(possessivePronouns)).replace(/\bHis\b|\bHer\b|\bTheir\b/g,$scope.capitalizeFirstLetter(possessiveAdjectives)).replace(/\bHimself\b|\bHerself\b|\bTheirself\b/g,$scope.capitalizeFirstLetter(reflexivePronouns));
        console.log('Fixed text: ' + text);
        return text;
    };

    $scope.blurStudentName = function() {
        console.log('student name: ' + $scope.studentName);
        console.log('old student name: ' + $scope.oldStudentName);

        if ($scope.studentName == null || $scope.studentName == '' || $scope.studentName == $scope.oldStudentName) {
            return;
        }

        $scope.yourCommentIntroduction = $scope.replaceStudentName($scope.yourCommentIntroduction, true);
        $scope.yourComment = $scope.replaceStudentName($scope.yourComment, true);
        $scope.yourCommentConclusion = $scope.replaceStudentName($scope.yourCommentConclusion);

        $mdToast.show(
            {
                template: '<md-toast style="overflow: hidden; position: fixed;">Student name changed</md-toast>',
                position: 'top left'
            }
        );
    };

    $scope.blurClassName = function() {
        console.log('class name: ' + $scope.className);
        console.log('old class name: ' + $scope.oldClassName);

        if ($scope.className == null || $scope.className == '' || $scope.className == $scope.oldClassName) {
            return;
        }

        $scope.yourCommentIntroduction = $scope.replaceClassName($scope.yourCommentIntroduction, true);
        $scope.yourComment = $scope.replaceClassName($scope.yourComment, true);
        $scope.yourCommentConclusion = $scope.replaceClassName($scope.yourCommentConclusion);

        $mdToast.show(
            {
                template: '<md-toast style="overflow: hidden; position: fixed;">Class name changed</md-toast>',
                position: 'top left'
            }
        );
    };

    $scope.replaceStudentName = function(text, dontSet) {
        var studentName;
        if ($scope.studentName == null || $scope.studentName == '') {
            studentName = $scope.defaultStudentName;
        } else {
            studentName = $scope.studentName;
        }

        if ($scope.oldStudentName != null) {
            text = text.replace(new RegExp($scope.oldStudentName, 'g'), studentName);
        }

        if (!dontSet) {
            $scope.oldStudentName = studentName;
        }

        return text.replace(/STUDENT_NAME/g, studentName);
    };

    $scope.replaceClassName = function(text, dontSet) {
        var className;
        if ($scope.className == null || $scope.className == '') {
            className = $scope.defaultClassName;
        } else {
            className = $scope.className;
        }

        if ($scope.oldClassName != null) {
            text = text.replace(new RegExp($scope.oldClassName, 'g'), className);
        }

        if (!dontSet) {
            $scope.oldClassName = className;
        }

        return text.replace(/CLASS_NAME/g, className);
    };

    $scope.capitalizeFirstLetter = function(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    $scope.changeCommentsPerPage = function() {
        console.log('Changing comment limit to ' + $scope.commentViewLimit);
        $scope.currentCommentsPage = 1;
        $scope.totalCommentPages = Math.ceil($scope.comments.length / $scope.commentViewLimit);
        $scope.commentViewBegin = 0;
    };

    $scope.changeCommentsPage = function(newPage) {
        console.log('Changing page to ' + newPage);
        if (newPage >= 1 && newPage <= $scope.totalCommentPages) {
            $scope.currentCommentsPage = newPage;
            $scope.commentViewBegin = ($scope.currentCommentsPage - 1) * $scope.commentViewLimit;
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

        for (var i = 0; i < $scope.makeSomethingUpSize; ++i) {
            var randomComment = $scope.comments[Math.floor(Math.random() * $scope.comments.length)];
            $scope.addComment(randomComment.comment_text, false);
        }

        $mdToast.show(
            {
                template: '<md-toast class="toast-style">Random comment generated</md-toast>',
                position: 'top left'
            }
        );
    };

    $scope.getComments();

});