const styleNames = [
    'left',
    'top',
    'width',
    'height',
    'border-radius',
    'color',
    'border',
    'border-color',
    'border-style',
    'stroke',
    'background-color',
    'font-name',
    'font-size',
    'isleft'
];
function fixNums(value) {
    const valNum = parseInt(value);
    return (isNaN(valNum)) ? value : valNum;
}
export function getStyles(element) {
    const styles = Object.create(null);
    const computedStyles = window.getComputedStyle(element);
    styleNames.forEach((name) => {
        if (element.hasAttribute(name)) {
            const val = element.getAttribute(name);
            if (val) {
                styles[name] = fixNums(val);
            }
            else {
                styles[name] = true;
            }
        }
        else {
            if (computedStyles[name]) {
                styles[name] = fixNums(computedStyles[name]);
            }
        }
    });
    return styles;
}
