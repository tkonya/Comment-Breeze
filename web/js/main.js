var commentApp = angular.module('commentApp', ['angular-clipboard', 'ngMaterial'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('amber')
            .accentPalette('deep-purple')
            .backgroundPalette('grey').dark();
    });

commentApp.controller('CommentController', function($scope, $http, $timeout, $mdToast, $mdBottomSheet, $mdDialog) {

    $scope.comments = [];
    $scope.allComments = []; // when 'filtering', put all comments in here, then we'll pull them back out when we switch back
    $scope.editingComment = null;
    $scope.editingPasswordTry = '';
    $scope.showTextEdit = false;

    $scope.commentsLengthFormatted = '20,000+';
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
    $scope.toneFilterSetting = 'Any';
    $scope.toneFilterOptions = ['Any', 'Positive', 'Neutral', 'Negative', 'Unrated'];

    $scope.makeSomethingUpSize = 10;

    $scope.defaultStudentName = 'Sung-hyun';
    $scope.defaultClassName = 'English class';

    // multi student
    $scope.students = [];

    $scope.getComments = function() {
        console.log('trying to get comments');
        $http.get('/rest/comments').
            success(function (data) {
                console.log('returned success');

                console.log(data.length + ' comments received');

                $scope.comments = data;
                $scope.commentsLengthFormatted = $scope.comments.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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

    $scope.shuffleComment = function() {
        var sentences = $scope.yourComment.match( /[^\.!\?]+[\.!\?]+/g );
        console.log('Found ' + sentences.length + ' sentences');

        for(var j, x, i = sentences.length; i; j = Math.floor(Math.random() * i), x = sentences[--i], sentences[i] = sentences[j], sentences[j] = x) {}

        $scope.yourComment = '';
        for (var k = 0; k < sentences.length; ++k) {
            $scope.yourComment += sentences[k].trim() + ' ';
        }
    };

    $scope.showEditDialog = function(comment, justPosNeg) {

        $scope.justPosNeg = justPosNeg;

        console.log('showing custom greeting');
        $scope.editingComment = comment;

        $scope.originalPosNeg = comment.pos_neg;

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/edit-dialog.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                    $scope.editingComment.pos_neg = $scope.originalPosNeg;

                    // if they don't have the right password then blank out the password and undo the showTextEdit
                    if ($scope.editingPasswordTry.slice(0, 10) != 'industrial') {
                        $scope.editingPasswordTry = '';
                        $scope.showTextEdit = false;
                    }

                };
                $scope.saveDialog = function() {

                    console.log('in saveDialog');
                    $mdDialog.hide();
                    $http({
                        url: "/rest/comments",
                        method: "PUT",
                        params: {comment: $scope.editingComment, editing_password_try: $scope.editingPasswordTry},
                        headers: {'Content-Type': 'application/json'}
                    }).success(function (data) {

                        if (data.hasOwnProperty('address')) {
                            console.log('got request from ' + data.address);
                        }

                        if (data.hasOwnProperty('passfail')) {
                            $scope.editingPasswordTry = '';
                            $scope.showTextEdit = false;
                        } else {
                            $mdToast.show(
                                {
                                    template: '<md-toast class="toast-style">' + data.message + '</md-toast>',
                                    position: 'top left'
                                }
                            );
                        }

                    }).error(function () {
                        $mdToast.show(
                            {
                                template: '<md-toast class="toast-style">Error updating comment</md-toast>',
                                position: 'top left'
                            }
                        );
                    });
                };
            }
        });
    };

    $scope.changeFilter = function() {
        console.log('changing the filter to ' + $scope.toneFilterSetting);

        if ($scope.toneFilterSetting == 'Any') {

            // put the comments back in
            if ($scope.allComments.length > 0) {
                $scope.comments = $scope.allComments;
            }

        } else {

            // backup comments if you haven't already
            if ($scope.allComments < 1) {
                $scope.allComments = $scope.comments;
            }

            $scope.comments = [];
            for (var i = 0; i < $scope.allComments.length; ++i) {

                if ($scope.allComments[i].hasOwnProperty('pos_neg')) {
                    if (($scope.allComments[i].pos_neg == 1 && $scope.toneFilterSetting == 'Positive') ||
                        ($scope.allComments[i].pos_neg == 0 && $scope.toneFilterSetting == 'Neutral') ||
                        ($scope.allComments[i].pos_neg == -1 && $scope.toneFilterSetting == 'Negative')) {
                        $scope.comments.push($scope.allComments[i]);
                    }
                } else if ($scope.toneFilterSetting == 'Unrated') {
                    $scope.comments.push($scope.allComments[i]);
                }
            }
        }

        $scope.changeCommentsPerPage();
        console.log('done changing filter');
    };

    $scope.getComments();

});