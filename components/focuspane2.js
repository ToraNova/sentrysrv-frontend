// A component to handle viewing alerts
// version 2

import React, {Component} from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

class FocusPane extends Component {

	constructor(props){
		super(props)
	}

	componentDidMount(){
	}

	componentDidUpdate(){
		if(this.props.value == undefined){
			//do nothing
		}else if(this.props.value.Attachment == undefined){
			//do nothing
		}else{
			//emit to live view, this goes directly to an MQTT broadcast
			/*
			this.props.wsock.emit('focus/live', JSON.stringify(
				{
					vnum : this.props.lview,
					command: 'stop'
				}
			))
			this.props.wsock.emit('focus/live', JSON.stringify(
				{
				fseg :this.props.value.fence_segment.id,
				vnum :this.props.lview,
				command: 'play'
				}
			)
			)
			*/
		}
	}

	componentWillUnmount() {
	}

	dispImg(){
		if(this.props.value == undefined){
			return []
		}else{
			if(this.props.value.Attachment == undefined){
				return []
			}
			return this.props.value.Attachment
		}

	}

	dispE(){
		if (this.props.value == undefined){
		}else{
			if(this.props.value.Attachment == undefined){
				return 'No images captured.'
			}else{
				if(this.props.value.Attachment.length <= 0){
					return 'No images captured.'
				}
			}
		}
		return ''
	}

	dispHSB(){
		if( this.props.value == undefined){
		}else{
			if( this.props.value.fence_segment != undefined ){
				if(this.props.value.fence_segment.fence_host != undefined){
					return `Origin : ${this.props.value.fence_segment.fence_host.HostName}\nSegment: ${this.props.value.fence_segment.SegmentName}\nBranch : ${this.props.value.OriginBranch}`
				}
			}

			return 'N/A'
		}

	}

	dispAGI(){
		if( this.props.value == undefined){
		}else{
			if( this.props.value.fence_segment != undefined ){
				return `${this.props.value.fence_segment.SegmentInfo}`
			}
			return 'N/A'
		}
	}

	datedisp(isostr) {
		const d = new Date(isostr)
		return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
	}

	timedisp(isostr) {
		const d = new Date(isostr)
		return `${d.getHours()}.${d.getMinutes()}`
	}

	buttonmap(list){

	}

	render(){

		const butlist0 = [
			{variant: "outline-danger", reason: "Intruder" },
			{variant: "outline-warning", reason: "False Alarm" },
			{variant: "outline-warning", reason: "Animal" },
		]

		const butlist1 = [
			{variant: "outline-secondary", reason: "Accident" },
			{variant: "outline-primary", reason: "Worker" },
			{variant: "outline-success", reason: "Testing" },
		]

		//const butlist = [
		//	{variant: "danger", reason: "Intruder" },
		//	{variant: "warning", reason: "False Alarm" },
		//	{variant: "primary", reason: "Animal" },
		//	{variant: "primary", reason: "Worker" },
		//	{variant: "secondary", reason: "Accident" },
		//	{variant: "success", reason: "Testing" }
		//]

		//const butlist = [
		//	{variant: "danger", reason: "Intruder" },
		//	{variant: "warning", reason: "False Alarm" },
		//	{variant: "primary", reason: "Animal" },
		//	{variant: "primary", reason: "Worker" },
		//	{variant: "secondary", reason: "Accident" },
		//	{variant: "success", reason: "Testing" }
		//]

		return(

<div>
<Container fluid="true">
<Row noGutters>
<Col md="9">
{
this.dispImg().length == 1 ?
<img className='simage' name={this.dispImg()[0].name} alt={this.dispImg()[0].created_at} src={process.env.backend_urlp+this.dispImg()[0].url}/> :
this.dispImg().map((attach) => (
<Col className='acont' key={attach.hash}>
<img className='aimage' name={attach.name} alt={attach.created_at} src={process.env.backend_urlp+attach.url}/>
</Col>
))
}
</Col>
<Col md="3">
	<Row noGutters>
	<pre id='descript'>
	ID     : #{this.props.value ? this.props.value.id : 'No alert'}{"\n"}
	Type   : {this.props.value ? this.props.value.alert_model.Element : 'N/A'}{"\n"}
	{this.dispHSB()}{"\n"}
	Date   : {this.props.value ? this.datedisp(this.props.value.created_at) : 'N/A'}{"\n"}
	Time   : {this.props.value ? this.timedisp(this.props.value.created_at) : 'N/A'}{"\n"}
	Details: {"\n"}{this.props.value ? JSON.stringify(this.props.value.Details) : 'N/A'}
	</pre>
	</Row>
<Row noGutters>
<Col md="6">
{
this.props.value ?
butlist0.map( (but) => (
<Button className="mx-0 my-0" key={but.reason} block={true} variant={but.variant}
type="submit" id={this.props.value.id} value={this.props.lview}
onClick={this.props.onSubmit}>{but.reason}</Button>
))
:
butlist0.map( (but) => (
<Button className="mx-0 my-0" key={but.reason} block={true} variant={but.variant}
type="submit" disabled>{but.reason}</Button>
))
}
</Col>
<Col md="6">
{
this.props.value ?
butlist1.map( (but) => (
<Button className="mx-0 my-0" key={but.reason} block={true} variant={but.variant}
type="submit" id={this.props.value.id} value={this.props.lview}
onClick={this.props.onSubmit}>{but.reason}</Button>
))
:
butlist1.map( (but) => (
<Button className="mx-0 my-0" key={but.reason} block={true} variant={but.variant}
type="submit" disabled>{but.reason}</Button>
))
}
{
this.props.value ?
<Button className="mx-0 my-0" block={true} variant='outline-info' value={this.props.value.fence_segment.id} onClick={this.props.onSelect}>Highlight</Button>
:
<Button className="mx-0 my-0" block={true} variant='outline-info' onClick={this.props.onSelect} disabled>Highlight</Button>
}
</Col>
</Row>

</Col>
</Row>

</Container>
<style jsx>{`
.simage {
max-width:100%;
max-height:${this.props.imxheight}px;
margin-left: auto;
margin-right: auto;
}
#descript {
margin-left: 2px;
}
.aimage {
max-width:100%;
max-height:${this.props.imxheight}px;
margin-top: 10px;
margin-bottom: 10px;
}
`}</style>
</div>
		)
	}
}

FocusPane.defaultProps = {
	//imxheight: 330,
	imxheight: 500,
}

export default FocusPane
