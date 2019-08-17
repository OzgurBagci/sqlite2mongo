const Ajv = require('ajv');
const ajv = new Ajv();

ajv.addKeyword('booleanstr', {
    type: 'string',
    compile: function (schema) {
        return function (data) {
            return data == true || data == false;
        };
    }
})

const Validator = function () {
    this.datatypes = {};
    this.validated = true;
}

Validator.prototype.validate = function (input) {
    Object.keys(this.datatypes).forEach((ele) => {
        this.validated = ajv.validate(this.datatypes[ele], input[ele]);
    });
}

Validator.prototype.addDataType = function (key, validators) {
    this.datatypes[key] = validators;
}

Validator.prototype.convertType2Validator = function (datatype) {
    const mType = [];
    const datatypeVal = { 'type': mType };
    if (datatype.includes('INT')) mType.push('integer');
    else if (datatype.includes('VARCHAR')) mType.push('string');
    else if (datatype.includes('DOUBLE')) mType.push('number');
    else if (datatype.includes('BOOLEAN')) {
        datatypeVal['booleanstr'] = null;
        mType.push('string');
    }
    return datatypeVal;
}

Validator.prototype.addNull = function (datatypes) {
    datatypes['type'].push('null');
}

Validator.prototype.isValid = function () {
    return this.validated;
}

Validator.prototype.getDataTypes = function () {
    return this.datatypes;
}

Validator.prototype.setDataTypes = function (datatypes) {
    this.datatypes = datatypes;
}

module.exports = { Validator, };
