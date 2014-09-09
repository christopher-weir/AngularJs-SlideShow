'use strict';

angular.module('iln-slideshow', [])


    .factory('$IlnSlideshow', [
        '$http',
        function( $http ) {

            var slideData       = {};
            var currentSlide    = 0;
            var nextSlide       = 0;
            var maxSlides       = 0;
            var minSlides       = 0;

            // Slideshow factory functions
            function setSlideShowData( _data ){
                slideData = _data;
                console.log( slideData );
            }

            function setSlideShowDataAjax( _data, callback ){
                slideData = _data;
                return callback();
            }

            function getSlideShowData(){
                return slideData;
            }

            function callNextSlide(){
                console.log('next');
            }

            function callPreviousSlide(){
                console.log('prev');
            }

            function goToSlide( _slide ){
                console.log('go to :' + _slide);
            }

            var service = {
                setSlideShowData        : setSlideShowData,
                setSlideShowDataAjax    : setSlideShowDataAjax,
                getSlideShowData        : getSlideShowData,
                callNextSlide           : callNextSlide,
                callPreviousSlide       : callPreviousSlide,
                goToSlide               : goToSlide
            };

            return service;
        }
    ])

    /**
     * The slideshow directive controller
     */
    .controller( 'IlnSlideshowCtrl', [
        '$scope',
        '$compile',
        '$timeout',
        '$rootScope',
        '$IlnSlideshow',
        function( $scope, $compile, $timeout, $rootScope, $IlnSlideshow ) {

            var current_slide = 0;
            var next_slide = 0;
            var max_slide = 0;
            var min_slide = 0;
            var slide_data = {};
            var slide_transitioning = false;
            var animation_direction = '';

            $scope.animateSlideCss = '';


            // load first slide
            $scope.init = function(){
                // get the json data for the slides
                // TODO make this different mb a service?
                slide_data = $scope.SLIDES_JSON().slides;
                console.log(slide_data);
                // get and set the max number of slides
                max_slide = ( slide_data.length ) - 1;
                // load up the first slide
                $scope.animateInNextSlide( 0 );
            };

            // call the next slide
            $scope.nextSlide = function(){

                if( current_slide !== max_slide && !slide_transitioning ){
                    next_slide = current_slide + 1;
                    slide_transitioning = true;
                    animation_direction = '';
                    $scope.animateOutCurrentSlide();
                }

                if( current_slide === max_slide && !slide_transitioning ){
                    next_slide = 0;
                    slide_transitioning = true;
                    animation_direction = '';
                    $scope.animateOutCurrentSlide();
                }
            };

            // call the previous slide
            $scope.prevSlide = function(){
                if( current_slide !== min_slide && !slide_transitioning ){
                    next_slide = current_slide - 1;
                    slide_transitioning = true;
                    animation_direction = '-reverse';
                    $scope.animateOutCurrentSlide();
                }

                if( current_slide === min_slide && !slide_transitioning ){
                    next_slide = max_slide;
                    slide_transitioning = true;
                    animation_direction = '-reverse';
                    $scope.animateOutCurrentSlide();
                }
            };

            // animatie out the current slde
            $scope.animateOutCurrentSlide = function(){
                // css animate out the slide
                $scope.animateSlideCss = 'slide-animate-out' + animation_direction;

                // animation out offset
                var animationOutOffset = ( slide_data[ current_slide ].out_offset ) ? 1000 : 1000;

                console.log( animationOutOffset );

                $timeout(function(){
                    // remove the css
                    $scope.animateSlideCss = 'space';
                    // slide has animated out remove current slide
                    $scope.removeSlide();
                }, 1000);

            };

            // fully remove the current slide from the dom
            $scope.removeSlide = function(){

                // remove and clear current slide
                angular.element(
                    document.getElementById('slide' + String( current_slide ))
                ).remove();

                // give the dom some time to click over and add in the next slide
                $timeout(function(){
                    // slide has animated out remove current slide
                    $scope.animateInNextSlide( next_slide );
                }, 10);
            };

            // animate in the next slide
            $scope.animateInNextSlide = function( _next ){
                // set the new current slide
                current_slide = _next;
                // add in the new directive
                angular.element(
                    document.getElementById('slide-container')
                ).append(
                    $compile(
                        '<iln-slideshow-slide id="slide' +
                            String( current_slide ) +
                        '" template-url="' +
                            slide_data[ current_slide ].template +
                        '"></iln-slideshow-slide>')($scope));

                // give the dom some time to click over and add in the animation
                $timeout(function(){
                    slide_transitioning = false;
                    // set the animation
                    $scope.animateSlideCss = 'slide-animate-in' + animation_direction;
                    // broadcast global slide complete
                    $rootScope.$broadcast('slideTransitionComplete', current_slide);
                }, 10);

            };

            // jump to a specific slide
            $scope.$on( 'jumpToSlide', function( _s, _data ){
                next_slide = _data;

                if( next_slide <= current_slide ){
                    animation_direction = '-reverse';
                }else{
                    animation_direction = '';
                }

                slide_transitioning = true;
                $scope.animateOutCurrentSlide();
            });

            // track next press
            $scope.$on( 'keypressNext', function(){
                $scope.nextSlide();
            });

            // track prev press
            $scope.$on( 'keypressPrev', function(){
                $scope.prevSlide();
            });

            // init the directive
            $scope.init();
        }
    ])
    /**
     * The controller for the pagination navigation
     */
    .controller( 'IlnSlideshowPaginationCtrl', [
        '$scope',
        '$rootScope',
        function( $scope, $rootScope ) {

            $scope.slide_data = {};
            $scope.current_slide = 0;

            $scope.init = function(){
                // $scope.slide_data = $rootScope.SLIDES_JSON.slides;
            };

            $scope.goToSlide = function( _index ){

                if( $scope.current_slide !== _index ){
                    $rootScope.$broadcast('jumpToSlide', _index);
                }
            };

            $scope.isActive = function( _index ){
                if( _index <= $scope.current_slide ){
                    return 'active';
                }else{
                    return '';
                }
            };

            $scope.$on( 'slideTransitionComplete', function( _s, _data ){

                $scope.current_slide = _data;
            });

            $scope.init();
        }
    ])
    /**
     * The controller for the individual slide
     */
    .controller( 'IlnSlideshowSlideCtrl', [
        '$scope',
        function( $scope ) {

            $scope.$on('$destroy', function() {
                console.log('removed');
            });


        }
    ])
    /**
     * The directive for the slideshow wrapper
     */
    .directive('ilnSlideshow', function() {
        return {
            restrict: 'E',
            controller: 'IlnSlideshowCtrl',
            template: '<section id="slideshow"><div id="slide-container" ng-class="animateSlideCss"></div><button id="slide-next" class="nav-arrow" ng-click="nextSlide()"></button><button id="slide-previous" class="nav-arrow" ng-click="prevSlide()"></button><nav class="pagination"><iln-slideshow-pagination></iln-slideshow-pagination></nav></section>',
            scope: { SLIDES_JSON: '&slideJson' }

        };
    })
    /**
     * The directive for the pagination button
     */
    .directive('ilnSlideshowPagination', function() {
        return {
            restrict: 'E',
            controller: 'IlnSlideshowPaginationCtrl',
            template: '<div></div>'
        };
    })
    /**
     * The directive for the individual slide
     */
    .directive('ilnSlideshowSlide', function() {
        return {
            restrict: 'E',
            controller: 'IlnSlideshowSlideCtrl',
            templateUrl: function( elem, attrs ) {
               return attrs.templateUrl || 'slides/slide.html';
            }
        };
    })
;
