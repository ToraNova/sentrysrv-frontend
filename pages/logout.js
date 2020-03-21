/*
 * Login page
 * used for logging in
 * please refer to https://github.com/zeit/next.js/issues/153
 *
 */

//react components
import React, {Component} from 'react'
import Router from 'next/router'

//custom service
import AuthService from '../utils/authser.js'

import Layout from '../layouts/minimalist/border1.js'

//configure AuthService onto localhost:1996
const auth = new AuthService(process.env.backend_urlp)

class Logout extends Component {
	constructor(props) {
		super(props)
	}

	componentDidMount () {
		//logout the user
		auth.logout() //wait for logout
		.then( res => {
			Router.push('/login')
		}).catch( e => {
			//error occurred
			//TODO: unify a error handling format
			if( e.response){
			switch( e.response.status ){
				case 401: case 400:
					//user not logged in.
					//redirect back to login for now
					Router.push('/login')
					break;
				case 500:
					//back-end error, logout user from device anyways
					localStorage.removeItem('token');
					localStorage.removeItem('profile');
					Router.push('/login')
					break;
				default:
					//unknown error do not logout first
					//TODO: figure out what do properly do here
					Router.push('/')
			}
			}
		})
	}

	render() {
		return (
		<div>
		<div>REDIRECTING....</div>
		</div>
		)
	}
}

export default Logout
