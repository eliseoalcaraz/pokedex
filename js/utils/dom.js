function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
            return;
        }

        if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
            return;
        }

        if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
            return;
        }

        element.setAttribute(key, value);
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });

    return element;
}

function showElement(element) {
    if (element) {
        element.hidden = false;
    }
}

function hideElement(element) {
    if (element) {
        element.hidden = true;
    }
}

export { createElement, hideElement, showElement };
