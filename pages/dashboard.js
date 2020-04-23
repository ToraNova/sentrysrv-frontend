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
// import from online
import KeyHandler, { KEYPRESS } from 'react-key-handler'
import Select from 'react-select'
import { Container, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

//custom components import
import Nav from './nav.js'
import Border from '../layouts/minimalist/border2.js'

//requires authentication
import AuthRequired from  '../utils/authreq.js'

class Dashboard extends Component {

	constructor(props){
		super(props)
		this.state = {
			llist: [],
			slist: [],
			alist: [],
			lines: [],
			caid: null,
			showlines: false,
			blink: false
		}
	}

	//toggle showlines or not
	showlines = () => {
		this.setState({showlines: !this.state.showlines})
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

	//foreground draw function
	fDraw = ( linelist = [] ) => {
		this.state.ctx.drawImage(this.state.map, 0, 0, this.state.map.width, this.state.map.height, 0, 0, this.state.canvas.width, this.state.canvas.height)
		if(this.state.showlines){
			this.state.llist.forEach( (elem, idx) => {
				//console.log(idx,sid, elem.fence_segment.id)
				this.lineDraw(elem.Data)
			})
		}

		linelist.forEach( (elem, idx) => {
			elem.Data['style'] = 'red'
			this.lineDraw(elem.Data)
		})
	}

	//repeating timer
	blinker = () => {
		//console.log("Blinker expired, changing line color")
		if(this.state.blink){
			this.fDraw(this.state.lines)
		}else{
			this.fDraw()
		}

		//invert blink
		this.setState({blink: !this.state.blink})
	}

	timer = () => {
		//console.log("Timer expired, getting new alerts")

		//obtain the list of alerts asynchronously
		this.props.auth.dfetch('/sentry/alerts/poll',{
			method: 'GET'
		}).then(res => {
			var tmp = []
			res.forEach( (elem, idx) => {
				//obtain relevant lines
				this.state.llist.forEach( (line, lidx) => {
					if(line.fence_segment.id == elem.fence_segment.id){
						tmp.push(line)
					}
				})
			})
			this.setState({alist: res, lines: tmp}, () => {
			})
		}).catch( function(e){
			Router.push('/error/[emsg]',`/error/${e}`)
		})
	}

	componentDidMount(){
		//console.log('dashboard-mounted')

		this.props.auth.dfetch('/draw-lines',{
			method: 'GET'
		}).then(res => {
			this.setState((state, props) => ({
				llist: res
			}))
		}).catch( function(e){
			Router.push('/error/[emsg]',`/error/${e}`)
		})

		//obtain the list of segments asynchronously
		this.props.auth.dfetch('/fence-segments',{
			method: 'GET'
		}).then(res => {
			this.setState((state, props) => ({
				slist: res
			}))
		}).catch( function(e){
			Router.push('/error/[emsg]',`/error/${e}`)
		})

		const canvas = this.refs.drawable
		const ctx = canvas.getContext('2d')
		const img = new Image()
		img.src = '/map.png'
		canvas.style.width = '100%'
		canvas.style.height = '100%'
		canvas.width = canvas.offsetWidth
		canvas.height = canvas.offsetHeight

		img.onload = () => {
			//ctx.drawImage(img, 0, 0, this.props.mscale, this.props.mscale*img.height / img.width)
			var blinkerd = setInterval(this.blinker, 500); //blink every 1 second
			var timerd = setInterval(this.timer, 1000); //renew alert list every 5 seconds
			this.setState({blinkerd: blinkerd, timerd: timerd,
				map: img, ctx: ctx, canvas: canvas},
				() => {
				this.fDraw() //refresh
			})
		}
	}

	//Main render function
	render(){

		const linkStyle = {
			marginRight: 15
		};

		const rpStyle = {
			border: '2px solid #CCC',
			marginTop: '20px',
			padding: '5px'
		};

		return (
<div>
<Head>
	<title>Dashboard</title>
</Head>
<KeyHandler keyEventName={KEYPRESS} keyValue=" " onKeyHandle={this.handleSpaceKey}/>
<Container fluid>
<Row>
	<Col md={9}>
		<Border>
		<div id="selection">
			<div className="schild">
			<Link href="/editor"><a style={linkStyle}>Map Editor</a></Link>
			</div>
		</div>
		</Border>

		<Border>
		<div id="contain">
			<canvas ref="drawable" onClick={this.state.canvashandler}/>
		</div>
		</Border>

		<Border>
			<Container fluid>
			<Row>
			<Col><button onClick={this.showlines} >Show Lines</button>
</Col>
			<Col></Col>
			<Col></Col>
			</Row>
			</Container>
		</Border>
	</Col>

	<Col md={3}>
		<div style={rpStyle}>
			<p refs="display">{this.state.displaytext}</p>
		</div>
	</Col>
</Row>
</Container>

<style jsx>{`
#contain {
width: ${this.props.mwidth}px;
height: ${this.props.mheight}px;
margin-top: 10px;
}

#selection {
height: 100px;
}

.schild {
float: left;
width: 300px;
margin-left: 10px;
margin-right: 10px;
}
`}</style>
</div>
		)
	}
}

Dashboard.defaultProps = {
	mwidth: 1340,
	mheight:441,
	mscale:1000, //not used for now
}

export default AuthRequired(Dashboard)
