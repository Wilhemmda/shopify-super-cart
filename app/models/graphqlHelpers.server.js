// Convertir un json en string, accepté par grapqhql de shopify
/**
 * 
 * @param {Object} value 
 * @returns 
 */
export function jsonToStringValue(value) {
    return JSON.stringify(value).replace(/"/g, '\\"')
  }
// Pareil que en haut mais l'inverse
/**
 * 
 * @param {String} value 
 * @returns 
 */
export function stringValueToJson(value) {
   return JSON.parse(value.replace(/\\"/g, '"'))
  }

export function test() {
    return null
}