var commentApp = angular.module('commentApp', ['angular-clipboard', 'ngMaterial'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('amber')
            .accentPalette('deep-purple')
            .backgroundPalette('grey').dark();
    });

commentApp.controller('CommentController', function($scope, $http, $mdToast, $mdDialog, $mdMedia, $document, $location, $timeout) {

    // comments
    $scope.comments = [];
    $scope.allComments = []; // when 'filtering', put all comments in here, then we'll pull them back out when we switch back
    $scope.editingComment = {};
    $scope.editingPasswordTry = '';
    $scope.commentSizeToGet = 0; // 0 should indicate that we intend to get them all or have gotten them all
    $scope.totalCommentsSize = '20000';
    $scope.commonTags = [];

    // pagination
    $scope.commentViewLimit = 20;
    $scope.commentViewBegin = 0;
    $scope.currentCommentsPage = 1;
    $scope.totalCommentPages = null;

    // single student
    $scope.studentName = '';
    $scope.oldStudentName = null;
    $scope.className = '';
    $scope.oldClassName = null;

    // single student search and filter
    $scope.searchComments = '';
    $scope.toneFilterSetting = 'Any';
    $scope.toneFilterOptions = ['Any', 'Positive', 'Neutral', 'Negative', 'Unrated', 'Flagged'];

    // multi student
    $scope.newMultiStudent = '';
    $scope.multiStudent = [];
    $scope.editingMultiStudent = null;
    $scope.allMultiStudentComments = ''; // this must be updated any time it changes for the copy to work right, it has to already be correct by the time copy is hit
    $scope.useSmartSearch = false;

    // both single and multi
    $scope.yourCommentIntroduction = '';
    $scope.yourComment = '';
    $scope.yourCommentConclusion = '';
    $scope.gender = 'male';

    // smart search
    $scope.smartSearch = [];
    $scope.savedSmartSearch = null; // this is the smart search that is not connected to any multi student, save and load when tab is activated
    $scope.newSmartSearch = {search_text: '', found_comment: '', tone: 'Any', tags: false, text: false};
    $scope.limitedToneFilterOptions = ['Any', 'Positive', 'Neutral', 'Negative'];

    // walkthrough
    $scope.walkthrough = [];

    // settings
    $scope.showTooltips = true;
    $scope.showHints = false;
    $scope.showTone = true;
    $scope.showTags = true;
    $scope.showEditButtons = true;
    $scope.makeSomethingUpSize = 10;
    $scope.getSearchResultCount = false;
    $scope.avoidHer = true;
    $scope.enableNeutralGender = false;
    $scope.reduceCommentsSize = 10000;
    $scope.showCommonTags = false;

    // navigation
    $scope.tabIndexes = {
        main_page: 0,
        single_student: 1,
        multi_student: 2,
        smart_search: 3,
        settings: 4,
        donate: 5
    };
    $scope.selectedTab = $scope.tabIndexes.main_page;


    $scope.getComments = function(showAllLoadedMessage) {

        var commentsToGet = $scope.commentSizeToGet;

        // see if we got a limit in the url params
        var params = $location.search();
        if (params.limit != null) {
            commentsToGet = params.limit;
            if (commentsToGet == 0) {
                $scope.illToastToThat('Reloaded all comments');
            }
        }

        $location.search('limit', null);

        $http.get('/rest/comments?size=' + commentsToGet).
        success(function (data) {
            console.log('returned success');
            console.log(data.comments.length + ' comments received');

            $scope.comments = data.comments;
            $scope.totalCommentsSize = data.total_size;
            $scope.commonTags = data.common_tags;

            if ($scope.selectedTab == $scope.tabIndexes.settings && $scope.comments.length < $scope.totalCommentsSize) {
                $scope.illToastToThat('Reloaded with ' + $scope.formatNumber($scope.comments.length) + ' comments');
            } else {
                if (!data.all_comments_loaded) {
                    $timeout(function() {
                        $scope.illToastToThat($scope.formatNumber($scope.comments.length) + ' comments loaded - see settings tab to change');
                    }, 150);
                } else if (showAllLoadedMessage) {
                    $scope.illToastToThat('Full comment set loaded');
                }
            }

            $scope.changeCommentsPerPage();

        }).
        error(function () {
            $scope.illToastToThat('Error loading comments');
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

    $scope.fixCommentPronouns = function() {
        // I'm not sure why I did this in a timeout initially, maybe it's not necessary anymore?
        //$timeout(function() {
        //    $scope.yourCommentIntroduction = $scope.fixGenderPronouns($scope.yourCommentIntroduction);
        //    $scope.yourComment = $scope.fixGenderPronouns($scope.yourComment);
        //    $scope.yourCommentConclusion = $scope.fixGenderPronouns($scope.yourCommentConclusion);
        //
        //    $scope.illToastToThat('Gender pronouns changed to ' + $scope.gender);
        //
        //}, 50);

        $scope.yourCommentIntroduction = $scope.fixGenderPronouns($scope.yourCommentIntroduction);
        $scope.yourComment = $scope.fixGenderPronouns($scope.yourComment);
        $scope.yourCommentConclusion = $scope.fixGenderPronouns($scope.yourCommentConclusion);

        $scope.illToastToThat('Gender pronouns changed to ' + $scope.gender);
    };

    $scope.fixGenderPronouns = function(text, gender) {

        if (gender == undefined) {
            gender = $scope.gender;
            console.log('using single student gender of ' + $scope.gender);
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

    $scope.changeStudentName = function() {
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

    $scope.changeClassName = function() {
        console.log('class name: ' + $scope.className);
        console.log('old class name: ' + $scope.oldClassName);

        if ($scope.className == null || $scope.className == '' || $scope.className == $scope.oldClassName) {
            return;
        }

        $scope.yourCommentIntroduction = $scope.replaceClassName($scope.yourCommentIntroduction, true);
        $scope.yourComment = $scope.replaceClassName($scope.yourComment, true);

        // replace it in all of the multi student texts too
        if ($scope.multiStudent.length > 0) {
            for (var i = 0; i < $scope.multiStudent.length; ++i) {
                $scope.multiStudent[i].comment = $scope.replaceClassName($scope.multiStudent[i].comment, true);
            }
            $scope.buildAllMultiStudentComments();
        }


        $scope.yourCommentConclusion = $scope.replaceClassName($scope.yourCommentConclusion);

        $scope.illToastToThat('Class name changed to ' + $scope.className);
    };

    $scope.replaceStudentName = function(text, dontSet) {
        var studentName;
        if ($scope.studentName == null || $scope.studentName == '') {
            studentName = 'STUDENT_NAME';
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
        if (studentName != null && studentName != '') {
            if (oldStudentName != null) {
                text = text.replace(new RegExp($scope.oldStudentName, 'g'), studentName);
            }
            return text.replace(/STUDENT_NAME/g, studentName);
        }
        return text;
    };

    $scope.replaceClassName = function(text, dontSet) {
        var className;
        if ($scope.className == null || $scope.className == '') {
            className = 'CLASS_NAME';
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
        if ($scope.currentCommentsPage != newPage) {
            console.log('Changing page to ' + newPage);
            if (newPage >= 1 && newPage <= $scope.totalCommentPages) {
                $scope.currentCommentsPage = newPage;
                $scope.commentViewBegin = ($scope.currentCommentsPage - 1) * $scope.commentViewLimit;
            }
        }
    };

    $scope.shuffleSingleStudentComment = function() {
        $scope.yourComment = $scope.shuffleText($scope.yourComment);
    };

    $scope.showEditCommentDialog = function(comment) {

        $scope.editingComment = angular.copy(comment);

        console.log('editing comment: ' + $scope.editingComment);
        if (!$scope.editingComment.hasOwnProperty('tags')) {
            $scope.editingComment.tags = [];
        } else {
            console.log('copying old tags');
            $scope.editingComment.old_tags = angular.copy($scope.editingComment.tags); // copy the old ones so we know which ones are deleted later
        }

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/edit-comment-dialog.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
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

                        // if we didn't actually add tags then take out the tag array
                        if ($scope.editingComment.hasOwnProperty('tags') && $scope.editingComment.tags.length == 0) {
                            delete $scope.editingComment.tags;
                        }

                        $scope.findAndUpdateComment($scope.editingComment);

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

    // looks for a comment in the comments list with the same id and replaces it with the one passed in
    $scope.findAndUpdateComment = function(newComment) {
        for (var i = 0; i < $scope.comments.length; ++i) {
            if ($scope.comments[i].comment_id == newComment.comment_id) {

                if (newComment.hasOwnProperty('deleted') && (newComment.deleted == 1 || newComment.deleted == '1')) {
                    $scope.comments.splice(i, 1);
                } else {
                    $scope.comments.splice(i, 1, newComment);
                }

                break;
            }
        }
    };

    $scope.showEditToneDialog = function(comment) {
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

    $scope.showTagEditDialog = function(comment) {

        $scope.editingComment = angular.copy(comment);

        console.log('editing comment: ' + $scope.editingComment);
        if (!$scope.editingComment.hasOwnProperty('tags')) {
            $scope.editingComment.tags = [];
        } else {
            console.log('copying old tags');
            $scope.editingComment.old_tags = angular.copy($scope.editingComment.tags); // copy the old ones so we know which ones are deleted later
        }

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/edit-tag-dialog.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.saveDialog = function(tone) {

                    $scope.editingComment.pos_neg = tone;

                    console.log('in saveDialog');
                    $mdDialog.hide();
                    $http({
                        url: "/rest/comments",
                        method: "PUT",
                        params: {comment: $scope.editingComment, editing_password_try: $scope.editingPasswordTry},
                        headers: {'Content-Type': 'application/json'}
                    }).success(function (data) {

                        // if we didn't actually add tags then take out the tag array
                        if ($scope.editingComment.hasOwnProperty('tags') && $scope.editingComment.tags.length == 0) {
                            delete $scope.editingComment.tags;
                        }

                        $scope.findAndUpdateComment($scope.editingComment);

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

    $scope.showSmartSearchHelp = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/smart-search-help.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
            }
        });
    };

    $scope.changeFilter = function() {
        console.log('changing the filter to ' + $scope.toneFilterSetting);
        //$scope.commentsLoaded = false;

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
                } else if ($scope.toneFilterSetting == 'Flagged' && ($scope.allComments[i].flagged == 1 || $scope.allComments[i].flagged == '1' || $scope.allComments[i].flagged == 'true')) {
                    $scope.comments.push($scope.allComments[i]);
                }
            }
        }

        //$scope.commentsLoaded = true;
        $scope.changeCommentsPerPage();
        console.log('done changing filter');
    };

    $scope.illToastToThat = function(text) {
        console.log('Toast: ' + text);
        $mdToast.show(
            {
                template: '<md-toast class="toast-style">' + text + '</md-toast>',
                position: 'bottom right',
                parent: $document[0].querySelector('#toastBounds')
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
        } else if ($scope.enableNeutralGender && ($scope.newMultiStudent.endsWith(' n') || $scope.newMultiStudent.endsWith(' N'))) {
            student.gender = "neutral";
            student.name = $scope.newMultiStudent.replace(' n', '').replace(' N', '');
        } else {
            student.name = $scope.newMultiStudent;
            student.gender = $scope.gender;
            console.log('Setting to default gender of ' + $scope.gender);
        }
        student.old_name = student.name;

        if ($scope.useSmartSearch && $scope.smartSearch.length > 0) {
            // generated based on default smart search
            student.comment = '';
            for (var i = 0; i < $scope.smartSearch.length; ++i) {
                student.comment += $scope.capitalizeFirstLetter($scope.getSmartSearchResult($scope.smartSearch[i]).found_comment + ' ');
            }
            student.comment = $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceMultiStudentName(student.comment, student.name, student.old_name), true), student.gender);
            student.smartSearch = angular.copy($scope.smartSearch);
            student.smartSearchType = 'global';
        } else {
            // just totally random generation
            student.comment = $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceMultiStudentName($scope.getRandomComments(), student.name, student.old_name), true), student.gender);
        }

        $scope.multiStudent.push(student);
        $scope.newMultiStudent = '';

        $scope.illToastToThat('Added student: ' + student.name + ' (' + student.gender + ')');

        $scope.buildAllMultiStudentComments();
    };

    $scope.regenerateMultiStudentComment = function(student) {

        if ($scope.useSmartSearch) {
            student.comment = '';

            var i;
            if (student.smartSearch) {
                for (i = 0; i < student.smartSearch.length; ++i) {
                    student.comment += $scope.capitalizeFirstLetter($scope.getSmartSearchResult(student.smartSearch[i]).found_comment + ' ');
                }
            } else {
                for (i = 0; i < $scope.smartSearch.length; ++i) {
                    student.comment += $scope.capitalizeFirstLetter($scope.getSmartSearchResult($scope.smartSearch[i]).found_comment + ' ');
                }
            }

            student.comment = $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceMultiStudentName(student.comment, student.name, student.old_name), true), student.gender);
        } else {
            student.comment = $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceMultiStudentName($scope.getRandomComments(), student.name, student.old_name), true), student.gender);
        }

        $scope.buildAllMultiStudentComments();
    };

    $scope.applyGlobalToAll = function() {
        for (var i = 0; i < $scope.multiStudent.length; ++i) {

            $scope.multiStudent[i].smartSearch = angular.copy($scope.smartSearch);
            $scope.multiStudent[i].smartSearchType = 'global';
            $scope.regenerateMultiStudentComment($scope.multiStudent[i]);
        }
        $scope.illToastToThat('Global Smart Search pattern applied to all multi students');
    };

    $scope.makeSomethingUp = function() {
        $scope.yourComment = '';
        $scope.addComment($scope.getRandomComments(), false);
        $scope.illToastToThat('Random comment generated');
    };

    $scope.getRandomComments = function(size) {
        var fullRandomComment = '';

        if (size == null) {
            size = $scope.makeSomethingUpSize;
        }

        for (var i = 0; i < size; ++i) {
            var randomComment = $scope.comments[Math.floor(Math.random() * $scope.comments.length)];

            if ($scope.avoidHer && $scope.gender != 'female' && (randomComment.comment_text.indexOf(' her ') > 0 || randomComment.comment_text.startsWith('Her') || randomComment.comment_text.endsWith(' her.'))) {
                --i;
                continue;
            }

            if (fullRandomComment == '') {
                fullRandomComment = $scope.capitalizeFirstLetter(randomComment.comment_text);
            } else {
                fullRandomComment = fullRandomComment + ' ' + $scope.capitalizeFirstLetter(randomComment.comment_text)
            }

        }

        return fullRandomComment;
    };


    $scope.removeMultiStudent = function(student) {
        var index = $scope.multiStudent.indexOf(student);
        if (index > -1) {
            $scope.multiStudent.splice(index, 1);
        }

        $scope.buildAllMultiStudentComments();
    };


    $scope.shuffleMultiStudentComment = function(student) {
        student.comment = $scope.shuffleText(student.comment);
        $scope.buildAllMultiStudentComments();
    };

    $scope.shuffleText = function(text) {
        var sentences = text.match( /[^\.!\?]+[\.!\?]+/g );
        console.log('Found ' + sentences.length + ' sentences');

        for(var j, x, i = sentences.length; i; j = Math.floor(Math.random() * i), x = sentences[--i], sentences[i] = sentences[j], sentences[j] = x) {}

        text = '';
        for (var k = 0; k < sentences.length; ++k) {
            if (text == '') {
                text = sentences[k].trim();
            } else {
                text = text + sentences[k].trim();
            }
        }

        return text;
    };

    $scope.shuffleCommentBank = function() {
        for(var j, x, i = $scope.comments.length; i; j = Math.floor(Math.random() * i), x = $scope.comments[--i], $scope.comments[i] = $scope.comments[j], $scope.comments[j] = x) {}
        $scope.illToastToThat('Comment bank shuffled');
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

    $scope.editMultiStudentAsSingleStudent = function(student) {
        $scope.copyMultiStudentToSingleInputs(student);
        $scope.selectedTab = $scope.tabIndexes.single_student;
        $scope.illToastToThat('Editing '+ student.name +' as single student.');
    };

    $scope.editMultiStudentAsSmartSearch = function(student) {
        $scope.copyMultiStudentToSingleInputs(student);

        if (!$scope.editingStudentWorking.smartSearch) {
            console.log('Creating Multi Student Smart Search profile');
            // import the existing multi student sentence into smart search

            var sentences = $scope.editingStudentWorking.comment.match( /[^\.!\?]+[\.!\?]+/g );

            $scope.editingStudentWorking.smartSearch = [];
            for (var i = 0; i < sentences.length; ++i) {
                console.log(sentences[i]);
                $scope.editingStudentWorking.smartSearch.push({search_text: '', found_comment: sentences[i].trim(), tone: 'Any', tags: false, text: false});
            }

        }
        $scope.editingStudentWorking.smartSearchType = 'individual';

        $scope.savedSmartSearch = angular.copy($scope.smartSearch);
        console.log('Saved smart search length: ' + $scope.savedSmartSearch.length);
        $scope.smartSearch = $scope.editingStudentWorking.smartSearch;

        $scope.selectedTab = $scope.tabIndexes.smart_search;
        $scope.illToastToThat('Editing '+ $scope.editingStudentWorking.name +' as smart search.')
    };

    $scope.submitEditingMultiStudentAsSmartSearch = function() {
        if ($scope.editingMultiStudent != null) {
            var index = $scope.multiStudent.indexOf($scope.editingMultiStudent);
            console.log('Index of editing student is ' + index);
            if (index > -1) {
                $scope.multiStudent[index].name = $scope.studentName;
                $scope.studentName = null;

                $scope.multiStudent[index].comment = $scope.yourComment;
                $scope.yourComment = null;

                $scope.multiStudent[index].gender = $scope.gender;
                $scope.gender = 'male';

                if ($scope.smartSearch.length > 0) {
                    $scope.multiStudent[index].smartSearch = $scope.smartSearch;
                    $scope.multiStudent[index].smartSearchType = 'individual';
                }

            }
            $scope.editingMultiStudent = null;
        }
        $scope.selectedTab = $scope.tabIndexes.multi_student;
        $scope.illToastToThat('Saved changes');
    };

    $scope.cancelEditingMultiStudentAsSmartSearch = function() {
        $scope.editingMultiStudent = null;
        $scope.editingStudentWorking = null;
        $scope.selectedTab = $scope.tabIndexes.multi_student;
        $scope.illToastToThat('Discarded changes');
    };

    $scope.copyMultiStudentToSingleInputs = function(student) {
        $scope.editingMultiStudent = student;
        $scope.editingStudentWorking = angular.copy(student);
        $scope.studentName = student.name;
        $scope.oldStudentName = student.name;
        $scope.yourComment = student.comment;
        $scope.gender = student.gender;
    };

    $scope.selectMultiStudentTab = function() {
        console.log('select multi student tab');
        if ($scope.editingMultiStudent != null) {
            var index = $scope.multiStudent.indexOf($scope.editingMultiStudent);
            console.log('Index of editing student is ' + index);
            if (index > -1) {
                $scope.multiStudent[index].name = $scope.studentName;
                $scope.studentName = null;

                $scope.multiStudent[index].comment = $scope.yourComment;
                $scope.yourComment = null;

                $scope.multiStudent[index].gender = $scope.gender;
                $scope.gender = 'male';

            }
            $scope.editingMultiStudent = null;
        }
    };

    $scope.startBlankMulti = function() {

        for (var i = 0; i < $scope.multiStudent.length; ++i) {
            $scope.multiStudent[i].comment = '';
        }

        $scope.selectedTab = $scope.tabIndexes.multi_student;
    };

    $scope.loadSampleSmartSearch = function() {
        $scope.smartSearch.push($scope.getSmartSearchResult({search_text: '', found_comment: '', tone: 'Positive', tags: false, text: false}));
        $scope.smartSearch.push($scope.getSmartSearchResult({search_text: 'reading', found_comment: '', tone: 'Any', tags: true, text: true}));
        $scope.smartSearch.push($scope.getSmartSearchResult({search_text: 'behavior', found_comment: '', tone: 'Any', tags: true, text: true}));
        $scope.smartSearch.push($scope.getSmartSearchResult({search_text: 'speaking', found_comment: '', tone: 'Any', tags: true, text: true}));
        $scope.smartSearch.push($scope.getSmartSearchResult({search_text: 'writing', found_comment: '', tone: 'Any', tags: true, text: true}));
        $scope.smartSearch.push($scope.getSmartSearchResult({search_text: '', found_comment: '', tone: 'Positive', tags: false, text: false}));
        $scope.buildAllSmartSearchComments();
    };

    $scope.reloadWithLimit = function(limit) {
        if (limit != null) {
            $location.search('limit', limit);
        } else {
            $location.search('limit', $scope.reduceCommentsSize);
        }
        location.reload();
    };

    $scope.formatNumber = function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    $scope.getSmartSearchResult = function(search, getResultCount) {

        // if there are no working search parameters passed then do not actually count the results, it's pointless!
        if (getResultCount && search.tone == 'Any' && (search.search_text == '' || (!search.tags && !search.text))) {
            getResultCount = false;
        }

        search.found_comment = '';

        console.log('search text: ' + search.search_text);

        // we start looking at a random starting point so that we don't end up getting the same comments for every search
        var randomStartingPoint = Math.floor((Math.random() * $scope.comments.length));
        console.log('Starting at random index ' + randomStartingPoint);

        var searchResults = 0;
        for (var i = randomStartingPoint; i < $scope.comments.length + randomStartingPoint; ++i) {

            var index = i;
            if (index >= $scope.comments.length) {
                index -= $scope.comments.length;
            }

            if ($scope.avoidHer && $scope.gender != 'female' && ($scope.comments[index].comment_text.indexOf(' her ') > 0 || $scope.comments[index].comment_text.startsWith('Her') || $scope.comments[index].comment_text.endsWith(' her.'))) {
                continue;
            }

            // yes I know I can make this statement more compact, but then it would be less readable
            if (search.tone != 'Any') {
                if (search.tone == 'Positive' && $scope.comments[index].pos_neg != 1) {
                    continue;
                } else if (search.tone == 'Neutral' && $scope.comments[index].pos_neg != 0) {
                    continue;
                } else if (search.tone == 'Negative' && $scope.comments[index].pos_neg != -1) {
                    continue;
                }
            }

            if (search.tags && search.text) {
                if ($scope.comments[index].comment_text.toLowerCase().indexOf(search.search_text) < 0 && (!$scope.comments[index].hasOwnProperty('tags') || $scope.comments[index].tags.indexOf(search.search_text) < 0)) {
                    continue;
                }
            } else if (search.tags) {
                if (!$scope.comments[index].hasOwnProperty('tags') || $scope.comments[index].tags.indexOf(search.search_text) < 0) {
                    continue;
                }
            } else if (search.text) {
                if ($scope.comments[index].comment_text.toLowerCase().indexOf(search.search_text) < 0) {
                    continue;
                }
            }

            //console.log('Searched ' + i + ' comments');
            //console.log('Found comment matching search: ' + $scope.comments[index].comment_text);

            ++searchResults;
            if (!getResultCount) {
                search.found_comment = $scope.comments[index].comment_text;
                break;
            } else if (search.found_comment == '') {
                search.found_comment = $scope.comments[index].comment_text;
            }
        }

        if ($scope.selectedTab == $scope.tabIndexes.smart_search && $scope.smartSearch.length > 0) {
            $scope.useSmartSearch = true;
        }

        if (getResultCount) {
            search.result_count = searchResults;
        }

        return angular.copy(search);
    };

    $scope.resubmitSearch = function(search, getResultCount) {
        console.log('resubmitting search for ' + search.search_text);
        console.log('getResultCount ? ' + getResultCount);
        var newSearch = $scope.getSmartSearchResult(search, getResultCount);
        search.found_comment = newSearch.found_comment;
        if (getResultCount) {
            console.log('result count for new search parameters: ' + newSearch.result_count);
            search.result_count = newSearch.result_count;
        }
    };

    $scope.shuffleSmartSearch = function() {
        for(var j, x, i = $scope.smartSearch.length; i; j = Math.floor(Math.random() * i), x = $scope.smartSearch[--i], $scope.smartSearch[i] = $scope.smartSearch[j], $scope.smartSearch[j] = x) {}
        $scope.buildAllSmartSearchComments();
    };

    $scope.buildAllSmartSearchComments = function() {
        //console.log('Building smart search comments');
        //console.log('Have ' + $scope.smartSearch.length + ' smart search comments');
        $scope.yourComment = '';
        for (var i = 0; i < $scope.smartSearch.length; ++i) {
            $scope.yourComment += $scope.capitalizeFirstLetter($scope.replaceClassName($scope.replaceMultiStudentName($scope.smartSearch[i].found_comment, $scope.studentName, $scope.oldStudentName), true), $scope.gender) + ' ';
        }
    };

    $scope.justMakeSomethingUpSmartSearch = function() {
        $scope.smartSearch = [];
        for (var i = 0; i < $scope.makeSomethingUpSize; ++i) {
            $scope.smartSearch.push($scope.getSmartSearchResult($scope.newSmartSearch));
        }
        $scope.buildAllSmartSearchComments();
    };

    $scope.regenerateAllSmartSearch = function() {
        console.log('Regenerating ' + $scope.smartSearch.length + ' searches');
        for (var i = 0; i < $scope.smartSearch.length; ++i) {
            $scope.smartSearch[i].found_comment = $scope.getSmartSearchResult($scope.smartSearch[i]).found_comment;
        }
        $scope.buildAllSmartSearchComments();
    };

    $scope.resetAllSingleStudent = function() {
        $scope.studentName = '';
        $scope.oldStudentName = null;
        $scope.gender = 'male';
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
        $scope.gender = 'male';
        $scope.className = '';
        $scope.oldClassName = null;
        $scope.yourCommentIntroduction = '';
        $scope.yourComment = '';
        $scope.yourCommentConclusion = '';
    };

    $scope.resetAllSmartSearch = function() {
        $scope.newSmartSearch = {search_text: '', found_comment: '', tone: 'Any', tags: true, text: true};
    };

    $scope.removeAllMultiStudents = function() {
        $scope.multiStudent = [];
        $scope.allMultiStudentComments = '';
    };

    $scope.setMobileSettings = function() {
        if ($mdMedia('xs')) {
            $scope.commentSizeToGet = 2000;
            $scope.showTooltips = false;
            //$scope.showTags = false;
            //$scope.showHints = true;
            $scope.showEditButtons = false;
        } else if ($mdMedia('sm')) {
            $scope.showTooltips = false;
            //$scope.showHints = true;
            $scope.commentSizeToGet = 6000;
        }
    };

    $scope.selectTab = function() {

        // set the search locations
        if ($scope.selectedTab == $scope.tabIndexes.main_page) {
            $location.search('tab', null);
        } else if ($scope.selectedTab == $scope.tabIndexes.single_student) {
            $location.search('tab', 'single-student');
        } else if ($scope.selectedTab == $scope.tabIndexes.multi_student) {
            $location.search('tab', 'multi-student');
        } else if ($scope.selectedTab == $scope.tabIndexes.smart_search) {
            $location.search('tab', 'smart-search');
        } else if ($scope.selectedTab == $scope.tabIndexes.settings) {
            $location.search('tab', 'settings');
        } else if ($scope.selectedTab == $scope.tabIndexes.donate) {
            $location.search('tab', 'donate');
        }

        // if we just switched off of smart search we might need to put the global pattern back
        if ($scope.selectedTab != $scope.tabIndexes.smart_search && $scope.savedSmartSearch != null) {
            console.log('Resetting global smart search');

            if ($scope.savedSmartSearch.length > 0) {
                $scope.smartSearch = angular.copy($scope.savedSmartSearch);
            } else {
                $scope.smartSearch = [];
            }
            $scope.savedSmartSearch = null;
        } else if ($scope.selectedTab != $scope.tabIndexes.smart_search && $scope.multiStudent.length > 0) {
            // if we moved off of the smart search tab and the saved smart search is null it means we were editing the global one
            // we need to re apply the global changes to each

            for (var i = 0; i < $scope.multiStudent.length; ++i) {
                if ($scope.multiStudent[i].smartSearchType == 'global') {
                    console.log('Reapplying global pattern for ' + $scope.multiStudent.name);
                    $scope.multiStudent.smartSearch = angular.copy($scope.smartSearch);
                }
            }
        }

    };

    $scope.setTab = function() {
        var params = $location.search();
        if (params.tab == 'single-student') {
            $scope.selectedTab = $scope.tabIndexes.single_student;
        } else if (params.tab == 'multi-student') {
            $scope.selectedTab = $scope.tabIndexes.multi_student;
        } else if (params.tab == 'smart-search') {
            $scope.selectedTab = $scope.tabIndexes.smart_search;
        } else if (params.tab == 'settings') {
            $scope.selectedTab = $scope.tabIndexes.settings;
        } else if (params.tab == 'donate') {
            $scope.selectedTab = $scope.tabIndexes.donate;
        }
    };

    $scope.setPassword = function() {
        var params = $location.search();
        if (params.hasOwnProperty('password')) {
            $scope.editingPasswordTry = params.password;
        }
    };

    $scope.setPassword();
    $scope.setTab();
    $scope.setMobileSettings();
    $scope.getComments();

});