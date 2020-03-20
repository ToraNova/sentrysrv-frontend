/*
 * This is a protected page
 * it requires authentication
 */

import React, {Component} from 'react'
import AuthRequired from  '../utils/authreq.js'

import Nav from './nav.js';
import Layout from '../layouts/minimalist/border0.js'

class Profile extends Component {
	render() {
		const user = this.props.auth.getProfile()
		return (
			<div>
			<Layout>
			<Nav/>
			</Layout>
			<div>Current user: {user.email}</div>
			</div>
		)
	}
}

export default AuthRequired(Profile)
