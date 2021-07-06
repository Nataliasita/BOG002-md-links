#!/usr/bin/env node

const path = require('path');
const colors = require('colors');
const marked = require('marked');
const md_links = require('./index.js');
const yargs = require('yargs');
const { ENGINE_METHOD_DH } = require('constants');

const [,, ...args] = process.argv;
const route = args[0];

const options = yargs

.usage("Usage: md-links <path-to-file> [options]")
.option("validate", { 
    describe: "Realizar solicitud HTTP para validacion de links", 
    type: "boolean",
    demandOption: false 
})
.option("stats", {
    describe: "Genera las estadisticas de los enlaces",
    type: "boolean",
    demandOption: false 
})
.help(true)
.argv;

if(!route){
    console.error("Ruta no proporcionada por el usuario!");
}else{
    if(args.length == 1){
        md_links(route).then((data) =>{
            data.forEach(element => {
                console.table({File:element.file, href: element.href, text: element.text});
            });
        })
        .catch(console.error);
    }
    if (yargs.argv.validate) {
        md_links(route, {validate: true})
        .then((data)=> {
            data.forEach(element => {
                console.table({File: element.file, href: element.href, ok:element.ok, status:element.status, text: element.text});
            });
        })
        .catch(console.error);
    }
    if (yargs.argv.stats) {
        md_links(route)
        .then((data)=> {
            const total = data.length;
            const links_unique = [...new Set(data.map((element) => element.href))];
            console.table({Total: total, Unique: links_unique.length});
        })
        .catch(console.error);
    }
    if (yargs.argv.validate && yargs.argv.stats){
        md_links(route, {validate: true})
        .then((data)=> {
            const total = data.length;
            const uniqueLinks = [...new Set(data.map((element) => element.href))];
            const broken = data.map(element => element.status !== 200)
            console.table(
                { Total: total, Unique: uniqueLinks.length, Broken: broken.length}
                );
        })
        .catch(console.error);
    }
}

