const curl = require("curl");
const jsdom = require("jsdom");
const url = "https://www.mccormick.northwestern.edu/computer-science/academics/courses/";
curl.get(url, null, (err,resp,body)=>{
  if(resp.statusCode == 200){
     parseData(body);
  }
  else{
     //some error handling
     console.log("error while fetching url");
  }
});

function parseData(html){
    const {JSDOM} = jsdom;
    const dom = new JSDOM(html);
    const $ = (require('jquery'))(dom.window);
    //let's start extracting the data
    var items = $("#course_list");
    // console.log(items[0].rows.length);
    // console.log(items[0].rows[119].cells[1].children[0].getAttribute('href'));
    // console.log(items[0].rows[119].cells[0].children[0].innerHTML);
    // console.log(items[0].rows[119].cells[1].children[0].innerHTML);
    // console.log(items[0].rows[119].cells[1].children[0].getAttribute('href'));
    for(var i = 1; i < items[0].rows.length; i++){
        // Print course number
        console.log(items[0].rows[i].cells[0].children[0].innerHTML);

        // Print course name
        console.log(items[0].rows[i].cells[1].children[0].innerHTML);

        // Print course link
        console.log(items[0].rows[i].cells[1].children[0].getAttribute('href'));
    }
}