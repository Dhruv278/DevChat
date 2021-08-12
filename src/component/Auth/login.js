import React from 'react'
import firebase from './../../firebase';
import {
    Grid,
    Form,
    Segment,
    Button,
    Header,
    Message,
    Icon,
    Flag
} from "semantic-ui-react";

import { Link } from "react-router-dom";
class Login extends React.Component {
    state = {
      
        password: "",
        email: "",
       
        errors: [],
        loading: false,
 
    };
    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };
   

    
   
isFormValid=({email,password})=> email && password;

displayError = errors => errors.map((error, i) => <p key={i}>{error.message}</p>)

  

  
    onsubmit = (event) => {
        event.preventDefault();
        this.setState({errors:[]})
        if (this.isFormValid(this.state)) {
            this.setState({ errors: [], loading: true })
            firebase
            .auth()
            .signInWithEmailAndPassword(this.state.email,this.state.password)
            .then(sidnedInUser=>{
                // console.log(sidnedInUser)
                this.setState({loading:false})
            }).catch(err=>{
                // console.log(err)
                this.setState({errors:this.state.errors.concat(err),loading:false})
            })
        }

    }

    HandleInputError = (errors, inutName) => {
        return errors.some(error => error.message.toLowerCase().includes(inutName)) ? "error" : ""
    }
    render() {
        const { password, email, loading } = this.state
        const errors = this.state.errors
        return (
            <Grid textAlign="center" verticalAlign="middle">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h2" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet" />
                         Login to DevChat
                    </Header>
                    <Form size="large" onSubmit={this.onsubmit}>
                        <Segment stacked>
                           

                            <Form.Input
                                fluid
                                name="email"
                                icon="mail"
                                iconPosition="left"
                                placeholder="Email Address"
                                onChange={this.handleChange}
                                value={email}
                                className={this.HandleInputError(errors, 'email')}
                                type="email"
                            />

                            <Form.Input
                                fluid
                                name="password"
                                icon="lock"
                                iconPosition="left"
                                placeholder="Password"
                                onChange={this.handleChange}
                                value={password}
                                className={this.HandleInputError(errors, 'password')}
                                type="password"
                            />


                            <Button disabled={loading} className={loading ? 'loading' : ''} color="violet" fluid size="large">
                                Login
                            </Button>
                        </Segment>

                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayError(errors)}
                        </Message>
                    )}
                    <Message>
                        Don't have an account? <Link to="/register">Register</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Login;