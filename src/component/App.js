
import React from 'react'
import { Grid } from 'semantic-ui-react'
import "./App.css"
import ColorPanel from './ColorPanel/ColorPanel'
import SidePanel from './SidePanel/SidePanel'
import Messages from './Messages/Messages'
import { connect } from 'react-redux'
import MetaPanel from './MetaPanel/MetaPanel'
const App = ({primaryColor,secondaryColor,currentUser,userPosts,currentChannel,isPrivateChannel }) => (
  <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
    
    <ColorPanel  currentChannel={currentChannel}
      key={currentUser && currentUser.name}
      currentUser={currentUser} />


    <SidePanel 
    key={currentUser && currentUser.uid}
    currentUser={currentUser}
    primaryColor={primaryColor} />
    
    <Grid.Column style={{ marginLeft: 320 }}>
    
    
      <Messages 
      key={currentChannel && currentChannel.id}
      currentChannel={currentChannel}
      currentUser={currentUser} 
      isPrivateChannel={isPrivateChannel}/>
    </Grid.Column>
    <Grid.Column width={4}>
      <MetaPanel  key={currentChannel && currentChannel.name}
      currentChannel={currentChannel}
      currentUser={currentUser} 
      isPrivateChannel={isPrivateChannel}
      userPosts={userPosts}/>
    </Grid.Column>
  </Grid>
)
const mapStateFromProps=state=>({
  currentUser:state.user.currentUser,
  currentChannel:state.channel.currentChannel,
  isPrivateChannel:state.channel.isPrivateChannel,
  userPosts:state.channel.userPosts,
  primaryColor:state.color.primary,
  secondaryColor:state.color.secondary
})
export default connect(mapStateFromProps)(App);
