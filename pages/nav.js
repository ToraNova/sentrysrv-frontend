/*
 * This is the nav header
 * it could vary across deployments, and so its purpose is
 * only for linking pages across the webapp
 */

//Link API from Next.js
import Link from 'next/link';
import React, {Component} from 'react'
import AuthRequired from  '../utils/authreq.js'

//Style
const linkStyle = {
	marginRight: 15
};

class Nav extends Component{

	sview(){

	}

	render() {
		const user = this.props.auth.getProfile()
		return(
			<div>
			<Link href="/profile"><a style={linkStyle}>Profile</a></Link>
			{user.role.name === "Supervisor" ?
			<>
			<Link href="/view"><a style={linkStyle}>View Alerts</a></Link>
			</>
			:
			<>
			<Link href="/map"><a style={linkStyle}>Map</a></Link>
			<Link href="/focus2"><a style={linkStyle}>Focus</a></Link>
			<Link href="/down"><a style={linkStyle}>Host Status Map</a></Link>
			<Link href="/editor"><a style={linkStyle}>Editor</a></Link>
			</>
			}
			{
			user === null ?
			<Link href="/login"><a style={linkStyle}>Login</a></Link>
			:
			<Link href="/logout"><a style={linkStyle}>Logout</a></Link>
			}
			</div>
		)
	}
}

export default AuthRequired(Nav);
