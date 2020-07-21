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
		}
	}

	//repeating timer
	blinker = () => {
		//console.log("Blinker expired, changing line color")
		if(this.state.showlines){
			this.fDraw(this.state.dlines, 'black')
		}else{
			this.fDraw()
		}

		if(this.state.blink){
			this.mDraw(this.state.slines, 'red')
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
<title>Dashboard (Host Up/Down)</title>
</Head>
<Container fluid>
<Row style={ctStyle}>
	<Col md={2}><h4>Host Up/Down</h4></Col>
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
	fDraw = ( lines = [], nstyle ) => {
		this.state.ctx.drawImage(this.state.map, 0, 0, this.state.map.width, this.state.map.height, 0, 0, this.state.canvas.width, this.state.canvas.height)
		if(nstyle == undefined) nstyle = 'black'
		this.mDraw( lines, nstyle )
	}

	mDraw = ( larray, nstyle) => {
		larray.forEach( (elem,idx) => {
			elem.Data['style'] = nstyle
			this.lineDraw(elem.Data)
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
		this.state.hlist.forEach( (host,idx) => {
			host.fence_segments.forEach( (seg, idx2) => {
				tmp = tmp.concat(this.obtainLines( seg.id ) )
			})
		})
		this.setState({slines: tmp}, () => {
			this.fDraw(this.state.slines)
		})
	}

	//WARNING, this is DIFFERENT from synclines.
	//notice fence_segment is used directly instead of fence_segment.id
	//due to strapi having different models
	syncLine = (host) => {
		var tmp = []
		host.fence_segments.forEach( (seg,idx) => {
			tmp = tmp.concat(this.obtainLines(seg.id))
		})
		this.setState({slines:	this.state.slines.concat(tmp)}, () => {
			this.fDraw(this.state.slines)
		})
	}

	//line drawing function
	lineDraw = (line) => {
		//console.log('drawing',line)
		this.state.ctx.beginPath()
		this.state.ctx.moveTo(line.sx,line.sy)
            	this.state.ctx.lineTo(line.ex,line.ey)
		this.state.ctx.strokeStyle = line.style
		this.state.ctx.lineWidth = line.width
            	this.state.ctx.stroke()
		this.state.ctx.closePath()
	}

	checkUpdate = (host) => {
		//assume not updating
		//console.log('update',a)
		var tmp = -1
		var tar = this.state.hlist
		this.state.hlist.forEach( (elem,idx) => {
			//if alert is in our list and its previous reason is null
			if(elem.id == host.id && !elem.RepliedPing && host.RepliedPing ){
				//this meant elem has updated, no longer needs to blink
				tmp = idx
			}
		})
		console.log(tmp)
		//if updated
		if(tmp > -1){
			//splice (remove)
			tar.splice(tmp,1)
			this.setState({hlist:tar}, () => {
				//sync the lines with alert
				this.syncLines()
				console.log('hls',this.state.hlist)
			})
		}
	}

	componentDidMount(){
		//console.log('dashboard-mounted')
		this.socket = io.connect(process.env.backend_urlp)
		this.socket.emit('down/init')

		const canvas = this.refs.drawable
		const ctx = canvas.getContext('2d')
		const img = new Image()
		img.src = process.env.mapfile
		canvas.style.width = '100%'
		canvas.style.height = '100%'
		canvas.width = canvas.offsetWidth
		canvas.height = canvas.offsetHeight

		img.onload = () => {
			this.setState({map: img, ctx: ctx, canvas: canvas},
				() => {
				this.fDraw() //refresh
			})

			//obtain line informations
			this.socket.on('down/line/data', (res) => {
			this.setState({dlines: JSON.parse(res)}, () => {

				//obtain alerts
				this.socket.on('down/alert/data', (res) => {
					//final block. here segment/line and alert are ready
					const tmp = JSON.parse(res)
					this.setState({hlist:tmp},() => {
						this.syncLines()
					})
				})

				this.socket.on('down/alert/new', (res) => {
					const tmp = JSON.parse(res)
					console.log('new',tmp[0])
					this.setState({hlist: this.state.hlist.concat(tmp)},()=> {
						this.syncLines()
					})
				})

				this.socket.on('down/alert/update', (res) => {
					const tmp = JSON.parse(res)
					console.log('hls',this.state.hlist)
					console.log('upd',tmp[0])
					this.checkUpdate(tmp[0])
				})

			})
			})
		}
	}

	componentWillUnmount() {
		//stop timers
		this.socket.off('down/line/data')
		this.socket.off('down/alert/data')
		this.socket.off('down/alert/new')
		this.socket.off('down/alert/update')
    		this.socket.close()
	}

}

Map.defaultProps = {
	mheight: 750,
}

export default AuthRequired(Map)
