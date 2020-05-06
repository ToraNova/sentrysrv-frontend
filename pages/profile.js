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
			<div id="main">
			<div><b>User Profile</b></div>
			<div>Userid: {user.id}</div>
			<div>Username: {user.username}</div>
			<div>Email: {user.email}</div>
			<div>Created on: {user.created_at}</div>
			<div>Role: {user.role.name}</div>
			<div>Description: {user.role.description}</div>
			</div>
<style jsx>{`
#main {
	margin:15px;
	padding: 15px;
}
`}</style>

			</div>
		)
	}
}

export default AuthRequired(Profile)
