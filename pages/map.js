/*
 * This is the about page
 * this corresponds to the /about path
 * to write details and information about the webapp
 */

//Link API from Next.js
import Link from 'next/link'
import Head from 'next/head'
import React, {Component} from 'react'
import Router from 'next/router' //router

//socket io for realtime behavior
import io from 'socket.io-client'

// import from online
import Select from 'react-select'
import { Container, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

//custom components import
import Nav from './nav.js'
import Border from '../layouts/minimalist/border2.js'
import AlertView from '../components/alertview.js'
import AlertDetail from '../components/alertdetail.js'

//requires authentication
import AuthRequired from  '../utils/authreq.js'

class Map extends Component {

	constructor(props){
		super(props)
		this.state = {
			alist: [],
			slist: [],
			dlines: [],
			slines: [],
			showlines: false,
			blink: false
		}
	}

	//repeating timer
	blinker = () => {
		//console.log("Blinker expired, changing line color")
		if(this.state.showlines){
			this.fDraw(this.state.dlines, false)
		}else{
			this.fDraw()
		}

		if(this.state.blink){
			this.mDraw(this.state.slines, true)
		}else{

		}

		//invert blink
		this.setState({blink: !this.state.blink})
	}

	//Main render function
	render(){

		const linkStyle = {
			marginRight: 15
		};

		const rpStyle = {
			border: '2px solid #CCC',
			marginTop: '20px',
			padding: '5px',
			marginLeft: '10px',
			marginRight: '10px',
			height: `${this.props.mheight}px`
		};

		const ctStyle = {
			border: '2px solid #CCC',
			marginTop: '20px',
			padding: '5px',
			marginLeft: '10px',
			marginRight: '10px'
		}

		return (
<div>
<Head>
<title>Dashboard (Map View)</title>
</Head>
<Container fluid>
<Row style={ctStyle}>
	<Col md={1}><h4>Map View</h4></Col>
	<Col md={2}>
			<Link href="/"><a style={linkStyle}>Home</a></Link>
			<Link href="/editor"><a style={linkStyle}>Editor</a></Link>
	</Col>
	<Col></Col>
</Row>
<Row style={rpStyle}>
	<canvas ref="drawable" onClick={this.state.canvashandler}/>
</Row>
</Container>
<style jsx>{`
`}</style>
</div>
		)
	}

	//foreground draw function
	fDraw = ( lines = [], act ) => {
		this.state.ctx.drawImage(this.state.map, 0, 0, this.state.map.width, this.state.map.height, 0, 0, this.state.canvas.width, this.state.canvas.height)
		//if(nstyle == undefined) nstyle = 'red'
		this.mDraw( lines, act )
	}

	mDraw = ( larray, act) => {
		larray.forEach( (elem,idx) => {
			//elem.Data['style'] = nstyle
			this.lineDraw(elem.Data, act)
		})
	}

	//obtain relevant lines from llist based on segment id
	obtainLines = (sid) => {
		var tmp = []
		this.state.dlines.forEach( (line, lidx) => {
			if(line.fence_segment.id == sid){
				tmp.push(line)
			}
		})
		return tmp
	}

	//synclines
	syncLines = () => {
		var tmp = []
		this.state.alist.forEach( (elem,idx) => {
			tmp = tmp.concat(this.obtainLines( elem.fence_segment.id ))
		})
		this.setState({slines: tmp})
	}

	//WARNING, this is DIFFERENT from synclines.
	//notice fence_segment is used directly instead of fence_segment.id
	//due to strapi having different models
	syncLine = (a) => {
		this.setState({slines:
			this.state.slines.concat( this.obtainLines( a.fence_segment ) )
		})
	}

	checkUpdate = (a) => {
		//assume not updating
		//console.log('update',a)
		var tmp = -1
		var tar = this.state.alist
		this.state.alist.forEach( (elem,idx) => {
			//if alert is in our list and its previous reason is null
			if(elem.id == a.id && elem.Reason == null && a.Reason != null){
				//this meant elem has updated, no longer needs to blink
				tmp = idx
			}
		})
		//if updated
		if(tmp > -1){
			//splice (remove)
			tar.splice(tmp, 1)
			this.setState({
				alist: tar
			})
			//sync the lines with alert
			this.syncLines()
		}
	}


	//line drawing function
	lineDraw = (line, activate) => {
		//console.log('drawing',line)
		this.state.ctx.beginPath()
		this.state.ctx.moveTo(line.sx,line.sy)
            	this.state.ctx.lineTo(line.ex,line.ey)
		if(activate){
			this.state.ctx.strokeStyle = line.style
		}else{
			this.state.ctx.strokeStyle = line.inact
		}
		//hackish way to fix thing!
		this.state.ctx.lineWidth = line.width*2
            	this.state.ctx.stroke()
		this.state.ctx.closePath()
	}

	componentDidMount(){
		//console.log('dashboard-mounted')
		this.socket = io.connect(process.env.backend_urlp)
		this.socket.emit('map/init')

		const canvas = this.refs.drawable
		const ctx = canvas.getContext('2d')
		const img = new Image()
		img.src = process.env.mapfile
		canvas.style.width = '100%'
		canvas.style.height = '100%'
		canvas.width = canvas.offsetWidth
		canvas.height = canvas.offsetHeight

		img.onload = () => {
			const blinkerd = setInterval(this.blinker, 500); //blink every 1 second
			this.setState({blinkerd: blinkerd,
				map: img, ctx: ctx, canvas: canvas},
				() => {
				this.fDraw() //refresh
			})

			//obtain line informations
			this.socket.on('map/line/data', (res) => {
			this.setState({dlines: JSON.parse(res)}, () => {

				//obtain alerts
				this.socket.on('map/alert/data', (res) => {
					//final block. here segment/line and alert are ready
					const tmp = JSON.parse(res)
					this.setState({alist:tmp},() => {
						this.syncLines()
					})
				})

				this.socket.on('map/alert/new', (res) => {
					const tmp = JSON.parse(res)
					this.syncLine(tmp)
					this.setState({
						alist: this.state.alist.concat(tmp)
					})
				})

				this.socket.on('map/alert/update', (res) => {
					this.checkUpdate(JSON.parse(res))
				})

			})
			})

			this.socket.on('map/alert/highlight', this.handleHighlight)
		}
	}

	handleHighlight = (sid) => {
		//stop blinker
		clearInterval(this.state.blinkerd)
		if(sid == 0){
			const blinkerd = setInterval(
				this.blinker, 500); //blink every 1 second
			this.setState({blinkerd: blinkerd})
		}else{
			this.fDraw()
			const hlines = this.obtainLines(sid)
			this.mDraw(hlines, true)
		}

	}

	componentWillUnmount() {
		//stop timers
		clearInterval(this.state.blinkerd)
		this.socket.off('map/line/data')
		this.socket.off('map/alert/data')
		this.socket.off('map/alert/new')
		this.socket.off('map/alert/update')
    		this.socket.close()
	}

}

Map.defaultProps = {
	mheight: 750,
}

export default AuthRequired(Map)
