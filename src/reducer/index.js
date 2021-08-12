import { combineReducers } from 'redux'
import * as actionTypes from './../actions/types'


const initialUser={
    currentUser:null,
    isLoading:true
}




const user_reducer=(state=initialUser,action)=>{
    switch(action.type){
        case actionTypes.SET_USER:
            return{
                currentUser:action.payload.currentUser,
                isLoading:false
            }
            case actionTypes.CLEAR_USER:
                return{
                ... initialUser,
                isLoading:false
                }
        default:
            return state
    }
}

const initialChannelState={
    currentChannel:null,
    isPrivateChannel:false,
    userPosts:null

}
const channel_reducer=(state=initialChannelState,action )=>{
    switch(action.type){
        case actionTypes.SET_CURRENT_CHANNEL:
            return{
                ...state,
                currentChannel:action.payload.currentChannel
            }
        case actionTypes.SET_PRIVATE_CHANNEL:
            return{
            ...state,
            isPrivateChannel:action.payload.isPrivateChannel
            }
        case actionTypes.SET_USER_POST:
            return{
                ...state,
                userPosts:action.payload.userPosts
            }
        default:
                return state
    }
}

const initialColorState={
    primary:'#4c3c4c',
    secondary:'#eee'
}

const color_reducer=(state=initialColorState,action )=>{
    switch(action.type){
        case actionTypes.SET_COLOR:
            return{
                primary:action.payload.primary,
                secondary:action.payload.secondary
            }
            default:
                return state;
    }
}

const rootReducer = combineReducers({
    user:user_reducer,
    channel:channel_reducer,
    color:color_reducer
})

export default rootReducer;