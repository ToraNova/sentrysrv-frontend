/*
 * Login page
 * used for logging in
 * please refer to https://github.com/zeit/next.js/issues/153
 *
 */

//react components
import React, {Component} from 'react'
import Router from 'next/router'
import Link from 'next/link';

//custom imports
import AuthService from '../utils/authser.js'
import Layout from '../layouts/minimalist/border1.js' //currently not used

//configure AuthService onto localhost:1996
const auth = new AuthService(process.env.backend_urlp)

class Login extends Component {
	constructor(props) {
		super(props)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	componentDidMount () {
		if (auth.loggedIn()) {
			// redirect if you're already logged in
			Router.push('/profile')
		}
	}

	handleSubmit (e) {
		e.preventDefault()
		// yay uncontrolled forms!
		auth.login(this.refs.email.value, this.refs.password.value)
		.then(res => {
			Router.push('/profile')
		})
		.catch(e => {
			//display login error
			if( e.response && e.response.status == 401){
				//unauthorized (wrong creds or invalid input)
				//change the worm image
				this.refs.worm.src = "/icons/worm128-o.png"
				this.refs.status.innerHTML = "Invalid credentials !"
			}else{
				Router.push('/error/[emsg]',`/error/${e}`)
			}
		})
	}

	render () {
		return (
		<div>
		<div className="login">
		<img src="/icons/worm128.png" alt="worm128.png" ref="worm"/>
		<h1>Wormy</h1>
		<form onSubmit={this.handleSubmit}>

		<label htmlFor='email'>Email Login</label>
		<input id="email" type="text" ref="email"/>

		<label htmlFor='password'>Password</label>
		<input id="password" type="password" ref="password"/>

		<input type="submit" value="Login"/>

		<br/>
		<label ref="status" style={{color:'#ea3636', textAlign: 'right'}}></label>

		<Link href="/signup"><a >Signup</a></Link>
		</form>
		</div>
		<style jsx>{`
			.login {
			max-width: 340px;
			margin: 0 auto;
			padding: 1rem;
			border: 1px solid #ccc;
			border-radius: 4px;
			text-align: center;
			margin-top: 50px;
			}
			form {
			display: flex;
			flex-flow: column;
			}
			label {
			font-weight: 600;
			}
			input {
			padding: 8px;
			margin: 0.3rem 0 1rem;
			border: 1px solid #ccc;
			border-radius: 4px;
			}
			.error {
			margin: 0.5rem 0 0;
			display: none;
			color: brown;
			}
			.error.show {
			display: block;
			}
		`}</style>
		</div>
		)
	}
}

export default Login
