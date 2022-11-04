import fetch from 'node-fetch';
import "./addRequire.js";
const jsdom = require("jsdom");
const fs = require('fs');
let list = [];
let course;

// download page
async function download(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }
        const result = await response.text();
        return result;
    } catch (err) {
        console.log(err);
    }
}

// write to cache
async function writeToCache(filePath, url, callback, i) {
    fs.writeFile(filePath, await download(url), function (err) {
        if (err) {
            console.log(err)
        } else {
            callback(filePath, i);
        }
    });
}

function generateCourseJson() {
    // If course list doesn't exist in cache, download it
    if (!fs.existsSync('./html/courses.html')) {
        writeToCache('./html/courses.html', 'https://www.mccormick.northwestern.edu/computer-science/academics/courses/', readCourseList);
    } else {
        readCourseList('./html/courses.html');
    }
}

function readCourseList(path) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            const { JSDOM } = jsdom;
            const dom = new JSDOM(data);
            const $ = (require('jquery'))(dom.window);
            const items = $("#course_list");
            // items[0].rows.length
            for (var i = 1; i < 10; i++) {
                const courseUrl = items[0].rows[i].cells[1].children[0].getAttribute('href');
                course = {
                    courseNumber: items[0].rows[i].cells[0].children[0].innerHTML,
                    courseTitle: items[0].rows[i].cells[1].children[0].innerHTML,
                    link: courseUrl,
                    prerequisites: ''
                };

                generatePrerequisites(items[0].rows[i].cells[0].children[0].innerHTML, courseUrl);
            }
        } else {
            console.log(err);
        }
    });
}

function generatePrerequisites(name, courseUrl) {
    const path = './html/' + name + '.html';
    if (!fs.existsSync(path)) {
        writeToCache(path, 'https://www.mccormick.northwestern.edu/computer-science/academics/courses/' + courseUrl, readCourse);
    } else {
        readCourse(path);
    }
}

function readCourse(path) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            const { JSDOM } = jsdom;
            const dom = new JSDOM(data);
            const $ = (require('jquery'))(dom.window);
            const prerequisites = $('h3:contains("Prerequisites")')[0];
            if (prerequisites) {
                console.log("setting prereq", prerequisites.nextSibling.textContent)
                course.prerequisites = prerequisites.nextSibling.textContent;
            }
            list.push(course);
            fs.writeFile('../webhook/courses2.json', JSON.stringify(list), function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('complete writing to courses2.json')
                }
            });
        } else {
            console.log(err);
        }
    });

}

generateCourseJson();