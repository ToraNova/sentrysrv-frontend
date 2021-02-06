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
import { Container, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

//custom components import
import Border from '../layouts/minimalist/border2.js'
import FocusPane from '../components/focuspane.js'

//requires authentication
import AuthRequired from  '../utils/authreq.js'
var delayFire = 7

class Focus extends Component {

	handleError = (e) => {
		console.log(e);
		console.log(e.stack);
		window.location.reload(false);//TODO experimental
		//Router.push('/error/[emsg]',`/error/${e}`)
	};

	constructor(props){
		super(props)
		this.state = {
			slist: [],
			alist: [],
		}
	}

	//Main render function
	render(){

		const linkStyle = {
			marginRight: 15
		}

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
<title>Dashboard (Focus View)</title>
</Head>
<Container fluid>
<Row style={ctStyle} >
	<Col md={1}><h4>Focus</h4></Col>
	<Col md={2}>
	<Link href="/"><a style={linkStyle}>Home</a></Link>
	<Button variant='light' onClick={this.clrSelect}>Clear highlights on Map</Button>
	</Col>
	<Col>
	</Col>
</Row>
<Row>
	<Col md={6}>
	<Border>
	<FocusPane value={this.state.alist[0]} onSubmit={this.aSubmit} onSelect={this.aSelect} wsock={this.socket} lview={0}/>
	</Border>
	</Col>
	<Col md={6}>
	<Border>
	<FocusPane value={this.state.alist[1]} onSubmit={this.aSubmit} onSelect={this.aSelect} wsock={this.socket} lview={1}/>
	</Border>
	</Col>
</Row>

<Row>
	<Col md={6}>
	<Border>
	<FocusPane value={this.state.alist[2]} onSubmit={this.aSubmit} onSelect={this.aSelect} wsock={this.socket} lview={2}/>
	</Border>
	</Col>
	<Col md={6}>
	<Border>
	<FocusPane value={this.state.alist[3]} onSubmit={this.aSubmit} onSelect={this.aSelect} wsock={this.socket} lview={3}/>
	</Border>
	</Col>
</Row>
</Container>

<style jsx>{`
`}</style>
</div>
)
}

	aSubmit = (sel) => {
		//console.log(sel.target.id)
		//console.log(sel.target.value)
		const vn = sel.target.value
		console.log(vn)
		const a = this.obtainEnt( sel.target.id, 'alist' )
		a['Reason'] = sel.target.innerText
		this.props.auth.dfetch(`/alerts/${sel.target.id}`,{
			method: 'PUT',
			body: JSON.stringify(
				a
			)
		}).then(res => {
			/*
			this.socket.emit('focus/live', JSON.stringify(
				{
					vnum : vn,
					command: 'stop'
				}
			))
			*/
			this.socket.emit('focus/alert/highlight', '0')
			setTimeout( function(socket){
				//console.log('delayed request fire')
				socket.emit('focus/init',`{"count":"${delayFire}"}`)
			}, 500, this.socket);
		}).catch( (e) => this.handleError(e));
	}

	aSelect = (sel) => {
		this.socket.emit('focus/alert/highlight', sel.target.value)
	}

	clrSelect = () => {
		this.socket.emit('focus/alert/highlight', '0')
	}

	componentDidMount(){
		this.socket = io.connect(process.env.backend_urlp)
		this.socket.emit('focus/init',`{"count":"${delayFire}"}`)

		this.socket.on('focus/alert/data', (res) => {
			const tmp = JSON.parse(res)
			this.aSync(tmp)
		})

		this.socket.on('focus/alert/new', (res) => {
			//start a timer, then emit an init later
			setTimeout( function(socket){
				//console.log('delayed request fire')
				socket.emit('focus/init',`{"count":"${delayFire}"}`)
			}, 2000, this.socket);
		})
	}

	aSync = (al) => {
		//stop all live view video
		for(var i=0;i<4;i++){
			this.socket.emit('focus/live', JSON.stringify(
				{
					vnum : i,
					command: 'stop'
				}
			))
		}
		this.setState({alist:al},() => {
			this.state.alist.forEach( (e,idx) => {
				this.socket.emit('focus/live', JSON.stringify(
					{
					fseg :e.fence_segment.id,
					vnum :idx,
					command: 'play'
					})
				)
			})
		})
	}

	componentWillUnmount() {
		this.socket.off('focus/alert/data')
		this.socket.off('focus/alert/new')
    		this.socket.close()
	}

	obtainEnt = (id, type) => {
		var e
		for (e of this.state[type]){
			if(e.id == id){
				return e
			}
		}
	}


}

export default AuthRequired(Focus)
