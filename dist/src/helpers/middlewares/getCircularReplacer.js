"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCircularReplacer = void 0;
/*
* This code defines a function `getCircularReplacer` that
* returns a replacer function to be used with `JSON.stringify`
* to handle circular references in objects.
* The function creates a `WeakSet` called `seen` to keep track
* of objects that have already been visited. The replacer function takes two arguments,
* `_key` (which is not used in this case) and `value`, and checks if the `value` is an
*  object and not null. If it is, the function checks if the object has already been
* seen by checking if it exists in the `seen` set. If the object has been seen before,
* the function returns `undefined` to prevent circular references. If the object
* has not been seen before, it is added to the `seen` set and returned as is.
* This replacer function can be passed as the second argument to `JSON.stringify`
* to handle circular references when serializing objects to JSON.
* */
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};
exports.getCircularReplacer = getCircularReplacer;
//# sourceMappingURL=getCircularReplacer.js.map