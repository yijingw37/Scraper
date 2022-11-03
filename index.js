const curl = require("curl");
const jsdom = require("jsdom");
const fs = require('fs');
const url = "https://www.mccormick.northwestern.edu/computer-science/academics/courses/";
let list = [];

// scrape course list
curl.get(url, null, async (err, resp, body) => {
    if (resp.statusCode == 200) {
        parseData(body);
    }
    else {
        //some error handling
        console.log("error while fetching url");
    }
});

function parseData(html) {
    const { JSDOM } = jsdom;
    const dom = new JSDOM(html);
    const $ = (require('jquery'))(dom.window);
    const items = $("#course_list");
    for (var i = 1; i < items[0].rows.length; i++) {
        const courseUrl = items[0].rows[i].cells[1].children[0].getAttribute('href');
        let course = {
            courseNumber: items[0].rows[i].cells[0].children[0].innerHTML,
            courseTitle: items[0].rows[i].cells[1].children[0].innerHTML,
            link: courseUrl,
            prerequisites: ""
        };
        list.push(course);

        // Scrape each page for prerequisites
        curl.get(url + courseUrl, null, async (err, resp, body) => {
            if (resp.statusCode == 200) {
                const { JSDOM } = jsdom;
                const dom = new JSDOM(body);
                const $ = (require('jquery'))(dom.window);
                const prerequisites = $('h3:contains("Prerequisites")')[0];
                if (prerequisites) {
                    course.prerequisites = prerequisites.nextSibling.textContent;
                }
                list.push(course);
            }
            else {
                //some error handling
                console.log("error while fetching url");
            }
        });
    }

    // write to courses.json
    fs.writeFile('../webhook/courses2.json', JSON.stringify(list), function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('complete')
        }
    });
}