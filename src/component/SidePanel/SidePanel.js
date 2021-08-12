import React from 'react'
import {Menu} from 'semantic-ui-react'
import UserPanel from './UserPanel'
import Channels from './Channels';
import DirectMessage from './DirectMessage'
import Starred from './Starred';
class SidePanel extends React.Component{
    render(){
        const {currentUser,primaryColor}=this.props;
        return(
           <Menu
           size="large"
           inverted
           fixed="left"
           vertical
           style={{background:primaryColor ,fontSize:'1.2rem'}}
           >
               <UserPanel primaryColor={primaryColor} currentUser={currentUser}></UserPanel>
              <Starred currentUser={currentUser} />
              <Channels currentUser={currentUser} />
              <DirectMessage currentUser={currentUser}/>
           </Menu>
        )
    }
}

export default SidePanel