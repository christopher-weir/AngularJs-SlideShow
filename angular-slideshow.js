'use strict';

angular.module('iln-slideshow', [])


    .factory('$IlnSlideshow', [
        '$rootScope',
        function( $rootScope ) {

            var slides          = [];
            var currentSlide    = 0;
            var nextSlide       = 0;
            var maxSlides       = 0;
            var minSlides       = 0;

            // Slideshow factory functions
            function setCurrentSlide( _slide ){
                currentSlide = _slide;
            }

            function setNextSlide(){
                return nextSlide;
            }

            function setSlideData( _data, callback ){
                slides = _data;
                maxSlides = ( slides.length ) - 1;

                 console.log( maxSlides );
                return callback();
            }

            function getSlideData( _slide ){
                return slides[ _slide ];
            }

            function getCurrentSlide(){
                return currentSlide;
            }

            function getNextSlide(){
                return nextSlide;
            }

            function callNextSlide(){
                console.log('callNextSlide');

                if( currentSlide !== maxSlides ){
                    nextSlide = currentSlide + 1;
                    goToSlide( nextSlide );
                }

                if( currentSlide === maxSlides ){
                    nextSlide = 0;
                    goToSlide( nextSlide );
                }

            }

            function callPreviousSlide(){

                if( currentSlide !== minSlides ){
                    nextSlide = currentSlide - 1;
                    goToSlide( nextSlide );
                }

                if( currentSlide === minSlides ){
                    nextSlide = maxSlides;
                    goToSlide( nextSlide );
                }
            }

            function goToSlide( _slide ){
                console.log('go to :' + _slide);

                $rootScope.$broadcast('IlnSlideshowGoToSlide', _slide);

            }

            var service = {
                setSlideData            : setSlideData,
                getSlideData            : getSlideData,
                setCurrentSlide         : setCurrentSlide,
                getCurrentSlide         : getCurrentSlide,
                setNextSlide            : setNextSlide,
                getNextSlide            : getNextSlide,
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

            var slide_transitioning = false;
            var slide_init  = true;

            $scope.animateSlideCss = '';


            // load first slide
            $scope.init = function(){
                // set the slideshow data
                // when complete call the first slide

                if( $scope.SLIDES_JSON().images ){
                    preloadImages( $scope.SLIDES_JSON().images );
                }

                $IlnSlideshow.setSlideData( $scope.SLIDES_JSON().slides, function(){
                    $IlnSlideshow.goToSlide( 0 );
                });

            };

            // call the next slide
            $scope.nextSlide = function(){
                console.log('press');
                if( !slide_transitioning ){
                    slide_transitioning = true;
                    $IlnSlideshow.callNextSlide();
                }
            };

            // call the next slide
            $scope.previousSlide = function(){
                if( !slide_transitioning ){
                    slide_transitioning = true;
                    $IlnSlideshow.callPreviousSlide();
                }
            };

            // animatie out the current slde
            $scope.animateOutCurrentSlide = function(){
                // css animate out the slide
                $scope.animateSlideCss = 'slide-animate-out';

                // animation out offset
                // var animationOutOffset = ( slide_data[ current_slide ].out_offset ) ? 1000 : 1000;
                // console.log( animationOutOffset );

                $timeout(function(){
                    // remove the css
                    $scope.animateSlideCss = '';
                    // slide has animated out remove current slide
                    $scope.removeSlide();
                }, 1000);

            };

            // fully remove the current slide from the dom
            $scope.removeSlide = function(){

                // remove and clear current slide
                angular.element(
                    document.getElementById('iln-slide-wrap-' + String( $IlnSlideshow.getCurrentSlide() ))
                ).remove();

                // give the dom some time to click over and add in the next slide
                $timeout(function(){
                    // slide has animated out remove current slide
                    $scope.animateInNextSlide( $IlnSlideshow.getNextSlide() );
                }, 10);
            };

            // animate in the next slide
            $scope.animateInNextSlide = function( _next ){
                // set the new current slide
                $IlnSlideshow.setCurrentSlide( _next );
                // add in the new directive
                console.log('add');
                console.log($IlnSlideshow.getSlideData( $IlnSlideshow.getCurrentSlide() ));

                angular.element(
                    document.getElementById('iln-slide-container')
                ).append(
                    $compile(
                        '<iln-slideshow-slide id="iln-slide-wrap-' +
                            String( $IlnSlideshow.getCurrentSlide() ) +
                        '" template-url="' +
                            // this might not work check
                            $IlnSlideshow.getSlideData( $IlnSlideshow.getCurrentSlide() ).template +

                        '"></iln-slideshow-slide>')($scope));

                // give the dom some time to click over and add in the animation
                $timeout(function(){
                    slide_transitioning = false;
                    // set the animation
                    $scope.animateSlideCss = 'slide-animate-in';
                    // broadcast global slide complete
                    $rootScope.$broadcast('slideTransitionComplete', $IlnSlideshow.getCurrentSlide() );
                }, 10);

            };

            // jump to a specific slide
            $scope.$on( 'IlnSlideshowGoToSlide', function( _s, _data ){
                // next_slide = _data;

                // slide_transitioning = true;
                // $scope.animateOutCurrentSlide();

                if( slide_init ){
                    slide_init = false;
                    $scope.animateInNextSlide( _data );
                }else{
                    $scope.animateOutCurrentSlide();
                }

            });


            // preload images
            function preloadImages( _data ){

                // add a holder for the preloader
                angular.element(
                    document.body
                ).append('<div id="iln-img-preload" style="display:none;"></div>');

                var slideImages = _data;
                for( var i = 0; i < slideImages.length; i++ ){
                    angular.element(
                        document.getElementById('iln-img-preload')
                    ).append('<img src="' + slideImages[i] + '" width="1" height="1"></img>');

                    // remove container on last image
                    if( i === slideImages.length - 1 ){
                        angular.element(
                            document.getElementById('iln-img-preload')
                        ).remove();
                    }
                }
            }

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
            template: '<section id="iln-slideshow"><div id="iln-slide-container" ng-class="animateSlideCss"></div><button id="iln-slide-next" class="nav-arrow" ng-click="nextSlide()"></button><button id="iln-slide-previous" class="nav-arrow" ng-click="previousSlide()"></button><nav class="pagination"><iln-slideshow-pagination></iln-slideshow-pagination></nav></section>',
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
