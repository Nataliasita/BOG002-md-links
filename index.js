#!/usr/bin/env node
console.log("")
console.log(`--------------------------------------------`.rainbow);
console.log("  |  HH  HH EEEEEE LL     LL     000000  |  ".rainbow);
console.log(`  |  HH  HH EE     LL     LL     00  00  |  `.rainbow);
console.log(`  |  HHHHHH EEEEEE LL     LL     00  00  |  `.rainbow);
console.log(`  |  HH  HH EE     LL     LL     00  00  |  `.rainbow);
console.log("  |  HH  HH EEEEEE LLLLLL LLLLLL 000000  |  ".rainbow);
console.log(`--------------------------------------------`.rainbow);
console.log("")


const fs = require('fs');
const path = require('path');
const colors = require('colors');
const marked = require('marked');
const jsdom  =  require ( "jsdom" ) ;
const axios = require("axios");
const { JSDOM } = jsdom;
const http = require('http');



let actual_directory = process.cwd();
let alterno_ = Buffer.from(actual_directory);
console.log(`Directorio de trabajo actual: ${process.cwd()}`);

const files_path_md = [];
const diferent_files = "La ruta no contiene archivos tipo Md";

const ubication_directory = (files_md) => new Promise((resolve) => {
  if(path.extname(files_md) === ".md"){
    files_path_md.push(files_md)
  }else{
    const files = fs.readdirSync(files_md)
      files.forEach(file => {
        directory = path.resolve(files_md, file);
        var stat = fs.statSync(directory);
        if(path.extname(directory) === ".md") files_path_md.push(directory);
        else if (stat.isDirectory()) ubication_directory(directory)
      });
  }
  resolve(files_path_md)  
});

const read_links = (element) => new Promise((resolve, reject) => {
  const relative_path = path.relative(__dirname, element);
  fs.readFile(element, 'utf8', (err, data) => {
    if(err) reject (err);
    let dataLinks = [];
    const htmlData = marked(data);
    const dom = new jsdom.JSDOM(htmlData);
    const anwersLink = dom.window.document.querySelectorAll("a");
    anwersLink.forEach((element, response) => {
        if (element.href.includes("http")) {
          dataLinks.push({
            href: element.href,
            text: element.textContent,
            file: relative_path
          });
        } 
  })
  resolve(dataLinks);
});
});

const answer_http = (links_objet) => new Promise((resolve) => {
  const url_web = links_objet.href;
  const options = {
    //respuesta de un sitio web a una solicitud que se origina en otro sitio web
    headers: {'Access-Control-Allow-Origin' : '*'}
  };
    axios.get(url_web, options)
    .then((response) => {
      links_objet.status = response.status,
      links_objet.ok =  "OK"
    })
    .catch((error) => {
      if (error.response){
        links_objet.status = error.response.status,
        links_objet.ok = "Fail"
      }else{
        links_objet.status = error.code,
        links_objet.ok = "Fail"
      }
    })
    .then(()=>{
      resolve(links_objet)
    })
})

function review(mdLinks){
  const allHttpResponse = [];
  mdLinks.map((element) => {
    allHttpResponse.push(answer_http(element))
  })
  return Promise.all(allHttpResponse)
  .then((httpResponse) => httpResponse)
  .catch((error) => error);
}

function md_links(files, options){
  return new Promise((resolve, reject) => {
    options = options || { validate: false }
    const path_valid = path.isAbsolute(files) ? files : path.resolve(files);
    const links = [];
    fs.access(path_valid, (err) => {
        if(err) reject(`${path_valid} Is not a valid path`);
        else 
          fs.stat(path_valid, (err, stats) => {
            if (err) console.error(err)
            if (stats.isFile() && path.extname(path_valid) !== ".md") 
              reject(`${path_valid} Does not contain md files`)
            else 
                ubication_directory(path_valid).then((files_path_md) => {
                if(files_path_md.length <= 0) reject(new Error(diferent_files))
                files_path_md.map((mdFile) => {
                  links.push(read_links(mdFile))
                })
                Promise.all(links)
                  .then(response => {
                    const fnlResponse = response.flat()
                    !options.validate ? resolve(fnlResponse) : resolve(review(fnlResponse))
                  })
              })
          })
    });
  });
}


module.exports = md_links;
