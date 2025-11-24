"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/canonicalize";
exports.ids = ["vendor-chunks/canonicalize"];
exports.modules = {

/***/ "(rsc)/./node_modules/canonicalize/lib/canonicalize.js":
/*!*******************************************************!*\
  !*** ./node_modules/canonicalize/lib/canonicalize.js ***!
  \*******************************************************/
/***/ ((module) => {

eval("/* jshint esversion: 6 */ /* jslint node: true */ \nmodule.exports = function serialize(object) {\n    if (object === null || typeof object !== \"object\" || object.toJSON != null) {\n        return JSON.stringify(object);\n    }\n    if (Array.isArray(object)) {\n        return \"[\" + object.reduce((t, cv, ci)=>{\n            const comma = ci === 0 ? \"\" : \",\";\n            const value = cv === undefined || typeof cv === \"symbol\" ? null : cv;\n            return t + comma + serialize(value);\n        }, \"\") + \"]\";\n    }\n    return \"{\" + Object.keys(object).sort().reduce((t, cv, ci)=>{\n        if (object[cv] === undefined || typeof object[cv] === \"symbol\") {\n            return t;\n        }\n        const comma = t.length === 0 ? \"\" : \",\";\n        return t + comma + serialize(cv) + \":\" + serialize(object[cv]);\n    }, \"\") + \"}\";\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvY2Fub25pY2FsaXplL2xpYi9jYW5vbmljYWxpemUuanMiLCJtYXBwaW5ncyI6IkFBQUEsdUJBQXVCLEdBQ3ZCLHFCQUFxQixHQUNyQjtBQUVBQSxPQUFPQyxPQUFPLEdBQUcsU0FBU0MsVUFBV0MsTUFBTTtJQUN6QyxJQUFJQSxXQUFXLFFBQVEsT0FBT0EsV0FBVyxZQUFZQSxPQUFPQyxNQUFNLElBQUksTUFBTTtRQUMxRSxPQUFPQyxLQUFLQyxTQUFTLENBQUNIO0lBQ3hCO0lBRUEsSUFBSUksTUFBTUMsT0FBTyxDQUFDTCxTQUFTO1FBQ3pCLE9BQU8sTUFBTUEsT0FBT00sTUFBTSxDQUFDLENBQUNDLEdBQUdDLElBQUlDO1lBQ2pDLE1BQU1DLFFBQVFELE9BQU8sSUFBSSxLQUFLO1lBQzlCLE1BQU1FLFFBQVFILE9BQU9JLGFBQWEsT0FBT0osT0FBTyxXQUFXLE9BQU9BO1lBQ2xFLE9BQU9ELElBQUlHLFFBQVFYLFVBQVVZO1FBQy9CLEdBQUcsTUFBTTtJQUNYO0lBRUEsT0FBTyxNQUFNRSxPQUFPQyxJQUFJLENBQUNkLFFBQVFlLElBQUksR0FBR1QsTUFBTSxDQUFDLENBQUNDLEdBQUdDLElBQUlDO1FBQ3JELElBQUlULE1BQU0sQ0FBQ1EsR0FBRyxLQUFLSSxhQUNmLE9BQU9aLE1BQU0sQ0FBQ1EsR0FBRyxLQUFLLFVBQVU7WUFDbEMsT0FBT0Q7UUFDVDtRQUNBLE1BQU1HLFFBQVFILEVBQUVTLE1BQU0sS0FBSyxJQUFJLEtBQUs7UUFDcEMsT0FBT1QsSUFBSUcsUUFBUVgsVUFBVVMsTUFBTSxNQUFNVCxVQUFVQyxNQUFNLENBQUNRLEdBQUc7SUFDL0QsR0FBRyxNQUFNO0FBQ1giLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wb3J0Zm9saW8tYXBwLy4vbm9kZV9tb2R1bGVzL2Nhbm9uaWNhbGl6ZS9saWIvY2Fub25pY2FsaXplLmpzPzY3MzUiXSwic291cmNlc0NvbnRlbnQiOlsiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuLyoganNsaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXJpYWxpemUgKG9iamVjdCkge1xuICBpZiAob2JqZWN0ID09PSBudWxsIHx8IHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnIHx8IG9iamVjdC50b0pTT04gIT0gbnVsbCkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmplY3QpO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgIHJldHVybiAnWycgKyBvYmplY3QucmVkdWNlKCh0LCBjdiwgY2kpID0+IHtcbiAgICAgIGNvbnN0IGNvbW1hID0gY2kgPT09IDAgPyAnJyA6ICcsJztcbiAgICAgIGNvbnN0IHZhbHVlID0gY3YgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgY3YgPT09ICdzeW1ib2wnID8gbnVsbCA6IGN2O1xuICAgICAgcmV0dXJuIHQgKyBjb21tYSArIHNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgfSwgJycpICsgJ10nO1xuICB9XG5cbiAgcmV0dXJuICd7JyArIE9iamVjdC5rZXlzKG9iamVjdCkuc29ydCgpLnJlZHVjZSgodCwgY3YsIGNpKSA9PiB7XG4gICAgaWYgKG9iamVjdFtjdl0gPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICB0eXBlb2Ygb2JqZWN0W2N2XSA9PT0gJ3N5bWJvbCcpIHtcbiAgICAgIHJldHVybiB0O1xuICAgIH1cbiAgICBjb25zdCBjb21tYSA9IHQubGVuZ3RoID09PSAwID8gJycgOiAnLCc7XG4gICAgcmV0dXJuIHQgKyBjb21tYSArIHNlcmlhbGl6ZShjdikgKyAnOicgKyBzZXJpYWxpemUob2JqZWN0W2N2XSk7XG4gIH0sICcnKSArICd9Jztcbn07XG4iXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsInNlcmlhbGl6ZSIsIm9iamVjdCIsInRvSlNPTiIsIkpTT04iLCJzdHJpbmdpZnkiLCJBcnJheSIsImlzQXJyYXkiLCJyZWR1Y2UiLCJ0IiwiY3YiLCJjaSIsImNvbW1hIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJPYmplY3QiLCJrZXlzIiwic29ydCIsImxlbmd0aCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/canonicalize/lib/canonicalize.js\n");

/***/ })

};
;