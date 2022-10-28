const curl = require("curl");
const jsdom = require("jsdom");
const fs = require('fs');
const { JSDOM } = jsdom;
const dom = new JSDOM(html);
const $ = (require('jquery'))(dom.window);
const url = "https://www.mccormick.northwestern.edu/computer-science/academics/courses/";

curl.get(url, null, (err, resp, body) => {
    if (resp.statusCode == 200) {
        parseData(body);
    }
    else {
        console.log("error while fetching url");
    }
});

function parseData(html) {
    const items = $("#course_list");
    let list = [];
    for (var i = 1; i < items[0].rows.length; i++) {
        list.push({
            courseNumber: items[0].rows[i].cells[0].children[0].innerHTML,
            courseTitle: items[0].rows[i].cells[1].children[0].innerHTML,
            link: items[0].rows[i].cells[1].children[0].getAttribute('href')
        });
    }

    fs.writeFile('courses.json', JSON.stringify(list), function (err) {
        if (err) {
            console.log(err)
        } else { 
            console.log('complete') 
        }
    });
}