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

            /**
             * Set the current slide
             * @name setCurrentSlide
             * @param { Number } _slide - the current slide
             *
             */
            function setCurrentSlide( _slide ){
                currentSlide = _slide;
            }

            /**
             * Set the next slide
             * @name setNextSlide
             * @param { Number } _slide - the next slide
             *
             */
            function setNextSlide( _slide ){
                nextSlide = _slide;
            }

            /**
             * Set the data of the slides and the max slides
             * @name setSlideData
             * @param {array} _data - the array of slides
             * @return {function} callback - when all done
             *
             */
            function setSlideData( _data, callback ){
                slides      = _data;
                maxSlides   = ( slides.length ) - 1;

                return callback();
            }

            /**
             * Return the data of a single slide
             * @name getSlideData
             * @param {number} _slide - the number of the slide
             * @return {object} slides - the single slide
             *
             */
            function getSlideData( _slide ){
                return slides[ _slide ];
            }

            /**
             * Return the data of all the slides
             * @name getSlides
             * @param {number} _slide - the number of the slide
             * @return {object} slides - the single slide
             *
             */
            function getSlideshowData(){
                return slides;
            }

            /**
             * Get the current slide number
             * @name getCurrentSlide
             * @return {number} currentSlide
             *
             */
            function getCurrentSlide(){
                return currentSlide;
            }

            /**
             * Get the current next slide number
             * @name getNextSlide
             * @return {number} nextSlide
             *
             */
            function getNextSlide(){
                return nextSlide;
            }

            /**
             * Call the next slide
             * @name callNextSlide
             *
             */
            function callNextSlide(){

                if( currentSlide !== maxSlides ){
                    nextSlide = currentSlide + 1;
                    goToSlide( nextSlide );
                }

                if( currentSlide === maxSlides ){
                    nextSlide = 0;
                    goToSlide( nextSlide );
                }

            }

            /**
             * Call the previous slide
             * @name callPreviousSlide
             *
             */
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

            /**
             * Jump to a specific slide
             * @name goToSlide
             * @param {number} _slide
             *
             */
            function goToSlide( _slide ){
                $rootScope.$broadcast('IlnSlideshowGoToSlide', _slide);
            }

            var service = {
                setSlideData            : setSlideData,
                getSlideshowData        : getSlideshowData,
                getSlideData            : getSlideData,
                setCurrentSlide         : setCurrentSlide,
                setNextSlide            : setNextSlide,
                getCurrentSlide         : getCurrentSlide,
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
            var slide_init          = true;

            $scope.animateSlideCss  = '';

            $scope.init = function(){
                // if there images to preload
                if( $scope.SLIDES_JSON().images ){
                    // preloadImages( $scope.SLIDES_JSON().images );
                    console.log('preload images');
                }

                $IlnSlideshow.setSlideData( $scope.SLIDES_JSON().slides, function(){
                    $IlnSlideshow.goToSlide( 0 );
                });

            };

            // call the next slide
            $scope.nextSlide = function(){
                $IlnSlideshow.callNextSlide();
            };

            // call the next slide
            $scope.previousSlide = function(){
                $IlnSlideshow.callPreviousSlide();
            };

            // animatie out the current slde
            $scope.animateOutCurrentSlide = function(){
                // css animate out the slide
                $scope.animateSlideCss = 'iln-slide-animate-out';

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
                    $scope.animateSlideCss = 'iln-slide-animate-in';
                    // broadcast global slide complete
                    $rootScope.$broadcast('IlnSlideshowTransitionComplete', $IlnSlideshow.getCurrentSlide() );
                }, 10);

            };

            // jump to a specific slide
            $scope.$on( 'IlnSlideshowGoToSlide', function( _s, _data ){
                if( !slide_transitioning ){
                    slide_transitioning = true;
                    if( slide_init ){
                        slide_init = false;
                        $scope.animateInNextSlide( _data );
                    }else{
                        $scope.animateOutCurrentSlide();
                    }
                }
            });

            // init the directive
            $scope.init();
        }
    ])
    /**
     * The controller for the pagination navigation
     * TODO update the pagination
     */
    .controller( 'IlnSlideshowPaginationCtrl', [
        '$scope',
        '$rootScope',
        '$IlnSlideshow',
        function( $scope, $rootScope, $IlnSlideshow ) {

            $scope.slide_data = [];
            $scope.current_slide = 0;

            $scope.init = function(){
                $scope.slide_data = $IlnSlideshow.getSlideshowData();
            };

            $scope.goToSlide = function( _index ){
                if( $scope.current_slide !== _index ){
                    $scope.current_slide = _index;
                    $IlnSlideshow.setNextSlide( _index );
                    $IlnSlideshow.goToSlide( _index );
                }
            };

            $scope.isActive = function( _index ){
                if( _index <= $scope.current_slide ){
                    return 'active';
                }else{
                    return '';
                }
            };

            $scope.$on( 'IlnSlideshowTransitionComplete', function( _s, _data ){
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
            template: '<section id="iln-slideshow"><div id="iln-slide-container" ng-class="animateSlideCss"></div><button id="iln-slide-next" class="nav-arrow" ng-click="nextSlide()"></button><button id="iln-slide-previous" class="nav-arrow" ng-click="previousSlide()"></button><nav id="iln-pagination"><iln-slideshow-pagination></iln-slideshow-pagination></nav></section>',
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
            template: '<ul><li ng-repeat="slide in slide_data" ng-click="goToSlide( $index )" ng-class="isActive( $index )"></li></ul>'
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

    /**
     * image preloader
     */
    .directive('ilnImagePreloader', function() {
        return {
            restrict: 'E',
            link: function ( scope, element, attrs ) {

                /**
                 * Preload images from the slide images array
                 * @name preloadImages
                 * @param {Array} _data - the images to preaload
                 *
                 */
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

                scope.$watch( attrs.images, function ( _images ) {

                    console.log( _images );

                });
            }
        };
    })
;
