import fetch from 'node-fetch';
import "./addRequire.js";
const jsdom = require("jsdom");
const fs = require('fs');
const courseListUrl = 'https://www.mccormick.northwestern.edu/computer-science/academics/courses/';
const courseListPath = './html/courses.html';
let list = [];
let course;

// download html page from url
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

// write html pages to cache
async function writeToCache(filePath, url, callback) {
    fs.writeFileSync(filePath, await download(url));
    callback(filePath);
}

async function generateCourseJson() {
    // If course list doesn't exist in cache, download it
    if (!fs.existsSync(courseListPath)) {
        await writeToCache(courseListPath, courseListUrl, readCourseList);
    } else {
        readCourseList(courseListPath);
    }
}

// Read the course list from cache
async function readCourseList(path) {
    const data = fs.readFileSync(path, 'utf-8');
    const { JSDOM } = jsdom;
    const dom = new JSDOM(data);
    const $ = (require('jquery'))(dom.window);
    const items = $("#course_list");

    for (var i = 1; i < items[0].rows.length; i++) {
        const courseUrl = items[0].rows[i].cells[1].children[0].getAttribute('href');
        course = {
            courseNumber: items[0].rows[i].cells[0].children[0].innerHTML,
            courseTitle: items[0].rows[i].cells[1].children[0].innerHTML,
            link: courseUrl,
            prerequisites: ''
        };

        await generatePrerequisites(items[0].rows[i].cells[0].children[0].innerHTML, courseUrl);
    }

    fs.writeFileSync('../webhook/courses2.json', JSON.stringify(list));
    console.log("writing complete");
}

async function generatePrerequisites(name, courseUrl) {
    const path = './html/' + name.replace('/', ',') + '.html';
    if (!fs.existsSync(path)) {
        await writeToCache(path, courseListUrl + courseUrl, readCourse);
    } else {
        readCourse(path);
    }
}

// Read each individual course from cache
function readCourse(path) {
    const data = fs.readFileSync(path, 'utf-8');
    const { JSDOM } = jsdom;
    const dom = new JSDOM(data);
    const $ = (require('jquery'))(dom.window);
    const prerequisites = $('h3:contains("Prerequisites")')[0];
    if (prerequisites) {
        course.prerequisites = prerequisites.nextSibling.textContent;
    }
    list.push(course);
}

generateCourseJson();