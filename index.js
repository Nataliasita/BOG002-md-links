#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const colors = require('colors');
const marked = require('marked');
const  jsdom  =  require ( "jsdom" ) ; 
//const { JSDOM } = jsdom;
//const http = require('http');
//const axios = require("axios");

function md_links (route){
    let promise_read;
    let dataLinks = [];
    promise_read = new Promise ((resolve,reject) => {
    fs.readFile(route,'utf8',(err, data) => {
    if(err) throw err;
    if (path.extname(route).toLowerCase() === '.md') {
        let currentDirectory = process.cwd();
        const htmlData = marked(data);
        const dom = new jsdom.JSDOM(htmlData);
        const anwersLink = dom.window.document.querySelectorAll("a");
        anwersLink.forEach((element) => {
            if (element.href.includes("http")) {
              dataLinks.push({
                href: element.href,
                text: element.textContent,
                file: currentDirectory,
              });
            } 
    })
    }
    let resultado = console.log(dataLinks)
    resultado;
//resolve(data);
});
});
return promise_read;
}

md_links('README.md').then((data)=> {
console.log(data)   
})

console.log('esto se ejecuta antes que esté el archivo');

module.exports = md_links;
