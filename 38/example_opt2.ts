function deadCode2(b:number,c:number){
    let a:number = b+c;
    let d:number;
    let y:number;
    if (b > 0){
        d = a+c;
        y = b+d;
    }
    else{
        b = a+b;
        d = a+b;
    }
    let x = a+b;
    y = c + d;
    return x;
}

