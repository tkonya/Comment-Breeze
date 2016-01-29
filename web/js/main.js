var commentApp = angular.module('commentApp', ['angular-clipboard', 'ngMaterial', 'ngStorage'])
    .config(function($mdThemingProvider) {

        $mdThemingProvider.definePalette('black', {
            '50': 'FAFAFA',
            '100': 'F5F5F5',
            '200': 'EEEEEE',
            '300': 'BDBDBD',
            '400': '9E9E9E',
            '500': '757575',
            '600': '616161',
            '700': '424242',
            '800': '111111',
            '900': '000000',
            'A100': '000000',
            'A200': '000000',
            'A400': '000000',
            'A700': '000000',
            'contrastDefaultColor': 'dark',    // whether, by default, text (contrast)
            // on this palette should be dark or light
            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                '200', '300', '400', 'A100'],
            'contrastLightColors': undefined    // could also specify this if default was 'dark'
        });

        $mdThemingProvider.definePalette('adventure', {
            '50': '66BB6A',
            '100': '81C784',
            '200': 'EEEEEE',
            '300': 'BDBDBD',
            '400': 'A5D6A7',
            '500': '757575',
            '600': '616161',
            '700': '424242',
            '800': '80D8FF',
            '900': '4FC3F7',
            'A100': '000000',
            'A200': '000000',
            'A400': '000000',
            'A700': '000000',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
            // on this palette should be dark or light
            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                '200', '300', '400', 'A100'],
            'contrastLightColors': undefined    // could also specify this if default was 'dark'
        });

        $mdThemingProvider.theme('darkula')
            .primaryPalette('amber', {
                'default': '700', // toolbars / card headers
                'hue-1': '500', // non-disabled menu items, menu button on individual students, text that should stand out from the background more than primary default
                'hue-2': '400',
                'hue-3': '600'
            })
            .accentPalette('deep-purple')
            .backgroundPalette('grey', {
                'default': '800', // default, menu box
                'hue-1': '900', // background background
                'hue-2': '700', // no idea what is wrong with this hue
                'hue-3': '800' // cards background
            }).dark();


        $mdThemingProvider.theme('breezy')
            .primaryPalette('blue', {
                'default': '500', // toolbars / card headers
                'hue-1': '700', // non-disabled menu items, menu button on individual students, text that should stand out from the background more than primary default
                'hue-2': '400',
                'hue-3': '600'
            })
            .accentPalette('green', {
                'default': 'A700'
            })
            .backgroundPalette('blue-grey', {
                'default': '100', // default, menu box
                'hue-1': '50', // background background
                'hue-2': '800', // no idea what is wrong with this hue
                'hue-3': '100' // cards background
            });


        $mdThemingProvider.theme('prince')
            .primaryPalette('deep-purple', {
                'default': '500', // toolbars / card headers
                'hue-1': '700', // non-disabled menu items, menu button on individual students, text that should stand out from the background more than primary default
                'hue-2': '400',
                'hue-3': '600'
            })
            .accentPalette('indigo')
            .backgroundPalette('purple', {
                'default': '100', // default, menu box
                'hue-1': '200', // background background
                'hue-2': '800', // no idea what is wrong with this hue
                'hue-3': '100' // cards background
            });

        $mdThemingProvider.theme('matrix')
            .primaryPalette('green', {
                'default': '900', // toolbars / card headers
                'hue-1': '700', // non-disabled menu items, menu button on individual students, text that should stand out from the background more than primary default
                'hue-2': '400',
                'hue-3': '600'
            })
            .accentPalette('green')
            .backgroundPalette('black', {
                'default': '800', // default, menu box
                'hue-1': '900', // background background
                'hue-2': '900', // no idea what is wrong with this hue
                'hue-3': '800' // cards background
            }).dark();

        $mdThemingProvider.theme('grass')
            .primaryPalette('green', {
                'default': 'A700', // toolbars / card headers
                'hue-1': '800', // non-disabled menu items, menu button on individual students, text that should stand out from the background more than primary default
                'hue-2': '400',
                'hue-3': '600'
            })
            .accentPalette('blue')
            .backgroundPalette('green', {
                'default': '50', // default, menu box
                'hue-1': '50', // background background
                'hue-2': '50', // no idea what is wrong with this hue
                'hue-3': '100' // cards background
            });

        $mdThemingProvider.theme('adventure')
            .primaryPalette('blue', {
                'default': '800', // toolbars / card headers
                'hue-1': '900', // non-disabled menu items, menu button on individual students, text that should stand out from the background more than primary default
                'hue-2': '400',
                'hue-3': '600'
            })
            .accentPalette('yellow')
            .backgroundPalette('adventure', {
                'default': '50', // default, menu box
                'hue-1': '900', // background background
                'hue-2': '50', // no idea what is wrong with this hue
                'hue-3': '100' // cards background
            });

        $mdThemingProvider.theme('brownie')
            .primaryPalette('brown', {
                'default': '900', // toolbars / card headers
                'hue-1': '900', // non-disabled menu items, menu button on individual students, text that should stand out from the background more than primary default
                'hue-2': '400',
                'hue-3': '600'
            })
            .accentPalette('brown')
            .backgroundPalette('brown', {
                'default': '200', // default, menu box
                'hue-1': '600', // background background
                'hue-2': '50', // no idea what is wrong with this hue
                'hue-3': '500' // cards background
            }).dark();


        $mdThemingProvider.alwaysWatchTheme(true);
    });

// replaces all non-space characters in the string with the poop emoji
commentApp.filter('poopFilter', function ($sce) {
    var urlPattern = /[^\s\\]/gi;
    return function (text, target) {
        return $sce.trustAsHtml(text.replace(urlPattern, '&#128169;'));
    };
});

commentApp.directive('onReadFile', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('change', function(onChangeEvent) {
                var reader = new FileReader();

                reader.onload = function(onLoadEvent) {
                    scope.$apply(function() {
                        fn(scope, {$fileContent:onLoadEvent.target.result});
                    });
                };

                reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
            });
        }
    };
});

commentApp.directive('chooseFileButton', function() {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.bind('click', function() {
                angular.element(document.querySelector('#' + attrs.chooseFileButton))[0].click();
            });
        }
    };
});

commentApp.controller('CommentController', function ($scope, $http, $mdToast, $mdDialog, $mdMedia, $location, $timeout, $localStorage, $interval, $window) {

    // comments
    $scope.comments = [];
    $scope.allComments = []; // when 'filtering', put all comments in here, then we'll pull them back out when we switch back
    $scope.editingComment = {};
    $scope.editingPasswordTry = '';
    $scope.commentSizeToGet = 0; // 0 should indicate that we intend to get them all or have gotten them all
    $scope.totalCommentsSize = '20000';
    $scope.commonTags = [];

    $scope.setInitialApplicationState = function() {
        // application state - this is the object that gets saved or loaded
        $scope.state = {
            date_created: new Date(),
            class_name: '',
            old_class_name: '',
            introduction: '',
            conclusion: '',
            students: [],
            all_student_comments: '',
            global_pattern: [],
            settings: {
                showTooltips: true,
                showHints: false,
                showTone: true,
                showTags: true,
                showEditButtons: true,
                makeSomethingUpSize: 10,
                getSearchResultCount: false,
                avoidHer: true,
                enableNeutralGender: false,
                reduceCommentsSize: 10000,
                showCommonTags: false,
                newStudentFill: 'random',
                useSmartSearch: false,
                tabSwipe: false,
                showAnnoy: true,
                autoCache: true,
                cacheInterval: 20
            },
            theme: {
                colorTheme: 'breezy',
                seizures: false
            }
        };

        // local storage of the state object
        $scope.cachedCommentsDetails = false;
        $scope.clearCacheOnExit = true;

        // mobile
        $scope.isMobile = false;

        // themes
        $scope.showColorThemes = false;
        $scope.defaultColorTheme = 'breezy';

        // single student search and filter
        $scope.searchComments = '';
        $scope.toneFilterSetting = 'Any';
        $scope.toneFilterOptions = ['Any', 'Positive', 'Neutral', 'Negative', 'Unrated', 'Flagged'];

        // adding a student
        $scope.gender = 'male';
        $scope.newStudentName = '';

        // editing a student
        $scope.editingStudentSearch = null;
        $scope.editingStudentPattern = null;
        $scope.editingStudentGrade = null;

        $scope.gradingIndex = null;
        $scope.hasNextStudentToGrade = true;
        $scope.goBackToBuild = false;

        $scope.studentToEditWithSearch = null;
        $scope.studentToEditWithPattern = null;

        // patterns
        $scope.editingPattern = [];
        $scope.newPatternPiece = {search_text: '', found_comment: '', tone: 'Any', tags: false, text: false};
        $scope.limitedToneFilterOptions = ['Any', 'Positive', 'Neutral', 'Negative'];

        // collapse cards
        $scope.showGlobalDetails = true;
        $scope.showAddStudents = true;
        $scope.showAllStudents = true;
        $scope.showSelectStudentSearch = true;
        $scope.showSelectStudentPattern = true;

        // pagination
        $scope.commentViewLimit = 20;
        $scope.commentViewBegin = 0;
        $scope.currentCommentsPage = 1;
        $scope.totalCommentPages = null;

        // navigation
        $scope.tabIndexes = {
            main_page: 0,
            build: 1,
            search: 2,
            patterns: 3,
            donate: 4
        };
        $scope.selectedTab = $scope.tabIndexes.main_page;
        $scope.annoySource = '';
        $scope.showAnnoyThisTime = false;

        // contact form
        $scope.contact = {
            name: '',
            email: '',
            message: ''
        };

        $scope.stats = null;
    };


    $scope.getComments = function (showLoadedMessage) {

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

                $scope.comments = data.comments;
                $scope.totalCommentsSize = data.total_size;
                $scope.commonTags = data.common_tags;

            if (showLoadedMessage) {
                if ($scope.comments.length == $scope.totalCommentsSize) {
                    $scope.illToastToThat('Loaded full comment set');
                } else {
                    $scope.illToastToThat('Loaded ' + $scope.formatNumber($scope.comments.length) + ' comments');
                    }
                }

                $scope.changeCommentsPerPage();

            }).
            error(function () {
                $scope.illToastToThat('Error loading comments');
            });
    };

    $scope.toggleColorThemesVisibility = function () {
        $scope.showColorThemes = !$scope.showColorThemes;
    };

    $scope.submitSearch = function () {
        if ($scope.editingStudentSearch != null) {
            for (var i = 0; i < $scope.comments.length; ++i) {
                if ($scope.comments[i].comment_text.toLowerCase().indexOf($scope.searchComments.toLowerCase()) > -1) {
                    $scope.addComment($scope.comments[i].comment_text, true);
                    $scope.searchComments = '';
                    return;
                }
            }
            console.log('no search result found');
            $scope.searchComments = '';
        }
    };

    $scope.addComment = function(comment, showToast) {

        if ($scope.editingStudentSearch == null) {
            return;
        }

        //console.log('Adding comment: ' + comment);

        comment = $scope.capitalizeFirstLetter(
            $scope.fixGenderPronouns(
                $scope.replaceClassName(
                    $scope.replaceStudentName(comment, $scope.editingStudentSearch.name, $scope.editingStudentSearch.old_name)
                ), $scope.editingStudentSearch.gender
            )
        );

        if ($scope.editingStudentSearch.comment == '') {
            $scope.editingStudentSearch.comment = comment;
        } else {
            $scope.editingStudentSearch.comment = $scope.editingStudentSearch.comment + ' ' + comment;
        }

        if (showToast) {
            $scope.illToastToThat('Comment added');
        }
    };

    $scope.changeStudentGender = function(student) {
        student.comment = $scope.fixGenderPronouns(student.comment, student.gender);
        $scope.illToastToThat('Gender for ' + student.name + ' changed to ' + student.gender);
    };

    $scope.fixGenderPronouns = function(text, gender) {

        if (gender == undefined) {
            gender = $scope.gender;
            //console.log('using single student gender of ' + $scope.gender);
        }

        var subject;
        var object;
        var possessiveAdjectives;
        var possessivePronouns;
        var reflexivePronouns;
        var girlBoyChild;
        var manLadyAdult;

        //console.log('Changing gender to ' + gender + ' for the text:\n' + text);
        if (gender == 'male') {
            subject = 'he';
            object = 'him';
            possessiveAdjectives = 'his';
            possessivePronouns = 'his';
            reflexivePronouns = 'himself';
            girlBoyChild = 'boy';
            manLadyAdult = 'man';
        } else if (gender == 'female') {
            subject = 'she';
            object = 'her';
            possessiveAdjectives = 'her';
            possessivePronouns = 'hers';
            reflexivePronouns = 'herself ';
            girlBoyChild = 'girl';
            manLadyAdult = 'lady';
        } else {
            subject = 'they';
            object = 'them';
            possessiveAdjectives = 'their';
            possessivePronouns = 'theirs';
            reflexivePronouns = 'themselves';
            girlBoyChild = 'child';
            manLadyAdult = 'adult';
        }

        text = text.replace(/\bboy\b|\bgirl\b|\bchild\b/g,girlBoyChild).replace(/\bBoy\b|\bGirl\b|\bChild\b/g,$scope.capitalizeFirstLetter(girlBoyChild));
        text = text.replace(/\bman\b|\blady\b|\badult\b/g,girlBoyChild).replace(/\bMan\b|\bLady\b|\bAdult\b/g,$scope.capitalizeFirstLetter(manLadyAdult));
        text = text.replace(/\bhe\b|\bshe\b|\bthey\b/g,subject).replace(/\bhis\b|\bhers\b|\btheirs\b/g,possessivePronouns).replace(/\bhim\b|\bher\b|\bthem\b/g,object).replace(/\bhis\b|\bher\b|\btheir\b/g,possessiveAdjectives).replace(/\bhimself\b|\bherself\b|\btheirself\b/g,reflexivePronouns);
        text = text.replace(/\bHe\b|\bShe\b|\bThey\b/g,$scope.capitalizeFirstLetter(subject)).replace(/\bHim\b|\bHer\b|\bThem\b/g,$scope.capitalizeFirstLetter(object)).replace(/\bHis\b|\bHers\b|\bTheirs\b/g,$scope.capitalizeFirstLetter(possessivePronouns)).replace(/\bHis\b|\bHer\b|\bTheir\b/g,$scope.capitalizeFirstLetter(possessiveAdjectives)).replace(/\bHimself\b|\bHerself\b|\bTheirself\b/g,$scope.capitalizeFirstLetter(reflexivePronouns));
        //console.log('Gender Fixed text length: ' + text.length);
        return text;
    };

    $scope.changeClassName = function() {
        //console.log('class name: ' + $scope.state.class_name);
        //console.log('old class name: ' + $scope.state.old_class_name);

        if ($scope.state.class_name == null || $scope.state.class_name == '' || $scope.state.class_name == $scope.state.old_class_name) {
            return;
        }

        $scope.state.introduction = $scope.replaceClassName($scope.state.introduction);
        $scope.state.conclusion = $scope.replaceClassName($scope.state.conclusion);

        if ($scope.state.students.length > 0) {
            for (var i = 0; i < $scope.state.students.length; ++i) {
                $scope.state.students[i].comment = $scope.replaceClassName($scope.state.students[i].comment, true);
            }
            $scope.buildAllStudentComments();
        }
        
        $scope.state.old_class_name = $scope.state.class_name;

        $scope.illToastToThat('Class name changed to ' + $scope.state.class_name);
    };

    $scope.replaceStudentName = function(text, studentName, oldStudentName) {
        //console.log('replacing ' + oldStudentName + ' with ' + studentName + ' for the text ' + text);
        if (studentName != null && studentName != '') {
            if (oldStudentName != null && oldStudentName != '' && studentName != oldStudentName) {
                text = text.replace(new RegExp($scope.oldStudentName, 'g'), studentName);
            }
            text = text.replace(/STUDENT_NAME/g, studentName);
            //console.log('replace Student Name Fixed text: ' + text);
            return text;
        }
        return text;
    };

    $scope.changeStudentName = function(student) {
        if (student.name != null && student.name != '' && student.name != student.old_name) {
            if (student.old_name != null && student.old_name != '') {
                student.comment = student.comment.replace(new RegExp(student.old_name, 'g'), student.name);
            }
            student.old_name = student.name;
            student.comment = student.comment.replace(/STUDENT_NAME/g, student.name);
            $scope.illToastToThat('Changed student name to ' + student.name);
        }
    };
    
    $scope.replaceClassName = function(text) {
        //console.log('Changing class name for ' + text);
        var className;
        if ($scope.state.class_name == null || $scope.state.class_name == '') {
            className = 'CLASS_NAME';
        } else {
            className = $scope.state.class_name;
        }

        if ($scope.state.old_class_name != null && $scope.state.old_class_name.length > 0) {
            text = text.replace(new RegExp($scope.state.old_class_name, 'g'), className);
        }

        //console.log('replace class name fixed text: ' + text);
        
        return text.replace(/CLASS_NAME/g, className);
    };

    $scope.capitalizeFirstLetter = function(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    $scope.changeCommentsPerPage = function() {
        //console.log('Changing comment limit to ' + $scope.commentViewLimit);
        $scope.currentCommentsPage = 1;
        $scope.totalCommentPages = Math.ceil($scope.comments.length / $scope.commentViewLimit);
        $scope.commentViewBegin = 0;
    };

    $scope.changeCommentsPage = function(newPage) {
        if ($scope.currentCommentsPage != newPage) {
            //console.log('Changing page to ' + newPage);
            if (newPage >= 1 && newPage <= $scope.totalCommentPages) {
                $scope.currentCommentsPage = newPage;
                $scope.commentViewBegin = ($scope.currentCommentsPage - 1) * $scope.commentViewLimit;
            }
        }
    };

    $scope.showEditCommentDialog = function(comment) {

        $scope.editingComment = angular.copy(comment);

        //console.log('editing comment: ' + $scope.editingComment);
        if (!$scope.editingComment.hasOwnProperty('tags')) {
            $scope.editingComment.tags = [];
        } else {
            //console.log('copying old tags');
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

                    //console.log('in saveDialog');
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

    $scope.showContactForm = function () {

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/contact-form.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                    $scope.contact = {
                        name: '',
                        email: '',
                        message: ''
                    };
                };
                $scope.saveDialog = function () {

                    //console.log('in saveDialog');
                    $mdDialog.hide();
                    $http({
                        url: "/rest/comments/contact",
                        method: "POST",
                        params: {contact: $scope.contact},
                        headers: {'Content-Type': 'application/json'}
                    }).success(function (data) {

                        if (data.message) {
                            $scope.illToastToThat(data.message);
                        }

                    }).error(function () {
                        $scope.illToastToThat('Error submitting contact');
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

                    //console.log('in saveDialog');
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

        //console.log('editing comment: ' + $scope.editingComment);
        if (!$scope.editingComment.hasOwnProperty('tags')) {
            $scope.editingComment.tags = [];
        } else {
            //console.log('copying old tags');
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
                $scope.saveDialog = function () {

                    //console.log('in saveDialog');
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

    $scope.showDialog = function (location) {
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: location,
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
            }
        });
    };

    $scope.gradeStudent = function (student, setIndexNull) {

        if (setIndexNull) {
            $scope.gradingIndex = null;
        }

        $scope.editingStudentGrade = angular.copy(student);

        if (!$scope.editingStudentGrade.pattern || $scope.editingStudentGrade.pattern.length < 1) {
            $scope.editingStudentGrade.pattern = angular.copy($scope.state.global_pattern);
        }

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/grader.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                    $scope.editingStudentGrade = null;
                };
                $scope.saveGrade = function () {
                    $scope.regenerateMultiStudentComment($scope.editingStudentGrade, false);
                    $scope.editingStudentGrade.pattern_type = 'grade';
                    for (var i = 0; i < $scope.state.students.length; ++i) {
                        if ($scope.state.students[i].student_id == $scope.editingStudentGrade.student_id) {
                            $scope.state.students[i] = $scope.editingStudentGrade;
                            $scope.illToastToThat($scope.state.students[i].name + ' graded');
                            break;
                        }
                    }
                    $scope.editingStudentGrade = null;
                    $mdDialog.hide();
                };
            }
        });
    };

    $scope.gradeAllStudents = function (index) {

        var time = 0;
        if (index > 0) {
            time = 400;
        }

        $timeout(function () {
            $scope.gradingIndex = index;
            if (index <= $scope.state.students.length - 1) {
                $scope.gradeStudent($scope.state.students[index], false);
            } else {
                console.log('trying to grade too many!');
            }

            if ($scope.gradingIndex == $scope.state.students.length - 1) {
                $scope.gradingIndex = null;
            }
        }, time);

    };

    $scope.setAllGrades = function (grade) {
        for (var i = 0; i < $scope.editingStudentGrade.pattern.length; ++i) {
            $scope.editingStudentGrade.pattern[i].tone = grade;
        }
    };

    $scope.showAnnoyDialog = function () {
        $scope.goBackToBuild = false;
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/annoy.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function (whatToDo) {
                    $scope.showAnnoyThisTime = false;

                    if (whatToDo == 'save' && $scope.annoySource == 'search') {
                        $scope.doneEditingStudentSearch();
                    } else if (whatToDo == 'save' && $scope.annoySource == 'patterns') {
                        $scope.doneEditingStudentPattern();
                    } else if (whatToDo == 'cancel' && $scope.annoySource == 'search') {
                        $scope.cancelEditingStudentSearch();
                    } else if (whatToDo == 'cancel' && $scope.annoySource == 'patterns') {
                        $scope.cancelEditingStudentPattern();
                    }

                    $mdDialog.hide();
                };
            }
        });
    };

    $scope.showExitAppDialog = function () {
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/exit-app.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function (exit) {

                    if ($scope.clearCacheOnExit) {
                        $scope.state.settings.autoCache = false;
                        $scope.stopAutoCaching();
                        $scope.removeStateLocal();
                    }

                    if (exit) {
                        $window.close();
                    }

                    $mdDialog.hide();
                };
            }
        });
    };

    $scope.showSavedStateDialog = function () {
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/saved-state.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.dialogLoadLocal = function () {
                    $scope.restoreStateLocal();
                    $mdDialog.hide();
                };
                $scope.dialogRemoveLocal = function () {
                    delete $localStorage.commentBreeze;
                    $mdDialog.hide();
                };
            }
        });
    };

    $scope.showResetDialog = function () {
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,        // use parent scope in template
            preserveScope: true,  // do not forget this if use parent scope
            templateUrl: '/reset-app.html',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.resetApplication = function () {
                    $location.search('theme', null);
                    $location.search('tab', null);
                    $location.search('password', null);
                    $location.search('limit', null);
                    $scope.setInitialApplicationState();
                    $scope.setMobileSettings();
                    $scope.illToastToThat('Application reset');
                    $scope.setTheme();

                    if ($scope.clearCacheOnExit) {
                        $scope.removeStateLocal();
                    }

                    $mdDialog.hide();
                }
            }
        });
    };

    $scope.changeFilter = function() {
        //console.log('changing the filter to ' + $scope.toneFilterSetting);
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
        //console.log('done changing filter');
    };

    $scope.illToastToThat = function(text) {
        console.log('Toast: ' + text);
        $mdToast.show(
            {
                template: '<md-toast class="toast-style">' + text + '</md-toast>',
                position: 'bottom right'

                // it used to be like this but I don't think I need it this way anymore
                // will need to inject $document if we have to put this back for some reason
                //template: '<md-toast class="toast-style">' + text + '</md-toast>',
                //position: 'bottom right',
                //parent: $document[0].querySelector('#toastBounds')
            }
        );
    };

    $scope.addStudent = function (studentName) {

        if (studentName) {
            $scope.newStudentName = studentName;
        }

        if ($scope.newStudentName == null || $scope.newStudentName == '') {
            return;
        }

        var student = {};

        if ($scope.newStudentName.endsWith(' m') || $scope.newStudentName.endsWith(' M')) {
            student.gender = "male";
            student.name = $scope.newStudentName.replace(' m', '').replace(' M', '');
            //console.log('detected male');
        } else if ($scope.newStudentName.endsWith(' f') || $scope.newStudentName.endsWith(' F')) {
            student.gender = "female";
            student.name = $scope.newStudentName.replace(' f', '').replace(' F', '');
        } else if ($scope.state.enableNeutralGender && ($scope.newStudentName.endsWith(' n') || $scope.newStudentName.endsWith(' N'))) {
            student.gender = "neutral";
            student.name = $scope.newStudentName.replace(' n', '').replace(' N', '');
        } else {
            student.name = $scope.newStudentName;
            student.gender = $scope.gender;
            //console.log('Setting to default gender of ' + $scope.gender);
        }
        student.old_name = student.name;

        // make an id for this student, based on their name + 8 random characters
        student.student_id = student.name.replace(/\s+/g, '');
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var random = 0; random < 8; ++random) {
            student.student_id += '-' + possible.charAt(Math.floor(Math.random() * possible.length));
        }

        if ($scope.state.settings.newStudentFill == 'blank') {

            // start with blank pattern
            student.comment = '';

        } else if ($scope.state.settings.newStudentFill == 'random') {

            // start with totally random comment
            student.comment = $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceStudentName($scope.getRandomComments(), student.name, student.old_name), true), student.gender);

        } else if ($scope.state.settings.newStudentFill == 'default_pattern' && $scope.state.global_pattern.length > 0) {

            // start with global pattern, put global pattern on student
            student.comment = '';
            for (var i = 0; i < $scope.state.global_pattern.length; ++i) {
                student.comment += $scope.capitalizeFirstLetter($scope.getSmartSearchResult($scope.state.global_pattern[i]).found_comment + ' ');
            }
            student.comment = $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceStudentName(student.comment, student.name, student.old_name), true), student.gender);
            student.pattern = angular.copy($scope.state.global_pattern);
            student.pattern_type = 'global';

        }

        $scope.state.students.push(student);
        $scope.newStudentName = '';

        $scope.illToastToThat('Added student: ' + student.name + ' (' + student.gender + ')');

        $scope.buildAllStudentComments();
    };

    $scope.regenerateMultiStudentComment = function(student, forceRandom) {
        if (forceRandom || !student.pattern) {
            //console.log('regenerating random');
            student.comment = $scope.getRandomComments();
        } else {
            //console.log('regenerating based on pattern');
            student.comment = '';
            for (var i = 0; i < student.pattern.length; ++i) {
                var matchFound = $scope.getSmartSearchResult(student.pattern[i]).found_comment + ' ';
                //console.log('adding ' + matchFound + ' to ' + student.name);
                student.comment += matchFound;
                //student.comment += $scope.getSmartSearchResult(student.pattern[i]).found_comment + ' ';
            }
        }

        student.comment = $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceStudentName(student.comment, student.name, student.old_name)), student.gender);
        //console.log('regenerated student comment length: ' + student.comment.length);
    };


    $scope.regenerateAllStudentComments = function(random) {
        for (var i = 0; i < $scope.state.students.length; ++i) {
            $scope.regenerateMultiStudentComment($scope.state.students[i], random);
        }
    };

    $scope.applyGlobalToAll = function() {
        for (var i = 0; i < $scope.state.students.length; ++i) {
            $scope.state.students[i].pattern = angular.copy($scope.editingPattern);
            $scope.state.students[i].pattern_type = 'global';
            $scope.regenerateMultiStudentComment($scope.state.students[i]);
        }
        $scope.illToastToThat('Default pattern applied to all students');
    };

    $scope.getRandomComments = function(size) {
        var fullRandomComment = '';

        if (size == null) {
            size = $scope.state.settings.makeSomethingUpSize;
        }

        for (var i = 0; i < size; ++i) {
            var randomComment = $scope.comments[Math.floor(Math.random() * $scope.comments.length)];

            if ($scope.state.settings.avoidHer && $scope.gender != 'female' && (randomComment.comment_text.indexOf(' her ') > 0 || randomComment.comment_text.startsWith('Her') || randomComment.comment_text.endsWith(' her.'))) {
                --i;
                continue;
            }

            //console.log('Found random comment ' + randomComment.comment_id);

            if (fullRandomComment == '') {
                fullRandomComment = $scope.capitalizeFirstLetter(randomComment.comment_text);
            } else {
                fullRandomComment = fullRandomComment + ' ' + $scope.capitalizeFirstLetter(randomComment.comment_text)
            }

        }

        return fullRandomComment;
    };

    $scope.removeMultiStudent = function(student) {
        var index = $scope.state.students.indexOf(student);
        if (index > -1) {
            $scope.state.students.splice(index, 1);
        }

        $scope.buildAllStudentComments();
    };

    $scope.shuffleAllStudentComments = function() {
        for (var i = 0; i < $scope.state.students.length; ++i) {
            if ($scope.state.students[i].comment) {
                $scope.shuffleMultiStudentComment($scope.state.students[i]);
            }
        }
    };

    $scope.shuffleMultiStudentComment = function(student) {
        student.comment = $scope.shuffleText(student.comment);
    };

    $scope.shuffleText = function(text) {
        var sentences = text.match( /[^\.!\?]+[\.!\?]+/g );

        if (sentences && sentences.length > 1) {
            //console.log('Found ' + sentences.length + ' sentences');

            for (var j, x, i = sentences.length; i; j = Math.floor(Math.random() * i), x = sentences[--i], sentences[i] = sentences[j], sentences[j] = x) {
            }

            text = '';
            for (var k = 0; k < sentences.length; ++k) {
                if (text == '') {
                    text = sentences[k].trim();
                } else {
                    text = text + sentences[k].trim();
                }
            }
        }

        return text;
    };

    $scope.shuffleCommentBank = function() {
        for(var j, x, i = $scope.comments.length; i; j = Math.floor(Math.random() * i), x = $scope.comments[--i], $scope.comments[i] = $scope.comments[j], $scope.comments[j] = x) {}
        $scope.illToastToThat('Comment bank shuffled');
    };

    $scope.buildWholeStudentComment = function(student) {
        //console.log('building whole comment');
        student.whole_comment = '';
        if ($scope.state.introduction.length > 0) {
            student.whole_comment += $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceStudentName($scope.state.introduction, student.name, student.old_name), true), student.gender).trim() + ' ';
        }
        if (student.comment.length > 0) {
            student.whole_comment += student.comment.trim() + ' ';
        }
        if ($scope.state.conclusion.length > 0) {
            student.whole_comment += $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceStudentName($scope.state.conclusion, student.name, student.old_name), true), student.gender).trim();
        }

        //console.log('whole comment: ' + student.whole_comment);
    };

    $scope.buildAllStudentComments = function() {
        $scope.state.all_student_comments = '';
        for (var i = 0; i < $scope.state.students.length; ++i) {
            $scope.state.all_student_comments += $scope.state.students[i].name + ':\n\n';

            $scope.state.all_student_comments += '\t';
            if ($scope.state.introduction.length > 0) {
                $scope.state.all_student_comments += $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceStudentName($scope.state.introduction, $scope.state.students[i].name, $scope.state.students[i].old_name), true), $scope.state.students[i].gender).trim() + ' ';
            }
            if ($scope.state.students[i].comment.length > 0) {
                $scope.state.all_student_comments += $scope.state.students[i].comment.trim() + ' ';
            }
            if ($scope.state.conclusion.length > 0) {
                $scope.state.all_student_comments += $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceStudentName($scope.state.conclusion, $scope.state.students[i].name, $scope.state.students[i].old_name), true), $scope.state.students[i].gender).trim();
            }

            if (i < $scope.state.students.length - 1) {
                $scope.state.all_student_comments += '\n\n\n';
            } else {
                $scope.state.all_student_comments += '\n';
            }

            $scope.state.all_student_comments = $scope.state.all_student_comments.replace(/  +/g, ' ');
        }
    };

    $scope.editStudentWithSearch = function (student, goBackToBuild) {
        $scope.showAnnoyThisTime = true;
        $scope.goBackToBuild = goBackToBuild;
        $scope.editingStudentSearch = angular.copy(student);
        $scope.selectedTab = $scope.tabIndexes.search;
    };

    $scope.doneEditingStudentSearch = function () {
        for (var i = 0; i < $scope.state.students.length; ++i) {
            if ($scope.state.students[i].student_id == $scope.editingStudentSearch.student_id) {
                $scope.state.students[i] = $scope.editingStudentSearch;
                $scope.editingStudentSearch = null;
                if ($scope.goBackToBuild) {
                    $scope.selectedTab = $scope.tabIndexes.build;
                    $scope.goBackToBuild = false;
                }
                $scope.illToastToThat('Saved comment changes for ' + $scope.state.students[i].name);
                $scope.buildWholeStudentComment($scope.state.students[i]);
                $scope.studentToEditWithSearch = null;
                return;
            }
        }
        $scope.illToastToThat('Error saving student changes!');
    };

    $scope.cancelEditingStudentSearch = function () {
        if ($scope.goBackToBuild) {
            $scope.selectedTab = $scope.tabIndexes.build;
            $scope.goBackToBuild = false;
        }
        $scope.editingStudentSearch = null;
        $scope.studentToEditWithSearch = null;
    };

    $scope.doneEditingStudentPattern = function() {
        for (var i = 0; i < $scope.state.students.length; ++i) {
            if ($scope.state.students[i].student_id == $scope.editingStudentPattern.student_id) {
                $scope.state.students[i] = $scope.editingStudentPattern;
                $scope.editingStudentPattern = null;

                if ($scope.editingPattern.length > 0) {
                    $scope.state.students[i].pattern = angular.copy($scope.editingPattern);
                    $scope.editingPattern = [];
                    $scope.state.students[i].pattern_type = 'individual';
                }

                if ($scope.goBackToBuild) {
                    $scope.selectedTab = $scope.tabIndexes.build;
                    $scope.goBackToBuild = false;
                }
                $scope.illToastToThat('Saved pattern changes for ' + $scope.state.students[i].name);
                $scope.buildWholeStudentComment($scope.state.students[i]);
                $scope.studentToEditWithPattern = null;
                return;
            }
        }
        $scope.illToastToThat('Error saving student changes!');
    };

    $scope.cancelEditingStudentPattern = function () {
        if ($scope.goBackToBuild) {
            $scope.selectedTab = $scope.tabIndexes.build;
            $scope.goBackToBuild = false;
        }
        $scope.editingStudentPattern = null;
        $scope.studentToEditWithPattern = null;
    };

    $scope.applyGlobalPatternToStudent = function(student) {
        student.pattern = angular.copy($scope.state.global_pattern);
        $scope.regenerateMultiStudentComment(student, false);
        student.pattern_type = 'global';
    };

    $scope.editStudentWithPatterns = function (student, goBackToBuild) {
        $scope.showAnnoyThisTime = true;
        $scope.goBackToBuild = goBackToBuild;

        //console.log('Student comment length: ' + student.comment.length);

        $scope.editingStudentPattern = angular.copy(student);

        if ($scope.editingStudentPattern.pattern) {
            console.log('student already has pattern');
            $scope.editingPattern = angular.copy($scope.editingStudentPattern.pattern);
        } else if ($scope.editingStudentPattern.comment.length > 0) {
            //console.log('student does not have pattern, but does have comment');
            //console.log('Creating Multi Student Smart Search profile');
            // import the existing multi student sentence into smart search

            var sentences = $scope.editingStudentPattern.comment.match(/[^\.!\?]+[\.!\?]+/g);

            $scope.editingPattern = [];
            for (var i = 0; i < sentences.length; ++i) {
                //console.log(sentences[i]);
                $scope.editingPattern.push({search_text: '', found_comment: sentences[i].trim(), tone: 'Any'});
            }

        } else if ($scope.editingStudentPattern.comment.length == 0) {
            //console.log('student does not have pattern or comment');
            $scope.editingPattern = [];
        }
        //console.log('Editing student comment length: ' + $scope.editingStudentPattern.comment.length);
        //$scope.buildAllSmartSearchComments();

        $scope.editingStudentPattern.pattern_type = 'individual';

        $scope.selectedTab = $scope.tabIndexes.patterns;
        $scope.illToastToThat('Editing ' + $scope.editingStudentPattern.name + ' pattern.')
    };

    $scope.loadSampleSmartSearch = function() {
        $scope.editingPattern = [];
        $scope.editingPattern.push($scope.getSmartSearchResult({search_text: '', found_comment: '', tone: 'Positive'}));
        $scope.editingPattern.push($scope.getSmartSearchResult({search_text: 'reading', found_comment: '', tone: 'Any'}));
        $scope.editingPattern.push($scope.getSmartSearchResult({search_text: 'behavior', found_comment: '', tone: 'Any'}));
        $scope.editingPattern.push($scope.getSmartSearchResult({search_text: 'speaking', found_comment: '', tone: 'Any'}));
        $scope.editingPattern.push($scope.getSmartSearchResult({search_text: 'comprehension', found_comment: '', tone: 'Any'}));
        $scope.editingPattern.push($scope.getSmartSearchResult({search_text: 'phonics', found_comment: '', tone: 'Any'}));
        $scope.editingPattern.push($scope.getSmartSearchResult({search_text: 'writing', found_comment: '', tone: 'Any'}));
        $scope.editingPattern.push($scope.getSmartSearchResult({search_text: '', found_comment: '', tone: 'Positive'}));
        $scope.buildAllSmartSearchComments();
    };

    $scope.reloadWithLimit = function(limit) {
        if (limit != null) {
            $scope.commentSizeToGet = 0;
        } else {
            $scope.commentSizeToGet = $scope.state.settings.reduceCommentsSize;
        }
        $scope.getComments(true);
    };

    $scope.formatNumber = function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    $scope.getSmartSearchResult = function(search, getResultCount) {

        // if there are no working search parameters passed then do not actually count the results, it's pointless!
        if (getResultCount && search.tone == 'Any' && search.search_text == '') {
            getResultCount = false;
        }

        //if (getResultCount) {
        //    console.log('getting count');
        //} else {
        //    console.log('not getting count');
        //}

        search.found_comment = '';

        //console.log('search text: ' + search.search_text);

        // we start looking at a random starting point so that we don't end up getting the same comments for every search
        var randomStartingPoint = Math.floor((Math.random() * $scope.comments.length));
        //console.log('Starting at random index ' + randomStartingPoint);

        var searchResults = 0;
        for (var i = randomStartingPoint; i < $scope.comments.length + randomStartingPoint; ++i) {

            var index = i;
            if (index >= $scope.comments.length) {
                index -= $scope.comments.length;
            }

            if ($scope.state.settings.avoidHer && $scope.gender != 'female' && ($scope.comments[index].comment_text.indexOf(' her ') > 0 || $scope.comments[index].comment_text.startsWith('Her') || $scope.comments[index].comment_text.endsWith(' her.'))) {
                continue;
            }

            if ((search.tone == 'Positive' && $scope.comments[index].pos_neg != 1) || (search.tone == 'Neutral' && $scope.comments[index].pos_neg != 0) || (search.tone == 'Negative' && $scope.comments[index].pos_neg != -1)) {
                continue;
            }

            if ($scope.comments[index].comment_text.toLowerCase().indexOf(search.search_text) < 0 && (!$scope.comments[index].hasOwnProperty('tags') || $scope.comments[index].tags.indexOf(search.search_text) < 0)) {
                continue;
            }

            //console.log('Searched ' + i + ' comments');
            //console.log('Found comment matching search: ' + $scope.comments[index].comment_text);

            ++searchResults;
            if (!getResultCount) {
                search.found_comment = $scope.capitalizeFirstLetter($scope.comments[index].comment_text).trim();
                break;
            } else if (search.found_comment == '') {
                search.found_comment = $scope.capitalizeFirstLetter($scope.comments[index].comment_text).trim();
            }
        }

        if (getResultCount) {
            search.result_count = searchResults;
        } else {
            delete search.result_count;
        }

        return angular.copy(search);
    };

    $scope.resubmitSearch = function(search, getResultCount) {
        //console.log('resubmitting search for ' + search.search_text);
        //console.log('getResultCount ? ' + getResultCount);
        var newSearch = $scope.getSmartSearchResult(search, getResultCount);
        search.found_comment = newSearch.found_comment;
        if (getResultCount) {
            //console.log('result count for new search parameters: ' + newSearch.result_count);
            search.result_count = newSearch.result_count;
        }
    };

    $scope.shuffleSmartSearch = function() {
        for(var j, x, i = $scope.editingPattern.length; i; j = Math.floor(Math.random() * i), x = $scope.editingPattern[--i], $scope.editingPattern[i] = $scope.editingPattern[j], $scope.editingPattern[j] = x) {}
        $scope.buildAllSmartSearchComments();
    };

    $scope.buildAllSmartSearchComments = function() {
        //console.log('building smart search comments start length ' + $scope.editingStudentPattern.comment.length);
        if ($scope.editingStudentPattern != null) {
            $scope.editingStudentPattern.comment = '';
            for (var i = 0; i < $scope.editingPattern.length; ++i) {
                //var foundComment = $scope.editingPattern[i].found_comment;
                //console.log('Pattern piece ' + i + ' match: ' + foundComment);

                //$scope.editingStudentPattern.comment += $scope.capitalizeFirstLetter(foundComment).trim() + ' ';
                //console.log('Editing student comment length: ' + $scope.editingStudentPattern.comment.length);
                $scope.editingStudentPattern.comment += $scope.capitalizeFirstLetter($scope.editingPattern[i].found_comment).trim() + ' ';
            }
            $scope.editingStudentPattern.comment = $scope.fixGenderPronouns($scope.replaceClassName($scope.replaceStudentName($scope.editingStudentPattern.comment, $scope.editingStudentPattern.name, $scope.editingStudentPattern.old_name)), $scope.editingStudentPattern.gender).trim();
        }
        //console.log('building smart search comments end length ' + $scope.editingStudentPattern.comment.length);
    };

    //$scope.justMakeSomethingUpSmartSearch = function() {
    //    $scope.state.global_pattern = [];
    //    for (var i = 0; i < $scope.state.settings.makeSomethingUpSize; ++i) {
    //        $scope.state.global_pattern.push($scope.getSmartSearchResult($scope.newPatternPiece));
    //    }
    //    $scope.buildAllSmartSearchComments();
    //};

    $scope.regenerateAllSmartSearch = function() {
        //console.log('Regenerating ' + $scope.state.global_pattern.length + ' searches');
        for (var i = 0; i < $scope.editingPattern.length; ++i) {
            $scope.editingPattern[i].found_comment = $scope.getSmartSearchResult($scope.state.global_pattern[i]).found_comment;
        }
        $scope.buildAllSmartSearchComments();
    };

    $scope.removeAllPatternPieces = function() {
        $scope.editingPattern = [];
    };

    $scope.removeAllMultiStudents = function() {
        $scope.state.students = [];
        $scope.state.all_student_comments = '';
    };

    $scope.setMobileSettings = function() {
        if ($mdMedia('xs') || $mdMedia('sm')) {
            $scope.isMobile = true;
            $scope.state.settings.tabSwipe = true;
            $scope.state.settings.showTooltips = false;
            $scope.state.settings.showEditButtons = false;
        }

        if ($mdMedia('xs')) {
            $scope.commentSizeToGet = 2000;
            $scope.state.settings.showTags = false;
            //$scope.state.settings.showTone = false;
        } else if ($mdMedia('sm')) {
            $scope.commentSizeToGet = 6000;
        }
    };

    $scope.collapseOrExpandAllStudents = function() {
        if ($scope.showAllStudents) {
            for (var i = 0; i < $scope.state.students.length; ++i) {

                // there is a bug where if you hide then show text areas they will not expand to their full size if they were not visible in the viewport at the time of show
                // this just adds a space and then removes it and it seems to do the trick
                $scope.state.students[i].comment = $scope.state.students[i].comment + ' ';
                $scope.state.students[i].comment = $scope.state.students[i].comment.substring(0, $scope.state.students[i].comment.length - 1);

                $scope.state.students[i].collapsed = false;
            }
        } else {
            for (var j = 0; j < $scope.state.students.length; ++j) {
                $scope.state.students[j].collapsed = true;
            }
        }
    };

    $scope.selectTab = function() {

        // set the search locations
        if ($scope.selectedTab == $scope.tabIndexes.main_page) {
            //console.log('tab selected : main_page');
            $location.search('tab', null);
        } else if ($scope.selectedTab == $scope.tabIndexes.search) {
            //console.log('tab selected : single_student');
            $location.search('tab', 'search');
        } else if ($scope.selectedTab == $scope.tabIndexes.build) {
            //console.log('tab selected : multi_student');
            $location.search('tab', 'build');
        } else if ($scope.selectedTab == $scope.tabIndexes.patterns) {
            //console.log('tab selected : smart_search');
            $location.search('tab', 'patterns');

            if ($scope.editingStudentPattern == null) {
                $scope.editingPattern = $scope.state.global_pattern;
            }

        } else if ($scope.selectedTab == $scope.tabIndexes.settings) {
            //console.log('tab selected : settings');
            $location.search('tab', 'settings');
        } else if ($scope.selectedTab == $scope.tabIndexes.donate) {
            //console.log('tab selected : donate');
            $location.search('tab', 'donate');
        }

        // maybe save the global pattern when we switch off this tab
        if ($scope.selectedTab != $scope.tabIndexes.patterns && $scope.editingPattern.length > 0 && !$scope.editingStudentPattern) {
            $scope.state.settings.newStudentFill = 'default_pattern';
            $scope.state.global_pattern = angular.copy($scope.editingPattern);
        }

        // annoy the user if they switched off of search while a student was being edited
        if ($scope.selectedTab != $scope.tabIndexes.search && $scope.editingStudentSearch && $scope.state.settings.showAnnoy && $scope.showAnnoyThisTime) {
            $scope.annoySource = 'search';
            $scope.showAnnoyDialog();
        }

        // annoy the user if they switched off of patterns while a student was being edited
        if ($scope.selectedTab != $scope.tabIndexes.patterns && $scope.editingStudentPattern && $scope.state.settings.showAnnoy && $scope.showAnnoyThisTime) {
            $scope.annoySource = 'patterns';
            $scope.showAnnoyDialog();
        }

    };

    $scope.setTab = function() {
        var params = $location.search();
        if (params.tab == 'search') {
            $scope.selectedTab = $scope.tabIndexes.search;
        } else if (params.tab == 'build') {
            $scope.selectedTab = $scope.tabIndexes.build;
        } else if (params.tab == 'patterns') {
            $scope.selectedTab = $scope.tabIndexes.patterns;
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

    $scope.saveState = function () {
        $scope.toJSON = '';
        $scope.toJSON = angular.toJson($scope.state, true);
        var blob = new Blob([$scope.toJSON], { type:"application/json;charset=utf-8;" });
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href', window.URL.createObjectURL(blob));

        // all this just to get the date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0
        var yyyy = today.getFullYear();
        if(dd<10) {
            dd='0'+dd
        }
        if(mm<10) {
            mm='0'+mm
        }
        today = yyyy+'-'+mm+'-'+dd;

        var fileName;
        if ($scope.state.class_name != '') {
            fileName = 'Comment Breeze Save File - ' + $scope.state.class_name + ' ' + today + '.txt';
        } else {
            fileName = 'Comment Breeze Save File - ' + today + '.txt';
        }

        downloadLink.attr('download', fileName);
        downloadLink[0].click();
    };

    $scope.saveComments = function () {
        $scope.buildAllStudentComments();
        var blob = new Blob([$scope.state.all_student_comments], {type: "text/html;charset=utf-8;"});
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href', window.URL.createObjectURL(blob));

        // all this just to get the date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        today = yyyy + '-' + mm + '-' + dd;

        var fileName;
        if ($scope.state.class_name != '') {
            fileName = 'Comment Breeze Comments - ' + $scope.state.class_name + ' ' + today + '.txt';
        } else {
            fileName = 'Comment Breeze Comments - ' + today + '.txt';
        }

        downloadLink.attr('download', fileName);
        downloadLink[0].click();
    };

    $scope.loadState = function (state) {
        $scope.state = JSON.parse(state);
    };

    $scope.getTheme = function () {
        var params = $location.search();
        if (params.theme) {
            $scope.setTheme(params.theme);
        } else {
            $scope.setTheme($scope.defaultColorTheme);
        }
    };

    $scope.setTheme = function (theme) {

        if (!theme) {
            theme = $scope.defaultColorTheme;
        }

        $scope.state.theme.colorTheme = theme;

        // only store the theme in the url if it's not the default
        if (theme == $scope.defaultColorTheme) {
            $location.search('theme', null);
        } else {
            $location.search('theme', theme.toString());
        }

        var primaryColor; // used for highlighting text, usually should be just the md-primary color
        var altBackgroundColor; // used on alternating rows, slightly darker or lighter than background hue-3
        var positiveColor; // color for positive comments icon
        var negativeColor; // color for negative comments icon
        var neutralColor; // color for neutral comments icon
        var unratedColor; // color for unrated comments
        var tooltipsFontColor;
        var textColor; // color of the text on the background or alt background

        // still have to set some colors that we want in ways angular material palettes don't support
        if (theme == 'darkula') {
            primaryColor = '#FFA000';
            altBackgroundColor = '#393939';
            positiveColor = '#FFA000';
            negativeColor = '#673AB7';
            neutralColor = '#A9B7C6';
            unratedColor = '#000000';
            tooltipsFontColor = '#000000';
            textColor = '#E0E0E0';
        } else if (theme == 'breezy') {
            primaryColor = '#1976D2';
            altBackgroundColor = '#B0BEC5';
            positiveColor = '#1976D2';
            negativeColor = '#F44336';
            neutralColor = '#9E9E9E';
            unratedColor = '#212121';
        } else if (theme == 'prince') {
            primaryColor = '#673AB7';
            altBackgroundColor = '#B39DDB';
            positiveColor = '#7B1FA2';
            negativeColor = '#EC407A';
            neutralColor = '#9575CD';
            unratedColor = '#78909C';
        } else if (theme == 'matrix') {
            primaryColor = '#4CAF50';
            altBackgroundColor = '#191919';
            positiveColor = '#4CAF50';
            negativeColor = '#4CAF50';
            neutralColor = '#4CAF50';
            unratedColor = '#4CAF50';
            tooltipsFontColor = '#000000';
            textColor = '#4CAF50';
        } else if (theme == 'grass') {
            primaryColor = '#2E7D32';
            altBackgroundColor = '#A5D6A7';
            positiveColor = '#42A5F5';
            negativeColor = '#0D47A1';
            neutralColor = '#78909C';
            unratedColor = '#455A64';
        } else if (theme == 'adventure') {
            primaryColor = '#1565C0';
            altBackgroundColor = '#A5D6A7';
            positiveColor = '#FFEB3B';
            negativeColor = '#512DA8';
            neutralColor = '#9E9E9E';
            unratedColor = '#E0E0E0';
            tooltipsFontColor = '#FFFFFF';
        } else if (theme == 'brownie') {
            primaryColor = '#3E2723';
            altBackgroundColor = '#8D6E63';
            positiveColor = '#D7CCC8';
            negativeColor = '#D7CCC8';
            neutralColor = '#D7CCC8';
            unratedColor = '#D7CCC8';
            textColor = '#D7CCC8';
            tooltipsFontColor = '#5D4037';
        }

        $scope.state.theme.highlightColor = {
            'color': primaryColor
        };
        $scope.state.theme.altBackgroundColor = {
            'background-color': altBackgroundColor
        };
        $scope.state.theme.positiveColor = {
            'color': positiveColor
        };
        $scope.state.theme.negativeColor = {
            'color': negativeColor
        };
        $scope.state.theme.neutralColor = {
            'color': neutralColor
        };
        $scope.state.theme.unratedColor = {
            'color': unratedColor
        };
        if (tooltipsFontColor) {
            $scope.state.theme.tooltips = {
                'color': tooltipsFontColor,
                'font=weight': 'bold'
            };
        } else {
            $scope.state.theme.tooltips = {
                'font=weight': 'bold'
            };
        }
        if (textColor) {
            $scope.state.theme.textColor = {
                'color': textColor
            };
        } else {
            $scope.state.theme.textColor = {};
        }

    };

    $scope.getAltBackgroundColor = function (even) {
        if (even) {
            return $scope.state.theme.altBackgroundColor;
        } else {
            return {};
        }
    };

    $scope.showStats = function () {

        if ($scope.stats) {
            $scope.showDialog('/stats.html');
        } else {
            $http.get('/rest/comments/stats').success(function (data) {
                $scope.stats = data;
                $scope.showDialog('/stats.html');
            }).error(function () {
                $scope.illToastToThat('Error getting stats');
            });
        }

    };

    $scope.confirmSeizures = function (ev) {
        var confirm = $mdDialog.confirm()
            .title('Seizure Mode')
            .textContent('Are you sure you want to do this? The screen will flash rapidly.')
            .ariaLabel('Start Seizure Mode')
            .targetEvent(ev)
            .ok('DO IT!')
            .cancel('Cancel');
        $mdDialog.show(confirm).then(function () {
            $scope.startSeizures();
        }, function () {

        });
    };

    // for testing only so I can get to things I want without making everything up repeatedly
    $scope.loadSampleState = function () {
        $scope.addStudent('Jimmy M');
        $scope.addStudent('Amanda F');
        $scope.addStudent('Alex M');
        $scope.addStudent('Jenny F');
        $scope.loadSampleSmartSearch();
    };

    $scope.saveStateLocal = function (requireStudents) {
        if (!requireStudents || (requireStudents && $scope.state.students.length > 0)) {
            console.log('saving local state');
            $localStorage.commentBreeze = angular.toJson($scope.state);
            $scope.cachedComments = true;
        }
    };

    $scope.restoreStateLocal = function () {
        console.log('loading local state');
        $scope.state = angular.fromJson($localStorage.commentBreeze);
        $scope.illToastToThat('Cached comments restored');
    };

    $scope.removeStateLocal = function () {
        console.log('removing local state');
        $scope.cachedComments = false;
        delete $localStorage.commentBreeze;
    };

    $scope.checkLocalState = function () {
        var localState = angular.fromJson($localStorage.commentBreeze);
        if (localState) {
            $scope.cachedComments = {
                class_name: angular.copy(localState.class_name),
                students: angular.copy(localState.students.length),
                date_created: angular.copy(localState.date_created)
            };
            $scope.showSavedStateDialog();
        }
    };

    $scope.autoCacheCheckboxChanged = function () {
        if ($scope.state.settings.autoCache) {
            $scope.startAutoCaching();
        } else {
            $scope.stopAutoCaching();
        }
    };

    $scope.changeCacheInterval = function () {
        var revertToState = $scope.state.settings.autoCache;
        $scope.state.settings.autoCache = false;
        $scope.stopAutoCaching();
        $scope.state.settings.autoCache = revertToState;
        $scope.startAutoCaching();
    };

    $scope.autoCacheInterval = null;
    $scope.startAutoCaching = function () {
        if ($scope.state.settings.autoCache) {
            console.log('starting auto caching');
            $scope.autoCacheInterval = $interval(function () {
                $scope.saveStateLocal(true);
            }, ($scope.state.settings.cacheInterval * 1000))
        }
    };

    $scope.stopAutoCaching = function () {
        if (!$scope.state.settings.autoCache) {
            console.log('stopping auto caching');
            if (angular.isDefined($scope.autoCacheInterval)) {
                $interval.cancel($scope.autoCacheInterval);
                $scope.autoCacheInterval = undefined;
            }
        }
    };

    $scope.setInitialApplicationState();
    $scope.setPassword();
    $scope.setTab();
    $scope.setMobileSettings();
    $scope.getComments();
    $scope.getTheme();
    $scope.checkLocalState();
    $scope.startAutoCaching();

});