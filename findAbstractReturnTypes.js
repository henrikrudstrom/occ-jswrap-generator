var nativeAPI = require('./lib/nativeAPI.js');

nativeAPI.find('*::*', 'method')
    .filter(method => {
        if(method.return.type === 'void') return false;
        var type = nativeAPI.get(method.return.type.replace('opencascade::handle<', '').replace('>', ''));
        return type && type.abstract;
    })
    .forEach(cls => console.log(cls.return.type + ' ' + cls.key))
