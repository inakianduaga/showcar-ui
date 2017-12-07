const path = require('path');
const fs = require('fs');
const recursiveSync = require('recursive-readdir-sync');
const marked = require('marked');
var renderer = new marked.Renderer();
renderer.heading = (text, level) => {
    return `<h${level}>${text}</h${level}>`;
};
const ssi = require('ssi');
const baseDir = './src/06-components';
const ssiParser = new ssi(baseDir, baseDir, '/**/*.html');
const entities = require('html-entities').AllHtmlEntities;
const docsData = JSON.parse(fs.readFileSync('./docs/docsData.json', 'utf8'));

const getFiles = (route, name, routesArr) => {
    let routes = route ? recursiveSync(route) : routesArr;
    return routes
        .filter(fileName => {
            return path.parse(fileName).ext === '.md';
        }).map((mdPath) => {
            const group = name || mdPath.split('/').slice(- 3, - 2)[0];
            return {
                name: path.parse(mdPath).name,
                group,
                mdPath
            };
        });
};

const setObj = (type, files) => {
    return files
        .map((file) => {
            const group = file.group;
            const paths = file.mdPath;
            const srcDir = path.parse(paths).dir;
            const name = path.parse(paths).name;
            const markDown = marked(fs.readFileSync(paths, 'utf8'), { renderer: renderer });

            const element = {
                name,
                type: type,
                group: group,
                srcDir,
                markDown: JSON.stringify(markDown),
            };

            const htmlPaths = paths.split('.md')[0] + '.html';
            if (fs.existsSync(htmlPaths)) {
                const html = ssiParser.parse('', fs.readFileSync(htmlPaths, 'utf8')).contents;
                
                element.html = JSON.stringify(html);
                element.codeExample = JSON.stringify(entities.encode(html));
            }

            const jsPaths = paths.split('.md')[0] + '.js';
            if (fs.existsSync(jsPaths)) {
                element.jsExample = JSON.stringify(fs.readFileSync(jsPaths, 'utf8'));
            }
            return element;
        });
};


module.exports = () => {
    let obj = Object.keys(docsData)
        .map((key) => {
            if (docsData[key] === Object(docsData[key])) {
                return Object.keys(docsData[key])
                    .map((deepKey) => {
                        if (path.parse(docsData[key][deepKey]).ext === '.md') {
                            return setObj(key, getFiles(false, deepKey, [docsData[key][deepKey]]));
                        }
                        return setObj(key, getFiles(docsData[key][deepKey], deepKey));
                    });
            }
            return setObj(key, getFiles(docsData[key]));
        })
        .reduce((acc, val) =>
                acc.concat(val),
            []
        )
        .reduce((acc, val) =>
                acc.concat(val),
            []
        )
        .reduce((res, obj) => {
            res[obj.name] = obj;
            return res;
        }, ({}));
    return obj;
};
