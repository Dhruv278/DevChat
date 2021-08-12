

import * as actionTypes from './types'

export const setUser=user=>{
    return{
        type:actionTypes.SET_USER,
        payload:{
            currentUser:user
        }
    }
}

export const clearUser=(history)=>{
    history.push('/login')
    return{
        type:actionTypes.CLEAR_USER
    }
}

export const setCurrentChannel=Channel=>{
    return{
        type:actionTypes.SET_CURRENT_CHANNEL,
        payload:{
            currentChannel:Channel
        }
    }
}
export const setPrivateChannel=(isPrivateChannel)=>{
    return{
        type:actionTypes.SET_PRIVATE_CHANNEL,
        payload:{
            isPrivateChannel
        }
    }
}

export const setUSerPost=(userPosts)=>{
    return{
        type:actionTypes.SET_USER_POST,
        payload:{
            userPosts
        }
    }

}


export const setColors=(primary,secondary)=>{
    // console.log(primary,secondary)
    return{
        type:actionTypes.SET_COLOR,
        payload:{
            primary,
            secondary
        }
    }
}