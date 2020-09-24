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
import { CompactPicker } from 'react-color'
import { Container, Row, Col } from 'react-bootstrap';

//custom components import
import Nav from './nav.js'
import Border from '../layouts/minimalist/border2.js'

//requires authentication
import AuthRequired from  '../utils/authreq.js'

const g_inactdef = '#000000';
const g_activdef = '#D33115';

class Editor extends Component {

	handleChange = (color) => {
		this.setState({ scolor: color.hex });
	};

	handleChangeComplete = (color) => {
		this.setState({ scolor: color.hex });
	}


	constructor(props){
		super(props)
		this.state = {
			scolor: g_activdef,
			displaytext: "Segment Editor",
			canvashandler: this.handleStartDraw,
			line:{
				width:3,
				style:g_activdef,
				inact:g_inactdef
			},
			hostlist: [],
			chostid: null,
			seglist: [],
			csegid: null,
			sseldis: true
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
					if(elem.fence_segment === null){
					}else{
					if(elem.fence_segment.id == sid){
						//highlight
						this.lineDraw(elem.Data, true);
						//elem.Data['style'] = elem.Data['inact']
					}else this.lineDraw(elem.Data, false);
					}
				})
			}).catch( function(e){
				Router.push('/error/[emsg]',`/error/${e}`)
			})

		}
	}

	//line drawing function
	lineDraw = (line, active) => {
		//console.log('drawing',line)
		const canvas = this.refs.drawable
		const ctx = canvas.getContext('2d')
		ctx.beginPath()
		ctx.moveTo(line.sx,line.sy)
            	ctx.lineTo(line.ex,line.ey)
		if(active){
			ctx.strokeStyle = line.style
		}else{
			ctx.strokeStyle = line.inact
		}
		ctx.lineWidth = line.width
            	ctx.stroke()
		ctx.closePath()
	}

	componentDidMount(){
		this.fDraw() //refresh
		//console.log('editor-mounted')

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
			this.setState({
				displaytext: "Segment list received. Select a segment to draw lines",
				seglist: tmp,
				sseldis: false
			}, ()=> {

			});
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
			displaytext: `Hit 'z' to register new line for \
			Segment:${this.state.csegid.label}. Or click on map to redraw.`,
			canvashandler: this.handleStartDraw,
			line:{
				sx:this.state.line.sx,
				sy:this.state.line.sy,
				ex:x,
				ey:y,
				width:this.state.line.width,
				style:this.state.scolor,
				inact:g_inactdef
			}
		}, () => {
			this.lineDraw(this.state.line, true)
		})
	}

	//handler for z, to save a line segment
	handlezkey = (event) => {
		if( this.state.line.sx &&
			this.state.line.sy &&
			this.state.line.ex &&
			this.state.line.ey &&
			this.state.line.width &&
			this.state.line.style &&
			this.state.line.inact &&
			this.state.csegid
		){
			//post the line
			var postdat = {
				'Data': this.state.line,
				'fence_segment': {
					'id': this.state.csegid.value
				}
			}
			this.props.auth.dfetch('/draw-lines',{
				method: 'POST',
				body: JSON.stringify(postdat)
			}).then(res => {
				this.setState((state, props) => ({
					displaytext: `Line registered id:${res.id}`,
					line:{
						width:3,
						style:'black'
					},
				}))
			}).catch( function(e){
				Router.push('/error/[emsg]',`/error/${e}`)
			})
			//console.log("Registering new line for segment")

		}else{
			this.setState((state, props) => ({
				displaytext: `Please click on new point first.`,
			}))

		}

	}

	//Changing a Host
	changeHost = (selectedOption) => {
		this.setState({
				chostid: selectedOption,
				sseldis: true
			},
			() => {
				//console.log(`Host selected:`, this.state.chostid)
				//obtain the list of related segments asynchronously
				if(this.state.chostid.value == 0){
					this.props.auth.dfetch(`/fence-hosts`,{
						method: 'GET'
					}).then(res => {
						var tmp = []
						res.forEach( (elem, idx) => {
							elem.fence_segments.forEach( (elem2, i) => {
								tmp.push({value: elem2.id, label:elem2.SegmentName})
							});
						});
						this.setState({
							displaytext: "Segment list received. Select a segment to draw lines",
							seglist: tmp,
							sseldis: false
						}, () => {

						});
					}).catch( function(e){
						Router.push('/error/[emsg]',`/error/${e}`);
					})
				}else{
					this.props.auth.dfetch(`/fence-hosts/${this.state.chostid.value}`,
					{
						method: 'GET'
					}).then(res => {
						var tmp = []
						res.fence_segments.forEach( (elem, idx) => {
							tmp.push({value: elem.id, label:elem.SegmentName})
						});
						this.setState({
							displaytext: "Segment list received. Select a segment to draw lines",
							seglist: tmp,
							sseldis: false
						}, () => {

						});
					}).catch( function(e){
						Router.push('/error/[emsg]',`/error/${e}`);
					})
				}
			}
		);

	}

	//Change a Segment
	changeSegment = (selectedOption) => {
		this.setState(
			{csegid: selectedOption, displaytext:"Click on map to start drawing"},
			() => {
				//console.log(`Segment selected:`, this.state.csegid)
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
		this.props.auth.dfetch(`/fence-segments/${this.state.csegid.value}`,{
			method: 'GET'
		}).then(res => {
			res.draw_lines.forEach( (elem, idx) => {
				//delete the line
				this.props.auth.dfetch(`/draw-lines/${elem.id}`,{
					method: 'DELETE'
				}).then(res => {
					//console.log(`DrawLine id:${elem.id} deleted.`)
					this.fDraw(this.state.csegid.value)
				}).catch( function(e){
					Router.push('/error/[emsg]',`/error/${e}`)
				})
			})
		}).catch( function(e){
			Router.push('/error/[emsg]',`/error/${e}`)
		})
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

		return (
<div>
<KeyHandler keyEventName={KEYPRESS} keyValue="z" onKeyHandle={this.handlezkey}/>
<Border>
<div id="selection">
	<div className="schild">
	<Link href="/"><a style={linkStyle}>Back to Home</a></Link>
	<p refs="display">{this.state.displaytext}</p>
	</div>
	<div className="schild">
	<p>Host Filter</p>
	<Select
			value={this.state.chostid}
			onChange={this.changeHost}
			options={this.state.hostlist}/>
	</div>
	<div className="schild">
	<p>Segment Selection</p>
	<Select
			value={this.state.csetid}
			onChange={this.changeSegment}
			options={this.state.seglist}
			disabled={this.state.sseldis}/>
	</div>
	<div className="schild">
		<CompactPicker
		color={ this.state.scolor }
		onChange={ this.handleChange }
		onChangeComplete={ this.handleChangeComplete }
		/>
	</div>
	<div className="schild">
	<p>Delete all lines from current selected segment</p>
	<button onClick={this.deleteSegmentLines} >Delete Segment Lines</button>
	</div>
</div>
</Border>

<Container fluid>
<Row style={rpStyle}>
	<canvas ref="drawable" onClick={this.state.canvashandler}/>
</Row>
</Container>

<style jsx>{`
#selection {
height: 100px;
}

.schild {
float: left;
width: 250px;
margin-left: 10px;
margin-right: 10px;
}
`}</style>
</div>
		)
	}
}

Editor.defaultProps = {
	mheight: 750
}

export default AuthRequired(Editor)
