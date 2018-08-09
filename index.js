const express = require('express');
const moment = require('moment');
const colors = require('colors/safe');
const path = require('path');
const fs = require('fs');

const dir = process.cwd();
const app = express();

app.use(express.static(__dirname + '/static'));

function log(msg, color) {
    if (!color) color = colors.green;
    console.log(color('[' + moment().format('YYYY-MM-DD HH:mm:ss') + '] ') + msg);
}

app.get('/g/*', function (req, res) {
    if (req.params['0']) {
        res.sendFile(path.join(dir, req.params['0']));
    } else {
        res.redirect('../');
    }
});

app.get('/f', function (req, res) {
    if (req.query.path && req.query.path.includes('..')) {
        res.status(500);
        res.send({
            error: "Path cannot contain '..'."
        });
    } else {
        let current_dir = path.join(dir, req.query.path || '');
        log("Browsing: " + current_dir);
        fs.readdir(current_dir, function (err, files) {
            if (err) {
                res.status(500);
                res.send({
                    error: err.toString()
                });
            } else {
                let data = [];
                files.filter(function () {
                    return true;
                }).forEach(function (file) {
                    try {
                        if (file.indexOf('.') !== 0) {
                            data.push({
                                name: file,
                                ext: path.extname(file),
                                is_dir: fs.statSync(path.join(current_dir, file)).isDirectory()
                                // path: path.join(current_dir, file)
                            });
                        }
                    } catch (e) {
                        log(e);
                    }
                });
                data.sort(function (a, b) {
                    return a.name > b.name;
                });
                res.json(data);
            }
        });
    }
});

let port = 7000;
let args = process.argv.slice(2);
if (args.length > 0) port = args[0];

app.listen(port, function () {
    log('vFile server is listening on port ' + port + '.');
    log('Working directory: ' + dir);
});