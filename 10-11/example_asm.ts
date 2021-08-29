
function foo(a:number):number{
    if (a>10){
        return a + 8;
    }
    else{
        return a - 8;
    }
}

function foo2(a:number):number{
    let c:number=0;
    if (a>10)
        c = a + 8;
    return c;
}

function foo3(a:number):number{
    let c:number=0;
    if (a>10){
    }
    else{
        c = a*10+a*5-3+2*4/2 + 8*a-2;
    }
    return c;
}

function foo4(a:number):number{
    let c:number = 0;
    if (a<10){
    }
    else{      
    }
    return c;
}
