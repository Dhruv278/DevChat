import React from 'react'
import {Header,Segment,Icon,Input} from 'semantic-ui-react'
class MessageHeader extends  React.Component{
 
        render(){
            const {channelName,isPrivateChannel,uniqueUser,handleSearch,searchLoading,isChannelStarred,handleStar}=this.props
            // console.log(uniqueUser)
        return(
            <Segment clearing>
                <Header fluid="true" as="h2" floated="left" style={{marginBottom:0}}>
                    <span>
                      {channelName}
                      {!isPrivateChannel &&
                       <Icon 
                      onClick={handleStar}
                       name={isChannelStarred?"star":"star outline"}
                        color={isChannelStarred ?"yellow":"black"} />
                        }


                    </span>
                    <Header.Subheader>{uniqueUser}</Header.Subheader>
                </Header>
                <Header floated="right">
                    <Input 
                    loading={searchLoading}
                    size="mini"
                    icon="search"
                    name="searchTerm"
                    onChange={handleSearch}
                    placeholde="Search Message"
                    />
                </Header>
            </Segment>
        )
    }
}

export default MessageHeader