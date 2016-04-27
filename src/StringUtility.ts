let nullstr:string = null;
let emptystr = "";

export function IsNullOrEmpty(str:string)
{
    if(str!=nullstr && str!=emptystr)
    {
        return false;
    }
    return true;
}