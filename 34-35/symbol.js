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
exports.SymbolDumper = exports.SymbolVisitor = exports.built_ins = exports.FUN_integer_to_string = exports.FUN_tick_d = exports.FUN_tick = exports.FUN_println_d = exports.FUN_println_s = exports.FUN_println_l = exports.FUN_println = exports.SymKind = exports.ClassSymbol = exports.VarSymbol = exports.Closure = exports.FunctionSymbol = exports.FunctionKind = exports.Symbol = void 0;
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
var FunctionKind;
(function (FunctionKind) {
    FunctionKind[FunctionKind["Function"] = 0] = "Function";
    FunctionKind[FunctionKind["Method"] = 1] = "Method";
    FunctionKind[FunctionKind["Constructor"] = 2] = "Constructor";
})(FunctionKind = exports.FunctionKind || (exports.FunctionKind = {}));
class FunctionSymbol extends Symbol {
    constructor(name, theType, vars = [], functionKind = FunctionKind.Function) {
        super(name, theType, SymKind.Function);
        this.vars = []; //本地变量的列表。参数也算本地变量。
        this.opStackSize = 10; //操作数栈的大小
        this.byteCode = null; //存放生成的字节码
        this.decl = null; //存放AST，作为代码来运行
        this.classSym = null; //当FunctionSymbol是类的方法时，设置所关联的类。
        this.closure = null;
        this.vars = vars;
        this.functionKind = functionKind;
    }
    //是否是方法
    get isMethodOrConstructor() {
        return this.classSym != null;
    }
    //获取全名称，也就是“类名.方法名”
    get fullName() {
        let str = "";
        if (this.classSym) {
            str += this.classSym.name + ".";
        }
        str += this.name;
        return str;
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
/**
 * 保存函数的闭包分析结果
 * 也就是：函数所引用的外部变量，以及每个外部变量所属的函数
 */
class Closure {
    constructor() {
        //闭包中所应用的变量
        this.vars = [];
        //每个变量所在的函数
        this.functions = [];
    }
    toString() {
        let str = "closure{";
        for (let i = 0; i < this.vars.length; i++) {
            str += this.functions[i].name + "." + this.vars[i].name;
            if (i < this.vars.length - 1)
                str += ", ";
        }
        str += "}";
        return str;
    }
}
exports.Closure = Closure;
class VarSymbol extends Symbol {
    constructor(name, theType) {
        super(name, theType, SymKind.Variable);
        this.classSym = null; //当VarSymbol是类的属性时，设置所关联的类。
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
class ClassSymbol extends Symbol {
    constructor(decl, theType, constructor_ = null, props = [], methods = [], superClassSym = null) {
        super(decl.name, theType, SymKind.Class);
        this.decl = decl;
        this.constructor_ = constructor_;
        this.props = props;
        this.methods = methods;
        this.superClassSym = superClassSym;
        if (this.constructor_)
            this.constructor_.classSym = this;
        for (let prop of this.props) {
            prop.classSym = this;
        }
        for (let method of this.methods) {
            method.classSym = this;
        }
    }
    /**
     * visitor模式
     * @param vistor
     * @param additional 额外需要传递给visitor的信息。
     */
    accept(visitor, additional = undefined) {
        visitor.visitClassSymbol(this, additional);
    }
    //计算总的属性的数量，包括自身的属性数和各级父类的属性数。
    get numTotalProps() {
        let num = this.props.length;
        if (this.superClassSym) {
            num += this.superClassSym.numTotalProps; //递归查找
        }
        return num;
    }
    //计算总的属性的数量，包括自身的属性数和各级父类的属性数。
    get numTotalMethods() {
        let num = this.methods.length;
        if (this.superClassSym) {
            num += this.superClassSym.numTotalMethods; //递归查找
        }
        return num;
    }
    //返回某个属性在总的属性中的序号，用于计算在内存中的偏移量
    getPropIndex(prop) {
        let index = this.props.indexOf(prop);
        if (index == -1) {
            if (this.superClassSym)
                index = this.superClassSym.getPropIndex(prop);
        }
        else {
            if (this.superClassSym)
                index += this.superClassSym.numTotalProps;
        }
        return index;
    }
    //返回某个方法在总的方法中的序号，用于计算在vtable中的偏移量
    //考虑了方法覆盖的情况
    getMethodIndex(methodName) {
        let index = -1;
        for (let i = 0; i < this.methods.length; i++) {
            if (this.methods[i].name == methodName) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            if (this.superClassSym)
                index = this.superClassSym.getMethodIndex(methodName);
        }
        else {
            if (this.superClassSym)
                index += this.superClassSym.numTotalMethods;
        }
        return index;
    }
    //获取父类的构造方法
    getSuperClassConstructor() {
        if (this.superClassSym) {
            if (this.superClassSym.constructor_) {
                return this.superClassSym.constructor_;
            }
            else {
                return this.superClassSym.getSuperClassConstructor();
            }
        }
        else {
            return null;
        }
    }
    //获取本级或父类中的属性
    getPropertyCascade(name) {
        for (let prop of this.props) {
            if (prop.name == name) {
                return prop;
            }
        }
        if (this.superClassSym) {
            return this.superClassSym.getPropertyCascade(name);
        }
        else {
            return null;
        }
    }
    //获取本级或父类中的方法
    getMethodCascade(name) {
        for (let method of this.methods) {
            if (method.name == name) {
                return method;
            }
        }
        if (this.superClassSym) {
            return this.superClassSym.getMethodCascade(name);
        }
        else {
            return null;
        }
    }
}
exports.ClassSymbol = ClassSymbol;
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
/////////////////////////////////////////////////////////////////////////
//一些系统内置的符号
exports.FUN_println = new FunctionSymbol("println", new types_1.FunctionType(types_1.SysTypes.Void, [types_1.SysTypes.Any]), [new VarSymbol("a", types_1.SysTypes.String)]);
exports.FUN_println_l = new FunctionSymbol("println", new types_1.FunctionType(types_1.SysTypes.Void, [types_1.SysTypes.Integer]), [new VarSymbol("a", types_1.SysTypes.Integer)]);
exports.FUN_println_s = new FunctionSymbol("println_s", new types_1.FunctionType(types_1.SysTypes.Void, [types_1.SysTypes.String]), [new VarSymbol("a", types_1.SysTypes.String)]);
exports.FUN_println_d = new FunctionSymbol("println_d", new types_1.FunctionType(types_1.SysTypes.Void, [types_1.SysTypes.Number]), [new VarSymbol("a", types_1.SysTypes.Number)]);
exports.FUN_tick = new FunctionSymbol("tick", new types_1.FunctionType(types_1.SysTypes.Integer, []), []);
exports.FUN_tick_d = new FunctionSymbol("tick_d", new types_1.FunctionType(types_1.SysTypes.Number, []), []);
exports.FUN_integer_to_string = new FunctionSymbol("integer_to_string", new types_1.FunctionType(types_1.SysTypes.String, [types_1.SysTypes.Integer]), [new VarSymbol("a", types_1.SysTypes.Integer)]);
// export let built_ins:Map<string, FunctionSymbol> = new Map([
//     ["println", FUN_println],
//     ["println_s", FUN_println_s],
//     ["println_d", FUN_println_d],
//     ["tick", FUN_tick],
//     ["tick_d", FUN_tick_d],
//     ["integer_to_string", FUN_integer_to_string],
//     // ["string_concat", FUN_string_concat],
// ]);
let FUN_string_create_by_str = new FunctionSymbol("string_create_by_cstr", new types_1.FunctionType(types_1.SysTypes.String, [types_1.SysTypes.String]), [new VarSymbol("a", types_1.SysTypes.String)]);
let FUN_string_concat = new FunctionSymbol("string_concat", new types_1.FunctionType(types_1.SysTypes.String, [types_1.SysTypes.String, types_1.SysTypes.String]), [new VarSymbol("str1", types_1.SysTypes.String), new VarSymbol("str2", types_1.SysTypes.String)]);
let FUN_array_create_by_length = new FunctionSymbol("array_create_by_length", new types_1.FunctionType(types_1.SysTypes.Object, [types_1.SysTypes.Integer]), [new VarSymbol("a", types_1.SysTypes.Integer)]);
let FUN_object_create_by_length = new FunctionSymbol("object_create_by_length", new types_1.FunctionType(types_1.SysTypes.Object, [types_1.SysTypes.Integer]), [new VarSymbol("a", types_1.SysTypes.Integer)]);
let FUN_double_to_string = new FunctionSymbol("double_to_string", new types_1.FunctionType(types_1.SysTypes.Object, [types_1.SysTypes.Number]), [new VarSymbol("a", types_1.SysTypes.Number)]);
let FUN_frame_walker = new FunctionSymbol("frame_walker", new types_1.FunctionType(types_1.SysTypes.Void, [types_1.SysTypes.Object]), [new VarSymbol("a", types_1.SysTypes.Object)]);
exports.built_ins = new Map([
    ["println", exports.FUN_println],
    ["println_l", exports.FUN_println_l],
    ["println_s", exports.FUN_println_s],
    ["println_d", exports.FUN_println_d],
    ["tick", exports.FUN_tick],
    ["tick_d", exports.FUN_tick_d],
    ["integer_to_string", exports.FUN_integer_to_string],
    ["string_create_by_cstr", FUN_string_create_by_str],
    ["string_concat", FUN_string_concat],
    ["array_create_by_length", FUN_array_create_by_length],
    ["object_create_by_length", FUN_object_create_by_length],
    ["double_to_string", FUN_double_to_string],
    ["frame_walker", FUN_frame_walker],
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
        console.log(additional + sym.name
            + (sym.functionKind != FunctionKind.Function ? ":" + FunctionKind[sym.functionKind] : "")
            + "{" + SymKind[sym.kind] + ", local var count:" + sym.vars.length + "}");
        //输出字节码
        if (sym.byteCode != null) {
            let str = '';
            for (let code of sym.byteCode) {
                str += code.toString(16) + " ";
            }
            console.log(additional + "    bytecode: " + str);
        }
        if (sym.closure && sym.closure.vars.length > 0) {
            console.log(additional + "    " + sym.closure.toString());
        }
    }
    visitClassSymbol(sym, additional) {
        let str = additional + sym.name + "{" + SymKind[sym.kind] + "}";
        if (sym.superClassSym)
            str += " extends " + sym.superClassSym.name;
        if (sym.constructor_)
            str += ", constructor";
        if (sym.props.length > 0) {
            str += ", props:[";
            for (let prop of sym.props) {
                str += prop.name + ",";
            }
            str += "]";
        }
        if (sym.methods.length > 0) {
            str += ", methods:[";
            for (let method of sym.methods) {
                str += method.name + ",";
            }
            str += "]";
        }
        console.log(str);
    }
}
exports.SymbolDumper = SymbolDumper;
