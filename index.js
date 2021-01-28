const STATE_STRINGS = ['OK', 'WARNING', 'CRITICAL'];

const requestPromise = require('request-promise');

const options = require('node-getopt').create([
    ['u', 'url=ARG', 'The URL to request.'],
    ['j', 'method=ARG', 'HTTP Method to use (default: GET).'],
    ['t', 'timeout=ARG', 'Seconds before connection times out (default: 10).'],
    ['p', 'checkproperty=ARG', 'Warning/Critical checks should be made on this property from the body instead of the response time.'],
    ['w', 'warning=ARG', 'Warning threshold (default: 1000).'],
    ['c', 'critical=ARG', 'Critical threshold (default: 2000).'],
    ['h', 'help', 'Display this help.'],
    ['V', 'version', 'Show version.']
]).bindHelp().parseSystem().options;

if (options.version) {
    console.log(require('./package.json').version);
    process.exit(3);
}

if (!options.url) {
    console.log('URL is mandatory');
    process.exit(3);
}

let warning = 1000;
let critical = 2000;

if (options.warning) {
    try {
        warning = parseInt(options.warning);
    }
    catch(err) {
        console.log('Warning value is not parsable to an integer.');
        process.exit(3);
    }
}

if (options.critical) {
    try {
        critical = parseInt(options.critical);
    }
    catch(err) {
        console.log('Critical value is not parseable to an integer.');
        process.exit(3);
    }
}

function objectToString(object, prefix) {
    return Object.keys(object).reduce((acc, key) => {
        const value = object[key];
        let subKey = prefix ? prefix + '.' + key : key;
        if (typeof value === 'object' && value !== null) {
            acc += objectToString(value, subKey);
        }
        else {
            acc += subKey + '=' + value;
            acc += ' ';
        }
        
        return acc;
    }, '');
}

requestPromise({
    uri: options.url,
    method: options.method || 'GET',
    timeout: parseInt(options.timeout || 10) * 1000,
    resolveWithFullResponse: true,
    time: true
})
.then(response => {
    let body = null;
    let resultValue = response.elapsedTime;

    try {
        body = JSON.parse(response.body);
    }
    catch(err) {

    }

    if (options.checkproperty) {
        let bodyValue;
        try {
            bodyValue = options.checkproperty.split('.').reduce((acc, propertyPart) => acc[propertyPart], body);
        }
        catch(err) {
            console.log(options.checkproperty, 'does not exist in response body');
            process.exit(3);
        }
        try {
            resultValue = parseInt(bodyValue);
        }
        catch(err) {
            console.log(bodyValue, 'is not parsable to an integer');
            process.exit(3);
        }
    }

    const state = resultValue > critical ? 2 : resultValue > warning ? 1 : 0;
    const performanceData = (body ? " | " + objectToString(body) : " ") + "responseTime=" + response.elapsedTime;

    console.log('HTTP', STATE_STRINGS[state], response.statusCode);
    console.log((response.body ? response.body : "") + performanceData);
    process.exit(state);
})
.catch(response => {
    if (response.statusCode) {
        console.log('HTTP', STATE_STRINGS[2], response.statusCode);
        process.exit(2);
    }
    console.log(response);
    process.exit(3);
})
