/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function () {
    'use strict';

    // Check to make sure service workers are supported in the current browser,
    // and that the current page is accessed from a secure origin. Using a
    // service worker from an insecure origin will trigger JS console errors. See
    // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
    var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

    if ('serviceWorker' in navigator &&
        (window.location.protocol === 'https:' || isLocalhost)) {
        navigator.serviceWorker.register('service-worker.js')
            .then(function (registration) {
                // Check to see if there's an updated version of service-worker.js with
                // new files to cache:
                // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-registration-update-method
                if (typeof registration.update === 'function') {
                    registration.update();
                }

                // updatefound is fired if service-worker.js changes.
                registration.onupdatefound = function () {
                    // updatefound is also fired the very first time the SW is installed,
                    // and there's no need to prompt for a reload at that point.
                    // So check here to see if the page is already controlled,
                    // i.e. whether there's an existing service worker.
                    if (navigator.serviceWorker.controller) {
                        // The updatefound event implies that registration.installing is set:
                        // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
                        var installingWorker = registration.installing;

                        installingWorker.onstatechange = function () {
                            switch (installingWorker.state) {
                            case 'installed':
                                // At this point, the old content will have been purged and the
                                // fresh content will have been added to the cache.
                                // It's the perfect time to display a "New content is
                                // available; please refresh." message in the page's interface.
                                break;

                            case 'redundant':
                                throw new Error('The installing ' +
                                    'service worker became redundant.');

                            default:
                                // Ignore
                            }
                        };
                    }
                };
            }).catch(function (e) {
                console.error('Error during service worker registration:', e);
            });
    }

    // Custom JavaScript goes here

    var materialLayout, tabs;
    var layoutIntervals = {
        morphSvgInterval: null
    };
    var svgIconHostClassName = '.section__play-btn';
    var $oNounSet = null,
        circles = null,
        force = null,
        svgMorpheus = null,
        nounIcons = ['noun-graph', 'noun-bar', 'noun-donut'];

    function morphIcons() {

        var tickCount = 1;

        function timerTick() {

            var idx = (tickCount += 1) % 3;

            if (!svgMorpheus) {
                svgMorpheus = new SVGMorpheus('#noun-set');
            }

            svgMorpheus.to(nounIcons[idx], {
                duration: 500
            });
        }

        // Safeguard ...
        //
        if (layoutIntervals.morphSvgInterval) {

            clearInterval(layoutIntervals.morphSvgInterval);

            layoutIntervals.morphSvgInterval = null;
            svgMorpheus = null;
        }

        if ($(svgIconHostClassName).is(':visible')) {

            if ($oNounSet) {

                $(svgIconHostClassName).children().remove();
                $(svgIconHostClassName).append($oNounSet);

            } else {

                $oNounSet = $('#noun-set').clone();

            }

            layoutIntervals.morphSvgInterval = setInterval(timerTick, 3000);

        }
    }

    function forceLayoutEx1() {

        // Data, width and height
        var dataset = null;
        var w = $('.force-ex-1').innerWidth();
        var h = 600;

        if ((w > 0) && (!force)) {

            d3.json("data/nyc-sm-usage-relationships.json", visualizeGraphData);
        }

        function visualizeGraphData(error, json) {

            if (error) {
                return console.warn(error);
            }

            // Set our data var.
            dataset = json;

            //Initialize a default force layout, using the nodes and edges in dataset
            force = d3.layout.force()
                .nodes(dataset.nodes)
                .links(dataset.edges)
                .size([w, h])
                .gravity(0.050)
                .linkDistance([200])
                .linkStrength([0.25])
                .charge([-300])
                .start();

            var colors = d3.scale.category20();

            //Create SVG element
            var svg = d3.select('.force-ex-1')
                .append('svg')
                .attr('width', w)
                .attr('height', h);

            var g = svg.append('g');

            //Create edges as lines
            var edges = g.selectAll('line')
                .data(dataset.edges)
                .enter()
                .append('line')
                .style('stroke', '#ccc')
                .style('stroke-width', '1.0');

            var nodes = g.selectAll('.node')
                .data(dataset.nodes)
                .enter().append('g')
                .attr('class', 'node')
                .call(force.drag);

            //Create nodes as circles
            nodes.append('path')
                .attr('d', d3.svg.symbol()
                    .type(function (d) {
                        if (d.name == 'DOT') {
                            return 'triangle-up';
                        } else {
                            return 'circle';
                        }
                    })
                    .size(512))
                .style('fill', function (d, i) {
                    if (d.name == 'DOT') {
                        return colors(i);
                    } else {
                        return 'white';
                    }
                })
                .style('stroke', function (d, i) {
                    return colors(i);
                })
                .style('stroke-width', '2.0');

            var chipsLegend = d3.select('.force-ex-1-chips-legend');
            var chips = chipsLegend.selectAll('div')
                .data(dataset.nodes)
                .enter()
                .append('div')
                .attr('class', 'mdl-chip')


            chips.append('div')
                .attr('class', 'mdl-chip-img')
                .style('background-color', function (d, i) {
                    return colors(i);
                });
            chips.append('span')
                .attr('class', 'mdl-chip-text')
                .text(function (d) {
                    return d.legendName;
                });


            // Every time the simulation "ticks", this will be called.
            force.on('tick', function () {

                edges.attr("x1", function (d) {
                        return d.source.x;
                    })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                nodes.attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            });

        }
    }

    function category20cCircle() {

        // Width and height
        var w = $('.color-c-ex1').innerWidth();
        var h = Math.min(450, w);

        if ((w > 0) && (!circles)) {

            var svg = d3.select('.color-c-ex1')
                .append('svg')
                .attr('width', w)
                .attr('height', h);
            var n = 35;
            var m = 30;
            var data = [];

            for (var i = 40; i > 0; i -= 1) {
                data.push(i);
            }

            var c20c = d3.scale.category20c();
            var g = svg.append("g")
                .attr("transform", "translate(5,10)");

            circles = g.selectAll("circle")
                .data(data);

            circles.enter()
                .append("circle")
                .attr({
                    cx: (w / 2),
                    cy: 205,
                    r: function (d, i) {
                        return Math.random() * d * 5
                    },
                    fill: c20c
                });
        }
    }

    function registerEvents() {

        // The materialLayout instance, and collection of tabs, is required by the footer link handler.
        //
        materialLayout = componentHandler.findCreatedComponentByNode($('.mdl-js-layout')[0]);
        tabs = materialLayout.tabBar_.querySelectorAll('.' + materialLayout.CssClasses_.TAB);

        $('.featured-example--open-here').click(showFeaturedExampleInline);
        $('.mdl-button--fab').click(showFabMenu);
        $('#fab-close').click(hideFabMenu);
        $('.footer__mdl-link').click(showFooterLink);
    }

    function showFeaturedExampleInline() {

        var $sender = $(this);

        if ($sender.data('target-state') == 'closed') {

            $sender.text('Collapse Pen');
            $sender.data('target-state', 'open');

        } else {

            $sender.text('Open Pen Here');
            $sender.data('target-state', 'closed');
        }

        $('#pen-qHJsf').toggle('fast');
    }

    function showFabMenu() {

        var $sender = $(this);

        if ($sender.hasClass('back')) {
            $(this).removeClass('back');
        }

        $(this).addClass('click');

        setTimeout(function () {
            $('.mdl-button--fab > *').hide();
            $('.header__fab-menu').show();
        }, 250)
    }

    function hideFabMenu() {

        $('.mdl-button--fab').removeClass('click').addClass('back');
        $('.mdl-button--fab > *').show();
        $('.header__fab-menu').hide();
    }

    function showFooterLink() {

        var tabLink = $(this).data('tab-link');

        $(tabs).each(function () {
            if ($(this).attr('href') == tabLink) {
                $(this)[0].show();
            }
        });
    }

    componentHandler.registerUpgradedCallback('MaterialLayout', function (el) {
        console.log('tab updated');
    });
    componentHandler.registerTabSelectedCallback('MaterialLayout', morphIcons);
    componentHandler.registerTabSelectedCallback('MaterialLayout', forceLayoutEx1);
    componentHandler.registerTabSelectedCallback('MaterialLayout', category20cCircle);

    window.onload = function () {
        morphIcons();
        registerEvents();
    }

})();