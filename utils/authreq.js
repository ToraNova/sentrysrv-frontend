/*
 * This file is to protect pages, as in
 * the the page requires an auth token
 * from the backend
 *
 */

// utils/withAuth.js - a HOC for protected pages
import React, {Component} from 'react'
import Router from 'next/router'

//custom Auth service
import AuthService from './authser.js'

export default function AuthRequired(AuthComponent) {
	const auth = new AuthService(process.env.backend_urlp)
	return class Authenticated extends Component {
		constructor(props) {
			super(props)
			this.state = {
			isLoading: true
			};
		}

		componentDidMount () {
			if (!auth.loggedIn()) {
				//if not logged in
				Router.push('/login')
			}else{
				this.setState({ isLoading: false })
			}
		}

		render() {
			return (
			<div>
			{this.state.isLoading ? (
			<div>LOADING....</div>
			) : (
			<AuthComponent {...this.props} auth={auth} />
			)}
			</div>
			)
		}
	}
}
