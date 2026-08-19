const widgetSettings = `%7B%22sort%22%3A%22newest%22%2C%22strings%22%3A%7B%22submit_label%22%3A%22Post%20comment%22%2C%22compose_title%22%3A%22bzz%20a%20comment%22%2C%22body_placeholder%22%3A%22bzz%20something%20nice...%22%7D%2C%22coloring%22%3A%22light%22%2C%22theme%22%3A%22bubbles%22%2C%22radius%22%3A6%2C%22show_thread_line%22%3Atrue%2C%22hide_attribution%22%3Afalse%2C%22font_family%22%3A%22custom_font%22%2C%22font_google_fonts%22%3A%22%22%2C%22font_custom%22%3A%22https%3A%2F%2Fbeeeeboshive.nekoweb.org%2Fimg%2Ffonts%2FMillennium-Regular_0.ttf%22%2C%22content_font_family%22%3A%22custom_font%22%2C%22content_font_google_fonts%22%3A%22%22%2C%22content_font_custom%22%3A%22https%3A%2F%2Fbeeeeboshive.nekoweb.org%2Fimg%2Ffonts%2FMillennium-Regular_0.ttf%22%2C%22font_size%22%3A13%2C%22name_font_weight%22%3A600%2C%22show_avatar%22%3Atrue%2C%22avatar_size%22%3A36%2C%22avatar_radius%22%3A0%2C%22default_avatar%22%3A%22%22%2C%22accent_color%22%3A%22rgb(210%2C%20100%2C%2016)%22%2C%22name_color%22%3A%22rgb(60%2C%2036%2C%2077)%22%2C%22background_color%22%3A%22rgb(255%2C%20252%2C%20255)%22%2C%22text_color%22%3A%22rgb(26%2C%2026%2C%2026)%22%2C%22muted_color%22%3A%22rgb(116%2C%2095%2C%20120)%22%2C%22bubble_color%22%3A%22rgb(241%2C%20229%2C%20216)%22%2C%22input_color%22%3A%22rgb(255%2C%20255%2C%20255)%22%2C%22border_color%22%3A%22rgb(177%2C%2069%2C%200)%22%2C%22button_border_color%22%3A%22rgb(177%2C%2069%2C%200)%22%2C%22padding%22%3A0%2C%22control_padding%22%3A0%2C%22message_padding%22%3A0%2C%22page_css_styling%22%3Afalse%2C%22css%22%3A%22%22%7D`

export const frontContent = [
    {
        'id': 1,
        'width': '2',
        'date': null,
        'content': `[!] welcome to the hive! the time is currently <span id="funTime">xx:xx</span><span id="funCurrentTime"></span>. <br>
                    [-] honey production is at <span id="funCurrentHoney"></span>%! <span id="funHoneySplash"></span><br>
                    [!] a<span id="funExplorationArea"></span> of nearby <span id="funExplorationFlora"></span> has been discovered!<br><br>
                    [-] <span id="funHoneySplashSeason"></span><br>
                    [?] <span id="funResearch"></span><br>
                    [-] <span id="funStatus"></span><br></br>`
    },

    {
        'id': 2,
        'width': '1',
        'date': null,
        'content':  `todo... <br>
                    mess with custom borders <br>
                    border on the bg <br>
                    figure out rain bg <br>
                    look at cool widgets or stickers or 88x31 <br>`
    },
    {
        'id': 3,
        'width': '1',
        'date': null,
        'content': `sister sites: <br> wip...<br>hi`
    },
    {
        'id': 4,
        'width': '1',
        'date': null,
        'content': `a hive that separates its members by their level will have its thinking done by hackers and its fighting done by noobs`
    },
    {
        'id': 100,
        'width': '2',
        'date': null,
        'content': `<ws-widget id="comments" type="comments" iid="6442" name="apiary" settings=${widgetSettings}></ws-widget>`
    },
    {
        'id': 6,
        'width': '1',
        'date': null,
        'content': `something of a placeholder<br> blah<br>blah<br>blah<br>thanks to widgetstar, hero patterns!`
    },
]

