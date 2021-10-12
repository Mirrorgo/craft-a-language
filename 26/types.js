"use strict";
/**
 * 类型体系
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeVisitor = exports.SysTypes = exports.UnionType = exports.FunctionType = exports.ValueType = exports.NamedType = exports.Type = exports.TypeUtil = exports.TypeKind = void 0;
var TypeKind;
(function (TypeKind) {
    TypeKind[TypeKind["Named"] = 0] = "Named";
    TypeKind[TypeKind["Value"] = 1] = "Value";
    TypeKind[TypeKind["Union"] = 2] = "Union";
    TypeKind[TypeKind["Intersection"] = 3] = "Intersection";
    TypeKind[TypeKind["Function"] = 4] = "Function";
})(TypeKind = exports.TypeKind || (exports.TypeKind = {}));
;
class TypeUtil {
    //t1是否是t2的子类型
    //LE是less equal的意思，也就是t1的值域是t2的值域的子集
    static LE(t1, t2) {
        if (t1 == t2 || t2 == SysTypes.Any) {
            return true;
        }
        else if (t1.kind == TypeKind.Named) {
            return TypeUtil.LE_N_T(t1, t2);
        }
        else if (t1.kind == TypeKind.Value) {
            return TypeUtil.LE_V_T(t1, t2);
        }
        else if (t1.kind == TypeKind.Union) {
            return TypeUtil.LE_U_T(t1, t2);
        }
        else {
            console.log("Unsupported type in LE: " + TypeKind[t1.kind]);
            return false;
        }
    }
    //ValueType是否是Type的子类型
    static LE_V_T(t1, t2) {
        if (t2.kind == TypeKind.Value) {
            let t2v = t2;
            if (t1.value == t2v.value) {
                //两个值相等
                return (t1.isComplement && t2v.isComplement || !t1.isComplement && !t2v.isComplement);
            }
            else {
                return false;
            }
        }
        else if (t2.kind == TypeKind.Named) {
            return TypeUtil.LE_N_T(t1.typeOfValue, t2);
        }
        else if (t2.kind == TypeKind.Union) {
            return TypeUtil.LE_T_Types(t1, t2.types);
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
                    if (TypeUtil.LE(upperType, t2n)) {
                        return true;
                    }
                }
                return false;
            }
        }
        else if (t2.kind == TypeKind.Union) {
            return TypeUtil.LE_T_Types(t1, t2.types);
        }
        else {
            console.log("Unsupported type in LE_V_T: " + TypeKind[t2.kind]);
            return false;
        }
    }
    //UnionType是否是Type的子类型
    static LE_U_T(t1, t2) {
        //t1的每个元素，都要是t2的子类型
        if (t2.kind == TypeKind.Named || t2.kind == TypeKind.Value) {
            for (let t1_elem of t1.types) {
                if (!TypeUtil.LE(t1_elem, t2))
                    return false;
            }
            return true;
        }
        //如果两个都是union，那么必须t1的每个元素，都是t2的子类型
        else if (t2.kind == TypeKind.Union) {
            for (let t1_elem of t1.types) {
                if (!TypeUtil.LE_T_Types(t1_elem, t2.types))
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
            if (TypeUtil.LE(t1, t2))
                return true;
        }
        return false;
    }
    /**
     * 判断两个类型是否有交集
     * @param t1
     * @param t2
     */
    static overlap(t1, t2) {
        if (t1.kind == TypeKind.Named) {
            if (t2.kind == TypeKind.Named) {
                return TypeUtil.overlap_N_N(t1, t2);
            }
            else if (t2.kind == TypeKind.Value) {
                return TypeUtil.overlap_N_V(t1, t2);
            }
            else { // t2.kind == TypeKind.Union
                return TypeUtil.overlap_U_T(t2, t1);
            }
        }
        else if (t1.kind == TypeKind.Value) {
            if (t2.kind == TypeKind.Named) {
                return TypeUtil.overlap_N_V(t2, t1);
            }
            else if (t2.kind == TypeKind.Value) {
                return TypeUtil.overlap_V_V(t1, t2);
            }
            else { // t2.kind == TypeKind.Union
                return TypeUtil.overlap_U_T(t2, t1);
            }
        }
        else { //t1.kind == TypeKind.Union
            return TypeUtil.overlap_U_T(t1, t2);
        }
    }
    static overlap_N_N(t1, t2) {
        return TypeUtil.LE(t1, t2) || TypeUtil.LE(t2, t1);
    }
    static overlap_N_V(t1, t2) {
        return (TypeUtil.LE(t2.typeOfValue, t1));
    }
    static overlap_V_V(t1, t2) {
        if (t1.isComplement) {
            if (t2.isComplement) {
                return true; //都是补集，无法比较，就认为有重叠好了。
            }
            else {
                //两者恰好互为补集，就返回false。
                return t1.value != t2.value;
            }
        }
        else { //!t1.isComplement
            if (t2.isComplement) {
                return t1.value != t2.value;
            }
            else {
                return t1.value == t2.value;
            }
        }
    }
    static overlap_U_T(t1, t2) {
        for (let t of t1.types) {
            if (TypeUtil.overlap(t, t2)) {
                return true;
            }
        }
        return false;
    }
    /**
    * 求type1与type2的上界
    * @param t1
    * @param t2
    */
    static getUpperBound(t1, t2) {
        if (t1 == SysTypes.Any || t2 == SysTypes.Any) {
            return SysTypes.Any;
        }
        else {
            if (TypeUtil.LE(t1, t2)) {
                return t2;
            }
            else if (TypeUtil.LE(t2, t1)) {
                return t1;
            }
            else { //求并集
                return TypeUtil.unionTypes(t1, t2);
            }
        }
    }
    /**
     * 返回两个类型的并集。
     * @param t1
     * @param t2
     */
    static unionTypes(t1, t2) {
        let t;
        if (t1.kind == TypeKind.Named) {
            if (t2.kind == TypeKind.Named) {
                t = TypeUtil.unionTypes_N_N(t1, t2);
            }
            else if (t2.kind == TypeKind.Value) {
                t = TypeUtil.unionTypes_N_V(t1, t2);
            }
            else { //t2.kind == TypeKind.Union
                t = TypeUtil.unionTypes_U_S(t2, t1);
            }
        }
        else if (t1.kind == TypeKind.Value) {
            if (t2.kind == TypeKind.Named) {
                t = TypeUtil.unionTypes_N_V(t2, t1);
            }
            else if (t2.kind == TypeKind.Value) {
                t = TypeUtil.unionTypes_V_V(t1, t2);
            }
            else { //t2.kind == TypeKind.Union
                t = TypeUtil.unionTypes_U_S(t2, t1);
            }
        }
        else { //t1.kind == TypeKind.Union
            if (t2.kind == TypeKind.Named) {
                t = TypeUtil.unionTypes_U_S(t1, t2);
            }
            else if (t2.kind == TypeKind.Value) {
                t = TypeUtil.unionTypes_U_S(t1, t2);
            }
            else { //t2.kind == TypeKind.Union
                t = TypeUtil.unionTypes_U_U(t1, t2);
            }
        }
        return t;
    }
    static unionTypes_N_V(t1, t2) {
        let t;
        if (TypeUtil.LE(t2.typeOfValue, t1)) {
            t = t1;
        }
        else {
            t = new UnionType([t1, t2]);
        }
        return t;
    }
    static unionTypes_N_N(t1, t2) {
        let t;
        if (TypeUtil.LE(t1, t2)) {
            t = t2;
        }
        else if (TypeUtil.LE(t2, t1)) {
            t = t1;
        }
        else {
            t = new UnionType([t1, t2]);
        }
        return t;
    }
    static unionTypes_U_S(t1, t2) {
        let types = [];
        for (let t of t1.types) {
            let t3 = TypeUtil.unionTypes(t, t2);
            if (t3.kind == TypeKind.Union) {
                types = types.concat(t3.types);
            }
            else {
                types.push(t3);
            }
        }
        return new UnionType(types);
    }
    /**
     * 返回一个新的UnionType，并合并了其中的元素
     * @param t1
     * @param t2
     */
    static unionTypes_U_U(t1, t2) {
        let types = t1.types.slice(0);
        // for(let t of (t1 as UnionType).types){
        //     TypeUtil.addToTypes(types, t);
        // }
        for (let t of t2.types) {
            TypeUtil.addToTypes(types, t);
        }
        return new UnionType(types);
    }
    /**
     * 把t添加进SimpeType的集合。进行必要的分拆和合并。
     * @param types
     * @param t
     */
    static addToTypes(types, t) {
        if (t.kind == TypeKind.Named) {
            let t2 = t;
            //看看该类型是否已经在集合中
            let processed = false;
            for (let i = 0; i < types.length; i++) {
                let t1 = types[i];
                if (TypeUtil.LE(t2, t1)) {
                    processed = true;
                    break;
                }
                else if (t1.kind == TypeKind.Value && TypeUtil.LE(t1.typeOfValue, t2)) {
                    //把值集替换成基础类型
                    types.splice(i, 1, t2);
                    processed = true;
                    break;
                }
            }
            if (!processed) {
                types.push(t2);
            }
        }
        else if (t.kind == TypeKind.Value) {
            let t2 = t;
            let processed = false;
            for (let i = 0; i < types.length; i++) {
                let t1 = types[i];
                if (t1.kind == TypeKind.Named && TypeUtil.LE(t2.typeOfValue, t1)) {
                    processed = true;
                    break;
                }
                else if (t1.kind == TypeKind.Value) {
                    let t1v = t1;
                    if (t1v.value == t2.value) {
                        if (t1v.isComplement != t2.isComplement) {
                            //替换成基础类型
                            if (types.indexOf(t1v.typeOfValue) == -1) { //看看是不是已经包含了此基础类型。
                                types.splice(i, 1, t1v.typeOfValue);
                            }
                            else {
                                types.splice(i, 1); //删掉原来的元素
                            }
                            types.push(t1v.typeOfValue);
                        }
                        processed = true;
                        break;
                    }
                }
            }
            if (!processed) {
                types.push(t2);
            }
        }
    }
    /**
     * 返回两个ValueSet的并集
     * 规则：
     * 如果都是常规集合，那么也返回一个常规集合。
     * 否则，都是返回补集。
     * @param t1
     * @param t2
     */
    static unionTypes_V_V(t1, t2) {
        if (t1.value == t2.value) {
            return t1;
        }
        else {
            return new UnionType([t1, t2]);
        }
    }
    /**
     * 计算补集。
     * @param t
     */
    static notOpOnType(t) {
        if (t.kind == TypeKind.Value) {
            let tv = t;
            let values = tv.value.slice(0); //克隆
            return new ValueType(tv.typeOfValue, values, !tv.isComplement);
        }
        else { //UnionType
            let types = [];
            for (let t2 of t.types) {
                if (t2.kind == TypeKind.Value) {
                    let t3 = TypeUtil.notOpOnType(t2);
                    types.push(t3);
                }
                else { //NamedType
                    console.log("in getComplement, element of UnionType should not be NamedType");
                }
            }
            return new UnionType(types);
        }
    }
    static intersectTypes(t1, t2) {
        if (t1.kind == TypeKind.Named) {
            if (t2.kind == TypeKind.Named) {
                return TypeUtil.intersectTypes_N_N(t1, t2);
            }
            else if (t2.kind == TypeKind.Value) {
                return TypeUtil.intersectTypes_N_V(t1, t2);
            }
            else { //t2.kind == TypeKind.Union
                return TypeUtil.intersectTypes_U_N(t2, t1);
            }
        }
        else if (t1.kind == TypeKind.Value) {
            if (t2.kind == TypeKind.Named) {
                return TypeUtil.intersectTypes_N_V(t2, t1);
            }
            else if (t2.kind == TypeKind.Value) {
                return TypeUtil.intersectTypes_V_V(t1, t2);
            }
            else { //t2.kind == TypeKind.Union
                return TypeUtil.intersectTypes_U_V(t2, t1);
            }
        }
        else { //t1.kind == TypeKind.Union
            if (t2.kind == TypeKind.Named) {
                return TypeUtil.intersectTypes_U_N(t1, t2);
            }
            else if (t2.kind == TypeKind.Value) {
                return TypeUtil.intersectTypes_U_V(t1, t2);
            }
            else { //t2.kind == TypeKind.Union
                return TypeUtil.intersectTypes_U_U(t2, t1);
            }
        }
    }
    //对于两个NamedType，返回子类型
    static intersectTypes_N_N(t1, t2) {
        if (TypeUtil.LE(t1, t2)) {
            return t1;
        }
        else if (TypeUtil.LE(t2, t1)) {
            return t2;
        }
        else {
            return new UnionType([]); //空集
        }
    }
    static intersectTypes_N_V(t1, t2) {
        if (TypeUtil.LE(t2.typeOfValue, t1)) {
            return t2;
        }
        else {
            if (t2.isComplement) {
                if (TypeUtil.LE(t1, t2.typeOfValue)) {
                    let t3 = TypeUtil.getNamedTypeByValue(t2.value);
                    if (TypeUtil.LE(t3, t1)) {
                        return new ValueType(t1, t2.value, true);
                    }
                    else {
                        return t1;
                    }
                }
                else {
                    return t1; //如果t1中不包含t2.value，那么就返回t1。
                }
            }
            return new UnionType([]); //空集;
        }
    }
    static intersectTypes_V_V(t1, t2) {
        if (t1.value == t2.value && (t1.isComplement && t2.isComplement || !t1.isComplement && !t2.isComplement)) {
            return t1;
        }
        else {
            return new UnionType([]); //空集;
        }
    }
    static intersectTypes_U_N(t1, t2) {
        let types = [];
        for (let t of t1.types) {
            if (t.kind == TypeKind.Named) {
                let t3 = TypeUtil.intersectTypes_N_N(t, t2);
                if (t3.kind == TypeKind.Named || t3.kind == TypeKind.Value)
                    types.push(t3);
            }
            else { //ValueSet
                let t3 = TypeUtil.intersectTypes_N_V(t2, t);
                if (t3.kind == TypeKind.Named || t3.kind == TypeKind.Value)
                    types.push(t3);
            }
        }
        if (types.length == 0) {
            return new UnionType([]); //空集;
        }
        else if (types.length == 1) {
            return types[0];
        }
        else {
            return new UnionType(types);
        }
    }
    /**
     * @param t1
     * @param t2
     */
    static intersectTypes_U_V(t1, t2) {
        let types = [];
        for (let t of t1.types) {
            if (t.kind == TypeKind.Named) {
                let t3 = TypeUtil.intersectTypes_N_V(t, t2);
                if (t3.kind == TypeKind.Named || t3.kind == TypeKind.Value)
                    types.push(t3);
            }
            else { //ValueSet
                let t3 = TypeUtil.intersectTypes_V_V(t, t2);
                if (t3.kind == TypeKind.Named || t3.kind == TypeKind.Value)
                    types.push(t3);
            }
        }
        if (types.length == 0) {
            return new UnionType([]); //空集
        }
        else if (types.length == 1) {
            return types[0];
        }
        else {
            return new UnionType(types);
        }
    }
    static intersectTypes_U_U(t1, t2) {
        let types = [];
        for (let t of t1.types) {
            if (t.kind == TypeKind.Named) {
                let t3 = TypeUtil.intersectTypes_U_N(t2, t);
                if (!TypeUtil.isEmptySet(t3))
                    types.push(t3);
            }
            else { //ValueSet
                let t3 = TypeUtil.intersectTypes_U_V(t2, t);
                if (!TypeUtil.isEmptySet(t3))
                    types.push(t3);
            }
        }
        if (types.length == 0) {
            return new UnionType([]); //空集;
        }
        else {
            return TypeUtil.mergeTypes(types);
        }
    }
    //值域是不是空的
    static isEmptySet(t) {
        if (t.kind == TypeKind.Union) {
            return t.types.length == 0;
        }
        else { //NamedType
            return false;
        }
    }
    //把一个类型数组中的类型尽量合并
    //要求types不能是空数组
    static mergeTypes(types) {
        if (types.length == 1) {
            return types[0];
        }
        else { //把求所有这些结果的并集
            let t = types[0];
            for (let i = 1; i < types.length; i++) {
                t = TypeUtil.unionTypes(t, types[i]);
            }
            return t;
        }
    }
    //根据值来创建类型
    static createTypeByValue(v) {
        let t = TypeUtil.getNamedTypeByValue(v);
        return new ValueType(t, v, false);
    }
    static getNamedTypeByValue(v) {
        if (typeof v == 'number') {
            if (Number.isInteger(v)) {
                return SysTypes.Integer;
            }
            else {
                return SysTypes.Decimal;
            }
        }
        else if (typeof v == 'boolean') {
            return SysTypes.Boolean;
        }
        else if (typeof v == 'string') {
            return SysTypes.String;
        }
        else if (typeof v == 'object') {
            return SysTypes.Object;
        }
        else { // typeof v == 'undefined'
            return SysTypes.UndefinedType;
        }
    }
}
exports.TypeUtil = TypeUtil;
/**
 * 所有类型的基类。
 */
class Type {
    constructor(kind) {
        this.kind = kind;
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
        return visitor.visitNamedType(this);
    }
}
exports.NamedType = NamedType;
class ValueType extends Type {
    constructor(typeOfValue, values, isComplement = false) {
        super(TypeKind.Value);
        this.typeOfValue = typeOfValue;
        this.value = values;
        this.isComplement = isComplement;
    }
    toString() {
        return this.isComplement ? "!" : "" + this.value;
    }
    hasVoid() {
        return false;
    }
    accept(visitor) {
        return visitor.visitValueSet(this);
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
        let str = "FunctionType: (";
        for (let i = 0; i < this.paramTypes.length; i++) {
            str += this.paramTypes[i].toString();
            if (i < this.paramTypes.length - 1)
                str += ", ";
        }
        return str + ")" + this.returnType.toString();
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
        else {
            typeNames += t.toString();
        }
        if (i < types.length - 1)
            typeNames += " | ";
    }
    return typeNames;
}
// //工具函数：把多个
// function concatValues(values: any[], seperator:string = "|"):string{
//     let str:string = "";
//     for (let i = 0; i< values.length; i++){
//         str += values[i];
//         if (i < values.length-1)
//             str += " "+seperator+" ";
//     }
//     return str;
// }
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
// /**
//  * 两个类型的差集。也就是集合中的元素属于第一个集合（类型），但不属于第二个集合（类型）。
//  */
// export class MinusType extends Type{
//     t1:Type;
//     t2:Type;
//     /**
//      * TODO：该构造方法有个问题，如果types中的类型是互相有子类型关系，应该合并。
//      * @param types 
//      */
//     constructor(t1:Type, t2:Type){
//         super(TypeKind.Union);
//         this.t1 = t1;
//         this.t2 = t2;
//     }
//     hasVoid():boolean{
//         return (this.t1.hasVoid() && !this.t2.hasVoid())
//     }
//     toString():string{
//         return "(" + this.t1.toString() + "-" + this.t2.toString()+")";
//     }
//     /**
//      * visitor模式
//      */
//     accept(visitor:TypeVisitor):any{
//         visitor.visitMinusType(this);
//     }
// }
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
SysTypes.Null = new ValueType(SysTypes.Object, null);
SysTypes.Undefined = new ValueType(SysTypes.UndefinedType, undefined);
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
