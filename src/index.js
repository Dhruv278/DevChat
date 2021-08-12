import React from 'react';
import ReactDOM from 'react-dom';
import { setUser,clearUser } from './actions';
import rootReducer from './reducer/index'
import reportWebVitals from './reportWebVitals';
import App from './component/App'
import Login from './component/Auth/login'
import Spinner from './spinner';
import Register from './component/Auth/Register'
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom'
import firebase from './firebase'
import 'semantic-ui-css/semantic.min.css'

import { createStore } from 'redux';
import { Provider,connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension'

const stor = createStore(rootReducer, composeWithDevTools());


class Root extends React.Component {
  componentDidMount() {
   
    firebase.auth().onAuthStateChanged(user => {
 
      if (user) {
        this.props.setUser(user)
        this.props.history.push('/')
      }else{
        this.props.history.push('/login');
        this.props.clearUser(this.props.history);
      }
    })
  }

  render() {

    return this.props.isLoading ? <Spinner />:(

      <Switch>
        <Route exact path="/" component={App}  abo/>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>

    )
  }
}
const mapStateFromProps=state=>({
  isLoading:state.user.isLoading
})
const RootWithAuth = withRouter(connect(mapStateFromProps,{ setUser,clearUser })(Root));

ReactDOM.render(
  <Provider store={stor}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>
  , document.getElementById('root'));


reportWebVitals();
