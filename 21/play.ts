/**
 * 第10-11节
 * 优化了命令行参数的处理逻辑
 */

import {TokenKind, Scanner, CharStream, Op} from './scanner';
import {AstVisitor, AstNode, Block, Prog, VariableDecl, FunctionDecl, FunctionCall, Statement, Expression, ExpressionStatement, Binary, Unary, IntegerLiteral, DecimalLiteral, StringLiteral, Variable, ReturnStatement, IfStatement, ForStatement, AstDumper} from './ast';
import {Parser} from './parser';
import {SemanticAnalyer} from './semantic';
import {Symbol, SymKind, VarSymbol, FUN_println} from './symbol';
import {Scope, ScopeDumper} from './scope';
import {BCModule, BCGenerator, VM, BCModuleDumper, BCModuleReader, BCModuleWriter} from './vm'
import {compileToAsm} from './asm_x86-64'
import * as process from 'process'
import { Console } from 'console';

/////////////////////////////////////////////////////////////////////////
// 解释器

/**
 * 遍历AST，执行函数调用。
 */
class Intepretor extends AstVisitor{   
    //调用栈
    callStack: StackFrame[] = [];

    //当前栈桢
    currentFrame: StackFrame;

    private pushFrame(frame:StackFrame){
        this.callStack.push(frame);
        this.currentFrame = frame;
    }

    private popFrame(){
        if (this.callStack.length>1){
            let frame = this.callStack[this.callStack.length-2];
            this.callStack.pop();
            this.currentFrame = frame;
        }
    }

    constructor(){
        super();
        //创建顶层的栈桢
        this.currentFrame = new StackFrame();
        this.callStack.push(this.currentFrame);
    }

    //函数声明不做任何事情。
    visitFunctionDecl(functionDecl:FunctionDecl):any{
    }

    /**
     * 遍历一个块
     * @param block 
     */
    visitBlock(block:Block):any{
        let retVal:any;
        for(let x of block.stmts){
            retVal = this.visit(x);
            //如果当前执行了一个返回语句，那么就直接返回，不再执行后面的语句。
            //如果存在上一级Block，也是中断执行，直接返回。
            
            if (typeof retVal == 'object' &&
                ReturnValue.isReturnValue(retVal)){
                return retVal;
            }
        }
        return retVal;
    }

    /**
     * 处理Return语句时，要把返回值封装成一个特殊的对象，用于中断后续程序的执行。
     * @param returnStatement 
     */
    visitReturnStatement(returnStatement: ReturnStatement):any{
        let retVal:any;
        if (returnStatement.exp != null){
            retVal = this.visit(returnStatement.exp); 
            this.setReturnValue(retVal);
        }
        return new ReturnValue(retVal);  //这里是传递一个信号，让Block和for循环等停止执行。
    }

    //把返回值设置到上一级栈桢中（也就是调用者的栈桢）
    private setReturnValue(retVal:any){
        let frame = this.callStack[this.callStack.length-2];
        frame.retVal = retVal;
    }

    /**
     * 执行if语句
     * @param ifStmt 
     */
    visitIfStatement(ifStmt:IfStatement):any{
        //计算条件
        let conditionValue = this.visit(ifStmt.condition);
        //条件为真，则执行then部分
        if (conditionValue){ 
            return this.visit(ifStmt.stmt);
        }
        //条件为false，则执行else部分
        else if (ifStmt.elseStmt !=null){ 
            return this.visit(ifStmt.elseStmt);
        }
    }

    /**
     * 执行for语句
     * @param forStmt 
     */
    visitForStatement(forStmt:ForStatement):any{
        //执行init
        if(forStmt.init !=null){
            this.visit(forStmt.init);
        }

        //计算循环结束的条件
        let notTerminate = forStmt.condition == null ? true : this.visit(forStmt.condition);
        while(notTerminate){
            //执行循环体
            let retVal = this.visit(forStmt.stmt);
            //处理循环体中的Return语句
            if (typeof retVal == 'object' && ReturnValue.isReturnValue(retVal)){
                // console.log("is ReturnValue!!")
                return retVal;
            }

            //执行增量表达式
            if (forStmt.increment!=null){
                this.visit(forStmt.increment);
            }

            //执行循环判断
            notTerminate = forStmt.condition == null ? true : this.visit(forStmt.condition);
        }
    }

    /**
     * 运行函数调用。
     * 原理：根据函数定义，执行其函数体。
     * @param functionCall 
     */
    visitFunctionCall(functionCall:FunctionCall):any{
        // console.log("running funciton:" + functionCall.name);
        if (functionCall.name == "println"){ //内置函数
            return this.println(functionCall.arguments);
        }
        else if (functionCall.name == "tick"){
            return this.tick();
        }
        else if (functionCall.name == "integer_to_string"){
            return this.integer_to_string(functionCall.arguments);
        }
        
        if(functionCall.sym != null){
            //清空返回值
            this.currentFrame.retVal = undefined;

            //1.创建新栈桢
            let frame = new StackFrame();
            //2.计算参数值，并保存到新创建的栈桢
            let functionDecl = functionCall.sym.decl as FunctionDecl;
            if (functionDecl.callSignature.paramList != null){
                let params = functionDecl.callSignature.paramList.params;
                for (let i = 0; i< params.length; i++){
                    let variableDecl = params[i];
                    let val = this.visit(functionCall.arguments[i]);
                    frame.values.set(variableDecl.sym as Symbol, val);  //设置到新的frame里。
                }
            }

            //3.把新栈桢入栈 
            this.pushFrame(frame);

            //4.执行函数
            this.visit(functionDecl.body);            

            //5.弹出当前的栈桢
            this.popFrame();

            //5.函数的返回值
            return this.currentFrame.retVal;
        }
        else{
            console.log("Runtime error, cannot find declaration of " + functionCall.name +".");
            return;
        }
    }

    /**
     * 内置函数println
     * @param functionCall 
     */
    private println(args: Expression[]):any{
        if(args.length>0){
            let retVal = this.visit(args[0]);
            console.log(retVal);
        }
        else{
            console.log();
        }
        return 0;
    }

    /**
     * 内置函数tick
     */
    private tick():number{
        let date = new Date();
        let value = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        return value;
    }

    /**
     * 把整型转成字符串
     * @param functionCall 
     */
    private integer_to_string(args:Expression[]):string{
        if(args.length>0){
            let arg = this.visit(args[0]);
            return arg.toString();
        }
        return "";
    }

    /**
     * 变量声明
     * 如果存在变量初始化部分，要存下变量值。
     * @param functionDecl 
     */
    visitVariableDecl(variableDecl:VariableDecl):any{
        if(variableDecl.init != null){
            let v = this.visit(variableDecl.init);
            this.setVariableValue(variableDecl.sym as VarSymbol, v);
            return v;
        }
    }

    /**
     * 获取变量的值。
     * 左值的情况，返回符号。否则，返回值。
     * @param v 
     */
    visitVariable(v:Variable):any{
        if (v.isLeftValue){
            return v.sym;
        }
        else{
            return this.getVariableValue(v.sym as VarSymbol);
        }
    }

    private getVariableValue(sym:VarSymbol):any{
        return this.currentFrame.values.get(sym);
    }

    private setVariableValue(sym:VarSymbol, value:any):any{
        return this.currentFrame.values.set(sym, value);
    }

    visitBinary(bi:Binary):any{
        // console.log("visitBinary:" + bi.op);
        let ret:any;
        let v1 = this.visit(bi.exp1);
        let v2 = this.visit(bi.exp2);
        switch(bi.op){
            case Op.Plus: //'+'
                ret = v1 + v2;
                break;
            case Op.Minus: //'-'
                ret = v1 - v2;
                break;
            case Op.Multiply: //'*'
                ret = v1 * v2;
                break;
            case Op.Divide: //'/'
                ret = v1 / v2;
                break;
            case Op.Modulus: //'%'
                ret = v1 % v2;
                break;
            case Op.G: //'>'
                ret = v1 > v2;
                break;
            case Op.GE: //'>='
                ret = v1 >= v2;
                break;
            case Op.L: //'<'
                ret = v1 < v2;
                break;
            case Op.LE: //'<='
                ret = v1 <= v2;
                break;
            case Op.EQ: //'=='
                ret = v1 == v2;
                break;
            case Op.NE: //'!='
                ret = v1 != v2;
                break;
            case Op.And: //'&&'
                ret = v1 && v2;
                break;
            case Op.Or: //'||'
                ret = v1 || v2;
                break;
            case Op.Assign: //'='
                let varSymbol = v1 as VarSymbol;
                this.setVariableValue(varSymbol, v2);
                
                break;
            default:
                console.log("Unsupported binary operation: " + Op[bi.op]);
        }
        return ret;
    }

    /**
     * 计算一元表达式
     * @param u 
     */
    visitUnary(u:Unary):any{
        let v = this.visit(u.exp);
        let varSymbol:VarSymbol;
        let value:any;
        
        switch(u.op){            
            case Op.Inc: //'++'
                varSymbol = v as VarSymbol;
                value = this.getVariableValue(varSymbol);
                this.setVariableValue(varSymbol, value+1);
                if (u.isPrefix){
                    return value+1;
                }
                else{
                    return value;
                }
               
                break;
            case Op.Dec: //'--'
                varSymbol = v as VarSymbol;
                value = this.getVariableValue(varSymbol);
                this.setVariableValue(varSymbol, value-1);
                if (u.isPrefix){
                    return value-1;
                }
                else{
                    return value;
                }
                break;
            case Op.Plus: //'+'
                return v; //不需要做任何动作
            case Op.Minus: //'-'
                return -v; //对值取反   
            default:
                console.log("Unsupported unary op: " + Op[u.op]);      
        }
    }

}



// /**
//  * 左值。
//  * 目前先只是指变量。
//  */
// class LeftValue{
//     variable:VarSymbol;
//     constructor(variable:VarSymbol){
//         this.variable = variable;
//     }
// }

/**
 * 栈桢
 * 每个函数对应一级栈桢.
 */
class StackFrame{
    //存储变量的值
    values:Map<Symbol, any> = new Map();
    
    //返回值，当调用函数的时候，返回值放在这里
    retVal:any = undefined;
}

/**
 * 用于封装Return语句的返回结果，并结束后续语句的执行。
 */
class ReturnValue{
    tag_ReturnValue:number = 0;
    value:any;
    constructor(value:any){
        this.value = value;
    }

    static isReturnValue(v:any){
        return typeof (v as ReturnValue).tag_ReturnValue != 'undefined';
    }
}

/////////////////////////////////////////////////////////////////////////
// 主程序

function compileAndRun(args:CommandArgs){

    let fileName = args.fileName as string;
    if(fileName.endsWith(".ts")){
        let program = readTextFile(fileName);
        if (args.verbose){
            console.log("源代码:");
            console.log(program);
        }

        //词法分析
        let scanner = new Scanner(new CharStream(program));
        if (args.verbose) {
            console.log("\n词法分析结果:");
            while(scanner.peek().kind!=TokenKind.EOF){
                console.log(scanner.next().toString());
            }
            scanner = new Scanner(new CharStream(program));  //重置tokenizer,回到开头。
        }

        //语法分析
        let parser = new Parser(scanner);
        let prog:Prog = parser.parseProg();
        let astDumper = new AstDumper();
        if (args.verbose) {
            console.log("\n语法分析后的AST:");
            astDumper.visit(prog,"");
        }

        //语义分析
        let semanticAnalyer = new SemanticAnalyer();
        semanticAnalyer.execute(prog);
        if (args.verbose) {
            console.log("\n符号表：");
            new ScopeDumper().visit(prog,"");
            console.log("\n语义分析后的AST，注意变量和函数已被消解:");
            astDumper.visit(prog,"");
        }

        if (parser.errors.length > 0 || semanticAnalyer.errors.length>0){
            console.log("\n共发现" + parser.errors.length + "个语法错误，" + semanticAnalyer.errors.length + "个语义错误。");
            return;
        }
    
        //用AST解释器运行程序
        if (args.mode == RunningMode.astWalker){
            console.log("\n通过AST解释器运行程序:");
            let date1 = new Date();
            new Intepretor().visit(prog);
            let date2 = new Date();
            console.log("耗时："+ (date2.getTime()-date1.getTime())/1000 + "秒");
        }
        // 用vm运行程序，或者输出字节码文件
        else if (args.mode == RunningMode.vm || args.mode == RunningMode.dumpBC){
            let generator = new BCGenerator();
            let bcModule = generator.visit(prog) as BCModule;
            if (args.verbose){
                console.log("\n编译成字节码:");
                let bcModuleDumper = new BCModuleDumper();
                bcModuleDumper.dump(bcModule);
            }
            
            //用vm运行程序
            if (args.mode == RunningMode.vm){
                console.log("\n使用栈机运行程序:");
                let date1 = new Date();
                new VM().execute(bcModule);
                let date2 = new Date(); 
                console.log("耗时："+ (date2.getTime()-date1.getTime())/1000 + "秒");
            }
            
            //输出字节码文件
            else if (args.mode == RunningMode.dumpBC){
                let writer = new BCModuleWriter();
                let code = writer.write(bcModule);
                let bcFileName = args.fileNameWithoutPostfix+ ".bc";
                console.log("输出在解码到文件："+bcFileName);
                writeByteCode(bcFileName,code);
                if (args.verbose){
                    console.log("字节码文件内容：");
                    let str:string ='';
                    for(let c of code){
                        str += c.toString(16) + " ";
                    }
                    console.log(str);
                }
            }
        }     
        //编译成汇编代码
        else if (args.mode == RunningMode.dumpAsm){
            let asm = compileToAsm(prog, args.verbose);     
            let asmFileName = args.fileNameWithoutPostfix+ ".s";
            console.log("输出汇编代码到文件："+asmFileName);
            writeTextFile(asmFileName, asm);
        }

    }
    //直接运行字节码文件
    else if (fileName.endsWith(".bc")){
        let bcFileName = args.fileNameWithoutPostfix+ ".bc";
        let code = readByteCode(bcFileName);
        let reader = new BCModuleReader();
        let newModule = reader.read(code);

        if(args.verbose){
            console.log("\n字节码文件:");
            let str:string ='';
            for(let c of code){
                str += c.toString(16) + " ";
            }
            console.log(str);

            console.log("\n从字节码中生成新BCModule:");
            let bcModuleDumper = new BCModuleDumper();
            bcModuleDumper.dump(newModule);
        }

        console.log("\n用栈机执行字节码:");
        let date1 = new Date();
        new VM().execute(newModule);
        let date2 = new Date();
        console.log("耗时："+ (date2.getTime()-date1.getTime())/1000 + "秒");
    }
}

function writeByteCode(fileName:string, bc:number[]){
    let fs = require('fs');

    let buffer = Buffer.alloc(bc.length);
    for (let i:number = 0; i< bc.length; i++){
        buffer[i]=bc[i];
    }

    try{
        fs.writeFileSync(fileName,buffer);
    }
    catch(err){
        console.log(err);
    }
}

function readByteCode(fileName:string):number[]{
    let fs = require('fs');
    let bc:number[] = [];

    var buffer:any;

    try{
        buffer = fs.readFileSync(fileName,buffer);
        for (let i:number = 0; i< buffer.length; i++){
            bc[i]=buffer[i];
        }
    }
    catch(err){
        console.log(err);
    }

    return bc; 
}

function writeTextFile(fileName:string, data:string):void{
    let fs = require('fs');
    try{
        fs.writeFileSync(fileName,data);
    }
    catch(err){
        console.log(err);
    }
}

function readTextFile(fileName:string):string{
    let fs = require('fs');
    let str:string = "";

    try{
        str = fs.readFileSync(fileName,'utf-8');
    }
    catch(err){
        console.log(err);
    }

    return str; 
}

/**
 * 程序运行模式
 */
enum RunningMode{astWalker,  //AST解释器
                vm,          //字节码虚拟机
                dumpAsm,     //输出汇编代码
                dumpBC,      //输出字节码
                help         //显示帮助信息
                }

/**
 * 命令行参数的选项
 */
class CommandArgs{
    mode:RunningMode = RunningMode.astWalker;  //运行模式

    fileNameWithoutPostfix:string|null = null;     //文件名称，不带后缀的版本
    fileName:string|null = null;     //文件名称，可以是.ts或.bc

    verbose:boolean = false;         //显示详细的调试信息
}



/**
 * 解析命令行参数
 */
function parseCommandArgs():CommandArgs|null{
    let args = new CommandArgs();

    if (process.argv.length < 3) {
        console.log("请输入文件名称。");
        console.log("用\"node play --help\"来显示更多帮助信息。");
        return null;
    }

    let modeCount = 0;  //出现了几次mode参数？
    for (let i = 2; i < process.argv.length; i++){
        let arg = process.argv[i];
        if (arg == "-B"){
            args.mode = RunningMode.vm;
            modeCount++;
        }
        else if (arg == "--dumpAsm"){
            args.mode = RunningMode.dumpAsm;
            modeCount++;
        }
        else if (arg == "--dumpBC"){
            args.mode = RunningMode.dumpBC;
            modeCount++;
        }
        else if (arg == "--help"){
            args.mode = RunningMode.help;
            modeCount++;
        }
        else if (arg == "-v"){
            args.verbose = true;
        }
        else{
            if(arg.endsWith(".ts") || arg.endsWith(".bc")){
                if (args.fileName != null){
                    console.log("输入了多个文件名。");
                    console.log("用\"node play --help\"来显示更多帮助信息。");
                    return null;
                }
                else{
                    args.fileName = arg;
                }
            }
            else{
                console.log("不认识的参数: " + arg);
                console.log("用\"node play --help\"来显示更多帮助信息。");
                return null;
            }
        }
    }

    if (modeCount >1){
        console.log("使用了相互冲突的运行模式。");
        console.log("用\"node play --help\"来显示更多帮助信息。");
        return null;
    }

    if (args.fileName != null){
        args.fileNameWithoutPostfix = args.fileName.substr(0,args.fileName.length-3);
    }
    else if (args.mode!=RunningMode.help){
        console.log("请输入文件名称。");
        console.log("用\"node play --help\"来显示更多帮助信息。");
        return null;
    }

    return args;
}

function showHelp(){
    console.log("一个简单的TypeScript编译器和解释器。");
    console.log('使用:\tnode play (-B|--dumpBC|--dumpAsm)? (-v)? FileName');
    console.log('\tnode play --help');
    console.log("举例：");
    console.log("\tnode play example.ts -> 用AST解释器执行example.ts");
    console.log("\tnode play example.bc -> 用字节码虚拟机执行example.bc");
    console.log("\tnode play -B example.ts -> 编译成字节码执行");
    console.log("\tnode play --dumpBC example.ts -> 编译成字节码执行，并保存到.bc文件中");
    console.log("\tnode play --dumpAsm example.ts -> 编译成汇编代码，保存到.s文件中");

    console.log("可选参数：");
    console.log("\t-B:\t用字节码虚拟机运行程序。缺省用AST解释器执行程序。");
    console.log("\t--dumpBC:\t编译成字节码，保存到.bc文件中。");
    console.log("\t--dumpAsm:\t编译成x86_64的汇编代码，保存到.s文件中。");
    console.log("\t-v:\t显示编译过程中的详细信息。");
    console.log("\t--help:\t显示当前的帮助信息。");

    console.log("FileName：");
    console.log("\t文件后缀可以是.ts或.bc，分别作为TypeScript和字节码文件读入。当文件后缀为.bc时，自动启动-B选项，用字节码虚拟机运行字节码文件。");
}

/**
 * 解析命令行参数并运行
 */
function execute(){
    let args = parseCommandArgs();
    if (args == null) return;
    
    if (args.mode == RunningMode.help){
        showHelp();
    }
    else{
        compileAndRun(args);
    }
}

//运行
execute();
