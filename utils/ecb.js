const https = require('https');
var parser = require('fast-xml-parser');

function UModel(options) {
    let { config } = options 

    class ECBError extends Error {
        constructor(response) {
            super(`${response.code || '-'} ${response.type || '-'} ${response.info || '-'}`);
            this.name = "ECBError";
            this.response = response
        }
    }

    function today() {
        return new Promise((resolve, reject) => {    
            https.get(`https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml`, response => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        var jsonObj = parser.parse(data, {
                            ignoreAttributes : false,
                            attributeNamePrefix : "",
                        });
                        if(!jsonObj || !jsonObj['gesmes:Envelope'] || !jsonObj['gesmes:Envelope'].Cube || !jsonObj['gesmes:Envelope'].Cube.Cube) 
                            return reject(new ECBError(jsonObj))

                        let cube = jsonObj['gesmes:Envelope'].Cube.Cube

                        let rates = {'EUR': 1}
                        cube.Cube.forEach(el => {
                            rates[el.currency] = parseFloat(el.rate)
                        });

                        return resolve({
                            ts: cube.time,
                            rates
                        })
                    } catch(error) {
                        return reject(error)
                    }                    
                });
                response.on('error', (error) => {
                    reject(error)
                })
            });
        })
    }

    return {
        today
    }
}

module.exports = UModel