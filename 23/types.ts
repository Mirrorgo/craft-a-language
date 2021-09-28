/**
 * 类型体系
 */

export enum TypeKind {Named, Value, Union, Intersection, Function};

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

    //t1是否是t2的子类型
    //LE是less equal的意思，也就是t1的集合是t2的集合的子集
    static LE(t1: Type, t2: Type):boolean{
        if(t1 == t2 || t2 == SysTypes.Any){
            return true;
        }
        else if (t1.kind == TypeKind.Value){
            return Type.LE_V_T(t1 as ValueType, t2);
        }
        else if (t1.kind ==TypeKind.Named){
            return Type.LE_N_T(t1 as NamedType, t2);
        }
        else if (t1.kind == TypeKind.Union){
            return Type.LE_U_T(t1 as UnionType, t2);
        }
        else{
            console.log("Unsupported type in LE: " + TypeKind[t1.kind]);
            return false;
        }

    }

    //ValueType是否是Type的子类型
    private static LE_V_T(t1:ValueType, t2:Type):boolean{
        if (t2.kind == TypeKind.Value){
            return t1.value == (t2 as ValueType).value;
        }
        else if (t2.kind == TypeKind.Named){
            return t1.typeOfValue == t2;
        }
        else if (t2.kind == TypeKind.Union){
            return Type.LE_T_Types(t1, (t2 as UnionType).types);
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
                    if (Type.LE(upperType,t2n)){
                        return true;
                    }
                }
                return false;
            }
        }
        else if (t2.kind == TypeKind.Union){
            return Type.LE_T_Types(t1, (t2 as UnionType).types);
        }
        else{
            console.log("Unsupported type in LE_V_T: " + TypeKind[t2.kind]);
            return false;
        }
    }

    //UnionType是否是Type的子类型
    private static LE_U_T(t1:UnionType, t2:Type):boolean{
        if (t2.kind == TypeKind.Value){
            return false;  //todo：如果NamedType以后支持类型别名，这里要修改
        }
        //t1的每个元素，都要是t2的子类型
        else if (t2.kind == TypeKind.Named){
            for (let t1_elem of t1.types){
                if (!Type.LE(t1_elem, t2))
                    return false;
            }
            return true;
        }
        //如果两个都是union，那么必须t1的每个元素，都是t2的子类型
        else if (t2.kind == TypeKind.Union){
            for (let t1_elem of t1.types){
                if(!Type.LE_T_Types(t1_elem, (t2 as UnionType).types))
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
            if (Type.LE(t1,t2))
                return true;
        }
        return false;
    }

     /**
     * 求type1与type2的上界
     * @param type1 
     * @param type2 
     */
    static getUpperBound(type1:Type, type2:Type):Type{
        if(type1 == SysTypes.Any || type2 == SysTypes.Any){
            return SysTypes.Any;
        }
        else{
            if (Type.LE(type1,type2)){
                return type2;
            }
            else if (Type.LE(type2,type1)){
                return type1;
            }
            else{ //todo 这里比较粗糙。如果type1和type2都是UnionType，其实应该求它们的并集
                return new UnionType([type1,type2]);
            }
        }
    }

}

/**
 * 简单的类型，可以有一到多个父类型
 */
//todo: 需要检查循环引用
export class NamedType extends Type{
    name:string;
    upperTypes: NamedType[];
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
        return visitor.visitSimpleType(this);
    }
}

export class ValueType extends Type{
    value:any;
    typeOfValue : NamedType;  //值的基础类型
    constructor(value:any, typeOfValue:NamedType){
        super(TypeKind.Value);
        this.value = value;
        this.typeOfValue = typeOfValue;
    }

    toString():string{
        return "{" + this.value + "}";     
    }

    hasVoid():boolean{
        return false;
    }


    accept(visitor:TypeVisitor):any{
        return visitor.visitValueType(this);
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
        let paramTypeNames:string = concatTypeNames(this.paramTypes);
        return "FunctionType: (" + paramTypeNames+ ")" + this.returnType.toString();
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
        else if(t.kind == TypeKind.Value){
            typeNames += (t as ValueType).value;
        }
        else{
            typeNames += TypeKind[t.kind] +"Type";
        }

        if (i < types.length-1)
            typeNames += " | ";
    }
    return typeNames;
}

//todo: 需要检查循环引用
export class UnionType extends Type{
    types:Type[];

    static index:number = 0; //序号，用于给UnionType命名

    /**
     * TODO：该构造方法有个问题，如果types中的类型是互相有子类型关系，应该合并。
     * @param types 
     */
    constructor(types:Type[]){
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
    static Null = new ValueType(null, SysTypes.Object);
    static Undefined = new ValueType(undefined, SysTypes.UndefinedType);

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
    abstract visitSimpleType(t:NamedType):any;
    abstract visitFunctionType(t:FunctionType):any;
    abstract visitUnionType(t:UnionType):any;
    abstract visitValueType(t:ValueType):any;
}

