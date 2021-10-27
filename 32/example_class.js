"use strict";
var a1 = new Mammal(30, "yellow");
var Mammal = /** @class */ (function () {
    function Mammal(weight, color) {
        this.weight = weight;
        this.color = color;
    }
    Mammal.prototype.speak = function () {
        // println("Hello!");
    };
    return Mammal;
}());
var mammal = new Mammal(20, "white");
// println(mammal.color);
// println(mammal.weight);
new Mammal(10, "black").color;
console.log();
