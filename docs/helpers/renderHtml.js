module.exports = (globalJSON, content, withOutMenu) => {
    const fs = require('fs');
    const renderMenu = require('./renderMenu.js');

    if (! globalJSON) {
        globalJSON = JSON.parse(fs.readFileSync('./docs/globalJSON.json', 'utf8'));
    }

    if (! content) {
        const wrap = (el) => {
            const html = el.html ? `<div class="sample">${JSON.parse(el.html)}</div>` : '';

            const sample = (type, content) => {
                return `
                    <div class="code-sample">
                        <div class="code">
                            <button class="clipbrd-btn" data-clipboard-target="#copy_code-${type}-${el.name}" title="Copy to clipboard">
                                <span></span>
                             </button>
                            <pre>
                                <code id="copy_code-${type}-${el.name}" class="hjs ${type === 'js' ? 'js javascript' : 'html'}">${content}</code>
                            </pre>
                        </div>
                        <div class="code-sample-toggle"><span>Show</span> ${type} sample</div>
                    </div>
                `;
            };

            let codeSample = el.codeExample ? sample('code', JSON.parse(el.codeExample)) : '';
            const jsSample = el.jsExample ? sample('js', JSON.parse(el.jsExample)) : '';

            return `
                <div class="element" id="${el.name}">
                    <div class="markdown">${JSON.parse(el.markDown)}</div>
                   ${html} ${codeSample} ${jsSample}
                </div>
            `;
        };
        let type = [];
        let group = [];
        content = Object.keys(globalJSON)
                .map((el, index) => {
                    let content = '';
                    if (group.indexOf(globalJSON[el].group) === - 1) {
                        if (index != 0) {
                            content += `<hr>`;
                            content += '</div>';
                        }
                        content += `<div id="${globalJSON[el].group}-target" class="positon-anchor">`;
                    }
                    if (type.indexOf(globalJSON[el].type) === - 1) {
                        type.push(globalJSON[el].type);
                        content += `<h2 class="type_name">${globalJSON[el].type}</h2>`;
                    }
                    content += wrap(globalJSON[el]);
                    group.push(globalJSON[el].group);
                    return content;
                }).join('\n') || 'empty';
    } else {
        content = `<div id="separate-content">${content}</div>`;
    }

    let scriptsFiles = [
        'dist/showcar-icons.js',
        'dist/showcar-tracking.js',
        'dist/showcar-ui.js',
        'docs/assets/js/highlight.min.js',
        'docs/assets/js/clipboard.min.js',
        'docs/assets/js/smooth-scroll.min.js',
        'docs/assets/js/docs.js',
    ];
    let stylesFiles = [
        'docs/assets/styles/github.min.css',
        'dist/showcar-ui.css',
        'docs/assets/styles/docs.css',
    ];

    scriptsFiles = scriptsFiles.map(script => {
        return `<script src="/showcar-ui/${script}"></script>`;
    }).join('\n');

    stylesFiles = stylesFiles.map(style => {
        return `<link rel="stylesheet" href="/showcar-ui/${style}">`;
    }).join('\n');
    const polyfils = require('../../dist/polyfills.js');

    const head = `
        <!DOCTYPE html>
        <html lang="en" class="ndpl-c-background">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width">
                <title>ShowCar UI docs</title>
                <link rel="shortcut icon" type="image/png" href="favicon.png"/>
                <script>(${polyfils})()</script>
                ${scriptsFiles}
                ${stylesFiles}
             </head>
             <body id="${withOutMenu ? 'withoutmenu' : ''}">
    `;

    const menu = withOutMenu ? '' : renderMenu(globalJSON);

    const leftMenu = withOutMenu ? '' : `
        <div id="sidebar">
            <a href="#about-target"><div id="sidebar-logo"></div></a>
            <h1>ShowCar UI</h1>
            <div id="all-code-toggler"><span>Show</span> all code samples</div>
            <div id="left-menu">
                ${menu}
            </div>
            <div id="open-menu">
                <div id="open-menu__container">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
         </div>
    `;

    const body = `
        <div id="content">${content}</div>
    `;

    const footer = `
        <script>
            var clipboard = new Clipboard('.clipbrd-btn');
            clipboard.on('success', function (e) {
                e.clearSelection();
                showTooltip(e.trigger,'Copied!');
            });
            var clpbdbtns = document.querySelectorAll('.clipbrd-btn');
            for(var i=0;i<clpbdbtns.length;i++){
                clpbdbtns[i].addEventListener('mouseleave',function(e){
                    e.currentTarget.classList.remove('tooltipped');
                    e.currentTarget.removeAttribute('aria-label');
                });
            }
            function showTooltip(elem,msg){
                elem.classList.add('tooltipped');
                elem.setAttribute('aria-label',msg);
            }

              hljs.initHighlightingOnLoad();
              if (location.hostname === 'autoscout24.github.io') {
                   [].forEach.call(document.querySelectorAll('#left-menu a.open-separate'), function (openSeparate) {
                        openSeparate.style.display = "none";
                    });
              (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
              (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
              })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
              ga('create', 'UA-92435213-1', 'auto');
              ga('set', 'anonymizeIp', true);
              ga('send', 'pageview');
              }
            </script>
        </body>
        </html>
    `;

    const html = head + leftMenu + body + footer;
    return html;
};


