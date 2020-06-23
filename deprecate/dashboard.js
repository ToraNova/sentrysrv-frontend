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
import AlertView from '../components/alertview.js'
import AlertDetail from '../components/alertdetail.js'

//requires authentication
import AuthRequired from  '../utils/authreq.js'

class Dashboard extends Component {

	constructor(props){
		super(props)
		this.state = {
			llist: [],
			slist: [],
			alist: [],
			adlist: [],
			lines: [],
			caid: 0,
			showlines: false,
			blink: false
		}
	}

	//toggle showlines or not
	showlines = () => {
		this.setState({showlines: !this.state.showlines}, () => {
			clearInterval(this.state.blinkerd)
			if(this.state.showlines){
				this.state.llist.forEach( (elem, idx) => {
					//console.log(idx,sid, elem.fence_segment.id)
					this.lineDraw(elem.Data)
				})
			}else{
				//do nothing
				const blinkerd = setInterval(this.blinker, 500); //blink every 1 second
				this.setState({blinkerd: blinkerd}, () => {
					this.fDraw()
				})
			}
		})
	}

	//foreground draw function
	fDraw = ( lines = [], nstyle ) => {
		this.state.ctx.drawImage(this.state.map, 0, 0, this.state.map.width, this.state.map.height, 0, 0, this.state.canvas.width, this.state.canvas.height)
		if(nstyle == undefined) nstyle = 'red'
		this.mDraw( lines, nstyle )
	}

	mDraw = ( larray, nstyle) => {
		larray.forEach( (elem,idx) => {
			elem.Data['style'] = nstyle
			this.lineDraw(elem.Data)
		})
	}

	//repeating timer
	blinker = () => {
		//console.log("Blinker expired, changing line color")
		if(this.state.blink){
			this.fDraw(this.state.lines, 'red')
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
			var tmp2 = [{value:0, label:'No select'}]
			var lstr
			res.forEach( (elem, idx) => {
				//obtain relevant lines
				const seg = this.obtainEnt( elem.fence_segment.id , 'slist' )
				lstr = seg.fence_host.HostName + ' : ' + elem.fence_segment.SegmentName
				tmp2.push({value: elem.id, label:lstr})
				tmp = tmp.concat( this.obtainLines(elem.fence_segment.id) )
			})
			this.setState({alist: res, lines: tmp, adlist: tmp2}, () => {
			})
		}).catch( function(e){
			Router.push('/error/[emsg]',`/error/${e}`)
		})
	}

	aSelect = (selectedOption) => {
		this.setState(
			{caid: selectedOption},
			() => {
				//stop the blinker
				clearInterval(this.state.blinkerd)
				if( this.state.caid.value <= 0){
					const blinkerd = setInterval(this.blinker, 500); //blink every 1 second
					this.setState({blinkerd: blinkerd, aview: undefined}, () => {
						this.fDraw()
					})
				}else{
					this.fDraw() //clear
					//highlight blue
					const a = this.obtainEnt( this.state.caid.value, 'alist' )
					const s = this.obtainEnt( a.fence_segment.id, 'slist')
					const sline = this.obtainLines( s.id )
					this.mDraw( sline, 'blue' )
					a['fence_host'] = s.fence_host
					//display alert on view and detail
					this.setState({ aview: a })
				}
			}
		);
	}

	aSubmit = (sel) => {
		//comes here when we submit alert reason
		if( this.state.caid.value > 0 ){
			const a = this.obtainEnt( this.state.caid.value, 'alist' )
			a['Reason'] = sel.target.value
			a['fence_segment'] = a.fence_segment.id
			this.props.auth.dfetch(`/alerts/${this.state.caid.value}`,{
				method: 'PUT',
				body: JSON.stringify(
					a
				)
			}).then(res => {
				console.log(res)
				clearInterval(this.state.blinkerd)
				const blinkerd = setInterval(this.blinker, 500); //blink every 1 second
				this.setState({blinkerd: blinkerd, aview: undefined, caid: 0}, () => {
					this.fDraw()
				})
			}).catch( function(e){
				Router.push('/error/[emsg]',`/error/${e}`)
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
			<Link href="/"><a style={linkStyle}>Home</a></Link>
			</div>
			<div className="schild">
			<p>Alert Selection</p>
			<Select value={this.state.caid} onChange={this.aSelect} options={this.state.adlist}/>
			</div>
		</div>
		</Border>

		<Border>
		<div id="contain">
			<canvas ref="drawable" onClick={this.state.canvashandler}/>
		</div>
		</Border>

		<Border>
			<AlertDetail value={ this.state.aview } onSubmit={this.aSubmit}></AlertDetail>
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
			<AlertView value={ this.state.aview }></AlertView>
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

	componentWillUnmount() {
		//stop timers
		clearInterval(this.state.timerd)
		clearInterval(this.state.blinkerd)
	}

	//obtain relevant lines from llist based on segment id
	obtainLines = (sid) => {
		var tmp = []
		this.state.llist.forEach( (line, lidx) => {
			if(line.fence_segment.id == sid){
				tmp.push(line)
			}
		})
		return tmp
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

	componentDidMount(){
		//console.log('dashboard-mounted')
		this.props.auth.dfetch('/fence-hosts',{
			method: 'GET'
		}).then(res => {
			this.setState({hlist:res})
		}).catch( function(e){
			Router.push('/error/[emsg]',`/error/${e}`)
		})

		this.props.auth.dfetch('/draw-lines',{
			method: 'GET'
		}).then(res => {
			this.setState({llist:res})
		}).catch( function(e){
			Router.push('/error/[emsg]',`/error/${e}`)
		})

		//obtain the list of segments asynchronously
		this.props.auth.dfetch('/fence-segments',{
			method: 'GET'
		}).then(res => {
			this.setState({slist:res})
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
			const timerd = setInterval(this.timer, 1000); //renew alert list every 5 seconds
			const blinkerd = setInterval(this.blinker, 500); //blink every 1 second
			this.setState({blinkerd: blinkerd, timerd: timerd,
				map: img, ctx: ctx, canvas: canvas},
				() => {
				this.fDraw() //refresh
			})
		}
	}


	//using linear search, obtain the entity from state
	obtainEnt = (id, type) => {
		var e
		for (e of this.state[type]){
			if(e.id == id){
				return e
			}
		}
	}


}

Dashboard.defaultProps = {
	mwidth: 1340,
	mheight:441,
	mscale:1000, //not used for now
}

export default AuthRequired(Dashboard)
