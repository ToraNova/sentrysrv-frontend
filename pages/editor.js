/*
 * This is the about page
 * this corresponds to the /about path
 * to write details and information about the webapp
 */

//Link API from Next.js
import Link from 'next/link'
import React, {Component} from 'react'
import Router from 'next/router' //router
// import from online
import KeyHandler, { KEYPRESS } from 'react-key-handler';
import Select from 'react-select';

//custom components import
import Nav from './nav.js'
import Border from '../layouts/minimalist/border0.js'

//requires authentication
import AuthRequired from  '../utils/authreq.js'

class Editor extends Component {

	constructor(props){
		super(props)
		this.state = {
			displaytext: "Segment Editor",
			canvashandler: this.handleStartDraw,
			line:{
				width:3,
				style:'black'
			},
			hostlist: [],
			chostid: null,
			seglist: [],
			csegid: null
		}
	}

	fDraw = (sid = 0) => {
		const canvas = this.refs.drawable
		const img = new Image()
		img.src = '/map.png'
		const ctx = canvas.getContext('2d')
		canvas.style.width = '100%'
		canvas.style.height = '100%'
		canvas.width = canvas.offsetWidth
		canvas.height = canvas.offsetHeight
		//draw image when loaded
		img.onload = () => {
			//ctx.drawImage(img, 0, 0, this.props.mscale, this.props.mscale*img.height / img.width)
			ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)

			//obtain the lines and draw it on the image
			this.props.auth.dfetch('/draw-lines',{
				method: 'GET'
			}).then(res => {
				res.forEach( (elem, idx) => {
					//console.log(idx,sid, elem.fence_segment.id)
					if(elem.fence_segment.id == sid){
						//highlight
						elem.Data['style']='red'
					}
					this.lineDraw(elem.Data)
				})
			}).catch( function(e){
				Router.push('/error/[emsg]',`/error/${e}`)
			})

		}
	}

	//line drawing function
	lineDraw = (line) => {
		//console.log('drawing',line)
		const canvas = this.refs.drawable
		const ctx = canvas.getContext('2d')
		ctx.beginPath()
		ctx.moveTo(line.sx,line.sy)
            	ctx.lineTo(line.ex,line.ey)
		ctx.strokeStyle = line.style
		ctx.lineWidth = line.width
            	ctx.stroke()
		ctx.closePath()
	}

	componentDidMount(){
		this.fDraw() //refresh
		console.log('dashboard-mounted')

		//obtain the list of hosts asynchronously
		this.props.auth.dfetch('/fence-hosts',{
			method: 'GET'
		}).then(res => {
			var tmp = [{value: 0, label: 'No filter'}]
			res.forEach( (elem, idx) => {
				tmp.push({value: elem.id, label:elem.HostName})
			})
			this.setState((state, props) => ({
				displaytext: "Host list received.",
				hostlist: tmp
			}))
		}).catch( function(e){
			Router.push('/error/[emsg]',`/error/${e}`)
		})

		//obtain the list of segments asynchronously
		this.props.auth.dfetch('/fence-segments',{
			method: 'GET'
		}).then(res => {
			var tmp = []
			res.forEach( (elem, idx) => {
				tmp.push({value: elem.id, label:elem.SegmentName})
			})
			this.setState((state, props) => ({
				displaytext: "Segment list received. Select a segment to draw lines",
				seglist: tmp
			}))
		}).catch( function(e){
			Router.push('/error/[emsg]',`/error/${e}`)
		})
	}

	//handler for starting a draw
	handleStartDraw = (event) => {
		this.fDraw() //redraw
		if( this.state.csegid == null ){
			window.alert("Please select segment first.");
			return;
		}
		const canvas = this.refs.drawable
		const x = event.nativeEvent.layerX - canvas.offsetLeft
		const y = event.nativeEvent.layerY - canvas.offsetTop
		//console.log('start',event.nativeEvent,canvas.offsetLeft,canvas.offsetTop)
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
	}

	//handler for ending a draw
	handleEndDraw = (event) => {
		const canvas = this.refs.drawable
		const x = event.nativeEvent.layerX - canvas.offsetLeft
		const y = event.nativeEvent.layerY - canvas.offsetTop
		//console.log('end',event.nativeEvent,canvas.offsetLeft,canvas.offsetTop)
		this.setState({
			displaytext: `Hit spacebar to register new line for \
			Segment:${this.state.csegid.label}. Or click on map to redraw.`,
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
			this.state.line['style'] = 'red' //temporary for highlighting
			this.lineDraw(this.state.line)
			this.state.line['style'] = 'black' //back to original
		})
	}

	//handler for spacebar, to save a line segment
	handleSpaceKey = (event) => {
		if( this.state.line.sx &&
			this.state.line.sy &&
			this.state.line.ex &&
			this.state.line.ey &&
			this.state.line.width &&
			this.state.line.style &&
			this.state.csegid
		){
			//post the line
			var postdat = {
				'Data': this.state.line,
				'fence_segment': {
					'id': this.state.csegid.value
				}
			}
			console.log(JSON.stringify(postdat))
			this.props.auth.dfetch('/draw-lines',{
				method: 'POST',
				body: JSON.stringify(postdat)
			}).then(res => {
			}).catch( function(e){
				Router.push('/error/[emsg]',`/error/${e}`)
			})
			console.log("Registering new line for segment")
		}else{
			window.alert("Line draw incomplete.");
		}
	}

	//Changing a Host
	changeHost = (selectedOption) => {
		this.setState(
			{chostid: selectedOption},
			() => {
				//console.log(`Host selected:`, this.state.chostid)
				//obtain the list of related segments asynchronously
				this.props.auth.dfetch('/fence-segments',{
					method: 'GET'
				}).then(res => {
					var tmp = []
					res.forEach( (elem, idx) => {
						if(elem.fence_host.id == this.state.chostid.value || this.state.chostid.value == 0 ){
							tmp.push({value: elem.id, label:elem.SegmentName})
						}
					})
					this.setState((state, props) => ({
						displaytext: "Segment list received. Select a segment to draw lines",
						seglist: tmp
					}))
				}).catch( function(e){
					Router.push('/error/[emsg]',`/error/${e}`)
				})
			}
		);

	}

	//Change a Segment
	changeSegment = (selectedOption) => {
		this.setState(
			{csegid: selectedOption, displaytext:"Click on map to start drawing"},
			() => {
				console.log(`Segment selected:`, this.state.csegid)
				this.fDraw(this.state.csegid.value)
			}
		);
	}

	//deletes all lines under the segment
	deleteSegmentLines = () => {
		if( this.state.csegid == null ){
			window.alert("Please select segment first.");
			return;
		}
		this.props.auth.dfetch('/draw-lines/',{
			method: 'GET'
		}).then(res => {
			res.forEach( (elem, idx) => {
				console.log(elem)
				if(elem.fence_segment.id == this.state.csegid.value){
					//delete the line
					this.props.auth.dfetch(`/draw-lines/${elem.id}`,{
						method: 'DELETE'
					}).then(res => {
						console.log(`DrawLine id:${elem.id} deleted.`)
						this.fDraw(this.state.csegid.value)
					}).catch( function(e){
						Router.push('/error/[emsg]',`/error/${e}`)
					})
				}
			})
		}).catch( function(e){
			Router.push('/error/[emsg]',`/error/${e}`)
		})
	}

	//Main render function
	render(){
		return (
		<div>
		<KeyHandler keyEventName={KEYPRESS} keyValue=" " onKeyHandle={this.handleSpaceKey}/>
		<Border>
		<div id="selection">
			<div className="schild">
			<p>Host Filter</p>
			<Select value={this.state.chostid} onChange={this.changeHost} options={this.state.hostlist}/>
			</div>
			<div className="schild">
			<p>Segment Selection</p>
			<Select value={this.state.csetid} onChange={this.changeSegment} options={this.state.seglist}/>
			</div>
			<div className="schild">
			<p>Delete all lines from current selected segment</p>
			<button onClick={this.deleteSegmentLines} >Delete Segment Lines</button>
			</div>
		</div>
		</Border>
		<Border>
		<div id="contain">
		<canvas ref="drawable" onClick={this.state.canvashandler}/>
		</div>
		</Border>
		<Border>
		<div><p refs="display">{this.state.displaytext}</p></div>
		</Border>

		<style jsx>{`
		#contain {
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

Editor.defaultProps = {
	mheight:441,
	mscale:1000, //not used for now
}

export default AuthRequired(Editor)
