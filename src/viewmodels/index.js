'use strict';

const fs = require('fs');

class BaseViewModel {
    constructor(obj, takeString) {
        if (this.customMappings) {
            this.customMappings(obj);
        }

        if (!takeString) {
            for (const propName in obj) {
                if(!this[propName]) {
                    this[propName] = obj[propName];
                }
            }
        } else if (takeString.startsWith('+')) {
            takeString
                .split('+')
                .forEach(propName => {
                    if (!this[propName]) {
                        this[propName] = obj[propName]
                    }
                });
        } else if (takeString.startsWith('-')) {
            const excludedProperties = takeString.split('-').reduce((map, propName) => {
                map[propName] = true;
                return map;
            }, Object.create(null));
            
            for (const propName in obj) {
                if (!excludedProperties[propName] && !this[propName]) {
                    this[propName] = obj[propName];
                }
            }
        }
    }
}

const viewmodels = {};

fs.readdirSync(__dirname)
    .filter(fileName => fileName.endsWith('-viewmodel.js'))
    .forEach(fileName => {
        const viewmodel = require(`./${fileName}`);;

        viewmodels[viewmodel.name] = class extends BaseViewModel {
            customMappings(obj) {
                viewmodel.customMappings(this, obj);
            }

            constructor(obj, takeString) {
                super(obj, takeString);
            }
        }
    });

module.exports = viewmodels;