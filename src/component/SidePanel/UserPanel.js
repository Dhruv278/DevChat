import React from 'react';
import { Grid,Header,Icon ,Dropdown,Image,Modal,Input,Button} from 'semantic-ui-react';
import firebase from './../../firebase';
import {connect} from 'react-redux'
import AvatarEditor from 'react-avatar-editor'
class UserPanel extends React.Component{
    state={
        user:this.props.currentUser,
        modal:false,
        previewImage:'',
        croppedImage:'',
        blob:'',
        uplaodedCropedImage:'',
        storage:firebase.storage().ref(),
        userRef:firebase.auth().currentUser,
        usersRef:firebase.database().ref('users'),
        metadata:{
            contentType:'image/jpeg'
        }
    }
    openModal=()=>this.setState({modal:true})
    closeModal=()=>this.setState({modal:false})
    dropDownOption=()=>[
        {
         key:'user',
         text:<span>Signed is as <strong>{this.state.user.displayName}</strong></span>,   
         disabled:true
        },
        {
         key:'avatar',
         text:<span onClick={this.openModal}>Change Avatar</span>
        },
        { 
            key:'signout',
            text:<span onClick={this.handleSignOut}>Sign Out</span>
        }
    ]

handleSignOut=()=>{
      firebase.auth().signOut().then(()=>console.log('signed Out')).catch(err=>console.log(err))
}
handelChange=(event)=>{
    const file=event.target.files[0];
    const reader=new FileReader();
    if(file){
        reader.readAsDataURL(file);
        reader.addEventListener('load',()=>{
          
            this.setState({previewImage:reader.result})
        })
    }
}
handelCropImage=()=>{
  if(this.avatarEditor){
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob=>{
          let imageUrl=URL.createObjectURL(blob)
          this.setState({
              croppedImage:imageUrl,
              blob
          })
      })
  }
}
uploadCropedImage=()=>{
 const storageRef=this.state.storage;
 const {userRef,blob,metadata}=this.state
 storageRef
        .child(`avatar/user/${userRef.uid}`)
        .put(blob,metadata)
        .then(snap=>{
            snap.ref.getDownloadURL().then((downloadUrl=>{
                this.setState({uplaodedCropedImage:downloadUrl},()=>this.changeAvatar())
            }))
        })
}
changeAvatar=()=>{
    // console.log('not work')
    this.state.userRef
                  .updateProfile({
                      photoURL:this.state.uplaodedCropedImage
                  })
                  .then(()=>{
                    //   console.log('Photot Url Updated')
                      this.closeModal()
                  }).catch(err=>{
                      console.log(err)
                  })

        this.state.usersRef
                        .child(`${this.state.user.uid}`)
                        .update({avatar:this.state.uplaodedCropedImage})
                        .then(()=>{
                            // console.log('Database Updated for avatar changing')
                        }).catch(err=>{
                            console.log(err)
                        })
}




    render(){
      
       const {user,modal,previewImage,croppedImage,blob}=this.state
       const {primaryColor}=this.props;
        return(
            <Grid style={{ background :primaryColor }}>
                <Grid.Column>
                    <Grid.Row style={{padding:'1.2em',margin:0}}>
                        <Header inverted floated="left" as="h2">
                            <Icon name="code"></Icon>
                            <Header.Content>DevChat</Header.Content>

                        </Header>
                    <Header style={{padding:'0.25em'}} as="h4" inverted>
                        <Dropdown trigger={
                            <span>
                                <Image src= {user?user.photoURL:null} spaced="left" avatar></Image>
                                {user.displayName}
                                </span>
                        } options={this.dropDownOption()} />
                    </Header>
                    </Grid.Row>

                    {/* Change user avatar modal  */}
                        <Modal basic open={modal} onClose={this.closeModal}>
                            <Modal.Header>Change Avatar(Photo)</Modal.Header>
                            <Modal.Content>
                                <Input 
                                fluid
                                type="file"
                                label="New Photo"
                                name="previewImage"
                                onChange={this.handelChange}
                                
                               />
                                <Grid centered stackable columns={2}>
                                    <Grid.Row centered>
                                        <Grid.Column className="ui center aligned grid">
                                                {/* Image Preview */}
                                                {previewImage && (
                                                    <AvatarEditor 
                                                    ref={node=>(this.avatarEditor=node)}
                                                    image={previewImage}
                                                    width={120}
                                                    height={120}
                                                    border={50}
                                                    scale={1.2}
                                                    />
                                                )}
                                        </Grid.Column>

                                        <Grid.Column>
                                         {/* Croped Image preview */}
                                                    {croppedImage && (
                                                        <Image 
                                                        style={{margin:'3.5em'}}
                                                        width={100}
                                                        height={100}
                                                        src={croppedImage}
                                                        />
                                                    )}
                                        </Grid.Column>
                                    </Grid.Row>

                                </Grid>
                            </Modal.Content>
                            <Modal.Actions>
                              { croppedImage && <Button color="green" inverted onClick={this.uploadCropedImage}>
                                    <Icon name="save" />Change Avatar(Photo)
                                </Button> }
                               <Button color="green" inverted onClick={this.handelCropImage}>
                                    <Icon name="image" />Preview
                                </Button> 
                                <Button color="red" inverted onClick={this.closeModal}>
                                    <Icon name="remove" />Cancle
                                </Button>

                            </Modal.Actions>
                        </Modal>
                </Grid.Column>
            </Grid>
        )
    }
}
const mapStateFromProps=state=>({
    currentUser:state.user.currentUser
})
export default connect(mapStateFromProps)(UserPanel)