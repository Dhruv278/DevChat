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
import md5 from 'md5'
import { Link } from "react-router-dom";
class Register extends React.Component {
    state = {
        username: "",
        password: "",
        email: "",
        passwordConfirmation: "",
        errors: [],
        loading: false,
        userRef:firebase.database().ref('users')
    };
    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };
    isFormValid = () => {
        let errors = [];
        let error;
        if (this.isFormEmpty(this.state)) {
            error = { message: 'Fill in all fields' }
            this.setState({ errors: errors.concat(error) })
            return false;
        } else if (!this.isPasswordValid(this.state.password, this.state.passwordConfirmation)) {

            return false;
        } else {
            return true;
        }
    };

    isPasswordValid = (password, passwordConfirmation) => {
        let errors = this.state.errors;
        let error;
        if (password.length < 6 || passwordConfirmation.length < 6) {
            error = { message: 'Password should be greater than 6 characters ' }
            this.setState({ errors: errors.concat(error) })
            return false;
        } else if (password !== passwordConfirmation) {
            error = { message: 'Password should be equal to Confirm Password ' }
            this.setState({ errors: errors.concat(error) })
            return false;

        } else {
            return true;
        }
    }

    isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length
    }

    displayError = errors => errors.map((error, i) => <p key={i}>{error.message}</p>)

  

    saveUser=(user)=>{
        // console.log("working")
        return this.state.userRef.child(user.user.uid).set({
            name:user.user.displayName,
            avatar:user.user.photoURL
        })
    }

    onsubmit = (event) => {
        event.preventDefault();

        if (this.isFormValid()) {
            this.setState({ errors: [], loading: true })
            // https://gravatar.com/avatar/81ddda51ad28a864fbf493d2c41bf0cf?s=400&d=robohash&r=x
            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(user => {
                    // console.log(user)
                    user.user.updateProfile({
                        displayName: this.state.username,
                        photoURL: `http://gravatar.com/avatar/${md5(user.user.email)}?d=identicon`
                    }).then(() => {
                        this.saveUser(user).then(()=>{
                            // console.log("user saved ")
                        })
                        this.setState({ loading: false })
                    }).catch(err => {
                        console.log(err)
                        this.setState({ errors: this.state.errors.concat(err), loading: false })
                    })
                    // this.setState({loading:false})
                })
                .catch(err => {
                    this.setState({ loading: false, errors: this.state.errors.concat({ message: err.message }) })
                })
        }

    }

    HandleInputError = (errors, inutName) => {
        return errors.some(error => error.message.toLowerCase().includes(inutName)) ? "error" : ""
    }
    render() {
        const { username, password, email, passwordConfirmation, loading } = this.state
        const errors = this.state.errors
        return (
            <Grid textAlign="center" verticalAlign="middle">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h2" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange" />
                        Register for DevChat
                    </Header>
                    <Form size="large" onSubmit={this.onsubmit}>
                        <Segment stacked>
                            <Form.Input
                                fluid
                                name="username"
                                icon="user"
                                iconPosition="left"
                                placeholder="Username"
                                onChange={this.handleChange}
                                value={username}
                                className={this.HandleInputError(errors, 'username')}
                                type="text"
                            />

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

                            <Form.Input
                                fluid
                                name="passwordConfirmation"
                                icon="repeat"
                                iconPosition="left"
                                placeholder="Password Confirmation"
                                onChange={this.handleChange}
                                value={passwordConfirmation}
                                type="password"
                            />

                            <Button disabled={loading} className={loading ? 'loading' : ''} color="orange" fluid size="large">
                                Submit
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
                        Already a user? <Link to="/login">Login</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Register;