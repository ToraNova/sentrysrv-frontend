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

class Editor extends Component {

	constructor(props){
		super(props)
		this.state = {
			displaytext: "Segment Editor",
			canvashandler: this.handleStartDraw,
			line:{
				width:3,
				style:'red'
			}
		}
	}

	bgDraw = () => {
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

	lineDraw = (line) => {
		console.log('draw',line)
		const canvas = this.refs.drawable
		const ctx = canvas.getContext('2d')
		ctx.moveTo(line.sx,line.sy);
            	ctx.lineTo(line.ex,line.ey);
		ctx.strokeStyle = line.style
		ctx.lineWidth = line.width
            	ctx.stroke();
		ctx.closePath();
	}

	componentDidMount(){
		this.bgDraw()
		console.log('dashboard-mounted')
	}

	handleStartDraw = (event) => {
		const canvas = this.refs.drawable
		const x = event.nativeEvent.layerX - canvas.offsetLeft;
		const y = event.nativeEvent.layerY - canvas.offsetTop;
		//const x = event.nativeEvent.x
		//const y = event.nativeEvent.y
		console.log('start',event.nativeEvent,canvas.offsetLeft,canvas.offsetTop)
		this.setState((state, props) => ({
			displaytext: "Click point B to draw line",
			canvashandler: this.handleEndDraw,
			line:{
				sx:x,
				sy:y,
				ex:null,
				ey:null,
				width:state.line.width,
				style:state.line.style,
			}
		}))
		//this.setState({
		//	displaytext: "Click point B to draw line",
		//	canvashandler: this.handleEndDraw,
		//	sx: x,
		//	sy: y,
		//})
	}

	handleEndDraw = (event) => {
		const canvas = this.refs.drawable
		const x = event.nativeEvent.layerX - canvas.offsetLeft;
		const y = event.nativeEvent.layerY - canvas.offsetTop;
		//const x = event.nativeEvent.x
		//const y = event.nativeEvent.y
		console.log('end',event.nativeEvent,canvas.offsetLeft,canvas.offsetTop)
		this.setState({
			displaytext: "Hit spacebar to register. Click to draw again.",
			canvashandler: this.handleStartDraw,
			line:{
				sx:this.state.line.sx,
				sy:this.state.line.sy,
				ex:x,
				ey:y,
				width:this.state.line.width,
				style:this.state.line.style,
			}
		}, () => {
			this.lineDraw(this.state.line)
		})
	}

	render(){
		return (
		<div>
		<Border>
		<div className="contain">
		<canvas ref="drawable" onClick={this.state.canvashandler}/>
		<style jsx>{`
		.contain {
		height: ${this.props.mheight}px;
		margin-top: 10px;
		}
		`}</style>
		</div>
		</Border>
		<Border>
		<div><p refs="display">{this.state.displaytext}</p></div>
		</Border>
		</div>
		)
	}
}

Editor.defaultProps = {
	mheight:441,
	mscale:1000,
}

export default Editor;
