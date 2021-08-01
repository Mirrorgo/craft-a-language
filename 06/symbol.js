"use strict";
/**
 * 符号表和作用域
 * @version 0.5
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-04
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolDumper = exports.SymbolVisitor = exports.intrinsics = exports.built_ins = exports.FUN_integer_to_string = exports.FUN_tick = exports.FUN_println = exports.SymKind = exports.VarSymbol = exports.FunctionSymbol = exports.Symbol = void 0;
const types_1 = require("./types");
/////////////////////////////////////////////////////////////////////////
// 符号表
// 
/**
 * 符号
 */
class Symbol {
    constructor(name, theType, kind) {
        this.theType = types_1.SysTypes.Any;
        this.name = name;
        this.theType = theType;
        this.kind = kind;
    }
}
exports.Symbol = Symbol;
class FunctionSymbol extends Symbol {
    constructor(name, theType, vars = []) {
        super(name, theType, SymKind.Function);
        this.vars = []; //本地变量的列表。参数也算本地变量。
        this.opStackSize = 10; //操作数栈的大小
        this.byteCode = null; //存放生成的字节码
        this.decl = null; //存放AST，作为代码来运行
        this.theType = theType;
        this.vars = vars;
    }
    /**
     * visitor模式
     * @param vistor
     * @param additional 额外需要传递给visitor的信息。
     */
    accept(vistor, additional = undefined) {
        vistor.visitFunctionSymbol(this, additional);
    }
    //获取参数数量
    getNumParams() {
        return this.theType.paramTypes.length;
    }
}
exports.FunctionSymbol = FunctionSymbol;
class VarSymbol extends Symbol {
    constructor(name, theType) {
        super(name, theType, SymKind.Variable);
        this.theType = theType;
    }
    /**
     * visitor模式
     * @param vistor
     * @param additional 额外需要传递给visitor的信息。
     */
    accept(vistor, additional = undefined) {
        vistor.visitVarSymbol(this, additional);
    }
}
exports.VarSymbol = VarSymbol;
/**
 * 符号类型
 */
var SymKind;
(function (SymKind) {
    SymKind[SymKind["Variable"] = 0] = "Variable";
    SymKind[SymKind["Function"] = 1] = "Function";
    SymKind[SymKind["Class"] = 2] = "Class";
    SymKind[SymKind["Interface"] = 3] = "Interface";
    SymKind[SymKind["Parameter"] = 4] = "Parameter";
    SymKind[SymKind["Prog"] = 5] = "Prog";
})(SymKind = exports.SymKind || (exports.SymKind = {}));
;
/**
 * 左值。
 * 目前先只是指变量。
 */
// export class LeftValue{
//     leftValue_tag = 1234;  //魔法数字，用来做类型判断
//     variable:VarSymbol;
//     constructor(variable:VarSymbol){
//         this.variable = variable;
//     }
//     static isLeftValue(v:any):boolean{
//         return (typeof v == 'object' && typeof (v as LeftValue).variable == 'object' && 
//             typeof (v as LeftValue).leftValue_tag == 'number' && (v as LeftValue).leftValue_tag == 1234);
//     }
// }
/////////////////////////////////////////////////////////////////////////
//一些系统内置的符号
exports.FUN_println = new FunctionSymbol("println", new types_1.FunctionType(types_1.SysTypes.Void, [types_1.SysTypes.String]), [new VarSymbol("a", types_1.SysTypes.String)]);
exports.FUN_tick = new FunctionSymbol("tick", new types_1.FunctionType(types_1.SysTypes.Integer, []), []);
exports.FUN_integer_to_string = new FunctionSymbol("integer_to_string", new types_1.FunctionType(types_1.SysTypes.String, [types_1.SysTypes.Integer]), [new VarSymbol("a", types_1.SysTypes.Integer)]);
exports.built_ins = new Map([
    ["println", exports.FUN_println],
    ["tick", exports.FUN_tick],
    ["integer_to_string", exports.FUN_integer_to_string],
    // ["string_concat", FUN_string_concat],
]);
let FUN_string_create_by_str = new FunctionSymbol("string_create_by_str", new types_1.FunctionType(types_1.SysTypes.String, [types_1.SysTypes.String]), [new VarSymbol("a", types_1.SysTypes.String)]);
let FUN_string_concat = new FunctionSymbol("string_concat", new types_1.FunctionType(types_1.SysTypes.String, [types_1.SysTypes.String, types_1.SysTypes.String]), [new VarSymbol("str1", types_1.SysTypes.String), new VarSymbol("str2", types_1.SysTypes.String)]);
exports.intrinsics = new Map([
    ["string_create_by_str", FUN_string_create_by_str],
    ["string_concat", FUN_string_concat],
]);
///////////////////////////////////////////////////////////////////////
//visitor
class SymbolVisitor {
}
exports.SymbolVisitor = SymbolVisitor;
class SymbolDumper extends SymbolVisitor {
    visit(sym, additional) {
        return sym.accept(this, additional);
    }
    /*
     * 输出VarSymbol的调试信息
     * @param sym
     * @param additional 前缀字符串
     */
    visitVarSymbol(sym, additional) {
        console.log(additional + sym.name + "{" + SymKind[sym.kind] + "}");
    }
    /**
     * 输出FunctionSymbol的调试信息
     * @param sym
     * @param additional 前缀字符串
     */
    visitFunctionSymbol(sym, additional) {
        console.log(additional + sym.name + "{" + SymKind[sym.kind] + ", local var count:" + sym.vars.length + "}");
        //输出字节码
        if (sym.byteCode != null) {
            let str = '';
            for (let code of sym.byteCode) {
                str += code.toString(16) + " ";
            }
            console.log(additional + "    bytecode: " + str);
        }
    }
}
exports.SymbolDumper = SymbolDumper;
