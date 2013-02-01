arrayToObject = (arr) ->
	dict = {}
	dict[val] = arr[1][key] for val,key in arr[0] when arr[1][key]
	return dict

`
/**
 * Convert data in CSV (comma separated value) format to a javascript array.
 *
 * Values are separated by a comma, or by a custom one character delimeter.
 * Rows are separated by a new-line character.
 *
 * Leading and trailing spaces and tabs are ignored.
 * Values may optionally be enclosed by double quotes.
 * Values containing a special character (comma's, double-quotes, or new-lines)
 *   must be enclosed by double-quotes.
 * Embedded double-quotes must be represented by a pair of consecutive 
 * double-quotes.
 *
 * Example usage:
 *   var csv = '"x", "y", "z"\n12.3, 2.3, 8.7\n4.5, 1.2, -5.6\n';
 *   var array = csv2array(csv);
 *  
 * Author: Jos de Jong, 2010
 * 
 * @param {string} data             The data in CSV format.
 * @param {string} delimeter        [optional] a custom delimeter. Comma ',' by default
 *                                  The Delimeter must be a single character.
 * @param {string} string_delimiter defaults to ""
 * @return {Array} array            A two dimensional array containing the data
 * @throw {String} error            The method throws an error when there is an
 *                                  error in the provided data.
 */ 
function csv2array(data, delimeter, string_delimiter) {

  // Retrieve the delimeter
  if (delimeter == undefined) 
    delimeter = ',';
  if (delimeter && delimeter.length > 1)
    delimeter = ',';


  if (string_delimiter === undefined)
    string_delimiter = '\"';

  // initialize variables
  var newline = '\n';
  var eof = '';
  var i = 0;
  var c = data.charAt(i);
  var row = 0;
  var col = 0;
  var array = new Array();

  while (c != eof) {
    // skip whitespaces
    while (c == ' ' || c == '\t' || c == '\r') {
      c = data.charAt(++i); // read next char
    }
    
    // get value
    var value = "";
    if (c == string_delimiter) {
      // value enclosed by double-quotes
      c = data.charAt(++i);
      
      do {
        if (c != string_delimiter) {
          // read a regular character and go to the next character
          value += c;
          c = data.charAt(++i);
        }
        
        if (c == string_delimiter) {
          // check for escaped double-quote
          var cnext = data.charAt(i+1);
          if (cnext == string_delimiter) {
            // this is an escaped double-quote. 
            // Add a double-quote to the value, and move two characters ahead.
            value += string_delimiter;
            i += 2;
            c = data.charAt(i);
          }
        }
      }
      while (c != eof && c != string_delimiter);
      
      if (c == eof) {
        //alert("Unexpected end of data, double-quote expected");
        return false;
      }

      c = data.charAt(++i);
    }
    else {
      // value without quotes
      while (c != eof && c != delimeter && c!= newline && c != ' ' && c != '\t' && c != '\r') {
        value += c;
        c = data.charAt(++i);
      }
    }

    // add the value to the array
    if (array.length <= row) 
      array.push(new Array());
    array[row].push(value);
    
    // skip whitespaces
    while (c == ' ' || c == '\t' || c == '\r') {
      c = data.charAt(++i);
    }

    // go to the next row or column
    if (c == delimeter) {
      // to the next column
      col++;
    }
    else if (c == newline) {
      // to the next row
      col = 0;
      row++;
    }
    else if (c != eof) {
      // unexpected character
      //alert("Delimiter expected after character "+ i +"( "+ data.substr(i - 15, 20) +")");
      return false;
    }
    
    // go to the next character
    c = data.charAt(++i);
  }  
  
  return array;
}
`



module.exports = {
	arrayToObject
	csv2array
}