export function success(result)
{
    return{
        msg:"sucesss",
        statusCode:200,
        status:"ok",
        data:result,
        error:" "  
    }
}

export function failure(error)
{
    return {
        msg:"Failed",
        statusCode:400,
        data:" ",
        error:error
    }
}

export function loginSuccess(result,token)
{
    return{
        msg:"Login Success",
        statusCode:200,
        data:{result,token},
        error:" "
    }
}

