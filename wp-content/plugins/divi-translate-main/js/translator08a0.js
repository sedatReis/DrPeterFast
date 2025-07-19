var mainLanguage = ditrData.mainLanguage || 'en'
var defaultLanguage = ditrData.defaultLanguage || 'en'
var custom_strings = ditrData.custom_strings || []
var auto_translate_to = ditrData.auto_translate_to || null
var selectedLanguages = ditrData.selectedLanguages || []
var blacklist = ditrData.blacklist || []
var autoDetect = ditrData.autoDetect || false
var autoTranslateAll = ditrData.autoTranslateAll || false

jQuery($ => {
    if ($("#wp-admin-bar-et-disable-visual-builder").length == 0 && $("#poststuff #post-body #post-body-content #titlediv input#title").length == 0) {//disable on builder
        $("body").append(`<div id="ditr_translate_element" class="skiptranslate"></div>`);
        if (ditrData.translate_title == '0') {
            $("title").addClass('notranslate')
        }
        $("#wpadminbar,.et-pb-icon").addClass('skiptranslate');
        $("[data-text_orientation]").each(function () {
            let text_orientation = $(this).data('text_orientation')
            if (text_orientation) {
                $(this).parent().parent().css('text-align', text_orientation)
            }
        });
        $(".ditr-switch-language").change(function () {
            let lang = $(this).val().replace('-uk', '');
            switchLanguage(lang)
        });
        $(".ditr-abbr-lang-switcher,.ditr-flag-lang-switcher").click(function () {
            let lang = $(this).data('lang').replace('-uk', '');
            switchLanguage(lang, $(this).data('link'))
        });
        setTimeout(function () {
            if (auto_translate_to) {
                switchLanguage(auto_translate_to)
            } else {
                let selected = $(".goog-te-combo").val();
                let lang = selected ? selected.split('-')[0] : mainLanguage
                if (!selected && autoDetect) {
                    let browserLangauge = navigator.language.split('-')[0]
                    if (selectedLanguages[browserLangauge] || autoTranslateAll) {
                        lang = browserLangauge
                    }
                }
                setUiLanguage(lang);
                setCustomStrings(lang)
            }
        }, 2000);
        jQuery.expr[':'].icontains = function (a, i, m) {
            return jQuery(a).text().toUpperCase()
                .indexOf(m[3].toUpperCase()) >= 0;
        };
        $('a[href^="mailto:"]').addClass("skiptranslate")
        if (blacklist) {
            for (let blacklistString of blacklist) {
                let textToFind = blacklistString.string.replace("'", '’')
                let caseSensitive = blacklistString.is_case_sensitive;
                if (textToFind) {
                    let searchBy = caseSensitive ? 'contains' : 'icontains'
                    $(`body :${searchBy}('${textToFind}')`).each(function () {
                        let tagName = $(this).prop("tagName").toLowerCase()
                        if (tagName != 'script' && tagName != 'style' && $(this).children().length == 0 && $(this).parents('script').length == 0) {
                            if ($(this).text().toLowerCase() == textToFind.toLowerCase()) {
                                $(this).addClass("skiptranslate")
                            } else {
                                let replace = new RegExp(`\b(${textToFind})\b`, 'g' + (caseSensitive ? '' : 'i'));
                                // $(this).html($(this).text().replace(replace, `<span class="skiptranslate">${replace}</span>`))
                                $(this).html($(this).text().replace(replace, `<span class="skiptranslate"> ${textToFind} </span>`))
                            }
                        }
                    });
                }
            }
        }
        // console.log(custom_strings)
        if (custom_strings) {
            // jQuery.expr[':'].icontains = function (a, i, m) {
            //     return jQuery(a).text().toUpperCase()
            //         .indexOf(m[3].toUpperCase()) >= 0;
            // };
            for (let index in custom_strings) {
                let customString = custom_strings[index]
                let textToFind = customString.original
                // alert(textToFind)
                let caseSensitive = customString.is_case_sensitive;
                if (textToFind) {
                    let searchBy = caseSensitive ? 'contains' : 'icontains'
                    $(`body :${searchBy}('${textToFind}')`).each(function () {
                        let tagName = $(this).prop("tagName").toLowerCase()
                        if (['style', 'script'].indexOf(tagName) >= 0) return;
                        // if (tagName == 'script') return;
                        if ($(this).parents('script').length) return;
                        let foundInText = false;
                        for (let content of $(this).contents()) {
                            if (content.nodeName == '#text' && content.data.toLowerCase().indexOf(textToFind.toLowerCase()) >= 0) {
                                foundInText = true
                            }
                        }
                        if ($(this).children().length == 0 || foundInText) {
                            if ($(this).text().toLowerCase() == textToFind.toLowerCase()) {
                                $(this).addClass("skiptranslate").attr("data-custom-string-index", index)
                            } else {
                                // let replace = new RegExp(`(${textToFind})`, 'g' + (caseSensitive ? '' : 'i'));
                                let replace = new RegExp(`\b(${textToFind})\b`, 'g' + (caseSensitive ? '' : 'i'));
                                $(this).html($(this).html().replace(replace, `<span data-custom-string-index="${index}" class="skiptranslate"> ${textToFind} </span>`))
                            }
                        }
                    });
                }
                $(`input[type="submit"][value="${textToFind}"]`).attr("data-custom-string-index", index).parent().addClass("skiptranslate")
            }
        }

        function setUiLanguage(lang) {
            $(".ditr-abbr-lang-switcher").removeClass("active")
            $(".ditr-flag-lang-switcher").removeClass("active")
            $(`.ditr-abbr-lang-switcher[data-lang=${lang}]`).addClass("active")
            $(`.ditr-flag-lang-switcher[data-lang=${lang}]`).addClass("active")
            if ($(`.ditr-switch-language option[value=${lang}]`).length) {
                $(".ditr-switch-language").val(lang);
            }
        }

        function setCustomStrings(lang) {
            $('[data-custom-string-index]').each(function () {
                let index = $(this).attr("data-custom-string-index")
                if (custom_strings[index] && custom_strings[index].original) {
                    let translated = custom_strings[index].original
                    let translatedStrings = custom_strings[index].translated;
                    if (translatedStrings[lang]) {
                        translated = translatedStrings[lang]
                    } else if (translatedStrings[`${lang}-uk`]) {
                        translated = translatedStrings[`${lang}-uk`]
                    }
                    if ($(this).attr("type") == 'submit' && $(this).prop("tagName") == 'INPUT') {
                        $(this).val(translated);
                    } else {
                        if ($(this).prop("tagName") == 'SPAN') {
                            translated = ` ${translated} `
                        }
                        $(this).text(translated);
                    }
                }
            });
        }

        function switchLanguage(lang, link) {
            setUiLanguage(lang)
            setCustomStrings(lang)
            let currentLang = $("select.goog-te-combo").val()
            if (currentLang == lang) { //new language is same as before
                return;
            }

            if ($(`.goog-te-combo option[value=${lang}]`).length == 0) {
                return
            }

            $("select.goog-te-combo").val(lang)
            triggerHtmlEvent($("select.goog-te-combo")[0], 'change');
            triggerHtmlEvent($("select.goog-te-combo")[0], 'change');
            if (link) {
                setTimeout(() => {
                    location = link
                }, 1000)
            }
        }
    }
})

function triggerHtmlEvent(element, eventName) {
    var event;
    event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
}

function ditrTranslateElementInit() {
    setTimeout(function () {
        new google.translate.TranslateElement({pageLanguage: mainLanguage, autoDisplay: false}, 'ditr_translate_element');
    }, 1000);
}
