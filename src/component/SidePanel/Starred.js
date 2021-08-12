import React from 'react'
import {connect} from 'react-redux'
import { setCurrentChannel,setPrivateChannel } from '../../actions'
import {Menu,Icon} from 'semantic-ui-react'
import firebase from './../../firebase'

class Starred extends React.Component{
    state={
        starredChannels : [],
        user:this.props.currentUser,
        usersRef:firebase.database().ref('users')
    }

    componentDidMount(){
        this.addListener(this.state.user.uid);
    }
    componentWillUnmount(){
        this.removeListeners()
    }
    removeListeners=()=>{
        this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
    }

    addListener=(userId)=>{
        this.state.usersRef.child(userId)
        .child('starred')
        .on('child_added',(snap)=>{
            const starredChannel={id:snap.key,...snap.val()};
            this.setState({
                starredChannels:[...this.state.starredChannels,starredChannel]

            })
        }) 
        

        this.state.usersRef.child(userId)
        .child('starred')
        .on('child_removed',snap=>{
            const channelToremove={id:snap.key,...snap.val()}
            const filtterdChannels=this.state.starredChannels.filter(channel=>{
                return channel.id!==channelToremove.id;
            })
            this.setState({starredChannels:filtterdChannels})
        })
    }
    displayChannels=starredChannels=>(
        starredChannels.length>0 && starredChannels.map(channel=>(
            <Menu.Item
            key={channel.id }
            onClick={()=>this.changeChannel(channel)}
            name={channel.name}
            style={{opacity:0.7}}
            active={channel.id===this.state.activeChannel}
            
            >
                
              # {channel.name}
            </Menu.Item>
        ))
    )

    setActiveChannel=(channel)=>{
        this.setState({activeChannel:channel.id})
    }
    changeChannel=channel=>{
        this.setActiveChannel(channel) ;
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false);
     
    }
    render(){
        const {starredChannels}=this.state;
        return(  
        <Menu.Menu className="menu">
        <Menu.Item>
            <span>
                <Icon name="star" /> Starred CHANNELS
            </span>{" "}
            ({ starredChannels.length}) 
        </Menu.Item>
            {this.displayChannels(starredChannels)}
    </Menu.Menu>
    )
    }
}

export default connect(null,{setPrivateChannel,setCurrentChannel})(Starred)