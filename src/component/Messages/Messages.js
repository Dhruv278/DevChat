import React from 'react'
import {Segment,Comment, SearchResult, Flag} from 'semantic-ui-react'
import  MessageHeader  from './MEssageHeader'
import MessageForm from './MessageForm'
import firebase from './../../firebase'
import Message from './Message'
import {connect} from 'react-redux'
import Typing from './Typing'
import {setUSerPost} from './../../actions/index'
import Skeleton from './Skeleton'
class Messages extends React.Component{
    state={
        privatChannel:this.props.isPrivateChannel,
        privateMessagesRef:firebase.database().ref('privateMessages'),
        messageRef:firebase.database().ref('messages'),
        typingRef:firebase.database().ref('typing'),
         usersRef:firebase.database().ref('users'),
         connectionRef:firebase.database().ref('.info/connected'),
        channel:this.props.currentChannel,
        user:this.props.currentUser,
        messages:[],
        messagesLoading:true,
        numUniqueUser:'',
        searchTerm:'',
        searchLoading:false,
        searchResult:[],
        isChannelStarred:false,
        typingUsers:[],
        listeners:[],
        EmptyChannel:false
        


    }

    getMessageRef=()=>{
        const {messageRef,privateMessagesRef,privatChannel}=this.state;
        return privatChannel?privateMessagesRef:messageRef
    }
    
componentDidMount(){
    const { channel,user,listeners}=this.state;
    if(channel&&user){
        this.removeListeners(listeners)
        this.addListener(channel.id)
        this.addUserStarsListener(channel.id,user.uid)
    }
}
componentDidUpdate(prevProps,prevState){
    if(this.messagesEnd){
        this.scrollToBottom()
    }

}
componentWillUnmount(){
    this.removeListeners(this.state.listeners)
    this.state.connectionRef.off()
}
scrollToBottom=()=>{
    this.messagesEnd.scrollIntoView({behavior:'smooth'})
}

addToListeners=(id,ref,event)=>{
    const index=this.state.listeners.findIndex(listener=>{
        return listener.id===id && listener.ref==ref && listener.event===event
    })
    if(index===-1){
        const newListner={id,ref,event};
        this.setState({listeners:this.state.listeners.concat(newListner)})
    }
}
addUserStarsListener=(channelId,userId)=>{
   this.state.usersRef
      .child(userId)
      .child(`starred`)
      .once('value')
      .then(data=>{
          if(data.val()!==null){
              const channelIds=Object.keys(data.val())
              const prevStarred=channelIds.includes(channelId)
              this.setState({isChannelStarred:prevStarred})
            }
      })
}

addListener=channelId=>{
    this.addMessageListener(channelId)
    this.addTypingListner(channelId)
}

addTypingListner=channelId=>{
    let typingUsers=[]
    this.state.typingRef.child(channelId).on('child_added',snap=>{
        if(snap.key!==this.state.user.uid){
            typingUsers=typingUsers.concat({
                id:snap.key,
                name:snap.val()
            })
            this.setState({typingUsers})
        }
    })
    this.addToListeners(channelId,this.state.typingRef,'chid_added')
    this.state.typingRef.child(channelId).on('child_removed',snap=>{
        const index=typingUsers.findIndex(user=>user.id===snap.key)
        if(index!==-1){
            typingUsers=typingUsers.filter(user=>user.id!==snap.key);
            this.setState({typingUsers})
        }

    })

    this.addToListeners(channelId,this.state.typingRef,'child_removed')
    this.state.connectionRef.on('value',snap=>{
        if(snap.val()==true){
            this.state.typingRef
            .child(channelId)
            .child(this.state.user.uid)
            .remove(err=>{
                if(err!==null){
                    console.log(err)
                }
            })
        }
    })
}

addMessageListener=channelId=>{
    let loadedMessage=[]
    console.log(loadedMessage.length)
    const ref=this.getMessageRef()
    this.setState({EmptyChannel:true})
    ref.child(channelId).on('child_added',snap=>{
     loadedMessage.push(snap.val());
     
   
     this.setState({
         messages:loadedMessage,
        
         messagesLoading:false,
        
     })
     this.countUniqueUsers(loadedMessage);
     this.CountUserPosts(loadedMessage)
    })
    this.CountUserPosts(loadedMessage)
    this.setState({messagesLoading:false})
    this.addToListeners(channelId,ref,'chid_added')
}

removeListeners=listeners=>{
    listeners.forEach(listener=>{
        listener.ref.child(listener.id).off(listener.event)
    })
}

countUniqueUsers=(messages)=>{
    const uniqueUser=messages.reduce((acc,message)=>{
        if(!acc.includes(message.user.name)){
            acc.push(message.user.name)
        }
        return acc

    },[])
    const pural=uniqueUser.length>1 || uniqueUser.length==0
    const numUniqueUser=`${uniqueUser.length} User${pural?"s":""}`
    // console.log(uniqueUser)
    this.setState({numUniqueUser})
}

 displayMessages=messages=>(
     messages.length>0 && messages.map(message=>(
         <Message 
         key={message.timestamp}
         message={message}
         user={this.state.user}
         />
     ))
 )

 handleSearch=event=>{
     this.setState({
         searchTerm:event.target.value,
         searchLoading:true
     },()=>this.handleSearchMessage())
 }

 handleSearchMessage=()=>{
     const channelMessages=[...this.state.messages];
     const regex =new RegExp(this.state.searchTerm,'gi')
     const searchResult=channelMessages.reduce((acc,message)=>{
         if(message.content && message.content.match(regex) || message.user.name.match(regex)){
             acc.push(message)
         }
         return acc
     },[])
     this.setState({searchResult})
     setTimeout(()=>{this.setState({searchLoading:false})},1000)
 }

 handleStar=()=>{
     this.setState(preState=>({
         isChannelStarred:!preState.isChannelStarred
     }),()=>this.starChannel())
 }
starChannel=()=>{
    if(this.state.isChannelStarred){
        this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]:{
                        name:this.state.channel.name,
                        details:this.state.channel.details,
                        createdBy:{
                            name:this.state.channel.createdBy.name,
                            avatar:this.state.channel.createdBy.avatar

                        }
                    }

                })
    }else{
        this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove(err=>{
            if(err!==null){
                console.log(err)
            }
        })
    }
}

CountUserPosts=(messages)=>{
    console.log('works')
    let usersPosts=messages.reduce((acc,message)=>{
        console.log(message)
        if(message.user.name in acc){
            acc[message.user.name].count +=1;

        }
        else{
            acc[message.user.name]={
                avatar:message.user.avatar,
                count:1    
            }
        }
        return acc
    }
    ,{})
    this.props.setUSerPost(usersPosts)
}
displayTypingUsers=(users)=>(
    users.length>0 && users.map(user=>(
        <div style={{display:'flex',alignItems:'center',marginBottom:'0.2em'}} key={user.id}>
            <span className="user__typing">{user.name} is typing</span><Typing />
        </div>  
    ))
)
 
displayMessageSkeleton=loading=>(
    loading?(
        <React.Fragment>
            {[...Array(10)].map((_,i)=>(
                    <Skeleton key={i}/>
            ))}
        </React.Fragment>
    ):null
)
 displayChannel=channel=>channel ? `${this.state.privatChannel ?'@':'#'}${channel.name}`:''
    render(){
        const {messageRef,channel,messagesLoading,user,typingUsers,messages,numUniqueUser,searchLoading,searchTerm,searchResult,EmptyChannel,privatChannel,isChannelStarred}=this.state;
        return(
            <React.Fragment>
                <MessageHeader isChannelStarred={isChannelStarred} handleStar={this.handleStar} handleSearch={this.handleSearch} isPrivateChannel={privatChannel} searchLoading={searchLoading} uniqueUser={numUniqueUser} channelName={this.displayChannel(channel)} />
                <Segment>
                    <Comment.Group className='messages'>
                        {messagesLoading?this.displayMessageSkeleton(messagesLoading):null}
                        {searchTerm? this.displayMessages(searchResult):this.displayMessages(messages)}
                       {this.displayTypingUsers(typingUsers)}
                        <div ref={node=>(this.messagesEnd=node)}></div>
                    </Comment.Group>
                </Segment>

                <MessageForm isPrivateChannel={privatChannel} messageRef={messageRef} currentChannel={channel} currentUser={user} getMessageRef={this.getMessageRef} />
            </React.Fragment>
        )
    }
}

export default connect(null,{setUSerPost})(Messages)