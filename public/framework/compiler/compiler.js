import { getStyles } from './styles.js';
export const components = [];
let component = null;
export const compileUI = () => {
    const surfaceElement = document.getElementById('surface');
    const nodes = surfaceElement.childNodes;
    for (const element of nodes) {
        if (element.tagName) {
            hydrateElement(element);
        }
    }
    localStorage.setItem('elementDescriptors', JSON.stringify(components));
};
function hydrateElement(thisElement) {
    const tagName = thisElement.tagName.toLowerCase();
    const styles = getStyles(thisElement);
    component = {
        kind: tagName,
        id: getStringAttribute(thisElement, 'id'),
        idx: getNumbericAttribute(thisElement, 'idx', 0),
        pathGeometry: getPathGeometry(thisElement, styles),
        renderAttributes: getAttributes(thisElement, styles)
    };
    components.push(component);
    return component;
}
function getPathGeometry(thisElement, styles) {
    const l = getNumbericAttribute(thisElement, 'left');
    const t = getNumbericAttribute(thisElement, 'top');
    const w = getNumbericAttribute(thisElement, 'width');
    const h = getNumbericAttribute(thisElement, 'height');
    const r = getNumbericAttribute(thisElement, 'radius');
    return {
        left: (l > 0) ? l : (styles.left) ? parseInt(styles.left) : 10,
        top: (t > 0) ? t : (styles.top) ? parseInt(styles.top) : 10,
        width: (w > 0) ? w : (styles.width) ? parseInt(styles.width) : 10,
        height: (h > 0) ? h : (styles.height) ? parseInt(styles.height) : 10,
        radius: (r > 0) ? r : (styles['border-radius']) ? parseInt(styles['border-radius']) : 15
    };
}
function getAttributes(thisElement, styles) {
    const strokeClr = getStringAttribute(thisElement, 'strokeColor');
    const fillClr = getStringAttribute(thisElement, 'fillColor');
    const fntSize = getStringAttribute(thisElement, 'font-size');
    return {
        strokeColor: (strokeClr) ? strokeClr : (styles.stroke) ? styles.stroke : 'black',
        fillColor: (fillClr) ? fillClr : (styles.fill) ? styles.fill : 'red',
        fontColor: getStringAttribute(thisElement, 'fontColor') || 'black',
        fontSize: (fntSize) ? fntSize : (styles['font-size']) ? styles['font-size'] : '14px',
        borderWidth: getNumbericAttribute(thisElement, 'borderWidth', 2),
        text: thisElement.textContent,
        isLeft: getBooleanAttribute(thisElement, 'isLeft')
    };
}
function getBooleanAttribute(thisElement, name) {
    const boolResult = thisElement.getAttribute(name);
    return (boolResult === "false" || boolResult === null) ? false : true;
}
function getNumbericAttribute(thisElement, name, defaultNumber = 0) {
    const val = thisElement.getAttribute(name);
    return (val) ? parseInt(val) : defaultNumber;
}
function getStringAttribute(thisElement, name) {
    return thisElement.getAttribute(name);
}
