#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const colors = require('colors');
const marked = require('marked');
const  jsdom  =  require ( "jsdom" ) ;
const md_links = require('./index.js');
const [,, ...args] = process.argv;


md_links;