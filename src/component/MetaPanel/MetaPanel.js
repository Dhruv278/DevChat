import React from 'react'
import {Segment,Accordion,Header,Icon,Image,List} from 'semantic-ui-react'
class MetaPanel extends React.Component{
    state={
        activeIndex:0,
        channel:this.props.currentChannel,
        privateChannel:this.props.isPrivateChannel
    }

    FormateCount=num=>(num>1||num===0)?`${num} Posts` : `${num} Post`
    displayTopPosters=(posts)=>(
        // console.log(posts)
        Object.entries(posts)
                .sort((a,b)=>b[1]-a[1])
                .map(([key,val],i)=>(
                    <List.Item key={i}>
                        <Image avatar src={val.avatar}></Image>
                        <List.Content>
                            {/* {console.log(val)} */}
                            <List.Header as="a">{key}</List.Header>
                            <List.Description>{this.FormateCount(val.count)}</List.Description>
                        </List.Content>
                    </List.Item>
                ))
                .slice(0,3)
    )
    setActivveIndex=(event,titleProps)=>{
        const {index}=titleProps;
        const {activeIndex}=this.state
        const newIndex=activeIndex===index?-1:index;
        this.setState({activeIndex:newIndex})
    }
    render(){
        const {activeIndex,privateChannel,channel}=this.state
        const {userPosts}=this.props
        if(privateChannel )return null
        return(
           <Segment loading={!channel}>
               <Header as="h3" attached="top">
                   About # {channel && channel.name}
               </Header>
               <Accordion styled attached="true">
                   <Accordion.Title 
                      active={activeIndex===0}
                      index={0}
                        onClick={this.setActivveIndex}
                      >
                          <Icon name="dropdown"></Icon>
                          <Icon name="info"></Icon>
                          Channel Details
                      </Accordion.Title>
                          <Accordion.Content active={activeIndex===0}>
                              {channel && channel.details}
                          </Accordion.Content>
                   <Accordion.Title 
                      active={activeIndex===1}
                      index={1}
                        onClick={this.setActivveIndex}
                      >
                          <Icon name="dropdown"></Icon>
                          <Icon name="pencil alternate"></Icon>
                          Top Posters
                      </Accordion.Title>
                          <Accordion.Content active={activeIndex===1}>
                            <List>

                             {userPosts && this.displayTopPosters(userPosts)}
                            </List>
                          </Accordion.Content>
                   <Accordion.Title 
                      active={activeIndex===2}
                      index={2}
                        onClick={this.setActivveIndex}
                      >
                          <Icon name="dropdown"></Icon>
                          <Icon name="user circle"></Icon>
                          Created By
                      </Accordion.Title>
                          <Accordion.Content active={activeIndex===2}>
                           <Header as="h3">

                              <Image circular src={channel && channel.createdBy.avatar} />
                              {channel && channel.createdBy.name}
                           </Header>
                          </Accordion.Content>
                  

               </Accordion>
           </Segment>
        )
    }
}

export default MetaPanel