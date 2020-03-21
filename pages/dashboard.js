/*
 * This is the about page
 * this corresponds to the /about path
 * to write details and information about the webapp
 */

//Link API from Next.js
import Link from 'next/link';
import React, {Component} from 'react'

//custom components import
import Nav from './nav.js';
import Border from '../layouts/minimalist/border0.js';

class Dashboard extends Component {

	constructor(props){
		super(props)
	}

	componentDidMount(){
		console.log('dashboard-mounted')
		const canvas = this.refs.drawable
		const img = new Image();
		img.src = '/map.png'
		const ctx = canvas.getContext('2d')
		canvas.style.width = '100%'
		canvas.style.height = '100%'
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		img.onload = () => {
			ctx.drawImage(img, 0, 0, this.props.mscale, this.props.mscale*img.height / img.width)
		}
	}

	render(){
		return (
		<div>
		<Border>
		<div className="contain">
		<canvas ref="drawable"/>
		<style jsx>{`
		.contain {
		height: ${this.props.mheight}px;
		margin-top: 10px;
		}
		`}</style>
		</div>
		</Border>
		<Border>
		<div><p refs="display">Map Display</p></div>
		</Border>
		</div>
		)
	}
}

Dashboard.defaultProps = {
	mheight:441,
	mscale:1000,
	edit:0
}

export default Dashboard;
