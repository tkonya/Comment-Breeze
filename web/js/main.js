var commentApp = angular.module('commentApp', ['angular-clipboard', 'ngMaterial'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('amber')
            .accentPalette('deep-purple')
            .backgroundPalette('grey').dark();
    });

commentApp.controller('CommentController', function($scope, $http, $timeout, $mdToast, $mdDialog, $mdMedia, $location, $anchorScroll) {

    $scope.selectedTab = 0;

    // settings
    $scope.isMobile = false;
    $scope.showTooltips = true;
    $scope.makeSomethingUpSize = 10;
    $scope.showEditButtons = true;
    $scope.showTone = true;
    $scope.reduceCommentsSize = 0;
    $scope.fullCommentsSet = null;

    $scope.comments = [];
    $scope.allComments = []; // when 'filtering', put all comments in here, then we'll pull them back out when we switch back
    $scope.editingComment = null;
    $scope.editingPasswordTry = '';
    $scope.commentsLoaded = false;

    $scope.commentsLengthFormatted = '20,000+';
    $scope.commentViewLimit = 20;
    $scope.commentViewBegin = 0;
    $scope.currentCommentsPage = 1;
    $scope.totalCommentPages = null;

    $scope.studentName = '';
    $scope.oldStudentName = null;

    $scope.studentGender = 'male';

    $scope.className = '';
    $scope.oldClassName = null;

    $scope.yourCommentIntroduction = '';
    $scope.yourComment = '';
    $scope.yourCommentConclusion = '';

    $scope.newMultiStudent = '';
    $scope.multiStudent = [];
    $scope.editingMultiStudent = null;
    $scope.defaultGender = 'male';
    $scope.allMultiStudentComments = ''; // this must be updated any time it changes for the copy to work right, it has to already be correct by the time copy is hit
    $scope.multiStudentsCopied = false;

    $scope.searchComments = '';
    $scope.toneFilterSetting = 'Any';
    $scope.toneFilterOptions = ['Any', 'Positive', 'Neutral', 'Negative', 'Unrated'];

    // these should probably just stay as variables to make them more visible in comments if the user didn't enter them in initially
    $scope.defaultStudentName = 'STUDENT_NAME';
    $scope.defaultClassName = 'CLASS_NAME';

    // multi student
    $scope.students = [];

    $scope.getComments = function() {
        console.log('trying to get comments');
        $http.get('/rest/comments').
            success(function (data) {
                console.log('returned success');

                console.log(data.length + ' comments received');

                $scope.comments = data;
                $scope.reduceCommentsSize = Math.round($scope.comments.length / 5);
                $scope.commentsLoaded = true;
                $scope.commentsLengthFormatted = $scope.comments.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                $scope.changeCommentsPerPage();

                $scope.recordPageHit();

            }).
            error(function () {
                console.error('returned error');
            });
    };

    $scope.recordPageHit = function() {
        $http({
            url: "/rest/comments/hit",
            method: "POST"
        }).success(function () {
            console.log('Page hit recorded');
        }).error(function () {
            console.log('Error recording page hit');
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
            $scope.illToastToThat('Comment added');
        }
    };

    $scope.commentsCopied = function() {
        $scope.illToastToThat('Comments copied to clipboard');
    };

    $scope.fixCommentPronouns = function() {
        $timeout(function() {
            $scope.yourCommentIntroduction = $scope.fixGenderPronouns($scope.yourCommentIntroduction);
            $scope.yourComment = $scope.fixGenderPronouns($scope.yourComment);
            $scope.yourCommentConclusion = $scope.fixGenderPronouns($scope.yourCommentConclusion);

            $scope.illToastToThat('Gender pronouns changed to ' + $scope.studentGender);

        }, 50);
    };

    $scope.fixGenderPronouns = function(text, gender) {

        if (gender == undefined) {
            gender = $scope.studentGender;
            console.log('using single student gender of ' + $scope.studentGender);
        }

        var subject;
        var object;
        var possessiveAdjectives;
        var possessivePronouns;
        var reflexivePronouns;
        var girlBoyChild;

        console.log('Changing gender to ' + gender + ' for the text:\n' + text);
        if (gender == 'male') {
            subject = 'he';
            object = 'him';
            possessiveAdjectives = 'his';
            possessivePronouns = 'his';
            reflexivePronouns = 'himself';
            girlBoyChild = 'boy';
        } else if (gender == 'female') {
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
        text = text.replace(/\bhe\b|\bshe\b|\bthey\b/g,subject).replace(/\bhis\b|\bhers\b|\btheirs\b/g,possessivePronouns).replace(/\bhim\b|\bher\b|\bthem\b/g,object).replace(/\bhis\b|\bher\b|\btheir\b/g,possessiveAdjectives).replace(/\bhimself\b|\bherself\b|\btheirself\b/g,reflexivePronouns);
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

        $scope.illToastToThat('Student name changed to ' + $scope.studentName);
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

        $scope.illToastToThat('Class name changed to ' + $scope.className);
    };

    $scope.replaceStudentName = function(text, dontSet) {
        var studentName;
        if ($scope.studentName == null || $scope.studentName == '') {
            studentName = $scope.defaultStudentName;
        } else {
            studentName = $scope.studentName;
        }

        if ($scope.oldStudentName != null && $scope.oldStudentName.length > 0) {
            text = text.replace(new RegExp($scope.oldStudentName, 'g'), studentName);
        }

        if (!dontSet) {
            $scope.oldStudentName = studentName;
        }

        return text.replace(/STUDENT_NAME/g, studentName);
    };

    $scope.replaceMultiStudentName = function(text, studentName, oldStudentName) {
        if (oldStudentName != null) {
            text = text.replace(new RegExp($scope.oldStudentName, 'g'), studentName);
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

        if ($scope.oldClassName != null && $scope.oldClassName.length > 0) {
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
        $scope.studentName = '';
        $scope.yourComment = '';
    };

    $scope.makeSomethingUp = function() {
        $scope.yourComment = '';

        for (var i = 0; i < $scope.makeSomethingUpSize; ++i) {
            var randomComment = $scope.comments[Math.floor(Math.random() * $scope.comments.length)];
            $scope.addComment(randomComment.comment_text, false);
        }

        $scope.illToastToThat('Random comment generated');

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

    $scope.showEditDialog = function(comment) {

        $scope.editingComment = comment;
        $scope.originalComment = comment;

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/edit-dialog.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                    $scope.editingComment= $scope.originalComment;
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

                        if (data.hasOwnProperty('passfail')) {
                            $scope.editingPasswordTry = '';
                        }

                        $scope.illToastToThat(data.message);

                    }).error(function () {
                        $scope.illToastToThat('Error updating comment');
                    });
                };
            }
        });
    };

    $scope.showEditCommentDialog = function(comment) {
        $scope.editingComment = comment;
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/edit-tone-dialog.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.setCommentTone = function(tone) {

                    $scope.editingComment.pos_neg = tone;

                    console.log('in saveDialog');
                    $mdDialog.hide();
                    $http({
                        url: "/rest/comments",
                        method: "PUT",
                        params: {comment: $scope.editingComment, editing_password_try: $scope.editingPasswordTry},
                        headers: {'Content-Type': 'application/json'}
                    }).success(function (data) {

                        if (data.hasOwnProperty('passfail')) {
                            $scope.editingPasswordTry = '';
                        }

                        $scope.illToastToThat(data.message);

                    }).error(function () {
                        $scope.illToastToThat('Error updating comment');
                    });
                };
            }
        });
    };

    $scope.showSingleStudentHelp = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/single-student-help.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
            }
        });
    };

    $scope.showMultiStudentHelp = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/multi-student-help.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
            }
        });
    };

    $scope.changeFilter = function() {
        console.log('changing the filter to ' + $scope.toneFilterSetting);
        $scope.commentsLoaded = false;

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

        $scope.commentsLoaded = true;
        $scope.changeCommentsPerPage();
        console.log('done changing filter');
    };

    $scope.detectMobile = function() {
        var smallScreen = $mdMedia('(max-width: 1199px)');
        if (smallScreen) {
            $scope.isMobile = true;
            $scope.showTooltips = false;
        }
    };

    $scope.illToastToThat = function(text) {
        $mdToast.show(
            {
                template: '<md-toast class="toast-style">' + text + '</md-toast>',
                position: 'top left'
            }
        );
    };

    $scope.addMultiStudent = function() {

        if ($scope.newMultiStudent == null || $scope.newMultiStudent == '') {
            return;
        }

        var student = {};

        if ($scope.newMultiStudent.endsWith(' m') || $scope.newMultiStudent.endsWith(' M')) {
            student.gender = "male";
            student.name = $scope.newMultiStudent.replace(' m', '').replace(' M', '');
            console.log('detected male');
        } else if ($scope.newMultiStudent.endsWith(' f') || $scope.newMultiStudent.endsWith(' F')) {
            student.gender = "female";
            student.name = $scope.newMultiStudent.replace(' f', '').replace(' F', '');
        } else if ($scope.newMultiStudent.endsWith(' n') || $scope.newMultiStudent.endsWith(' N')) {
            student.gender = "neutral";
            student.name = $scope.newMultiStudent.replace(' n', '').replace(' N', '');
        } else {
            student.name = $scope.newMultiStudent;
            student.gender = $scope.defaultGender;
            console.log('Setting to default gender of ' + $scope.defaultGender);
        }
        student.old_name = student.name;

        student.comment = '';

        for (var i = 0; i < $scope.makeSomethingUpSize; ++i) {
            var randomComment = $scope.comments[Math.floor(Math.random() * $scope.comments.length)];
            student.comment += $scope.capitalizeFirstLetter($scope.fixGenderPronouns($scope.replaceClassName($scope.replaceMultiStudentName(randomComment.comment_text, student.name, student.old_name), true), student.gender)) + ' ';
        }

        $scope.newMultiStudent = '';
        $scope.multiStudent.push(student);

        $scope.illToastToThat('Added student: ' + student.name + ' (' + student.gender + ')');

        $scope.buildAllMultiStudentComments();
    };

    $scope.removeMultiStudent = function(student) {
        var index = $scope.multiStudent.indexOf(student);
        if (index > -1) {
            $scope.multiStudent.splice(index, 1);
        }

        $scope.buildAllMultiStudentComments();
    };

    $scope.regenerateMultiStudentComment = function(student) {
        student.comment = '';

        for (var i = 0; i < $scope.makeSomethingUpSize; ++i) {
            var randomComment = $scope.comments[Math.floor(Math.random() * $scope.comments.length)];
            student.comment += $scope.capitalizeFirstLetter($scope.fixGenderPronouns($scope.replaceClassName($scope.replaceMultiStudentName(randomComment.comment_text, student.name, student.old_name), true), student.gender)) + ' ';
        }

        $scope.buildAllMultiStudentComments();
    };

    $scope.shuffleMultiStudentComment = function(student) {
        var sentences = student.comment.match( /[^\.!\?]+[\.!\?]+/g );
        console.log('Found ' + sentences.length + ' sentences');

        for(var j, x, i = sentences.length; i; j = Math.floor(Math.random() * i), x = sentences[--i], sentences[i] = sentences[j], sentences[j] = x) {}

        student.comment = '';
        for (var k = 0; k < sentences.length; ++k) {
            student.comment += sentences[k].trim() + ' ';
        }

        $scope.buildAllMultiStudentComments();
    };

    $scope.buildAllMultiStudentComments = function() {
        $scope.allMultiStudentComments = '';
        for (var i = 0; i < $scope.multiStudent.length; ++i) {
            $scope.allMultiStudentComments += $scope.multiStudent[i].name + ':\n' +
                $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceMultiStudentName($scope.yourCommentIntroduction, $scope.multiStudent[i].name, $scope.multiStudent[i].old_name), true), $scope.multiStudent[i].gender) + ' ' +
                $scope.multiStudent[i].comment + ' ' +
                $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceMultiStudentName($scope.yourCommentConclusion, $scope.multiStudent[i].name, $scope.multiStudent[i].old_name), true), $scope.multiStudent[i].gender) + '\n\n\n';

            $scope.allMultiStudentComments = $scope.allMultiStudentComments.replace(/  +/g, ' ');
        }
    };

    $scope.editMultiStudentComment = function(student) {
        $scope.editingMultiStudent = student;
        $scope.studentName = student.name;
        $scope.oldStudentName = student.name;
        $scope.yourComment = student.comment;
        $scope.studentGender = student.gender;
        $scope.selectedTab = 1;
        $location.hash('top-of-page');
        $anchorScroll();
        $scope.illToastToThat('Editing '+ student.name +'. Return to Multi Student tab when done and your changes will be brought back.')
    };

    $scope.selectMultiStudentTab = function() {
        if ($scope.editingMultiStudent != null) {
            var index = $scope.multiStudent.indexOf($scope.editingMultiStudent);
            console.log('Index of editing student is ' + index);
            if (index > -1) {
                $scope.multiStudent[index].name = $scope.studentName;
                $scope.studentName = null;

                $scope.multiStudent[index].comment = $scope.yourComment;
                $scope.yourComment = null;

                $scope.multiStudent[index].gender = $scope.studentGender;
                $scope.studentGender = 'male';
            }
            $scope.editingMultiStudent = null;
        }
    };

    $scope.resizeComments = function() {
        if ($scope.fullCommentsSet == null) {
            $scope.fullCommentsSet = $scope.comments;
        }
        $scope.comments = $scope.fullCommentsSet.slice(0, $scope.reduceCommentsSize);
        $scope.illToastToThat('Comments reduced to ' + $scope.comments.length);
        $scope.changeCommentsPerPage();
        $scope.changeCommentsPage(1);
    };

    $scope.restoreComments = function() {
        if ($scope.fullCommentsSet != null) {
            $scope.comments = $scope.fullCommentsSet;
        }
        $scope.fullCommentsSet = null;
        $scope.illToastToThat('Full comment set restored');
        $scope.changeCommentsPerPage();
        $scope.changeCommentsPage(1);
    };

    $scope.currentCommentsFormattedLength = function() {
        return $scope.comments.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    $scope.resetAllSingleStudent = function() {
        $scope.studentName = '';
        $scope.oldStudentName = null;
        $scope.studentGender = 'male';
        $scope.className = '';
        $scope.oldClassName = null;
        $scope.searchComments = '';
        $scope.yourCommentIntroduction = '';
        $scope.yourComment = '';
        $scope.yourCommentConclusion = '';

        if ($scope.toneFilterSetting != 'Any') {

            // put the comments back in
            if ($scope.allComments.length > 0) {
                $scope.comments = $scope.allComments;
            }

        }
        $scope.toneFilterSetting = 'Any';

        $scope.illToastToThat('All fields reset')
    };

    $scope.resetAllMultiStudent = function() {
        $scope.newMultiStudent = '';
        $scope.defaultGender = 'male';
        $scope.className = '';
        $scope.oldClassName = null;
        $scope.yourCommentIntroduction = '';
        $scope.yourComment = '';
        $scope.yourCommentConclusion = '';
    };

    $scope.removeAllMultiStudents = function() {
        $scope.multiStudent = [];
        $scope.allMultiStudentComments = '';
        $scope.multiStudentsCopied = false;
    };

    $scope.getComments();
    $scope.detectMobile();

});