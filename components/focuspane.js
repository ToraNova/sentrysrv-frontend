//A component to handle viewing alerts
//

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
					return `${this.props.value.fence_segment.fence_host.HostName} / ${this.props.value.fence_segment.SegmentName} / ${this.props.value.OriginBranch}`
				}
			}

			return 'N/A'
		}

	}

	timedisp(isostr) {
		const d = new Date(isostr)
		return d.toString()
	}

	buttonmap(list){

	}

	render(){

		const butlist0 = [
			{variant: "outline-danger", reason: "Intruder" },
			{variant: "outline-warning", reason: "False Alarm" },
			{variant: "outline-primary", reason: "Animal" },
		]

		const butlist1 = [
			{variant: "outline-secondary", reason: "Accident" },
			{variant: "outline-success", reason: "Testing" },
			{variant: "outline-primary", reason: "Worker" }
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
		//	{variant: "outline-danger", reason: "Intruder" },
		//	{variant: "outline-warning", reason: "False Alarm" },
		//	{variant: "outline-primary", reason: "Animal" },
		//	{variant: "outline-primary", reason: "Worker" },
		//	{variant: "outline-secondary", reason: "Accident" },
		//	{variant: "outline-success", reason: "Testing" }
		//]

		return(

<div>
<Container fluid>
<p>{this.dispE()}</p>
<Row id='imgpane'>
{
this.dispImg().length == 1 ?
<img className='simage' name={this.dispImg()[0].name} alt={this.dispImg()[0].created_at} src={process.env.backend_urlp+this.dispImg()[0].url}/> :
this.dispImg().map((attach) => (
<Col className='acont' key={attach.hash}>
<img className='aimage' name={attach.name} alt={attach.created_at} src={process.env.backend_urlp+attach.url}/>
</Col>
))
}
</Row>

<Row id='infopane'>
<Col md={6}>
<table>
<thead>
	<tr>
	<td>Alert ID</td>
	<td>#{this.props.value ? this.props.value.id + ` (${this.props.value.alert_model.Element})` : 'No alert'}</td>
	</tr>
</thead>

<tbody>
<tr>
<td>Host / Segment / Branch</td>
<td>{this.dispHSB()}</td>
</tr>
<tr>
<td>Alert Time</td>
<td>{this.props.value ? this.timedisp(this.props.value.created_at) : 'N/A'}</td>
</tr>
<tr>
<td>Details</td>
<td>{this.props.value ? JSON.stringify(this.props.value.Details) : 'N/A'}</td>
</tr>
</tbody>
</table>
{
this.props.value ?
<Button block={true} variant='outline-info' value={this.props.value.fence_segment.id} onClick={this.props.onSelect}>Highlight on Map</Button>
:
<Button block={true} variant='outline-info' onClick={this.props.onSelect} disabled>Highlight on Map</Button>
}
</Col>

<Col md={3}>
{
this.props.value ?
butlist0.map( (but) => (
<Button key={but.reason} block={true} variant={but.variant}
type="submit" id={this.props.value.id} value={this.props.lview}
onClick={this.props.onSubmit}>{but.reason}</Button>
))
:
butlist0.map( (but) => (
<Button key={but.reason} block={true} variant={but.variant}
type="submit" disabled>{but.reason}</Button>
))
}
</Col>

<Col md={3}>
{
this.props.value ?
butlist1.map( (but) => (
<Button key={but.reason} block={true} variant={but.variant}
type="submit" id={this.props.value.id} value={this.props.lview} onClick={this.props.onSubmit}>{but.reason}</Button>
))
:
butlist1.map( (but) => (
<Button key={but.reason} block={true} variant={but.variant}
type="submit" disabled>{but.reason}</Button>
))
}
</Col>


</Row>

</Container>
<style jsx>{`
.simage {
max-width:100%;
max-height:${this.props.imxheight}px;
margin-top: 10px;
margin-bottom: 10px;
margin-left: auto;
margin-right: auto;
}
.aimage {
max-width:100%;
max-height:${this.props.imxheight}px;
margin-top: 10px;
margin-bottom: 10px;
}
table {
text-align: left;
margin-bottom: 10px;
margin-left: auto;
margin-right: auto;
}
table, th, td {
border: 1px solid black;
border-collapse: collapse;
}
th, td {
padding-right: 10px;
padding-left: 10px;
width: 200px;
max-width: 100%;
}
`}</style>
</div>
		)
	}
}

FocusPane.defaultProps = {
	imxheight: 375,
}

export default FocusPane
