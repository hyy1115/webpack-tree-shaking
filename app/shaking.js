import { square } from './lib/utils.js';

function component() {
    var element = document.createElement('pre');
    
    element.innerHTML = [
        'Hello webpack!',
        '5 cubed is equal to ' + square(10)
    ].join('\n\n');
    
    return element;
}

document.body.appendChild(component());