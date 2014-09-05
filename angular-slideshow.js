'use strict';

angular.module('iln-slideshow')
    /**
     * The slideshow directive controller
     */
    .controller( 'SlideshowCtrl', [
        '$scope',
        '$compile',
        '$timeout',
        '$rootScope',
        function( $scope, $compile, $timeout, $rootScope ) {

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
                slide_data = $rootScope.SLIDES_JSON.slides;
                max_slide = ( slide_data.length ) - 1;

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

            // call the next slide
            $scope.menuPress = function( _slide ){

                if( _slide !== current_slide  && !slide_transitioning ){

                    if( _slide <= current_slide ){
                        animation_direction = '-reverse';
                    }else{
                        animation_direction = '';
                    }

                    next_slide = _slide;
                    slide_transitioning = true;
                    $scope.animateOutCurrentSlide();
                }
            };

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

            $scope.animateOutCurrentSlide = function(){
                // css animate out the slide
                $scope.animateSlideCss = 'slide-animate-out' + animation_direction;

                $timeout(function(){
                    // remove the css
                    $scope.animateSlideCss = 'space';
                    // slide has animated out remove current slide
                    $scope.removeSlide();
                }, 700);

            };
            $scope.removeSlide = function(){

                angular.element(
                    document.getElementById('slide' + String( current_slide ))
                ).remove();

                // give the dom some time to click over and add in the next slide
                $timeout(function(){
                    // slide has animated out remove current slide
                    $scope.animateInNextSlide( next_slide );
                }, 100);
            };

            $scope.animateInNextSlide = function( _next ){

                current_slide = _next;

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
                    // global slide complete
                    $rootScope.$broadcast('slideTransitionComplete', current_slide);
                }, 100);

            };

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

            $scope.$on( 'keypressNext', function(){
                $scope.nextSlide();
            });

            $scope.$on( 'keypressPrev', function(){
                $scope.prevSlide();
            });

            $scope.init();

        }
    ])
    /**
     * The controller for the pagination navigation
     */
    .controller( 'SlideshowPaginationCtrl', [
        '$scope',
        '$rootScope',
        function( $scope, $rootScope ) {

            $scope.slide_data = {};
            $scope.current_slide = 0;

            $scope.init = function(){
                $scope.slide_data = $rootScope.SLIDES_JSON.slides;
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
    .controller( 'SlideshowSlideCtrl', [
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
            controller: 'SlideshowCtrl',
            templateUrl: 'slides/slideshow.html'
        };
    })
    /**
     * The directive for the pagination button
     */
    .directive('ilnSlideshowPagination', function() {
        return {
            restrict: 'E',
            controller: 'SlideshowPaginationCtrl',
            templateUrl: 'slides/pagination.html'
        };
    })
    /**
     * The directive for the individual slide
     */
    .directive('ilnSlideshowSlide', function() {
        return {
            restrict: 'E',
            controller: 'SlideshowSlideCtrl',
            templateUrl: function( elem, attrs ) {
               return attrs.templateUrl || 'slides/slide.html'
           }
        };
    })
;
