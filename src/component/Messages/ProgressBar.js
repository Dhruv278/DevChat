import React from 'react'
import {Progress} from 'semantic-ui-react'
const ProgressBar=({uplaodState,percentUplaod})=>(
    uplaodState==='uploading' && 
     <Progress
     className="progress__bar"
     percent={percentUplaod}
     progress
     indicating
     size="medium"
     inverted
     >

     </Progress>
);

export default ProgressBar