// src/bytes_allocation.js
(function(){
    var pointers = [];
    
    function normalizeValue(value) {
        if (value && value.buffer instanceof ArrayBuffer) {
            value = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
        } else if (typeof value === "string") {
            var length = value.length, array = new Uint8Array(length + 1);
            for (var i = 0; i < length; ++i) {
                array[i] = value.charCodeAt(i);
            }
            return array;
        }
        return value;
    }
    
    function createPointer(address, size) {
        var pointer;
        pointer = new Number(address);
        pointer["length"] = size;
        pointer["get"] = function(as) {
            as = as || Uint8Array;
            return new as(HEAPU8.buffer, pointer, size / as.BYTES_PER_ELEMENT).slice();
        };
        pointer["dereference"] = function(size) {
            size = size || 4;
            return createPointer(pointer["get"](Uint32Array)[0], size);
        };
        pointer["set"] = function(value) {
            value = normalizeValue(value);
            if (value.length > size) {
                throw RangeError("invalid array length");
            }
            HEAPU8.set(value, pointer);
        };
        pointer["free"] = function() {
            _free(pointer);
            pointers.splice(pointers.indexOf(pointer), 1);
        };
        pointers.push(pointer);
        return pointer;
    }
    
    function allocatePointer(address) {
        if (address) {
            address = Uint32Array.of(address);
        }
        return allocateBytes(4, address);
    }
    
    function allocateBytes(size, value) {
        var pointer;
        value = normalizeValue(value);
        if (size === 0) {
            size = value.length;
        }
        pointer = createPointer(_malloc(size), size);
        if (value !== undefined) {
            pointer["set"](value);
            if (value.length < size) {
                HEAPU8.fill(0, pointer + value.length, pointer + size);
            }
        } else {
            HEAPU8.fill(0, pointer, pointer + size);
        }
        return pointer;
    }
    
    function freeBytes() {
        for (var i = 0, length = pointers.length; i < length; ++i) {
            _free(pointers[i]);
        }
        pointers = [];
    }
    

    Module["createPointer"] = createPointer;
    Module["allocatePointer"] = allocatePointer;
    Module["allocateBytes"] = allocateBytes;
    Module["freeBytes"] = freeBytes;

    // Expose VDF functions as JS methods using cwrap for browser, after WASM is ready
    if (typeof Module !== 'undefined') {
        Module.postRun = Module.postRun || [];
        Module.postRun.push(function() {
            if (typeof Module.cwrap === 'function') {
                // generate: (u32, u8*, usize, u16, bool, u8**, usize*) -> u8
                Module.generate = Module.cwrap('generate', 'number', [
                    'number', // iterations (u32)
                    'number', // challenge (u8*)
                    'number', // challenge_size (usize)
                    'number', // int_size_bits (u16)
                    'boolean',// is_pietrzak (bool)
                    'number', // proof (u8**)
                    'number'  // proof_size (usize*)
                ]);
                // verify: (u32, u8*, usize, u8*, usize, u32, bool) -> bool
                Module.verify = Module.cwrap('verify', 'boolean', [
                    'number', // iterations (u32)
                    'number', // challenge (u8*)
                    'number', // challenge_size (usize)
                    'number', // proof (u8*)
                    'number', // proof_size (usize)
                    'number', // int_size_bits (u32)
                    'boolean' // is_pietrzak (bool)
                ]);
            }
        });
    }
})();
