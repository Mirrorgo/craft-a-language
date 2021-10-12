/**
 * 类型体系
 */

import { type } from "os";
import { SSL_OP_NO_TLSv1_1 } from "constants";

export enum TypeKind {Named, Value, Union, Intersection, Function};

export class TypeUtil{
    //t1是否是t2的子类型
    //LE是less equal的意思，也就是t1的值域是t2的值域的子集
    static LE(t1: Type, t2: Type):boolean{
        if(t1 == t2 || t2 == SysTypes.Any){
            return true;
        }
        else if (t1.kind ==TypeKind.Named){
            return TypeUtil.LE_N_T(t1 as NamedType, t2);
        }
        else if (t1.kind == TypeKind.Value){
            return TypeUtil.LE_V_T(t1 as ValueType, t2);
        }
        else if (t1.kind == TypeKind.Union){
            return TypeUtil.LE_U_T(t1 as UnionType, t2);
        }
        else{
            console.log("Unsupported type in LE: " + TypeKind[t1.kind]);
            return false;
        }

    }

    //ValueType是否是Type的子类型
    private static LE_V_T(t1:ValueType, t2:Type):boolean{
        if (t2.kind == TypeKind.Value){
            let t2v = t2 as ValueType;
            if (t1.value == t2v.value){
                //两个值相等
                return (t1.isComplement && t2v.isComplement || !t1.isComplement && !t2v.isComplement);
            }
            else{
                return false;
            }
        }
        else if (t2.kind == TypeKind.Named){
            return TypeUtil.LE_N_T(t1.typeOfValue,t2);
        }
        else if (t2.kind == TypeKind.Union){
            return TypeUtil.LE_T_Types(t1, (t2 as UnionType).types);
        }
        else{
            console.log("Unsupported type in LE_V_T: " + TypeKind[t2.kind]);
            return false;
        }
    }

    //NamedType是否是Type的子类型
    private static LE_N_T(t1:NamedType, t2:Type):boolean{
        if (t2.kind == TypeKind.Value){
            return false;  //todo：如果NamedType以后支持类型别名，这里要修改
        }
        else if (t2.kind == TypeKind.Named){
            let t2n = t2 as NamedType;
            if(t1.upperTypes.indexOf(t2n) != -1){
                return true;
            }
            else{
                //看看所有的父类型中，有没有一个是t2的子类型
                for (let upperType of t1.upperTypes){
                    if (TypeUtil.LE(upperType,t2n)){
                        return true;
                    }
                }
                return false;
            }
        }
        else if (t2.kind == TypeKind.Union){
            return TypeUtil.LE_T_Types(t1, (t2 as UnionType).types);
        }
        else{
            console.log("Unsupported type in LE_V_T: " + TypeKind[t2.kind]);
            return false;
        }
    }

    //UnionType是否是Type的子类型
    private static LE_U_T(t1:UnionType, t2:Type):boolean{
        //t1的每个元素，都要是t2的子类型
        if (t2.kind == TypeKind.Named || t2.kind == TypeKind.Value){
            for (let t1_elem of t1.types){
                if (!TypeUtil.LE(t1_elem, t2))
                    return false;
            }
            return true;
        }
        //如果两个都是union，那么必须t1的每个元素，都是t2的子类型
        else if (t2.kind == TypeKind.Union){
            for (let t1_elem of t1.types){
                if(!TypeUtil.LE_T_Types(t1_elem, (t2 as UnionType).types))
                    return false;
            }
            return true;
        }
        else{
            console.log("Unsupported type in LE_U_T: " + TypeKind[t2.kind]);
            return false;
        }
    }
    
    //t1是否是types中某个元素的子类型
    private static LE_T_Types(t1:Type, types: Type[]):boolean{
        for (let t2 of types){
            if (TypeUtil.LE(t1,t2))
                return true;
        }
        return false;
    }

    /**
     * 判断两个类型是否有交集
     * @param t1 
     * @param t2 
     */
    static overlap(t1:Type, t2:Type):boolean{
        if(t1.kind == TypeKind.Named){
            if (t2.kind == TypeKind.Named){
                return TypeUtil.overlap_N_N(t1 as NamedType, t2 as NamedType);
            }
            else if (t2.kind == TypeKind.Value){
                return TypeUtil.overlap_N_V(t1 as NamedType, t2 as ValueType);
            }
            else{// t2.kind == TypeKind.Union
                return TypeUtil.overlap_U_T(t2 as UnionType, t1);
            }
        }
        else if(t1.kind == TypeKind.Value){
            if (t2.kind == TypeKind.Named){
                return TypeUtil.overlap_N_V(t2 as NamedType, t1 as ValueType);
            }
            else if (t2.kind == TypeKind.Value){
                return TypeUtil.overlap_V_V(t1 as ValueType, t2 as ValueType);
            }
            else{// t2.kind == TypeKind.Union
                return TypeUtil.overlap_U_T(t2 as UnionType, t1);
            }
        }
        else{//t1.kind == TypeKind.Union
            return TypeUtil.overlap_U_T(t1 as UnionType, t2);
        }
    }

    private static overlap_N_N(t1:NamedType, t2:NamedType){
        return TypeUtil.LE(t1, t2) || TypeUtil.LE(t2,t1);
    }

    private static overlap_N_V(t1:NamedType, t2:ValueType){
        return (TypeUtil.LE(t2.typeOfValue, t1));
    }

    private static overlap_V_V(t1:ValueType, t2:ValueType){
        if (t1.isComplement){
            if (t2.isComplement){
                return true;  //都是补集，无法比较，就认为有重叠好了。
            }
            else{
                //两者恰好互为补集，就返回false。
                return t1.value != t2.value;
            }
        }
        else{ //!t1.isComplement
            if (t2.isComplement){
                return t1.value != t2.value;
            }
            else{
                return t1.value == t2.value;
            }
        }
    }

    private static overlap_U_T(t1:UnionType, t2:Type):boolean{
        for (let t of t1.types){
            if (TypeUtil.overlap(t,t2)){
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
    static getUpperBound(t1:Type, t2:Type):Type{
        if(t1 == SysTypes.Any || t2 == SysTypes.Any){
            return SysTypes.Any;
        }
        else{
            if (TypeUtil.LE(t1,t2)){
                return t2;
            }
            else if (TypeUtil.LE(t2,t1)){
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
    static unionTypes(t1:Type, t2:Type):Type{
        let t:Type;
        if(t1.kind == TypeKind.Named){
            if (t2.kind == TypeKind.Named){
                t = TypeUtil.unionTypes_N_N(t1 as NamedType, t2 as NamedType);
            }
            else if (t2.kind == TypeKind.Value){
                t = TypeUtil.unionTypes_N_V(t1 as NamedType, t2 as ValueType);
            }
            else{ //t2.kind == TypeKind.Union
                t = TypeUtil.unionTypes_U_S(t2 as UnionType, t1 as NamedType);
            }
        }
        else if (t1.kind == TypeKind.Value){
            if (t2.kind == TypeKind.Named){
                t = TypeUtil.unionTypes_N_V(t2 as NamedType, t1 as ValueType);
            }
            else if (t2.kind == TypeKind.Value){
                t = TypeUtil.unionTypes_V_V(t1 as ValueType, t2 as ValueType);
            }
            else{ //t2.kind == TypeKind.Union
                t = TypeUtil.unionTypes_U_S(t2 as UnionType, t1 as ValueType);
            }
        }
        else{ //t1.kind == TypeKind.Union
            if (t2.kind == TypeKind.Named){
                t = TypeUtil.unionTypes_U_S(t1 as UnionType, t2 as NamedType);
            }
            else if (t2.kind == TypeKind.Value){
                t = TypeUtil.unionTypes_U_S(t1 as UnionType, t2 as ValueType);
            }
            else{ //t2.kind == TypeKind.Union
                t = TypeUtil.unionTypes_U_U(t1 as UnionType, t2 as UnionType);
            }
        }

        return t;
    }

    private static unionTypes_N_V(t1:NamedType, t2:ValueType):NamedType|UnionType{
        let t:NamedType|UnionType;
        if(TypeUtil.LE(t2.typeOfValue,t1)){
            t = t1;
        } 
        else{
            t = new UnionType([t1,t2]); 
        }
        return t;
    }

    private static unionTypes_N_N(t1:NamedType, t2:NamedType):NamedType|UnionType{
        let t:NamedType|UnionType;
        if (TypeUtil.LE(t1,t2)){
            t = t2;
        }
        else if(TypeUtil.LE(t2,t1)){
            t = t1;
        }
        else{
            t = new UnionType([t1 as NamedType, t2 as NamedType]); 
        }   
        return t;
    }

    private static unionTypes_U_S(t1:UnionType, t2:SimpleType):UnionType{
        let types:SimpleType[] = [];
        for (let t of t1.types){
            let t3 = TypeUtil.unionTypes(t, t2);
            if (t3.kind == TypeKind.Union){
                types = types.concat((t3 as UnionType).types);
            }
            else{
                types.push(t3 as SimpleType);
            }
        }

        return new UnionType(types);
    }

    /**
     * 返回一个新的UnionType，并合并了其中的元素
     * @param t1 
     * @param t2 
     */
    private static unionTypes_U_U(t1:UnionType, t2:UnionType):UnionType{
        let types:SimpleType[] = t1.types.slice(0);
        // for(let t of (t1 as UnionType).types){
        //     TypeUtil.addToTypes(types, t);
        // }
        for(let t of (t2 as UnionType).types){
            TypeUtil.addToTypes(types, t);
        }
        return new UnionType(types);
    }

    /**
     * 把t添加进SimpeType的集合。进行必要的分拆和合并。
     * @param types 
     * @param t 
     */
    private static addToTypes(types:SimpleType[], t:SimpleType){
        if (t.kind == TypeKind.Named){
            let t2 = t as NamedType;
            //看看该类型是否已经在集合中
            let processed = false;
            for (let i = 0; i < types.length; i++){
                let t1 = types[i];
                if (TypeUtil.LE(t2,t1)){
                    processed = true;
                    break;
                }
                else if (t1.kind == TypeKind.Value &&  TypeUtil.LE((t1 as ValueType).typeOfValue,t2)){
                    //把值集替换成基础类型
                    types.splice(i,1,t2);
                    processed = true;
                    break;
                }
            }
            if (!processed){
                types.push(t2);
            }
        }
        else if (t.kind == TypeKind.Value){
            let t2 = t as ValueType;
            let processed = false;
            for (let i = 0; i < types.length; i++){
                let t1 = types[i];
                if (t1.kind == TypeKind.Named && TypeUtil.LE(t2.typeOfValue,t1)){
                    processed = true;
                    break;
                }
                else if (t1.kind == TypeKind.Value){
                    let t1v = t1 as ValueType;
                    if (t1v.value == t2.value){
                        if (t1v.isComplement != t2.isComplement){
                            //替换成基础类型
                            if(types.indexOf(t1v.typeOfValue)==-1){ //看看是不是已经包含了此基础类型。
                                types.splice(i,1,t1v.typeOfValue);
                            }
                            else{
                                types.splice(i,1);  //删掉原来的元素
                            }
                            types.push(t1v.typeOfValue);
                        }
                        processed = true;
                        break;
                    } 

                }
            }
            if (!processed){
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
    private static unionTypes_V_V(t1:ValueType, t2:ValueType):ValueType|UnionType{
        if(t1.value == t2.value){
            return t1;
        }
        else{
            return new UnionType([t1, t2]); 
        }
    }


    /**
     * 计算补集。
     * @param t 
     */
    static notOpOnType(t:ValueType|UnionType):ValueType|UnionType{
        if (t.kind == TypeKind.Value){
            let tv = t as ValueType;
            let values = tv.value.slice(0); //克隆
            return new ValueType(tv.typeOfValue, values,!tv.isComplement);
        }
        else{ //UnionType
            let types:SimpleType[] = [];
            for (let t2 of (t as UnionType).types){
                if (t2.kind == TypeKind.Value){
                    let t3 = TypeUtil.notOpOnType(t2 as ValueType) as ValueType;
                    types.push(t3);
                }
                else{ //NamedType
                    console.log("in getComplement, element of UnionType should not be NamedType");
                }
            }
            return new UnionType(types);
        }
    }

    static intersectTypes(t1:Type, t2:Type):Type{
        if(t1.kind == TypeKind.Named){
            if (t2.kind == TypeKind.Named){
                return TypeUtil.intersectTypes_N_N(t1 as NamedType, t2 as NamedType);
            }
            else if (t2.kind == TypeKind.Value){
                return TypeUtil.intersectTypes_N_V(t1 as NamedType, t2 as ValueType);
            }
            else{ //t2.kind == TypeKind.Union
                return TypeUtil.intersectTypes_U_N(t2 as UnionType, t1 as NamedType);
            }
        }
        else if(t1.kind == TypeKind.Value){
            if (t2.kind == TypeKind.Named){
                return TypeUtil.intersectTypes_N_V(t2 as NamedType, t1 as ValueType);
            }
            else if (t2.kind == TypeKind.Value){
                return TypeUtil.intersectTypes_V_V(t1 as ValueType, t2 as ValueType);
            }
            else{ //t2.kind == TypeKind.Union
                return TypeUtil.intersectTypes_U_V(t2 as UnionType, t1 as ValueType);
            }
        }
        else{ //t1.kind == TypeKind.Union
            if (t2.kind == TypeKind.Named){
                return TypeUtil.intersectTypes_U_N(t1 as UnionType, t2 as NamedType);
            }
            else if (t2.kind == TypeKind.Value){
                return TypeUtil.intersectTypes_U_V(t1 as UnionType, t2 as ValueType);
            }
            else{ //t2.kind == TypeKind.Union
                return TypeUtil.intersectTypes_U_U(t2 as UnionType, t1 as UnionType);
            }
        }
        
    }

    //对于两个NamedType，返回子类型
    private static intersectTypes_N_N(t1:NamedType, t2:NamedType):Type{
        if (TypeUtil.LE(t1,t2)){
            return t1;
        }
        else if (TypeUtil.LE(t2,t1)){
            return t2;
        }
        else{
            return new UnionType([]);   //空集
        }
    }

    private static intersectTypes_N_V(t1:NamedType, t2:ValueType):Type{
        if(TypeUtil.LE(t2.typeOfValue, t1)){
            return t2;
        }
        else{
            if (t2.isComplement){
                if(TypeUtil.LE(t1, t2.typeOfValue)){
                    let t3 = TypeUtil.getNamedTypeByValue(t2.value);
                    if (TypeUtil.LE(t3, t1)){
                        return new ValueType(t1, t2.value, true);
                    }
                    else{
                        return t1;
                    }
                }
                else{
                    return t1;  //如果t1中不包含t2.value，那么就返回t1。
                }
            }

            return new UnionType([]);   //空集;
        }
    }

    private static intersectTypes_V_V(t1:ValueType, t2:ValueType):Type{
        if(t1.value == t2.value && (t1.isComplement && t2.isComplement || !t1.isComplement && !t2.isComplement)){
            return t1;
        }
        else{
            return new UnionType([]);  //空集;
        }
    }

    private static intersectTypes_U_N(t1:UnionType,t2:NamedType):Type{
        let types:SimpleType[] = [];
        for (let t of t1.types){
            if (t.kind == TypeKind.Named){
                let t3 = TypeUtil.intersectTypes_N_N(t as NamedType, t2);
                if (t3.kind == TypeKind.Named || t3.kind == TypeKind.Value) types.push(t3 as SimpleType);
            }
            else{ //ValueSet
                let t3 = TypeUtil.intersectTypes_N_V(t2, t as ValueType);
                if (t3.kind == TypeKind.Named || t3.kind == TypeKind.Value) types.push(t3 as SimpleType);
            }
        }

        if (types.length==0){
            return new UnionType([]);  //空集;
        }
        else if (types.length == 1){
            return types[0];
        }
        else{
            return new UnionType(types);
        }
    }

    /**
     * @param t1 
     * @param t2 
     */
    private static intersectTypes_U_V(t1:UnionType,t2:ValueType):Type{
        let types:SimpleType[] = [];
        for (let t of t1.types){
            if (t.kind == TypeKind.Named){
                let t3 = TypeUtil.intersectTypes_N_V(t as NamedType, t2);
                if (t3.kind == TypeKind.Named || t3.kind == TypeKind.Value) types.push(t3 as SimpleType);
            }
            else{ //ValueSet
                let t3 = TypeUtil.intersectTypes_V_V(t as ValueType, t2);
                if (t3.kind == TypeKind.Named || t3.kind == TypeKind.Value) types.push(t3 as SimpleType);
            }
        }

        if (types.length==0){
            return new UnionType([]);   //空集
        }
        else if (types.length == 1){
            return types[0];
        }
        else{
            return new UnionType(types);
        }
    }

    private static intersectTypes_U_U(t1:UnionType,t2:UnionType):Type{
        let types:Type[] = [];
        for (let t of t1.types){
            if (t.kind == TypeKind.Named){
                let t3 = TypeUtil.intersectTypes_U_N(t2, t as NamedType);
                if (!TypeUtil.isEmptySet(t3)) types.push(t3);
            }
            else{//ValueSet
                let t3 = TypeUtil.intersectTypes_U_V(t2, t as ValueType);
                if (!TypeUtil.isEmptySet(t3)) types.push(t3);
            }
        }

        if (types.length == 0){
            return new UnionType([]);  //空集;
        }
        else{
            return TypeUtil.mergeTypes(types);
        }
    }

    //值域是不是空的
    private static isEmptySet(t:Type):boolean{
        if(t.kind == TypeKind.Union){
            return (t as UnionType).types.length ==0;
        }
        else{ //NamedType
            return false;
        }
    }

    //把一个类型数组中的类型尽量合并
    //要求types不能是空数组
    static mergeTypes(types:Type[]):Type{
        if (types.length == 1){
            return types[0];
        }
        else{ //把求所有这些结果的并集
            let t = types[0];
            for (let i = 1; i< types.length; i++){
                t = TypeUtil.unionTypes(t, types[i]);
            }
            return t;
        }
    }

    //根据值来创建类型
    static createTypeByValue(v:any):ValueType{
        let t = TypeUtil.getNamedTypeByValue(v);
        return new ValueType(t,v,false);
    }

    static getNamedTypeByValue(v:any):NamedType{
        if (typeof v == 'number'){
            if (Number.isInteger(v)){
                return SysTypes.Integer;
            }
            else{
                return SysTypes.Decimal;
            }
        }
        else if (typeof v == 'boolean'){
            return SysTypes.Boolean;
        }
        else if (typeof v == 'string'){
            return SysTypes.String;
        }
        else if (typeof v == 'object'){
            return SysTypes.Object;
        }
        else {// typeof v == 'undefined'
            return SysTypes.UndefinedType;
        }
    }

}

/**
 * 所有类型的基类。
 */
export abstract class Type{
    kind:TypeKind;
    
    constructor(kind:TypeKind){
        this.kind = kind;
    }

    /**
     * visitor模式
     * 可以用于生成字节码等。
     */
    abstract accept(visitor:TypeVisitor):any;

    /**
     * 类型中是否包含void。
     */
    abstract hasVoid():boolean;

    abstract toString():string;
}

export type SimpleType = NamedType | ValueType;

/**
 * 简单的类型，可以有一到多个父类型
 */
//todo: 需要检查循环引用
export class NamedType extends Type{
    name:string;
    upperTypes: NamedType[];   //父类型
    
    constructor(name:string, upperTypes:NamedType[] = []){
        super(TypeKind.Named);
        this.name = name;
        this.upperTypes = upperTypes;
    }

    hasVoid():boolean{
        if (this === SysTypes.Void){
            return true;
        }
        else{
            for (let t of this.upperTypes){
                if (t.hasVoid()){
                    return true;
                }
            }
            return false;
        }
    }

    toString():string{
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
    accept(visitor:TypeVisitor):any{
        return visitor.visitNamedType(this);
    }
}

export class ValueType extends Type{
    typeOfValue : NamedType;  //值的基础类型
    value:any;             //值的集合
    isComplement:boolean;     //是否是布吉，也就是从基础类型中扣除values

    constructor(typeOfValue:NamedType, values:any, isComplement:boolean = false){
        super(TypeKind.Value);
        this.typeOfValue = typeOfValue;
        this.value = values;
        this.isComplement = isComplement;
    }

    toString():string{
        return this.isComplement ? "!" : "" + this.value;     
    }

    hasVoid():boolean{
        return false;
    }

    accept(visitor:TypeVisitor):any{
        return visitor.visitValueSet(this);
    }
}

//todo: 需要检查循环引用
export class FunctionType extends Type{
    returnType:Type;
    paramTypes:Type[];
    static index:number = 0; //序号，用于给函数类型命名
    constructor(returnType:Type = SysTypes.Void, paramTypes:Type[]=[], name:string|undefined = undefined){
        super(TypeKind.Function); 
        this.returnType = returnType;
        this.paramTypes = paramTypes;
    }    

    hasVoid():boolean{
        return this.returnType.hasVoid();
    }

    toString():string{
        let str:string = "FunctionType: (";
        for (let i = 0; i < this.paramTypes.length; i++){
            str += this.paramTypes[i].toString();
            if (i < this.paramTypes.length-1)
                str += ", ";
        }
        return str+ ")" + this.returnType.toString();
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
    accept(visitor:TypeVisitor):any{
        return visitor.visitFunctionType(this);
    }
}

//工具函数：链接多个类型的名称
function concatTypeNames(types: Type[]):string{
    let typeNames:string = "";
    for (let i = 0; i< types.length; i++){
        let t = types[i];
        if(t.kind == TypeKind.Named){
            typeNames += (t as NamedType).name;
        }
        else{
            typeNames += (t as ValueType).toString();
        }

        if (i < types.length-1)
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

export class UnionType extends Type{
    types:SimpleType[];

    /**
     * TODO：该构造方法有个问题，如果types中的类型是互相有子类型关系，应该合并。
     * @param types 
     */
    constructor(types:SimpleType[]){
        super(TypeKind.Union);
        this.types = types;
    }

    hasVoid():boolean{
        for (let t of this.types){
            if (t.hasVoid()){
                return true;
            }
        }
        return false;
    }

    toString():string{
        let typeNames = concatTypeNames(this.types);
        return typeNames ;
    }

    /**
     * visitor模式
     */
    accept(visitor:TypeVisitor):any{
        visitor.visitUnionType(this);
    }

}

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
export class SysTypes{
    //所有类型的父类型
    static Any = new NamedType("any",[]);

    //基础类型
    static String = new NamedType("string",[SysTypes.Any]);
    static Number = new NamedType("number",[SysTypes.Any]);
    static Boolean = new NamedType("boolean", [SysTypes.Any]);
    static Object = new NamedType("object", [SysTypes.Any]);
    static UndefinedType = new NamedType("undefined", [SysTypes.Any]);

    //所有类型的子类型
    static Null = new ValueType(SysTypes.Object, null);
    static Undefined = new ValueType(SysTypes.UndefinedType, undefined);

    //函数没有任何返回值的情况
    //如果作为变量的类型，则智能赋值为null和undefined
    static Void = new NamedType("void");

    //两个Number的子类型
    static Integer = new NamedType("integer", [SysTypes.Number]);
    static Decimal = new NamedType("decimal", [SysTypes.Number]);

    static isSysType(t:Type){
        return t === SysTypes.Any || t === SysTypes.String || t === SysTypes.Number ||
               t === SysTypes.Boolean || t === SysTypes.Null || t === SysTypes.Undefined ||
               t === SysTypes.Void || t === SysTypes.Integer || t === SysTypes.Decimal;
    }
}

/**
 * visitor
 */
export abstract class TypeVisitor{
    visit(t:Type):any{
        return t.accept(this);
    }
    abstract visitNamedType(t:NamedType):any;
    abstract visitFunctionType(t:FunctionType):any;
    abstract visitUnionType(t:UnionType):any;
    abstract visitValueSet(t:ValueType):any;
}

