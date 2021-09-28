"use strict";
/**
 * 类型体系
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeVisitor = exports.SysTypes = exports.UnionType = exports.FunctionType = exports.ValueType = exports.NamedType = exports.Type = exports.TypeKind = void 0;
var TypeKind;
(function (TypeKind) {
    TypeKind[TypeKind["Named"] = 0] = "Named";
    TypeKind[TypeKind["Value"] = 1] = "Value";
    TypeKind[TypeKind["Union"] = 2] = "Union";
    TypeKind[TypeKind["Intersection"] = 3] = "Intersection";
    TypeKind[TypeKind["Function"] = 4] = "Function";
})(TypeKind = exports.TypeKind || (exports.TypeKind = {}));
;
class Type {
    constructor(kind) {
        this.kind = kind;
    }
    //t1是否是t2的子类型
    //LE是less equal的意思，也就是t1的集合是t2的集合的子集
    static LE(t1, t2) {
        if (t1 == t2 || t2 == SysTypes.Any) {
            return true;
        }
        else if (t1.kind == TypeKind.Value) {
            return Type.LE_V_T(t1, t2);
        }
        else if (t1.kind == TypeKind.Named) {
            return Type.LE_N_T(t1, t2);
        }
        else if (t1.kind == TypeKind.Union) {
            return Type.LE_U_T(t1, t2);
        }
        else {
            console.log("Unsupported type in LE: " + TypeKind[t1.kind]);
            return false;
        }
    }
    //ValueType是否是Type的子类型
    static LE_V_T(t1, t2) {
        if (t2.kind == TypeKind.Value) {
            return t1.value == t2.value;
        }
        else if (t2.kind == TypeKind.Named) {
            return t1.typeOfValue == t2;
        }
        else if (t2.kind == TypeKind.Union) {
            return Type.LE_T_Types(t1, t2.types);
        }
        else {
            console.log("Unsupported type in LE_V_T: " + TypeKind[t2.kind]);
            return false;
        }
    }
    //NamedType是否是Type的子类型
    static LE_N_T(t1, t2) {
        if (t2.kind == TypeKind.Value) {
            return false; //todo：如果NamedType以后支持类型别名，这里要修改
        }
        else if (t2.kind == TypeKind.Named) {
            let t2n = t2;
            if (t1.upperTypes.indexOf(t2n) != -1) {
                return true;
            }
            else {
                //看看所有的父类型中，有没有一个是t2的子类型
                for (let upperType of t1.upperTypes) {
                    if (Type.LE(upperType, t2n)) {
                        return true;
                    }
                }
                return false;
            }
        }
        else if (t2.kind == TypeKind.Union) {
            return Type.LE_T_Types(t1, t2.types);
        }
        else {
            console.log("Unsupported type in LE_V_T: " + TypeKind[t2.kind]);
            return false;
        }
    }
    //UnionType是否是Type的子类型
    static LE_U_T(t1, t2) {
        if (t2.kind == TypeKind.Value) {
            return false; //todo：如果NamedType以后支持类型别名，这里要修改
        }
        //t1的每个元素，都要是t2的子类型
        else if (t2.kind == TypeKind.Named) {
            for (let t1_elem of t1.types) {
                if (!Type.LE(t1_elem, t2))
                    return false;
            }
            return true;
        }
        //如果两个都是union，那么必须t1的每个元素，都是t2的子类型
        else if (t2.kind == TypeKind.Union) {
            for (let t1_elem of t1.types) {
                if (!Type.LE_T_Types(t1_elem, t2.types))
                    return false;
            }
            return true;
        }
        else {
            console.log("Unsupported type in LE_U_T: " + TypeKind[t2.kind]);
            return false;
        }
    }
    //t1是否是types中某个元素的子类型
    static LE_T_Types(t1, types) {
        for (let t2 of types) {
            if (Type.LE(t1, t2))
                return true;
        }
        return false;
    }
    /**
    * 求type1与type2的上界
    * @param type1
    * @param type2
    */
    static getUpperBound(type1, type2) {
        if (type1 == SysTypes.Any || type2 == SysTypes.Any) {
            return SysTypes.Any;
        }
        else {
            if (Type.LE(type1, type2)) {
                return type2;
            }
            else if (Type.LE(type2, type1)) {
                return type1;
            }
            else { //todo 这里比较粗糙。如果type1和type2都是UnionType，其实应该求它们的并集
                return new UnionType([type1, type2]);
            }
        }
    }
}
exports.Type = Type;
/**
 * 简单的类型，可以有一到多个父类型
 */
//todo: 需要检查循环引用
class NamedType extends Type {
    constructor(name, upperTypes = []) {
        super(TypeKind.Named);
        this.name = name;
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
        // let upperTypeNames:string = "[";
        // for (let ut of this.upperTypes){
        //     upperTypeNames += ut.name +", ";
        // }
        // upperTypeNames += "]";
        // return "SimpleType {name: " + this.name + ", upperTypes: " + upperTypeNames+ "}"; 
        return this.name;
    }
    /**
     * visitor模式
     */
    accept(visitor) {
        return visitor.visitSimpleType(this);
    }
}
exports.NamedType = NamedType;
class ValueType extends Type {
    constructor(value, typeOfValue) {
        super(TypeKind.Value);
        this.value = value;
        this.typeOfValue = typeOfValue;
    }
    toString() {
        return "{" + this.value + "}";
    }
    hasVoid() {
        return false;
    }
    accept(visitor) {
        return visitor.visitValueType(this);
    }
}
exports.ValueType = ValueType;
//todo: 需要检查循环引用
class FunctionType extends Type {
    constructor(returnType = SysTypes.Void, paramTypes = [], name = undefined) {
        super(TypeKind.Function);
        this.returnType = returnType;
        this.paramTypes = paramTypes;
    }
    hasVoid() {
        return this.returnType.hasVoid();
    }
    toString() {
        let paramTypeNames = concatTypeNames(this.paramTypes);
        return "FunctionType: (" + paramTypeNames + ")" + this.returnType.toString();
    }
    /**
     * 当前类型是否小于等于type2
     * @param type2
     */
    // LE(type2:Type):boolean{
    //     if (type2 == SysTypes.Any){
    //          return true;
    //     } 
    //     else if (this == type2){
    //         return true;
    //     }
    //     else if (type2.kind == TypeKind.Union){
    //         let t = type2 as UnionType;
    //         if (t.types.indexOf(this)!=-1){
    //             return true;
    //         }
    //         else{ 
    //             return false;
    //         }
    //     }
    //     else{
    //         return false;
    //     }
    // } 
    /**
     * visitor模式
     */
    accept(visitor) {
        return visitor.visitFunctionType(this);
    }
}
exports.FunctionType = FunctionType;
FunctionType.index = 0; //序号，用于给函数类型命名
//工具函数：链接多个类型的名称
function concatTypeNames(types) {
    let typeNames = "";
    for (let i = 0; i < types.length; i++) {
        let t = types[i];
        if (t.kind == TypeKind.Named) {
            typeNames += t.name;
        }
        else if (t.kind == TypeKind.Value) {
            typeNames += t.value;
        }
        else {
            typeNames += TypeKind[t.kind] + "Type";
        }
        if (i < types.length - 1)
            typeNames += " | ";
    }
    return typeNames;
}
//todo: 需要检查循环引用
class UnionType extends Type {
    /**
     * TODO：该构造方法有个问题，如果types中的类型是互相有子类型关系，应该合并。
     * @param types
     */
    constructor(types) {
        super(TypeKind.Union);
        this.types = types;
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
        let typeNames = concatTypeNames(this.types);
        return typeNames;
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
SysTypes.Any = new NamedType("any", []);
//基础类型
SysTypes.String = new NamedType("string", [SysTypes.Any]);
SysTypes.Number = new NamedType("number", [SysTypes.Any]);
SysTypes.Boolean = new NamedType("boolean", [SysTypes.Any]);
SysTypes.Object = new NamedType("object", [SysTypes.Any]);
SysTypes.UndefinedType = new NamedType("undefined", [SysTypes.Any]);
//所有类型的子类型
SysTypes.Null = new ValueType(null, SysTypes.Object);
SysTypes.Undefined = new ValueType(undefined, SysTypes.UndefinedType);
//函数没有任何返回值的情况
//如果作为变量的类型，则智能赋值为null和undefined
SysTypes.Void = new NamedType("void");
//两个Number的子类型
SysTypes.Integer = new NamedType("integer", [SysTypes.Number]);
SysTypes.Decimal = new NamedType("decimal", [SysTypes.Number]);
/**
 * visitor
 */
class TypeVisitor {
    visit(t) {
        return t.accept(this);
    }
}
exports.TypeVisitor = TypeVisitor;
