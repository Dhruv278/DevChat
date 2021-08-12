import React from  'react';
import {Menu,Icon,Modal,Form,Input,Button,Label} from 'semantic-ui-react'
import firebase from './../../firebase';
import {connect} from 'react-redux'
import {setCurrentChannel,setPrivateChannel} from './../../actions/index'
class Channels extends React.Component{
  state={
      channels:[],
      channel:null,
      channelName:'',
      user:this.props.currentUser,
      channelDetails:'',
      channelRef:firebase.database().ref('channels'),
      typingRef:firebase.database().ref('typing'),
      modal:false,
      messageRef:firebase.database().ref('messages'),
      firstLoad:true,
      notifications:[],
      activeChannel:''
  }


  componentDidMount(){
      this.addListner();
  }
  componentWillUnmount(){
      this.removeListner()
  }
  removeListner=()=>{
      this.state.channelRef.off()
      this.state.channel.forEach(channel=>{
          this.state.messageRef.child(channel.id).off();
      })
  }

addListner=()=>{
    let loadedChannels=[]
    this.state.channelRef.on('child_added',snap=>{
        loadedChannels.push(snap.val());
        console.log(loadedChannels)
        this.setState({channels:loadedChannels},()=>this.setFirstChannel())
        this.addNotificationListener(snap.key);
    })
}
addNotificationListener=channelId=>{
    console.log('fdfsdfdsdfdfd2')
    this.state.messageRef.child(channelId).on('value',snap=>{
           console.log('snap 1' + snap)
        
        if(this.state.channel){
            this.handleNotifications(channelId,this.state.channel.id,this.state.notifications,snap)
        }
    })
}

handleNotifications=(channelId,currentChannelId,notifications,snap)=>{
    console.log('fdfsdfdsdfdfd')
    console.log(snap.numChildren())
    let lastTotal=0;
    let index=notifications.findIndex(notificatin=>notificatin.id===channelId);
    if(index!==-1){
        lastTotal=notifications[index].total;
        if(snap.numChildren()-lastTotal>0){
            notifications[index].count=snap.numChildren()-lastTotal;

        }
       notifications[index].lastKnownTotal=snap.numChildren()
    }
    else{
        notifications.push({
            id:channelId,
            total:snap.numChildren(),
            lastKnownTotal:snap.numChildren(),
            count:0
        })

    }
    this.setState({notifications})
}

  handleChange=(event)=>{
      this.setState({[event.target.name]:event.target.value})
  }

addChannel=()=>{
    const {channelRef,channelName,channelDetails,user}=this.state;
    const key=channelRef.push().key;
    const newChannel={
        id:key,
        name:channelName,
        details:channelDetails,
        createdBy:{
            name:user.displayName,
            avatar:user.photoURL
        }
    }

    channelRef
        .child(key)
        .update(newChannel)
        .then(()=>{
            this.setState({channelName:'',channelDetails:''})
            this.closeModal();
            console.log('channel Added')
        })
        .catch(err=>{
            console.log(err)
        })

}
  
setFirstChannel=()=>{
    const firstChannel=this.state.channels[0];
    if(this.state.firstLoad && this.state.channels.length>0){
         this.props.setCurrentChannel(firstChannel)
         this.props.setPrivateChannel(false)
         this.setState({channel:firstChannel})
    }
    this.setState({firstLoad:false})
}

  handleSubmit=(event)=>{
      event.preventDefault();
      if(this.isFormValid(this.state)){
        this.addChannel()
      }
  }

  getNotificationCount=(channel)=>{
      let count=0;
      this.state.notifications.forEach(notification=>{
          if(notification.id===channel.id){
              count=notification.count
          }
      })
      if(count>0)return count
  }
  isFormValid=({channelName,channelDetails})=>channelDetails && channelName

  openModal=()=>this.setState({modal:true})
  closeModal=()=>this.setState({modal:false})

  displayChannels=channels=>(
      channels.length>0 && channels.map(channel=>(
          <Menu.Item
          key={channel.id }
          onClick={()=>this.changeChannel(channel)}
          name={channel.name}
          style={{opacity:0.7}}
          active={channel.id===this.state.activeChannel}
          
          >
              {this.getNotificationCount(channel)&&(
                  <Label color="red">{this.getNotificationCount(channel)}</Label>
              )}
            # {channel.name}
          </Menu.Item>
      ))
  )
  changeChannel=channel=>{
      this.setActiveChannel(channel) ;
      this.state.typingRef.child(this.state.channel.id).child(this.state.user.uid).remove()
      this.clearNotifications();
      this.props.setCurrentChannel(channel)
      this.props.setPrivateChannel(false);
      this.setState({channel})
  }
  setActiveChannel=(channel)=>{
      this.setState({activeChannel:channel.id})
  }

  clearNotifications=()=>{
      let index=this.state.notifications.findIndex(notification=>notification.id===this.state.channel.id)
      console.log(index)
      if(index!==-1){
          let updatedNotifications=[...this.state.notifications];
          updatedNotifications[index].total=this.state.notifications[index].lastKnownTotal;
          updatedNotifications[index].count=0;
          this.setState({notifications:updatedNotifications})
      }
  }
    render(){
    
        const {channels,modal,channelName,channelDetails,activeChannel}=this.state
        return(
            <React.Fragment>

            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="exchange" /> CHANNELS
                    </span>{" "}
                    ({ channels.length}) <Icon name="add" onClick={this.openModal}></Icon>
                </Menu.Item>
                    {this.displayChannels(channels)}
            </Menu.Menu>
            <Modal basic open={modal} onClose={this.closeModal}>
                <Modal.Header>Add a Channel</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Field>
                            <Input 
                            fluid
                            label="Name of channel"
                            name="channelName"
                            onChange={this.handleChange}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Input 
                            fluid
                            label="About the Channel"
                            name="channelDetails"
                            onChange={this.handleChange}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted onClick={this.handleSubmit}>
                        <Icon name="checkmark"/> Add
                    </Button>
                    <Button color="red" inverted onClick={this.closeModal}>
                        <Icon name="remove"/> Cancle
                    </Button>
                </Modal.Actions>
            </Modal>
            </React.Fragment>
        )
    }
}

export default connect(null,{setCurrentChannel,setPrivateChannel})(Channels)