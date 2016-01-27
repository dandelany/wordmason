import './styles.less';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import randomWords from 'random-words';

const phraseCount = 250;
//const availableFonts = ["Helvetica Neue", "Georgia", "Arial Black", "Baskerville"];
const availableFonts = ["Baskerville"];
const phrases = randomPhrases(phraseCount);
const fontFamilies = _.times(phraseCount, _.sample.bind(this, availableFonts));

function loadFont(family, callback=_.noop) {
    return new Promise((resolve, reject) => {
        const start = new Date();
        const cb = function() {
            console.log(`loaded ${family} in ${new Date() - start} ms`);
            resolve(f);
            callback(f);
        };

        let f = new window.Font();
        f.fontFamily = family;
        f.onload = cb;
        f.src = f.fontFamily;
    });
}
function loadFonts(families, callback=_.noop) {
    //let promise;
    //families.forEach((family, i) => {
    //    console.log(family);
    //    if(i == 0) promise = loadFont(family);
    //    else promise = promise.then(() => loadFont(family));
    //});
    //promise.then(callback);
    //return promise;

    return Promise.all(families.map(family => loadFont(family))).then(callback);
}

function randomPhrases(count=1) {
    return _.range(count).map(() => randomWords(_.random(1, 4)).join(' '));
}
function randomColors(count=1, min=0, max=255) {
    const rgb = () => _.random(min, max);
    return _.range(count).map(() => `rgb(${rgb()}, ${rgb()}, ${rgb()})`);
}

class MeasuredLabel extends React.Component {
    render() {
        const text = '' + this.props.children;
        const {font, size, top, left, color} = this.props;

        const start = new Date();
        const metrics = font.measureText(text, size);
        console.log(`measured ${text} in ${new Date() - start} ms`);

        const style = {position: 'absolute'};
        const boxStyle = _.assign({}, style, {
            left,
            top: top,
            height: metrics.height,
            width: metrics.width,
            opacity: 0.5,
            background: color,
            zIndex: 9
        });
        const textStyle = _.assign({}, style, {
            top, left,
            fontFamily: font.fontFamily,
            fontSize: `${size}px`,
            lineHeight: `${metrics.height}px`,
            whiteSpace: 'nowrap',
            zIndex: 10
        });

        return <div>
            <div style={boxStyle}></div>
            <div style={textStyle}>{this.props.children}</div>
        </div>;
    }
}

MeasuredLabel.defaultProps = {
    size: 14,
    top: 0,
    left: 0
};


class Label extends React.Component {
    render() {
        const text = '' + this.props.children;
        const {font, size, box, color, metrics} = this.props;
        const {top, left, height, width} = box;

        const style = {position: 'absolute'};
        const boxStyle = _.assign({}, style, {
            left,
            top: top + (metrics.descent / 2),
            height,
            width,
            opacity: 0.5,
            background: color,
            zIndex: 9
        });
        const textStyle = _.assign({}, style, {
            top, left,
            fontFamily: font.fontFamily,
            fontSize: `${size}px`,
            lineHeight: `${height}px`,
            whiteSpace: 'nowrap',
            zIndex: 10
        });

        return <div>
            <div style={boxStyle}></div>
            <div style={textStyle}>{this.props.children}</div>
        </div>;
    }
}


function rectsIntersect(r1, r2) {
    return !(
        r2.left > r1.left + r1.width ||
        r1.left > r2.left + r2.width ||
        r2.top > r1.top + r1.height ||
        r1.top > r2.top + r2.height
    );
}

function addLabelToLayout(labels, newLabel) {
    let {phrase, font, size} = newLabel;
    let metrics = font.measureText(phrase, size);
    let placed = false;
    let box;

    const startLayout = new Date();
    let i = 0;
    while(!placed && i < 10) {
        const {width, height} = metrics;
        const top = _.random(window.innerHeight - height);
        const left = _.random(window.innerWidth - width);
        const newLabelBox = {top, left, width, height};

        if(!_.any(labels, label => rectsIntersect(newLabelBox, label.box))) {
            box = newLabelBox;
            placed = true;
        } else {
            size = Math.max(size - 2, 5);
            metrics = font.measureText(phrase, size);
        }
        i++;
    }
    return placed ? labels.concat(Object.assign({}, newLabel, {size, metrics, box})) : labels;
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {labels: []};
        //window.setInterval(this.addLabel.bind(this, props), 50);
        requestAnimationFrame(this.addLabel.bind(this));
    }
    addLabel() {
        const {fonts, phrases} = this.props;
        //const phrase = phrases[labels.length];
        const phrase = randomPhrases(1)[0];
        const font = _.sample(fonts);
        const size = _.random(6, 52);
        const color = randomColors(1)[0];

        let {labels} = this.state;
        if(labels.length > 400) labels = [];
        const labelCount = labels.length;
        const newLabels = addLabelToLayout(labels, {phrase, font, size, color});

        if(newLabels.length > labelCount) {
            this.setState(
                {labels: newLabels},
                () => requestAnimationFrame(this.addLabel.bind(this))
            );
        } else this.addLabel();

    }
    render() {
        //const {fonts, phrases} = this.props;
        //let labels = [];
        //let measureTime = 0;
        //let layoutTime = 0;
        //
        //phrases.forEach(phrase => {
        //    const font = _.sample(fonts);
        //    const size = _.random(6, 36);
        //    const color = randomColors(1)[0];
        //    labels = addLabelToLayout(labels, {phrase, font, size, color})
        //});
        //
        //console.log(`text measurement took ${measureTime} ms`);
        //console.log(`layout took ${layoutTime} ms`);

        return <div>
            {this.state.labels.map(({phrase, font, size, metrics, box, color}) => {
                return <Label {...{font, size, metrics, box, color}}>
                    {phrase}
                </Label>;
            })}
        </div>;
    }
}





window.setTimeout(() => {
    loadFonts(availableFonts, (fonts) => {
        ReactDOM.render(
            <App {...{fonts, phrases}}/>,
            document.getElementById('container')
        );
    });
}, 1000);


