// ==UserScript==
// @name            The Wall Street Journal Full Text Articles
// @name:it         The Wall Street Journal - Articoli con testo completo
// @namespace       iamfredchu
// @version         0.0.2
// @description     Fetch the full text of The Wall Street Journal articles from the AMP version
// @description:it  Mostra il testo completo degli articoli su The Wall Street Journal
// @author          Fred Chu
// @match           https://www.wsj.com/articles/*
// @match           https://cn.wsj.com/articles/*
// @require         https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant           GM_xmlhttpRequest
// @grant           GM.xmlHttpRequest
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// ==/UserScript==

/* Greasemonkey 4 wrapper */
if (typeof GM !== "undefined" && !!GM.xmlHttpRequest) {
    GM_xmlhttpRequest = GM.xmlHttpRequest;
}

function fetch(params) {
    return new Promise(function(resolve, reject) {
        params.onload = resolve;
        params.onerror = reject;
        GM_xmlhttpRequest(params);
    });
}

(function() {
    'use strict';

    var paywalled = $("#cx-snippet-promotion");

    if (!!paywalled) {
        fetch({
            method: 'GET',
            url: '/amp' + location.pathname,
        }).then(function(responseDetails) {
            var r = responseDetails.responseText;
            r = r.replace(/<script/gi, '<div').replace(/script>/gi, 'div>');
            r = r.replace(/\?width=/gi, '?__=').replace(/<amp-img/gi, '<img').replace(/<.amp-img>/, '').replace(/amp-iframe/gi, 'iframe');

            var data = $(r);

            setTimeout(function(){
                let hasSnippet = $('.wsj-snippet-body');
                let $preview = $('.wsj-snippet-body').length ?
                    $('.wsj-snippet-body') :
                    $('[aria-label*="Listen"]').next('section');

                    $preview.replaceWith(data.find('section[subscriptions-section="content"]')
                                         .css('margin-bottom', '5rem')
                                         .css('color', 'var(--primary-text-color)')
                                         .css('font-family', 'var(--article-font-family)')
                                         .css('font-size', 'calc((17 / var(--article-base-font-size)) * var(--article-text-size-scale) * 1rem)')
                                         .css('font-weight', 'var(--article-font-weight)')
                                         .css('line-height', 'calc(27 / 17)')
                                        );

            }, 3000);

            $('[aria-label*="Listen"]').next().next().remove();
            $('[aria-label*="What"]').remove();
            $('.snippet-promotion, #cx-what-to-read-next').remove();
            $('.responsive-media').css('height', 'auto');
            $('.responsive-media img').css({
                'height': 'auto',
                'width': 'auto',
                'max-width': '100%',
                'display': 'block',
                'position': 'relative',
            });
            $('.media-object-video iframe').addClass('video-wrapper').wrap('<div class="video-container"></div>');
            $('.imageCaption').each(function() {
                var element = $(this);
                var parent = element.parent();
                var wrapper = $('<div class="wsj-article-caption"></div>');
                wrapper.append(element.html()).appendTo(parent);
                element.remove();
            }).find('.imageCredit').addClass('wsj-article-credit').prepend(' ');
            $('.media-object').addClass('media-object-image');
            $('.media-object img').css('height', 'auto');
        });
    }

})();
