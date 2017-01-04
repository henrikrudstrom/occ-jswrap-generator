# occ-jswrap-generator

## Dependencies: 
* OpenCascade 7.1.0
* Globally installed gulp-cli: `npm install glup-cli -g`
* Globally installed cmake-js: `npm install cmake-js -g`
* clang-format 

To re-parse the headers (`data/headers`) you also need:
* CastXML
* python
* pygccxml (version 1.8.x or higher)

## Usage

`gulp parse-headers` parses opencascade header files, not necessary unless you make 
changes to `parse_headers.py`

`gulp test` tests the wrap generator
`gulp render` generates the c++ wrapper
`cmake-js` build the wrapper
 


