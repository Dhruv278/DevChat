import React from 'react'
import { Segment, Button, Input } from 'semantic-ui-react'
import firebase from './../../firebase'
import FileModal from './FileModal'
import uuidv4 from 'uuid/dist/v4'
import ProgressBar from './ProgressBar'
import {Picker,emojiIndex} from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'

class MessageForm extends React.Component {
    state = {
        storageRef: firebase.storage().ref(),
        typingRef:firebase.database().ref('typing'),
        uplaodState: '',
        uploadTask: null,
        message: '',
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        loading: false,
        errors: [],
        modal: false,
        percentUplaod: 0,
        emojiPicker:false
    }
componentWillUnmount(){
    if(this.state.uploadTask!==null){
        this.state.uploadTask.cancel();
        this.setState({uploadTask:null})
    }
}

    openModal = () => this.setState({ modal: true })

    closeModal = () => this.setState({ modal: false })

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    getPath=()=>{
        if(this.props.isPrivateChannel){
            return `chat/private/${this.state.channel.id}`
        }else{
            return 'chat/public'
        }
    }

    createMessage = (fileUrl=null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            },
        };
        if(fileUrl!==null){
            message['image']=fileUrl
        }else{
            message['content']=this.state.message;
        }
        return message;
    }

    sendMessage = () => {
        const { messageRef ,getMessageRef} = this.props;
        const { message, channel,typingRef,user } = this.state

        if (message) {
            this.setState({ loading: true })
            getMessageRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({ loading: false, message:'', errors: [] })
                    typingRef
                    .child(channel.id)
                    .child(user.uid)
                    .remove()
                })
                .catch(err => {
                    console.error(err)
                    this.setState({
                        loading: false,
                        errors: this.state.errors.concat(err)
                    })
                })
        } else {
            this.setState({ errors: this.state.errors.concat({ message: 'Add a message' }) })
        }
    }

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessageRef();
        const filePath = `chat/public/${uuidv4()}.jpg`

        this.setState({
            uplaodState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        }, () => {
            this.state.uploadTask.on('state_changed', snap => {
                const percentUplaod = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                this.setState({ percentUplaod: percentUplaod })
            }, (err) => {
                console.log(err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    uploadTask: null,
                    uplaodState: 'error'
                })
            },()=>{
                this.state.uploadTask.snapshot.ref.getDownloadURL().then(download=>{
                    this.sendFileMessage(download,ref,pathToUpload)
                }).catch(err=>{
                    console.log(err);
                    this.setState({
                        errors: this.state.errors.concat(err),
                        uploadTask: null,
                        uplaodState: 'error'
                    })
                })
            }

            )
        }

        )
    }




sendFileMessage=(fileUrl,ref,pathToUpload)=>{
    ref.child(pathToUpload)
        .push()
        .set(this.createMessage(fileUrl))
        .then(()=>{
            this.setState({uplaodState:'done'})
        })
        .catch(err=>{
            console.error(err)
            this.setState({errors:this.state.errors.concat(err)})
        })
}

handelKeyDown=(event)=>{

    if(event.keyCode===13){
        // console.log('work')
        this.sendMessage()
    }
    const {message,typingRef,channel,user}=this.state
    if(message){
        typingRef.child(channel.id)
                .child(user.uid)
                .set(user.displayName)

    }else{
        typingRef
                .child(channel.id)
                .child(user.uid)
                .remove()
    }
}
handelTogglePicker=()=>{
 this.setState({emojiPicker:!this.state.emojiPicker})
}
handleAddEmoji=emoji=>{
    const oldMessage=this.state.message;
    const newMessage=this.colonUnicode(`${oldMessage}${emoji.colons}`)
    this.setState({message:newMessage,emojiPicker:false})

    setTimeout(() =>this.messageInputRef.focus(),0 );
}


colonUnicode=message=>{
    // console.log(message)
    return message.replace(/:[A-Za-z0-9_+-]+:/g,x=>{
      x= x.replace(/:/g,"");
        let emoji =emojiIndex.emojis[x]
        if(typeof emoji !=='undefined'){
            let unicode=emoji.native;
            // console.log(unicode)
            if(typeof unicode!=="undefined"){
                return unicode
            }
        }
        x=":"+x+":"
        return x
    })
}

    render() {
        const { errors, message,emojiPicker, loading, modal,uplaodState,percentUplaod } = this.state;
        return (
            <Segment className="message__form">
                {emojiPicker && (
                    <Picker 
                    set="apple"
                    onSelect={this.handleAddEmoji}
                    className="C"
                    title="Pick your emoji"
                    emoji="point_up"
                    />
                )}
                <Input
                    fluid
                    onChange={this.handleChange}
                    name="message"
                    style={{ margineBottom: '0.7em' }}
                    label={<Button  content={emojiPicker?"close":null} icon={emojiPicker ?"close":"add"} onClick={this.handelTogglePicker}></Button>}
                    labelPosition="left"
                   
                    value={message}
                    ref={node=>(this.messageInputRef=node)}
                    onKeyDown={this.handelKeyDown}
                    className={
                        errors.some(error => error.message.includes('message')) ? 'error' : ''
                    }
                    placeholder="Write your message"
                >
                </Input>
                <Button.Group icon widths="2">
                    <Button
                        onClick={this.sendMessage}
                        disabled={loading}
                        color="orange"
                        content="Add reply"
                        labelPosition="left"
                        icon="edit"
                    />

                    <Button
                        color="teal"
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                        onClick={this.openModal}
                    />

                </Button.Group>
                    <FileModal
                        modal={modal}
                        uploadFile={this.uploadFile}
                        closeModal={this.closeModal}
                    />
                    <ProgressBar 
                    uplaodState={uplaodState}
                    percentUplaod={percentUplaod}
                    />
            </Segment>
        )
    }
}

export default MessageForm