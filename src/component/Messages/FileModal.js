import React from 'react'
import {Modal,Input,Button,Icon} from 'semantic-ui-react'
import mime from 'mime-types'
class FileModal extends React.Component{
    state={
        file :null,
        authorized:['image/jpeg','image/jpg','image/png']
    }
    addFile=event=>{
        const file=event.target.files[0]
        if(file){
            this.setState({file:file})
        }
    }
  

    sendFile=()=>{
        const file=this.state.file;
        const { uploadFile , closeModal}=this.props
        if(file!==null){
            if(this.isAuthorized(file.name)){
                const metadata={contentType:mime.lookup(file.name)}
                uploadFile(file,metadata);
                closeModal()
            }
        }
    }
    clearFIle=()=>this.setState({file:null})
    isAuthorized=filename=>this.state.authorized.includes(mime.lookup(filename))
    render(){
        const {modal,closeModal}=this.props;
        return(
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Select an Image File</Modal.Header>
                <Modal.Content>
                    <Input
                    onChange={this.addFile}
                    fluid
                    label="File Types : JPG , PNG , JPEG"
                    name='file'
                    type="file"
                    />

                </Modal.Content>
                <Modal.Actions>
                    <Button 
                    color="green"
                    inverted
                    onClick={this.sendFile}
                    >
                        <Icon name="checkmark"/> Send
                    </Button>
                    <Button
                    color="red"
                    inverted
                    onClick={closeModal}
                    >
                        <Icon name="remove" />Cancle

                    </Button>

                </Modal.Actions>
            </Modal>
        )
    }
}

export default FileModal