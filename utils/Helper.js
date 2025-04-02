
export function checkString(x,input,a){
    //here if a is 1 we need to return trimmed string back and if nothing is given i.e. the third parameter is not given it will not return
    if (typeof x !== 'string' || x.trim().length ===0){
        throw new Error(`${input} must be a string`)
    }
    if(a===1){
        return x.trim();
    }
}


export function checkNumber(y,input,z){

    if(typeof y !=='number' || isNaN(y) ||y<z){
        throw new Error(`${input} must be a Number`)
    }
}