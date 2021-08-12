
import React from 'react'
import firebase from './../../firebase'
import {Menu,Icon} from 'semantic-ui-react'
import {connect} from'react-redux'
import {setCurrentChannel,setPrivateChannel} from './../../actions/index'
class DirectMessage extends React.Component{
    state={
        activeChannel:null,
        users:[],
        user:this.props.currentUser,
        userRef:firebase.database().ref('users'),
        connectedRef:firebase.database().ref('.info/connected'),
        presenceRef:firebase.database().ref('presence')
   
    }

    componentDidMount(){
        if(this.state.user){
            // console.log(this.state.user)
            this.addListeners(this.state.user.uid)
        }
    }
componentWillUnmount(){
    this.removeListeners()
}
removeListeners=()=>{
    this.state.userRef.off()
    this.state.presenceRef.off()
    this.state.connectedRef.off()
}
    addListeners=currentUserUid=>{
        // console.log(currentUserUid)
        let loadedUsers=[]
        this.state.userRef.on('child_added',snap=>{
            // console.log(snap.key)
            if(currentUserUid!==snap.key){
                let user=snap.val()
                user['uid']=snap.key;
                user['status']='offline'
                loadedUsers.push(user)
                // console.log(user)
                this.setState({users:loadedUsers})
            }
        })
        this.state.connectedRef.on('value',snap=>{
            if(snap.val()===true){
                // console.log('working')
                const ref=this.state.presenceRef.child(currentUserUid);
                ref.set(true);
                ref.onDisconnect().remove(err=>{
                    console.log(err)
                })
            }
            this.state.presenceRef.on('child_removed',snap=>{
                if(currentUserUid!==snap.key){
                    // console.log(snap.key)
                    this.addStatusToUser(snap.key,false)
                }
            })
            this.state.presenceRef.on('child_added',snap=>{
                if(currentUserUid!==snap.key){
                    // console.log(snap.key)
                    this.addStatusToUser(snap.key)
                }
            })
        })
    }

    isUserOnline=user=>user.status==='online'

    changeChannel=user=>{
        const channelId=this.getChannelId(user.uid);
        const channelData={
            id:channelId,
            name:user.name
        }
        this.props.setCurrentChannel(channelData)
        this.props.setPrivateChannel(true)
        this.setActiveChannel(user.uid)

    }
    getChannelId=(userid)=>{
        const curentUserId=this.state.user.uid;
        return userid<curentUserId?`${userid}/${curentUserId}`:`${curentUserId}/${userid}`
    }

 addStatusToUser=(userId,connected=true)=>{
     const upadatUsers=this.state.users.reduce((acc,user)=>{
         if(user.uid==userId){
             user['status']=`${connected?'online':'offline'}`

         }
         return acc.concat(user);
     },[])
     this.setState({users:upadatUsers})
 }

 setActiveChannel=userid=>{
     this.setState({activeChannel:userid})
 }
    render(){
        const {users,activeChannel}=this.state
        console.log(users.length)
        return(
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail" />Direct Message
                    </span>{' '}
                    ({`${users.length}`})
                </Menu.Item>
                {users.map(user=>(
                    <Menu.Item
                    key={user.uid}
                    active={user.uid===activeChannel}
                    onClick={()=>this.changeChannel(user)}
                    style={{opacity:0.7,fontStyle:'italic'}}
                    >
                        <Icon name="circle"
                        color={this.isUserOnline(user)?'green':'red'}
                        /> @ {user.name}
                    </Menu.Item>
                ))}
            </Menu.Menu>
        )
    }
}

export default connect(null,{setCurrentChannel,setPrivateChannel})(DirectMessage)