/**
 * 符号表和作用域
 * @version 0.5
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-04
 * 
 */

import {AstNode, FunctionDecl, Prog, VariableDecl, ClassDecl} from './ast'
import {SysTypes, Type, FunctionType} from './types'

/////////////////////////////////////////////////////////////////////////
// 符号表
// 

/**
 * 符号
 */
export abstract class Symbol{
    name : string;
    theType: Type = SysTypes.Any;
    kind : SymKind;
    constructor(name: string, theType:Type, kind:SymKind){
        this.name = name;
        this.theType = theType;
        this.kind = kind;
    } 

    /**
     * visitor模式
     * @param vistor 
     * @param additional 额外需要传递给visitor的信息。
     */
    abstract accept(vistor:SymbolVisitor, additional:any):any;
    
}

export enum FunctionKind{Function, Method, Constructor}

export class FunctionSymbol extends Symbol{
    vars:VarSymbol[] = [];  //本地变量的列表。参数也算本地变量。

    opStackSize:number = 10; //操作数栈的大小

    byteCode:number[]|null = null; //存放生成的字节码

    decl:FunctionDecl|null = null; //存放AST，作为代码来运行

    functionKind:FunctionKind;

    classSym:ClassSymbol|null = null;  //当FunctionSymbol是类的方法时，设置所关联的类。

    closure:Closure | null = null;

    //是否是方法
    get isMethodOrConstructor():boolean{
        return this.classSym != null;  
    }

    //获取全名称，也就是“类名.方法名”
    get fullName():string{
        let str = "";
        if(this.classSym){
            str += this.classSym.name+".";
        }
        str += this.name;
        return str;
    }

    constructor(name: string, theType:FunctionType, vars:VarSymbol[] = [], functionKind:FunctionKind=FunctionKind.Function){
        super(name,theType, SymKind.Function);
        this.vars = vars;
        this.functionKind = functionKind;
    } 

    /**
     * visitor模式
     * @param vistor 
     * @param additional 额外需要传递给visitor的信息。
     */
    accept(vistor:SymbolVisitor, additional:any = undefined):any{
        vistor.visitFunctionSymbol(this, additional);
    }

    //获取参数数量
    getNumParams():number{
        return (this.theType as FunctionType).paramTypes.length;
    }

}

/**
 * 保存函数的闭包分析结果
 * 也就是：函数所引用的外部变量，以及每个外部变量所属的函数
 */
export class Closure{
    //闭包中所应用的变量
    vars:VarSymbol[] = [];
    //每个变量所在的函数
    functions:FunctionSymbol[] = [];

    toString():string{
        let str = "closure{";
        for (let i = 0; i < this.vars.length; i++){
            str+=this.functions[i].name + "." + this.vars[i].name;
            if (i < this.vars.length -1) str += ", ";
        }
        str += "}";
        return str;
    }
}


export class VarSymbol extends Symbol{
    classSym:ClassSymbol|null = null;  //当VarSymbol是类的属性时，设置所关联的类。

    constructor(name: string, theType:Type){
        super(name,theType,SymKind.Variable);
    } 

    /**
     * visitor模式
     * @param vistor 
     * @param additional 额外需要传递给visitor的信息。
     */
    accept(vistor:SymbolVisitor, additional:any = undefined):any{
        vistor.visitVarSymbol(this, additional);
    }
}

export class ClassSymbol extends Symbol{
    superClassSym:ClassSymbol|null;
    constructor_:FunctionSymbol|null;
    props:VarSymbol[];
    methods:FunctionSymbol[];
    decl:ClassDecl; //存放AST，作为代码来运行
    constructor(decl:ClassDecl, theType:Type, constructor_:FunctionSymbol|null = null, 
        props:VarSymbol[] = [], methods:FunctionSymbol[] = [], superClassSym:ClassSymbol|null = null){
        super(decl.name,theType,SymKind.Class);
        this.decl = decl;
        this.constructor_ = constructor_;
        this.props = props;
        this.methods = methods;
        this.superClassSym = superClassSym;

        if(this.constructor_) this.constructor_.classSym = this;
        for (let prop of this.props){
            prop.classSym = this;
        }
        for (let method of this.methods){
            method.classSym = this;
        }
    } 

    /**
     * visitor模式
     * @param vistor 
     * @param additional 额外需要传递给visitor的信息。
     */
    accept(visitor:SymbolVisitor, additional:any = undefined):any{
        visitor.visitClassSymbol(this, additional);
    }

    //计算总的属性的数量，包括自身的属性数和各级父类的属性数。
    get numTotalProps():number{
        let num = this.props.length;
        if (this.superClassSym){
            num += this.superClassSym.numTotalProps; //递归查找
        }
        return num;
    }

    //计算总的属性的数量，包括自身的属性数和各级父类的属性数。
    get numTotalMethods():number{
        let num = this.methods.length;
        if (this.superClassSym){
            num += this.superClassSym.numTotalMethods; //递归查找
        }
        return num;
    }

    //返回某个属性在总的属性中的序号，用于计算在内存中的偏移量
    getPropIndex(prop:VarSymbol):number{
        let index = this.props.indexOf(prop);
        if (index == -1){
            if (this.superClassSym) index = this.superClassSym.getPropIndex(prop);
        }
        else{
            if (this.superClassSym) index += this.superClassSym.numTotalProps;
        }
        return index;
    }

    //返回某个方法在总的方法中的序号，用于计算在vtable中的偏移量
    //考虑了方法覆盖的情况
    getMethodIndex(methodName:string):number{
        let index = -1;
        for (let i = 0; i < this.methods.length; i++){
            if (this.methods[i].name == methodName){
                index = i;
                break;
            }
        }

        if (index == -1){
            if (this.superClassSym) index = this.superClassSym.getMethodIndex(methodName);
        }
        else{
            if (this.superClassSym) index += this.superClassSym.numTotalMethods;
        }
        return index;
    }

    //获取父类的构造方法
    getSuperClassConstructor():FunctionSymbol | null{
        if (this.superClassSym){
            if (this.superClassSym.constructor_){
                return this.superClassSym.constructor_;
            }
            else{
                return this.superClassSym.getSuperClassConstructor();
            }
        }
        else{
            return null;
        }
    }

    //获取本级或父类中的属性
    getPropertyCascade(name:string):VarSymbol|null{
        for (let prop of this.props){
            if (prop.name == name){
                return prop;
            }
        }

        if (this.superClassSym){
            return this.superClassSym.getPropertyCascade(name);
        }
        else{
            return null;
        }
    }

    //获取本级或父类中的方法
    getMethodCascade(name:string):FunctionSymbol|null{
        for (let method of this.methods){
            if (method.name == name){
                return method;
            }
        }

        if (this.superClassSym){
            return this.superClassSym.getMethodCascade(name);
        }
        else{
            return null;
        }
    }

}

/**
 * 符号类型
 */
export enum SymKind{Variable, Function, Class, Interface, Parameter, Prog};

/////////////////////////////////////////////////////////////////////////
//一些系统内置的符号
export let FUN_println = new FunctionSymbol("println", new FunctionType(SysTypes.Void,[SysTypes.Any]),[new VarSymbol("a", SysTypes.String)]);
export let FUN_println_l = new FunctionSymbol("println", new FunctionType(SysTypes.Void,[SysTypes.Integer]),[new VarSymbol("a", SysTypes.Integer)]);
export let FUN_println_s = new FunctionSymbol("println_s", new FunctionType(SysTypes.Void,[SysTypes.String]),[new VarSymbol("a", SysTypes.String)]);
export let FUN_println_d = new FunctionSymbol("println_d", new FunctionType(SysTypes.Void,[SysTypes.Number]),[new VarSymbol("a", SysTypes.Number)]);
export let FUN_tick = new FunctionSymbol("tick", new FunctionType(SysTypes.Integer,[]),[]);
export let FUN_tick_d = new FunctionSymbol("tick_d", new FunctionType(SysTypes.Number,[]),[]);
export let FUN_integer_to_string = new FunctionSymbol("integer_to_string", new FunctionType(SysTypes.String,[SysTypes.Integer]),[new VarSymbol("a", SysTypes.Integer)]);

// export let built_ins:Map<string, FunctionSymbol> = new Map([
//     ["println", FUN_println],
//     ["println_s", FUN_println_s],
//     ["println_d", FUN_println_d],
//     ["tick", FUN_tick],
//     ["tick_d", FUN_tick_d],
//     ["integer_to_string", FUN_integer_to_string],
//     // ["string_concat", FUN_string_concat],
// ]);

let FUN_string_create_by_str = new FunctionSymbol("string_create_by_cstr", new FunctionType(SysTypes.String,[SysTypes.String]),[new VarSymbol("a", SysTypes.String)]);
let FUN_string_concat = new FunctionSymbol("string_concat", new FunctionType(SysTypes.String,[SysTypes.String,SysTypes.String]),[new VarSymbol("str1", SysTypes.String), new VarSymbol("str2", SysTypes.String)]);
let FUN_array_create_by_length = new FunctionSymbol("array_create_by_length", new FunctionType(SysTypes.Object,[SysTypes.Integer]),[new VarSymbol("a", SysTypes.Integer)]);
let FUN_object_create_by_length = new FunctionSymbol("object_create_by_length", new FunctionType(SysTypes.Object,[SysTypes.Integer]),[new VarSymbol("a", SysTypes.Integer)]);
let FUN_double_to_string = new FunctionSymbol("double_to_string", new FunctionType(SysTypes.Object,[SysTypes.Number]),[new VarSymbol("a", SysTypes.Number)]);


export let built_ins:Map<string, FunctionSymbol> = new Map([
    ["println", FUN_println],
    ["println_l", FUN_println_l],
    ["println_s", FUN_println_s],
    ["println_d", FUN_println_d],
    ["tick", FUN_tick],
    ["tick_d", FUN_tick_d],
    ["integer_to_string", FUN_integer_to_string],  //todo:去掉？

    ["string_create_by_cstr", FUN_string_create_by_str],
    ["string_concat", FUN_string_concat],
    ["array_create_by_length", FUN_array_create_by_length],
    ["object_create_by_length", FUN_object_create_by_length],
    ["double_to_string", FUN_double_to_string],
]);


///////////////////////////////////////////////////////////////////////
//visitor
export abstract class SymbolVisitor{
    abstract visitVarSymbol(sym:VarSymbol, additional:any):any;
    abstract visitFunctionSymbol(sym:FunctionSymbol, additional:any):any;
    abstract visitClassSymbol(sym:ClassSymbol, additional:any):any;
}


export class SymbolDumper extends SymbolVisitor{

    visit(sym:Symbol, additional:any){
        return sym.accept(this, additional);
    }
    
    /*
     * 输出VarSymbol的调试信息
     * @param sym 
     * @param additional 前缀字符串
     */
    visitVarSymbol(sym:VarSymbol, additional:any):any{
        console.log(additional + sym.name + "{" + SymKind[sym.kind] + "}");
    }

    /**
     * 输出FunctionSymbol的调试信息
     * @param sym 
     * @param additional 前缀字符串
     */
    visitFunctionSymbol(sym:FunctionSymbol, additional:any):any{
        console.log(additional + sym.name 
            + (sym.functionKind != FunctionKind.Function ? ":"+FunctionKind[sym.functionKind] : "") 
            + "{" + SymKind[sym.kind] + ", local var count:"+ sym.vars.length+ "}");
        //输出字节码
        if (sym.byteCode!=null){
            let str:string ='';
            for(let code of sym.byteCode){
                str += code.toString(16) + " ";
            }
            console.log(additional + "    bytecode: " + str);
        }

        if (sym.closure && sym.closure.vars.length>0){
            console.log(additional + "    " + sym.closure.toString());
        }
    }

    visitClassSymbol(sym:ClassSymbol, additional:any):any{
        let str = additional + sym.name + "{" + SymKind[sym.kind] + "}";
        
        if (sym.superClassSym) str += " extends " + sym.superClassSym.name;

        if (sym.constructor_) str += ", constructor";

        if (sym.props.length > 0){
            str += ", props:[";
            for (let prop of sym.props){
                str += prop.name + ",";
            }
            str += "]";
        }
        
        if (sym.methods.length > 0){
            str += ", methods:[";
            for (let method of sym.methods){
                str += method.name + ",";
            }
            str += "]";
        }

        console.log(str);
    }
}