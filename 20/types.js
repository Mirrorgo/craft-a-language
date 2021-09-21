"use strict";
/**
 * 类型体系
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeVisitor = exports.SysTypes = exports.UnionType = exports.FunctionType = exports.SimpleType = exports.Type = void 0;
class Type {
    constructor(name) {
        this.name = name;
    }
    /**
    * type1与type2的上界
    * @param type1
    * @param type2
    */
    static getUpperBound(type1, type2) {
        if (type1 == SysTypes.Any || type2 == SysTypes.Any) {
            return SysTypes.Any;
        }
        else {
            if (type1.LE(type2)) {
                return type2;
            }
            else if (type2.LE(type1)) {
                return type1;
            }
            else {
                return new UnionType([type1, type2]);
            }
        }
    }
    static isSimpleType(t) {
        return typeof t.upperTypes == 'object';
    }
    static isUnionType(t) {
        return typeof t.types == 'object';
    }
    static isFunctionType(t) {
        return typeof t.returnType == 'object';
    }
}
exports.Type = Type;
/**
 * 简单的类型，可以有一到多个父类型
 */
//todo: 需要检查循环引用
class SimpleType extends Type {
    constructor(name, upperTypes = []) {
        super(name);
        this.upperTypes = upperTypes;
    }
    hasVoid() {
        if (this === SysTypes.Void) {
            return true;
        }
        else {
            for (let t of this.upperTypes) {
                if (t.hasVoid()) {
                    return true;
                }
            }
            return false;
        }
    }
    toString() {
        let upperTypeNames = "[";
        for (let ut of this.upperTypes) {
            upperTypeNames += ut.name + ", ";
        }
        upperTypeNames += "]";
        return "SimpleType {name: " + this.name + ", upperTypes: " + upperTypeNames + "}";
    }
    /**
     * 当前类型是否小于等于type2
     * @param type2
     */
    LE(type2) {
        if (type2 == SysTypes.Any) {
            return true;
        }
        else if (this == SysTypes.Any) {
            return false;
        }
        else if (this === type2) {
            return true;
        }
        else if (Type.isSimpleType(type2)) {
            let t = type2;
            if (this.upperTypes.indexOf(t) != -1) {
                return true;
            }
            else {
                //看看所有的父类型中，有没有一个是type2的子类型
                for (let upperType of this.upperTypes) {
                    if (upperType.LE(type2)) {
                        return true;
                    }
                }
                return false;
            }
        }
        else if (Type.isUnionType(type2)) {
            let t = type2;
            if (t.types.indexOf(this) != -1) {
                return true;
            }
            else { //是联合类型中其中一个类型的子类型就行
                for (let t2 of t.types) {
                    if (this.LE(t2)) {
                        return true;
                    }
                }
                return false;
            }
        }
        else {
            return false;
        }
    }
    /**
     * visitor模式
     */
    accept(visitor) {
        return visitor.visitSimpleType(this);
    }
}
exports.SimpleType = SimpleType;
//todo: 需要检查循环引用
class FunctionType extends Type {
    constructor(returnType = SysTypes.Void, paramTypes = [], name = undefined) {
        super("@function"); //用一个非法字符@，避免与已有的符号名称冲突
        this.returnType = returnType;
        this.paramTypes = paramTypes;
        if (typeof name == 'string') {
            this.name = name;
        }
        else {
            this.name = "@function" + (FunctionType.index++);
        }
    }
    hasVoid() {
        return this.returnType.hasVoid();
    }
    toString() {
        let paramTypeNames = "[";
        for (let ut of this.paramTypes) {
            paramTypeNames += ut.name + ", ";
        }
        paramTypeNames += "]";
        return "FunctionType {name: " + this.name + ", returnType: " + this.returnType.name + ", paramTypes: " + paramTypeNames + "}";
    }
    /**
     * 当前类型是否小于等于type2
     * @param type2
     */
    LE(type2) {
        if (type2 == SysTypes.Any) {
            return true;
        }
        else if (this == type2) {
            return true;
        }
        else if (Type.isUnionType(type2)) {
            let t = type2;
            if (t.types.indexOf(this) != -1) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    /**
     * visitor模式
     */
    accept(visitor) {
        return visitor.visitFunctionType(this);
    }
}
exports.FunctionType = FunctionType;
FunctionType.index = 0; //序号，用于给函数类型命名
//todo: 需要检查循环引用
class UnionType extends Type {
    /**
     * TODO：该构造方法有个问题，如果types中的类型是互相有子类型关系，应该合并。
     * @param types
     */
    constructor(types, name = undefined) {
        super("@union");
        this.types = types;
        if (typeof name == 'string') {
            this.name = name;
        }
        else {
            this.name = "@union" + (UnionType.index++);
        }
    }
    hasVoid() {
        for (let t of this.types) {
            if (t.hasVoid()) {
                return true;
            }
        }
        return false;
    }
    toString() {
        let typeNames = "[";
        for (let ut of this.types) {
            typeNames += ut.name + ", ";
        }
        typeNames += "]";
        return "UnionType {name: " + this.name + ", types: " + typeNames + "}";
    }
    /**
     * 当前类型是否小于等于type2
     * @param type2
     */
    LE(type2) {
        if (type2 == SysTypes.Any) {
            return true;
        }
        else if (Type.isUnionType(type2)) {
            for (let t1 of this.types) {
                let found = false;
                for (let t2 of type2.types) {
                    if (t1.LE(t2)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * visitor模式
     */
    accept(visitor) {
        visitor.visitUnionType(this);
    }
}
exports.UnionType = UnionType;
UnionType.index = 0; //序号，用于给UnionType命名
/**
 * 内置类型
 */
class SysTypes {
    static isSysType(t) {
        return t === SysTypes.Any || t === SysTypes.String || t === SysTypes.Number ||
            t === SysTypes.Boolean || t === SysTypes.Null || t === SysTypes.Undefined ||
            t === SysTypes.Void || t === SysTypes.Integer || t === SysTypes.Decimal;
    }
}
exports.SysTypes = SysTypes;
//所有类型的父类型
SysTypes.Any = new SimpleType("any", []);
//基础类型
SysTypes.String = new SimpleType("string", [SysTypes.Any]);
SysTypes.Number = new SimpleType("number", [SysTypes.Any]);
SysTypes.Boolean = new SimpleType("boolean", [SysTypes.Any]);
//所有类型的子类型
SysTypes.Null = new SimpleType("null");
SysTypes.Undefined = new SimpleType("undefined");
//函数没有任何返回值的情况
//如果作为变量的类型，则智能赋值为null和undefined
SysTypes.Void = new SimpleType("void");
//两个Number的子类型
SysTypes.Integer = new SimpleType("integer", [SysTypes.Number]);
SysTypes.Decimal = new SimpleType("decimal", [SysTypes.Number]);
/**
 * visitor
 */
class TypeVisitor {
    visit(t) {
        return t.accept(this);
    }
}
exports.TypeVisitor = TypeVisitor;
